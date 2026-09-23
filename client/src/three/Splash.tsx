import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { Quality } from './PerfumeBottle';

/**
 * Liquid arcs of perfume that curl around the bottle. Each arc is a flattened,
 * tapering tube along a spline, shaded as transmissive champagne liquid. A
 * reveal uniform "pours" the arc along its length with a tapered head; the
 * surface breathes with slow travelling waves. Tiny droplets peel off the arcs
 * in slow motion.
 */

interface ArcDef {
  angle: [number, number]; // start / end angle around the bottle
  radius: [number, number]; // base radius, bulge
  y: [number, number]; // start / end height
  lift: number; // mid-arc rise
  thickness: number;
  flatten: number;
  delay: number; // reveal offset 0..1
  phase: number;
}

export const ARCS: ArcDef[] = [
  { angle: [-2.5, 1.55], radius: [1.02, 0.38], y: [-0.82, 0.52], lift: 0.28, thickness: 0.09, flatten: 0.34, delay: 0, phase: 0.3 },
  { angle: [1.35, -1.85], radius: [0.92, 0.22], y: [0.72, 0.18], lift: 0.16, thickness: 0.058, flatten: 0.4, delay: 0.18, phase: 1.7 },
  { angle: [2.7, 5.1], radius: [1.34, 0.12], y: [-0.95, -0.7], lift: 0.1, thickness: 0.032, flatten: 0.5, delay: 0.32, phase: 2.9 },
];

export const arcCurve = (a: ArcDef) => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i += 1) {
    const s = i / 24;
    const ang = a.angle[0] + (a.angle[1] - a.angle[0]) * s;
    const r = a.radius[0] + a.radius[1] * Math.sin(Math.PI * s);
    const y = a.y[0] + (a.y[1] - a.y[0]) * s + a.lift * Math.sin(Math.PI * s * 1.15);
    pts.push(new THREE.Vector3(Math.cos(ang) * r, y, Math.sin(ang) * r));
  }
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
};

