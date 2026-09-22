import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { layersColors } from '../../utils/colors';

interface CakeModelProps {
  reduceMotion: boolean;
}

const tierColors = [layersColors.primary, layersColors.primaryLight, layersColors.accentSoft];

export default function CakeModel({ reduceMotion }: CakeModelProps) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!group.current) return;

    target.current.x = state.pointer.y * 0.18;
    target.current.y = state.pointer.x * 0.28;

    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, target.current.x, 4, delta);
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      (reduceMotion ? 0 : state.clock.elapsedTime * 0.22) + target.current.y,
      4,
      delta,
    );
  });

  return (
    <Float speed={reduceMotion ? 0 : 1.4} rotationIntensity={reduceMotion ? 0 : 0.15} floatIntensity={reduceMotion ? 0 : 0.6}>
      <group ref={group} position={[0, -0.3, 0]}>
        {/* Cake tiers */}
        <mesh position={[0, -0.9, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1.6, 0.55, 48]} />
          <meshStandardMaterial color={tierColors[0]} roughness={0.45} metalness={0.05} />
        </mesh>
        <mesh position={[0, -0.35, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.15, 1.25, 0.5, 48]} />
          <meshStandardMaterial color={tierColors[1]} roughness={0.45} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.8, 0.9, 0.45, 48]} />
          <meshStandardMaterial color={tierColors[2]} roughness={0.4} metalness={0.08} />
        </mesh>

        {/* Frosting swirl top */}
        <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.55, 0.12, 24, 64]} />
          <meshStandardMaterial color={layersColors.accent} roughness={0.3} metalness={0.35} />
        </mesh>
        <mesh position={[0, 0.62, 0]} castShadow>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial color={layersColors.accent} roughness={0.25} metalness={0.4} />
        </mesh>

        {/* Cherry */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={layersColors.primary} roughness={0.2} metalness={0.1} />
        </mesh>

        {/* Gold trim rings between tiers */}
        {[-0.62, -0.1].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[y === -0.62 ? 1.5 : 1.15, 0.03, 12, 64]} />
            <meshStandardMaterial color={layersColors.accent} roughness={0.3} metalness={0.6} />
          </mesh>
        ))}

        {!reduceMotion && (
          <Sparkles count={30} scale={[3.2, 2.6, 3.2]} size={2.5} speed={0.3} color={layersColors.accent} opacity={0.6} />
        )}
      </group>
    </Float>
  );
}
