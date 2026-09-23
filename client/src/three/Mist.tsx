import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { createCloudGeometry, createParticleMaterial, type CloudShape, type ParticleOptions } from './particles';

export interface MistDrivers {
  /** 0..1 how far the mist has emerged */
  intro?: () => number;
  /** 0..1 how far the mist has dispersed into the background */
  disperse?: () => number;
  /** normalised cursor -1..1 */
  pointer?: React.MutableRefObject<{ x: number; y: number }>;
  /** height band to gather around, and how strongly (0..1) */
  attract?: () => { y: number; amount: number };
  /** distance from the camera that is in focus */
  focus?: number;
  frozen?: boolean;
}

interface Props extends MistDrivers {
  shape: CloudShape;
  look: ParticleOptions;
  renderOrder?: number;
}

export const MIST_LAYER = 1;

const Mist = ({ shape, look, intro, disperse, pointer, attract, focus, frozen, renderOrder = 3 }: Props) => {
  const geometry = useMemo(() => createCloudGeometry(shape), [shape]);
  const material = useMemo(() => createParticleMaterial(look), [look]);
  const points = useRef<THREE.Points>(null);
  const { size, viewport, gl, camera } = useThree();
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const inv = useMemo(() => new THREE.Matrix4(), []);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  // Particles live on layer 1 so depth-only passes (the contact shadow) never
  // see them; the main camera renders both layers.
  useEffect(() => {
    points.current?.layers.set(MIST_LAYER);
    camera.layers.enable(MIST_LAYER);
  }, [camera]);

  useFrame((state, delta) => {
    const u = material.uniforms;
    if (!frozen) u.uTime.value += Math.min(delta, 0.05);
    u.uScale.value = size.height * gl.getPixelRatio() * 0.5;
    u.uIntro.value = intro ? intro() : 1;
    u.uDisperse.value = disperse ? disperse() : 0;
    u.uFocus.value = focus ?? camera.position.length();
    if (attract) {
      const a = attract();
      u.uAttractY.value = a.y;
      u.uAttract.value = THREE.MathUtils.damp(u.uAttract.value, a.amount, 2.2, delta);
    }
    if (pointer && points.current) {
      const { x, y } = pointer.current;
      u.uPointer.value.x = THREE.MathUtils.damp(u.uPointer.value.x, x, 2.5, delta);
      u.uPointer.value.y = THREE.MathUtils.damp(u.uPointer.value.y, -y, 2.5, delta);
      // cursor position on the z = 0 plane, in the cloud's local space
      tmp.set((x * viewport.width) / 2, (-y * viewport.height) / 2, 0);
      inv.copy(points.current.matrixWorld).invert();
      tmp.applyMatrix4(inv);
      u.uPointerWorld.value.lerp(tmp, Math.min(1, delta * 4));
    }
    void state;
  });

  return <points ref={points} geometry={geometry} material={material} renderOrder={renderOrder} frustumCulled={false} />;
};

export default Mist;
