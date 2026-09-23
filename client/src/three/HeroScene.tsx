import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, PerformanceMonitor } from '@react-three/drei';
import PerfumeBottle, { bottleHeight, type Quality } from './PerfumeBottle';
import Studio from './Studio';
import Mist from './Mist';
import Splash from './Splash';
import Backdrop from './Backdrop';
import type { CloudShape, ParticleOptions } from './particles';
import type { BottleSpec } from '../types';

export interface HeroSceneProps {
  quality: Quality;
  /** 0..1 progress through the sticky hero (scroll storytelling) */
  scrollProgress: () => number;
  reduced: boolean;
  onReady?: () => void;
  className?: string;
}

const BOTTLE: BottleSpec = { shape: 'classic', liquid: '#EBDDB4', cap: 'gold', glass: 'clear' };

// Module-level so materials / geometries are created once.
const MIST_LOOK: ParticleOptions = { color: '#C8AE78', color2: '#EDE0C2', opacity: 0.15, softness: 1, swirl: 0.03, aperture: 0.22 };
// lighter haze on phones, where the glass is alpha-blended and would read milky under dense mist
const MIST_LOOK_LOW: ParticleOptions = { ...MIST_LOOK, opacity: 0.09 };
const DUST_LOOK: ParticleOptions = { color: '#BFA36A', color2: '#FFF3D6', opacity: 0.95, softness: 0.35, sparkle: 0.8, swirl: 0.02, aperture: 0.45 };
const MIST_HIGH: CloudShape = { count: 300, radius: [0.55, 2.8], height: [-1.15, 1.4], size: [0.6, 1.35], lowBias: 1.7, seed: 11 };
const MIST_LOW: CloudShape = { ...MIST_HIGH, count: 110 };
const DUST_HIGH: CloudShape = { count: 110, radius: [0.7, 3.2], height: [-1.1, 1.9], size: [0.018, 0.05], seed: 29 };
const DUST_LOW: CloudShape = { ...DUST_HIGH, count: 45 };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const easeInOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const seg = (t: number, a: number, b: number, fn = easeOut) => fn((t - a) / (b - a));

interface Timeline {
  bottle: number;
  turn: number;
  mist: number;
  splash: number;
  drops: number;
  sweep: number;
  scroll: number;
}

/**
 * The commercial: a timeline started on the first rendered frame drives the
 * bottle's arrival, the mist, the pour of the liquid arcs, droplets and a
 * light sweep. Scroll then carries the bottle to centre, turns it and lets the
 * mist disperse into the page.
 */
