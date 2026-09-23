import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * The studio backdrop, rendered inside the scene so transmissive glass and
 * liquid refract warm ivory light instead of an empty (black) buffer. Colours
 * match the page exactly at the edges; a soft taupe light pool sits behind the
 * subject and drifts slightly against the cursor.
 */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uIvory;
  uniform vec3 uTaupe;
  uniform vec3 uGold;
  uniform vec2 uPool;
  uniform float uAspect;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - uPool;
    p.x *= uAspect;
    float pool = exp(-dot(p, p) * 5.5);
    float floorGlow = smoothstep(0.42, 0.0, vUv.y);
    vec3 col = uIvory;
    col = mix(col, uTaupe, pool * 0.55);
    col = mix(col, uGold, pool * pool * 0.06);
    col = mix(col, uTaupe, floorGlow * 0.32);
    gl_FragColor = vec4(col, uOpacity);
    #include <colorspace_fragment>
  }
`;

interface Props {
  /** where the light pool sits, in 0..1 screen space */
  pool: () => { x: number; y: number };
  pointer?: React.MutableRefObject<{ x: number; y: number }>;
  distance?: number;
}

const Backdrop = ({ pool, pointer, distance = 5 }: Props) => {
  const mesh = useRef<THREE.Mesh>(null);
  const { camera, size } = useThree();
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        depthWrite: false,
        toneMapped: false,
        uniforms: {
          uIvory: { value: new THREE.Color('#F8F7F3') },
          uTaupe: { value: new THREE.Color('#D8D0C2') },
          uGold: { value: new THREE.Color('#C9B27C') },
          uPool: { value: new THREE.Vector2(0.7, 0.52) },
          uAspect: { value: 1 },
          uOpacity: { value: 1 },
        },
      }),
    []
  );

  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;
    const cam = camera as THREE.PerspectiveCamera;
    // sit `distance` behind the origin and always fill the frame
    const d = cam.position.z + distance;
    const h = 2 * d * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * 1.08;
    const w = h * (size.width / size.height);
    m.position.set(cam.position.x, cam.position.y, -distance);
    m.scale.set(w, h, 1);
    material.uniforms.uAspect.value = size.width / size.height;
    const target = pool();
    const px = pointer ? pointer.current.x * -0.012 : 0;
    const py = pointer ? pointer.current.y * 0.01 : 0;
    const u = material.uniforms.uPool.value as THREE.Vector2;
    u.x = THREE.MathUtils.damp(u.x, target.x + px, 2, delta);
    u.y = THREE.MathUtils.damp(u.y, target.y + py, 2, delta);
  });

  return (
    <mesh ref={mesh} material={material} renderOrder={-10}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
};

export default Backdrop;
