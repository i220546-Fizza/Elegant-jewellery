import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment } from '@react-three/drei';
import CakeModel from './CakeModel';
import Crumbs from './Crumbs';

interface HeroSceneProps {
  reduceMotion: boolean;
}

export default function HeroScene({ reduceMotion }: HeroSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.4, 6], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 5, 3]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 2, -2]} intensity={0.4} color="#c9a24b" />

      <Suspense fallback={null}>
        <CakeModel reduceMotion={reduceMotion} />
        <Crumbs reduceMotion={reduceMotion} />
        <ContactShadows position={[0, -1.55, 0]} opacity={0.35} scale={8} blur={2.4} far={2} />
        <Environment preset="apartment" />
      </Suspense>
    </Canvas>
  );
}
