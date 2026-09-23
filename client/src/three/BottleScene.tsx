import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import type { BottleSpec } from '../types';
import PerfumeBottle, { bottleHeight, type Quality } from './PerfumeBottle';
import Studio from './Studio';
import GLBModel from './GLBModel';

export interface BottleSceneProps {
  spec: BottleSpec;
  name: string;
  modelUrl?: string;
  /** 'hero' follows the cursor window-wide; 'viewer' allows full drag rotation; 'static' is still. */
  mode?: 'hero' | 'viewer' | 'static';
  quality?: Quality;
  /** returns 0..1 scroll progress for scroll-linked positioning */
  scrollProgress?: () => number;
  /** 0..1 height to highlight with a champagne ring (composition section), or null */
  highlight?: number | null;
  initialYaw?: number;
  zoom?: number;
  cameraY?: number;
  onReady?: () => void;
  preserveDrawingBuffer?: boolean;
  className?: string;
  interactive?: boolean;
}

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const Rig = ({
  spec,
  name,
  modelUrl,
  mode,
  quality,
  scrollProgress,
  highlight,
  initialYaw = 0,
  pointer,
  drag,
}: Required<Pick<BottleSceneProps, 'spec' | 'name' | 'mode' | 'quality'>> &
  Pick<BottleSceneProps, 'modelUrl' | 'scrollProgress' | 'highlight' | 'initialYaw'> & {
    pointer: React.MutableRefObject<{ x: number; y: number }>;
    drag: React.MutableRefObject<{ yaw: number; pitch: number; active: boolean }>;
  }) => {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const reduced = useMemo(prefersReducedMotion, []);
  const height = bottleHeight(spec);
  const bodyHeight = height - 0.6;

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const follow = mode !== 'static' && !reduced;
    const px = follow ? pointer.current.x : 0;
    const py = follow ? pointer.current.y : 0;
    const scroll = scrollProgress ? scrollProgress() : 0;

    const targetYaw = initialYaw + drag.current.yaw + px * (mode === 'hero' ? 0.38 : 0.18) - scroll * 0.5;
    const targetPitch = drag.current.pitch + py * 0.08;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetYaw, drag.current.active ? 10 : 2.4, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetPitch, 2.4, delta);

    const float = reduced || mode === 'static' ? 0 : Math.sin(t * 0.6) * 0.025;
    g.position.y = THREE.MathUtils.damp(g.position.y, float - scroll * 0.35, 3, delta);
    g.position.x = THREE.MathUtils.damp(g.position.x, px * (mode === 'hero' ? 0.12 : 0.04), 2, delta);

    // Let go: drag offset eases back to rest in the hero, stays put in the viewer.
    if (!drag.current.active && mode === 'hero') drag.current.yaw = THREE.MathUtils.damp(drag.current.yaw, 0, 1.2, delta);
    if (!drag.current.active) drag.current.pitch = THREE.MathUtils.damp(drag.current.pitch, 0, 2, delta);

    if (ring.current) {
      const visible = highlight !== null && highlight !== undefined;
      const mat = ring.current.material as THREE.MeshStandardMaterial;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, visible ? 0.95 : 0, 3, delta);
      if (visible) ring.current.position.y = THREE.MathUtils.damp(ring.current.position.y, 0.12 + highlight! * bodyHeight, 2.2, delta);
      ring.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={group} rotation={[0, initialYaw, 0]}>
      <group position={[0, -height / 2 + 0.05, 0]}>
        {modelUrl ? (
          <GLBModel url={modelUrl} targetHeight={height} fallback={<PerfumeBottle spec={spec} name={name} quality={quality} />} />
        ) : (
          <PerfumeBottle spec={spec} name={name} quality={quality} />
        )}
        {highlight !== undefined && (
          <mesh ref={ring} position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.05, 0.006, 12, 128]} />
            <meshStandardMaterial color="#C9B27C" emissive="#C9B27C" emissiveIntensity={0.9} metalness={1} roughness={0.2} transparent opacity={0} />
          </mesh>
        )}
      </group>
    </group>
  );
};