const buildRibbon = (curve: THREE.Curve<THREE.Vector3>, a: ArcDef, segments: number, radial: number) => {
  const frames = curve.computeFrenetFrames(segments, false);
  const positions: number[] = [];
  const normals: number[] = [];
  const offsets: number[] = [];
  const along: number[] = [];
  const indices: number[] = [];
  const c = new THREE.Vector3();
  const n = new THREE.Vector3();
  const off = new THREE.Vector3();
  for (let i = 0; i <= segments; i += 1) {
    const s = i / segments;
    curve.getPointAt(s, c);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    // liquid stream profile: thin ends, gentle swelling along the length
    const r = a.thickness * Math.pow(Math.sin(Math.PI * s), 0.55) * (0.72 + 0.28 * Math.sin(s * Math.PI * 5 + a.phase));
    for (let j = 0; j <= radial; j += 1) {
      const th = (j / radial) * Math.PI * 2;
      const cs = Math.cos(th);
      const sn = Math.sin(th);
      off.copy(N).multiplyScalar(cs * r).addScaledVector(B, sn * r * a.flatten);
      n.copy(N).multiplyScalar(cs * a.flatten).addScaledVector(B, sn).normalize();
      positions.push(c.x + off.x, c.y + off.y, c.z + off.z);
      normals.push(n.x, n.y, n.z);
      offsets.push(off.x, off.y, off.z);
      along.push(s);
    }
  }
  for (let i = 0; i < segments; i += 1) {
    for (let j = 0; j < radial; j += 1) {
      const a1 = i * (radial + 1) + j;
      const b1 = (i + 1) * (radial + 1) + j;
      indices.push(a1, a1 + 1, b1, b1, a1 + 1, b1 + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  g.setAttribute('aOff', new THREE.Float32BufferAttribute(offsets, 3));
  g.setAttribute('aS', new THREE.Float32BufferAttribute(along, 1));
  g.setIndex(indices);
  g.computeBoundingSphere();
  return g;
};

const liquidMaterial = (quality: Quality, uniforms: { uTime: { value: number }; uReveal: { value: number } }) => {
  const high = quality === 'high';
  const m = new THREE.MeshPhysicalMaterial({
    // golden perfume rather than water: warm body, partial transmission
    color: high ? '#E8CB8C' : '#DCBF83',
    roughness: 0.035,
    metalness: 0.05,
    transmission: high ? 0.7 : 0,
    thickness: 0.6,
    ior: 1.38,
    attenuationColor: new THREE.Color('#B8903F'),
    attenuationDistance: 0.2,
    emissive: new THREE.Color('#B8913F'),
    emissiveIntensity: 0.06,
    sheen: 0.6,
    sheenColor: new THREE.Color('#F7E6BC'),
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    specularIntensity: 1,
    specularColor: new THREE.Color('#FFF4DA'),
    envMapIntensity: 1.5,
    transparent: !high,
    opacity: high ? 1 : 0.62,
  });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uReveal = uniforms.uReveal;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        attribute float aS;
        attribute vec3 aOff;
        uniform float uTime;
        uniform float uReveal;
        varying float vS;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vS = aS;
        // tapered head while the arc pours in
        float grow = smoothstep(uReveal, uReveal - 0.12, aS);
        transformed -= aOff * (1.0 - grow);
        // slow travelling waves: the liquid breathes and flows
        float wave = sin(aS * 9.0 - uTime * 0.8) * 0.16 + sin(aS * 21.0 + uTime * 0.5) * 0.06;
        transformed += aOff * wave;
        transformed.y += sin(aS * 5.0 + uTime * 0.35) * 0.028;
        transformed.x += cos(aS * 4.0 + uTime * 0.28) * 0.018;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform float uReveal;\nvarying float vS;`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n if (vS > uReveal) discard;`);
  };
  m.customProgramCacheKey = () => `nb-liquid-${quality}`;
  return m;
};

interface DropState {
  arc: number;
  s: number; // where on the arc it detaches
  drift: THREE.Vector3;
  life: number;
  period: number;
  size: number;
}

interface Props {
  quality: Quality;
  /** 0..1 pour progress (intro x scroll) */
  reveal: () => number;
  /** 0..1 how visible the droplets are */
  drops: () => number;
  frozen?: boolean;
}

const Splash = ({ quality, reveal, drops, frozen }: Props) => {
  const high = quality === 'high';
  const uniforms = useMemo(() => ARCS.map(() => ({ uTime: { value: 0 }, uReveal: { value: 0 } })), []);
  const curves = useMemo(() => ARCS.map(arcCurve), []);
  const geometries = useMemo(() => ARCS.map((a, i) => buildRibbon(curves[i], a, high ? 220 : 120, high ? 14 : 8)), [curves, high]);
  const materials = useMemo(() => ARCS.map((_, i) => liquidMaterial(quality, uniforms[i])), [quality, uniforms]);

  const dropCount = high ? 34 : 14;
  const inst = useRef<THREE.InstancedMesh>(null);
  const dropMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#F4E6C2',
        roughness: 0.02,
        transmission: high ? 1 : 0,
        thickness: 0.06,
        ior: 1.36,
        attenuationColor: new THREE.Color('#C9A45E'),
        attenuationDistance: 0.15,
        clearcoat: 1,
        envMapIntensity: 1.8,
        transparent: !high,
        opacity: high ? 1 : 0.75,
      }),
    [high]
  );
  const dropsState = useMemo<DropState[]>(() => {
    const out: DropState[] = [];
    for (let i = 0; i < dropCount; i += 1) {
      const k = i % 5 === 4 ? 2 : i % 2;
      out.push({
        arc: k,
        s: 0.15 + ((i * 0.618) % 1) * 0.8,
        drift: new THREE.Vector3(Math.sin(i * 12.9) * 0.22, 0.05 + ((i * 0.37) % 1) * 0.18, Math.cos(i * 7.3) * 0.22),
        life: (i * 0.371) % 1,
        period: 9 + ((i * 1.7) % 6),
        size: 0.009 + ((i * 0.53) % 1) * 0.022,
      });
    }
    return out;
  }, [dropCount]);

  useEffect(
    () => () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      dropMaterial.dispose();
    },
    [geometries, materials, dropMaterial]
  );

  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const sc = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame((_, delta) => {
    const dt = frozen ? 0 : Math.min(delta, 0.05);
    const r = reveal();
    ARCS.forEach((a, i) => {
      uniforms[i].uTime.value += dt;
      // each arc pours slightly after the previous one
      uniforms[i].uReveal.value = THREE.MathUtils.clamp((r - a.delay) / (1 - a.delay), 0, 1) * 1.02;
    });

    const mesh = inst.current;
    if (!mesh) return;
    const vis = drops();
    dropsState.forEach((d, i) => {
      d.life = (d.life + dt / d.period) % 1;
      const arcReveal = uniforms[d.arc].uReveal.value;
      const alive = arcReveal > d.s ? vis : 0;
      const curve = curves[d.arc];
      curve.getPointAt(d.s, p);
      curve.getTangentAt(d.s, tangent);
      // slow-motion flight: carried along the tangent, drifting, barely falling
      const t = d.life;
      p.addScaledVector(tangent, t * 0.55).addScaledVector(d.drift, t).addScaledVector(up, -t * t * 0.18);
      const env = Math.sin(Math.PI * t) * alive;
      sc.set(d.size, d.size * 1.12, d.size).multiplyScalar(Math.max(0.0001, env));
      q.setFromUnitVectors(up, tangent);
      m4.compose(p, q, sc);
      mesh.setMatrixAt(i, m4);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {geometries.map((g, i) => (
        <mesh key={i} geometry={g} material={materials[i]} renderOrder={1} />
      ))}
      <instancedMesh ref={inst} args={[undefined, undefined, dropCount]} material={dropMaterial} frustumCulled={false}>
        <sphereGeometry args={[1, 16, 12]} />
      </instancedMesh>
    </group>
  );
};

export default Splash;
