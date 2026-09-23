import * as THREE from 'three';

/**
 * Soft particle system used for the perfume mist, suspended droplets (bokeh)
 * and champagne dust. Motion lives in the vertex shader so thousands of frames
 * cost nothing on the CPU. Particles further from the focal plane grow and
 * soften - a cheap, convincing depth of field.
 */

const vertexShader = /* glsl */ `
  attribute vec4 aRand;   // x seed, y speed, z mix/size bias, w phase
  attribute float aSize;  // world-space size

  uniform float uTime;
  uniform float uIntro;
  uniform float uDisperse;
  uniform vec2 uPointer;
  uniform vec3 uPointerWorld;
  uniform float uScale;
  uniform float uFocus;
  uniform float uAperture;
  uniform float uOpacity;
  uniform float uSparkle;
  uniform float uAttractY;
  uniform float uAttract;
  uniform float uSwirl;

  varying float vAlpha;
  varying float vBlur;
  varying float vMix;
  varying float vTw;

  float easeOut(float x) { x = clamp(x, 0.0, 1.0); return 1.0 - pow(1.0 - x, 3.0); }

  void main() {
    vec3 p = position;
    float t = uTime * (0.35 + aRand.y);

    // a slow orbit around the bottle
    float ang = uTime * uSwirl * (0.4 + aRand.y) + aRand.w;
    float ca = cos(ang), sa = sin(ang);
    p.xz = mat2(ca, -sa, sa, ca) * p.xz;

    // lazy drift
    p += vec3(sin(t * 0.31 + aRand.x * 12.0) * 0.14,
              sin(t * 0.23 + aRand.w * 9.0) * 0.10,
              cos(t * 0.27 + aRand.x * 7.0) * 0.14);

    // emerge from the bottle outward
    float e = easeOut(uIntro * 1.2 - aRand.x * 0.2);
    p = mix(vec3(p.x * 0.12, p.y * 0.3 + 0.1, p.z * 0.12), p, e);

    // gather around a height band (fragrance notes)
    float pull = uAttract * smoothstep(0.0, 1.0, aRand.x + 0.35);
    p.y = mix(p.y, uAttractY + (p.y - uAttractY) * 0.18, pull);
    p.xz *= 1.0 - pull * 0.25;

    // disperse into the background
    float d = uDisperse * (0.6 + aRand.x);
    p.xz *= 1.0 + d * 2.4;
    p.y += d * (0.5 + aRand.z) * 1.5;

    // cursor: depth parallax plus a gentle push away from the pointer
    p.xy += uPointer * 0.1 * (0.35 + aRand.x);
    vec2 away = p.xy - uPointerWorld.xy;
    float push = exp(-dot(away, away) * 2.2) * 0.3;
    p.xy += normalize(away + vec2(1e-4)) * push;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = max(0.1, -mv.z);

    vBlur = clamp(abs(depth - uFocus) * uAperture, 0.0, 1.0);
    gl_PointSize = aSize * (1.0 + vBlur * 2.2) * projectionMatrix[1][1] * uScale / depth;
    vTw = uSparkle > 0.0 ? mix(1.0, 0.45 + 0.55 * sin(uTime * (0.9 + aRand.y * 1.6) + aRand.w * 20.0), uSparkle) : 1.0;
    vAlpha = uOpacity * e * (1.0 - uDisperse * 0.9) / (1.0 + vBlur * 2.6);
    vMix = aRand.z;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uColor2;
  uniform float uSoft;

  varying float vAlpha;
  varying float vBlur;
  varying float vMix;
  varying float vTw;

  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    if (r > 1.0) discard;
    float soft = mix(uSoft, 1.0, vBlur);
    float a = 1.0 - smoothstep(1.0 - soft, 1.0, r);
    a *= a;
    // faint bright core for in-focus droplets
    float core = (1.0 - vBlur) * (1.0 - uSoft) * smoothstep(0.45, 0.0, r) * 0.6;
    vec3 col = mix(uColor, uColor2, vMix) + core;
    gl_FragColor = vec4(col, a * vAlpha * vTw);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export interface ParticleOptions {
  color: string;
  color2: string;
  opacity: number;
  softness: number; // 1 = mist, ~0.3 = droplet
  sparkle?: number;
  swirl?: number;
  aperture?: number;
}

export const createParticleMaterial = (o: ParticleOptions) =>
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uIntro: { value: 0 },
      uDisperse: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uPointerWorld: { value: new THREE.Vector3(99, 99, 0) },
      uScale: { value: 400 },
      uFocus: { value: 8 },
      uAperture: { value: o.aperture ?? 0.32 },
      uOpacity: { value: o.opacity },
      uSparkle: { value: o.sparkle ?? 0 },
      uAttractY: { value: 0 },
      uAttract: { value: 0 },
      uSwirl: { value: o.swirl ?? 0.035 },
      uColor: { value: new THREE.Color(o.color) },
      uColor2: { value: new THREE.Color(o.color2) },
      uSoft: { value: o.softness },
    },
  });

export interface CloudShape {
  count: number;
  radius: [number, number]; // min / max distance from the bottle axis
  height: [number, number]; // y range
  size: [number, number]; // world size range
  lowBias?: number; // >1 concentrates particles near the bottom
  seed?: number;
}

// Small deterministic PRNG so the composition is identical on every load.
const mulberry32 = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const createCloudGeometry = ({ count, radius, height, size, lowBias = 1, seed = 7 }: CloudShape) => {
  const rand = mulberry32(seed);
  const pos = new Float32Array(count * 3);
  const rnd = new Float32Array(count * 4);
  const sz = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const a = rand() * Math.PI * 2;
    const r = radius[0] + Math.sqrt(rand()) * (radius[1] - radius[0]);
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = height[0] + Math.pow(rand(), lowBias) * (height[1] - height[0]);
    pos[i * 3 + 2] = Math.sin(a) * r;
    rnd[i * 4] = rand();
    rnd[i * 4 + 1] = rand();
    rnd[i * 4 + 2] = rand();
    rnd[i * 4 + 3] = rand() * Math.PI * 2;
    sz[i] = size[0] + rand() * (size[1] - size[0]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 4));
  g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
  // particles drift outside their start box - never frustum-cull the cloud
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
  return g;
};