const FrameCamera = ({ spec, zoom = 1, cameraY = 0 }: { spec: BottleSpec; zoom?: number; cameraY?: number }) => {
  const { camera, size } = useThree();
  useEffect(() => {
    const h = bottleHeight(spec);
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const fitH = (h * 1.14) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
    const fitW = (1.9 * 1.12) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * aspect);
    const dist = Math.max(fitH, fitW) / zoom;
    cam.position.set(0, 0.35 + cameraY, dist);
    cam.lookAt(0, cameraY * 0.6, 0);
    cam.updateProjectionMatrix();
  }, [camera, size, spec, zoom, cameraY]);
  return null;
};

const ReadySignal = ({ onReady }: { onReady?: () => void }) => {
  const done = useRef(false);
  useFrame(() => {
    if (!done.current) {
      done.current = true;
      // wait a couple of frames so the environment and shadows are baked
      requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
    }
  });
  return null;
};

/**
 * A WebGL "showroom" for one bottle. Renders only while on screen, lowers its
 * pixel ratio when the device struggles, and exposes cursor / drag / scroll.
 */
const BottleScene = ({
  spec,
  name,
  modelUrl,
  mode = 'viewer',
  quality = 'high',
  scrollProgress,
  highlight,
  initialYaw,
  zoom,
  cameraY,
  onReady,
  preserveDrawingBuffer,
  className,
  interactive = true,
}: BottleSceneProps) => {
  const wrapper = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const drag = useRef({ yaw: 0, pitch: 0, active: false });
  const [visible, setVisible] = useState(true);
  const [dpr, setDpr] = useState<number>(() => Math.min(window.devicePixelRatio || 1, quality === 'high' ? 1.75 : 1.25));

  // Pause rendering entirely when scrolled out of view.
  useEffect(() => {
    const el = wrapper.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Cursor position: window-wide in the hero, relative to the canvas elsewhere.
  useEffect(() => {
    if (mode === 'static') return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && !drag.current.active) return;
      if (mode === 'hero') {
        pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      } else if (wrapper.current) {
        const r = wrapper.current.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        pointer.current.x = inside ? ((e.clientX - r.left) / r.width) * 2 - 1 : 0;
        pointer.current.y = inside ? ((e.clientY - r.top) / r.height) * 2 - 1 : 0;
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [mode]);

  // Drag to turn the bottle.
  const last = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive || mode === 'static') return;
    last.current = { x: e.clientX, y: e.clientY };
    drag.current.active = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active || !last.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    const limit = mode === 'hero' ? 1.1 : Infinity;
    drag.current.yaw = THREE.MathUtils.clamp(drag.current.yaw + dx * 0.012, -limit, limit);
    drag.current.pitch = THREE.MathUtils.clamp(drag.current.pitch + dy * 0.004, -0.25, 0.25);
  };
  const endDrag = () => {
    drag.current.active = false;
    last.current = null;
  };

  return (
    <div
      ref={wrapper}
      className={className}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      style={{ touchAction: mode === 'viewer' ? 'pan-y' : 'auto', cursor: interactive && mode !== 'static' ? 'grab' : 'default' }}
    >
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={dpr}
        camera={{ fov: 26, near: 0.1, far: 50, position: [0, 0.4, 8] }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: !!preserveDrawingBuffer, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.25))} />
        <FrameCamera spec={spec} zoom={zoom} cameraY={cameraY} />
        <Suspense fallback={null}>
          <Studio quality={quality} pointer={mode === 'static' ? undefined : pointer} staticShadows={mode === 'static' || quality === 'low'} />
          <Rig
            spec={spec}
            name={name}
            modelUrl={modelUrl}
            mode={mode}
            quality={quality}
            scrollProgress={scrollProgress}
            highlight={highlight}
            initialYaw={initialYaw}
            pointer={pointer}
            drag={drag}
          />
          <ReadySignal onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default BottleScene;
