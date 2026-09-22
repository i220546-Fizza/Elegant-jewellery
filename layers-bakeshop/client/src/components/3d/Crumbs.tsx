import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { layersColors } from '../../utils/colors';

interface CrumbsProps {
  count?: number;
  reduceMotion: boolean;
}

export default function Crumbs({ count = 22, reduceMotion }: CrumbsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 4 - 1,
        ),
        speed: 0.15 + Math.random() * 0.25,
        offset: Math.random() * Math.PI * 2,
        scale: 0.04 + Math.random() * 0.07,
      })),
    [count],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current || reduceMotion) return;
    particles.forEach((p, i) => {
      const t = state.clock.elapsedTime * p.speed + p.offset;
      dummy.position.set(p.position.x + Math.sin(t) * 0.4, p.position.y + Math.cos(t * 0.7) * 0.3, p.position.z);
      dummy.rotation.set(t, t * 0.6, 0);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={layersColors.accentSoft} roughness={0.6} />
    </instancedMesh>
  );
}