const Commercial = ({ quality, scrollProgress, reduced, onReady }: Omit<HeroSceneProps, 'className'>) => {
  const { viewport, size, camera } = useThree();
  const stage = useRef<THREE.Group>(null);
  const bottle = useRef<THREE.Group>(null);
  const arcs = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const start = useRef<number | null>(null);
  const tl = useRef<Timeline>({ bottle: 0, turn: 0, mist: 0, splash: 0, drops: 0, sweep: -9, scroll: 0 });
  const h = bottleHeight(BOTTLE);
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

  const wide = size.width / size.height > 1.05;

  useFrame((state, delta) => {
    if (start.current === null) {
      start.current = state.clock.elapsedTime;
      requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
    }
    const t = reduced ? 100 : state.clock.elapsedTime - start.current;
    const p = clamp01(scrollProgress());
    const v = tl.current;

    // --- the opening sequence ---
    v.bottle = seg(t, 0.2, 2.8);
    v.turn = seg(t, 0.2, 3.8, easeInOut);
    v.mist = seg(t, 1.0, 4.6);
    v.splash = seg(t, 1.8, 5.2, easeInOut);
    v.drops = seg(t, 2.8, 4.4);
    v.scroll = p;
    // light travels across the glass once, then returns every twelve seconds
    if (reduced) v.sweep = -9;
    else if (t < 5.6) v.sweep = -9 + seg(t, 2.4, 5.6, easeInOut) * 18;
    else {
      const c = ((t - 5.6) % 12) / 5.5;
      v.sweep = c < 1 ? -9 + easeInOut(c) * 18 : 9;
    }

    // --- cursor, softened ---
    smooth.current.x = THREE.MathUtils.damp(smooth.current.x, pointer.current.x, 2.2, delta);
    smooth.current.y = THREE.MathUtils.damp(smooth.current.y, pointer.current.y, 2.2, delta);
    const { x: px, y: py } = smooth.current;

    // --- layout + scroll storytelling ---
    const g = stage.current;
    if (g) {
      const baseX = wide ? viewport.width * 0.235 : 0;
      const baseY = wide ? -0.08 : viewport.height * 0.2;
      const baseS = wide ? 0.94 : Math.min(0.72, (viewport.width / 3.4) * 0.72);
      const toCentre = seg(p, 0.05, 0.6, easeInOut);
      g.position.x = baseX * (1 - toCentre);
      g.position.y = baseY + p * 0.45 + (1 - v.bottle) * -0.45 + (reduced ? 0 : Math.sin(t * 0.5) * 0.02);
      g.scale.setScalar(baseS * (0.94 + 0.06 * v.bottle) * (1 - 0.14 * p));
    }
    const b = bottle.current;
    if (b) {
      // arrival turn + tilt, then the cursor gently leads the bottle
      b.rotation.y = -0.7 * (1 - v.turn) + px * 0.28 + p * 1.25;
      b.rotation.z = 0.07 * (1 - v.turn) - px * 0.03;
      b.rotation.x = py * 0.07;
    }
    if (arcs.current) {
      arcs.current.position.x = px * 0.07;
      arcs.current.position.y = -py * 0.05;
      arcs.current.rotation.y = -p * 0.6 + px * 0.08;
    }
    camera.position.z = 8.4 - p * 0.7;
    camera.lookAt(0, 0.05, 0);
  });

  const mistShape = high ? MIST_HIGH : MIST_LOW;
  const dustShape = high ? DUST_HIGH : DUST_LOW;
  const disperse = () => seg(tl.current.scroll, 0.1, 0.7, easeInOut);

  // light pool follows the bottle: right of the headline, centred once scrolled
  const poolAt = () => {
    const toCentre = seg(tl.current.scroll, 0.05, 0.6, easeInOut);
    return wide ? { x: 0.735 - 0.235 * toCentre, y: 0.5 } : { x: 0.5, y: 0.72 };
  };

  return (
    <>
      <Backdrop pool={poolAt} pointer={reduced ? undefined : pointer} />
      <Studio quality={quality} pointer={reduced ? undefined : pointer} shadowY={false} sweep={() => tl.current.sweep} liveEnvironment={high && !reduced} />
      <group ref={stage}>
        <group ref={bottle}>
          <group position={[0, -h / 2, 0]}>
            <PerfumeBottle spec={BOTTLE} name="Éclat" quality={quality} />
          </group>
        </group>
        <ContactShadows position={[0, -h / 2 + 0.002, 0]} opacity={0.45} scale={5} blur={2.8} far={2.2} resolution={high ? 512 : 256} color="#2a241c" frames={high ? Infinity : 1} />
        <group ref={arcs}>
          <Splash
            quality={quality}
            reveal={() => tl.current.splash * (1 - seg(tl.current.scroll, 0.12, 0.5, easeInOut))}
            drops={() => tl.current.drops * (1 - seg(tl.current.scroll, 0.08, 0.35))}
            frozen={reduced}
          />
        </group>
        <Mist shape={mistShape} look={high ? MIST_LOOK : MIST_LOOK_LOW} intro={() => tl.current.mist} disperse={disperse} pointer={pointer} frozen={reduced} focus={8.4} />
        <Mist shape={dustShape} look={DUST_LOOK} intro={() => tl.current.drops} disperse={disperse} pointer={pointer} frozen={reduced} focus={8.4} renderOrder={4} />
      </group>
    </>
  );
};

const HeroScene = ({ quality, scrollProgress, reduced, onReady, className }: HeroSceneProps) => {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, quality === 'high' ? 1.75 : 1.25));
  const camera = useMemo(() => ({ fov: 28, near: 0.1, far: 60, position: [0, 0.25, 8.4] as [number, number, number] }), []);

  useEffect(() => {
    const el = wrapper.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '80px' });
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
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.25))} />
        <Suspense fallback={null}>
          <Commercial quality={quality} scrollProgress={scrollProgress} reduced={reduced} onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HeroScene;
