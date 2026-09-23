import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import type { Quality } from './PerfumeBottle';

interface Props {
  quality: Quality;
  /** normalised pointer (-1..1) read every frame, drives subtle light movement */
  pointer?: React.MutableRefObject<{ x: number; y: number }>;
  shadowOpacity?: number;
  staticShadows?: boolean;
}

/**
 * Soft photographic studio: a procedural environment built from light-formers
 * (no HDR download), a warm key light that drifts gently with the cursor, and
 * a soft contact shadow on the floor.
 */
const Studio = ({ quality, pointer, shadowOpacity = 0.42, staticShadows = false }: Props) => {
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!pointer) return;
    const { x, y } = pointer.current;
    if (key.current) {
      key.current.position.x = THREE.MathUtils.damp(key.current.position.x, 3 - x * 2.2, 2, delta);
      key.current.position.y = THREE.MathUtils.damp(key.current.position.y, 5 + y * 1.2, 2, delta);
    }
    if (rim.current) {
      rim.current.rotation.y = THREE.MathUtils.damp(rim.current.rotation.y, x * 0.35, 1.5, delta);
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} color="#fbf6ea" />
      <directionalLight ref={key} position={[3, 5, 4]} intensity={1.6} color="#fff6e6" />
      <directionalLight position={[-4, 2.5, -3]} intensity={0.7} color="#efe6d4" />

      <Environment resolution={quality === 'high' ? 256 : 128} frames={1}>
        {/* warm ivory surroundings so metals reflect the room, not a black void */}
        <color attach="background" args={['#a89f90']} />
        <group ref={rim}>
          {/* large overhead softbox */}
          <Lightformer form="rect" intensity={1.1} color="#fffaf0" position={[0, 6, -1.5]} rotation-x={Math.PI / 2} scale={[8, 5, 1]} />
          {/* tall strip lights create the long vertical highlights on glass */}
          <Lightformer form="rect" intensity={3.2} color="#ffffff" position={[-3.2, 1.6, 2.4]} rotation-y={Math.PI / 3.2} scale={[0.6, 6, 1]} />
          <Lightformer form="rect" intensity={2.4} color="#fff3de" position={[3.4, 1.4, 1.8]} rotation-y={-Math.PI / 3} scale={[0.5, 6, 1]} />
          {/* warm champagne bounce from behind */}
          <Lightformer form="rect" intensity={1.2} color="#C9B27C" position={[0, 1, -5]} scale={[10, 3, 1]} />
          {/* ivory floor bounce */}
          <Lightformer form="rect" intensity={0.8} color="#F8F7F3" position={[0, -3, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} />
          <Lightformer form="ring" intensity={1.4} color="#ffffff" position={[1.8, 3.2, 3.5]} scale={1.2} />
        </group>
      </Environment>

      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={shadowOpacity}
        scale={6}
        blur={2.6}
        far={2.4}
        resolution={quality === 'high' ? 512 : 256}
        color="#2a241c"
        frames={staticShadows ? 1 : Infinity}
      />
    </>
  );
};

export default Studio;
