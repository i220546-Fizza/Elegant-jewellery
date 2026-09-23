import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, PerformanceMonitor } from '@react-three/drei';
import PerfumeBottle, { bottleHeight, type Quality } from './PerfumeBottle';
import Studio from './Studio';
import Mist from './Mist';
import Backdrop from './Backdrop';
import type { CloudShape, ParticleOptions } from './particles';
import type { BottleSpec } from '../types';

export const TRIO: { name: string; slug: string; spec: BottleSpec }[] = [
  { name: 'Éclat', slug: 'eclat', spec: { shape: 'classic', liquid: '#EBDDB4', cap: 'gold', glass: 'clear' } },
  { name: 'Essence', slug: 'essence', spec: { shape: 'round', liquid: '#E3B98E', cap: 'gold', glass: 'clear' } },
  { name: 'Noir', slug: 'noir', spec: { shape: 'facet', liquid: '#5B3A1E', cap: 'black', glass: 'smoke' } },
];

const HAZE_LOOK: ParticleOptions = { color: '#CBB27C', color2: '#EEE3C9', opacity: 0.1, softness: 1, swirl: 0.012, aperture: 0.2 };
const HAZE: CloudShape = { count: 160, radius: [0.4, 4.2], height: [-1.3, 0.6], size: [0.8, 1.6], lowBias: 1.4, seed: 5 };
const HAZE_LOW: CloudShape = { ...HAZE, count: 70 };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeInOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const seg = (t: number, a: number, b: number) => easeInOut((t - a) / (b - a));

/** Horizontal spacing as a fraction of the frame width, shared with the DOM labels. */
export const trioSpacing = (wide: boolean) => (wide ? 0.27 : 0.31);

const Composition = ({ quality, progress, reduced, onReady }: { quality: Quality; progress: () => number; reduced: boolean; onReady?: () => void }) => {
  const { viewport, size } = useThree();
  const bottles = useRef<(THREE.Group | null)[]>([]);
  const all = useRef<THREE.Group>(null);
  const floor = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const ready = useRef(false);
  const wide = size.width / size.height > 1.05;
  const high = quality === 'high';

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced]);

  const maxH = Math.max(...TRIO.map((b) => bottleHeight(b.spec)));

  useFrame((state, delta) => {
    if (!ready.current) {
      ready.current = true;
      requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
    }
    const q = reduced ? Math.max(0.6, progress()) : clamp01(progress());
    smooth.current.x = THREE.MathUtils.damp(smooth.current.x, pointer.current.x, 2, delta);
    smooth.current.y = THREE.MathUtils.damp(smooth.current.y, pointer.current.y, 2, delta);
    const spacing = viewport.width * trioSpacing(wide);
    const scale = wide ? Math.min(0.82, (viewport.height / 4.6) * 0.82) : Math.min(0.55, viewport.width / 5.6);
    const t = state.clock.elapsedTime;

    bottles.current.forEach((b, i) => {
      if (!b) return;
      // each bottle rises into place in turn, then settles into the trio
      const a = seg(q, 0.04 + i * 0.09, 0.42 + i * 0.09);
      const side = i - 1;
      b.position.x = side * spacing * (0.55 + 0.45 * a);
      b.position.y = -3.4 * (1 - a) + (reduced ? 0 : Math.sin(t * 0.5 + i) * 0.012);
      b.position.z = i === 1 ? 0.35 : 0;
      b.rotation.y = side * (1.1 * (1 - a) - 0.32) + smooth.current.x * 0.2 - q * 0.25 * side;
      b.scale.setScalar(scale * (0.9 + 0.1 * a));
    });
    if (floor.current) floor.current.position.y = (-maxH / 2) * scale - 0.005;
    if (all.current) {
      all.current.rotation.x = smooth.current.y * 0.03;
      all.current.position.y = 0.05 + seg(q, 0.75, 1) * 0.35;
    }
  });

  return (
    <>
      <Backdrop pool={() => ({ x: 0.5, y: 0.5 })} pointer={reduced ? undefined : pointer} />
      <Studio quality={quality} pointer={reduced ? undefined : pointer} shadowY={false} />
      <group ref={all}>
        {TRIO.map((b, i) => {
          return (
            <group key={b.slug} ref={(el) => (bottles.current[i] = el)}>
              <group position={[0, -maxH / 2, 0]}>
                <PerfumeBottle spec={b.spec} name={b.name} quality={quality} />
              </group>
            </group>
          );
        })}
        {/* one shared floor so neighbouring bottles don't cast into each other's shadow maps */}
        <group ref={floor}>
          <ContactShadows position={[0, 0, 0]} opacity={0.42} scale={[14, 5]} blur={2.4} far={2.6} resolution={high ? 1024 : 512} color="#2a241c" frames={high ? Infinity : 1} />
        </group>
        <Mist shape={high ? HAZE : HAZE_LOW} look={HAZE_LOOK} intro={() => seg(progress(), 0.15, 0.6)} disperse={() => seg(progress(), 0.85, 1)} pointer={pointer} frozen={reduced} focus={9} />
      </group>
    </>
  );
};

const TrioScene = ({ quality, progress, reduced, onReady, className }: { quality: Quality; progress: () => number; reduced: boolean; onReady?: () => void; className?: string }) => {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, quality === 'high' ? 1.6 : 1.25));
  const camera = useMemo(() => ({ fov: 28, near: 0.1, far: 60, position: [0, 0.35, 9] as [number, number, number] }), []);

  useEffect(() => {
    const el = wrapper.current;
    if (!el || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapper} className={className}>
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={dpr}
        camera={camera}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl, camera: cam }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.setClearColor(0x000000, 0);
          cam.lookAt(0, 0, 0);
        }}
      >
        <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.25))} />
        <Suspense fallback={null}>
          <Composition quality={quality} progress={progress} reduced={reduced} onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default TrioScene;
