import { lazy, Suspense, useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const HeroScene = lazy(() => import('./3d/HeroScene'));

function HeroFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
      <div className="h-56 w-56 animate-pulse rounded-full bg-layers-accent-soft/40 blur-2xl" />
    </div>
  );
}

/**
 * Defers WebGL scene creation until the browser is idle and skips it
 * entirely when the device reports no WebGL support, so the hero never
 * blocks first paint or crashes on low-power devices.
 */
export default function HeroCanvas() {
  const prefersReduced = useReducedMotion();
  const [canRender3d, setCanRender3d] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebglSupported(!!gl);
    } catch {
      setWebglSupported(false);
    }

    const idle = (window as typeof window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (idle) {
      idle(() => setCanRender3d(true));
    } else {
      const t = setTimeout(() => setCanRender3d(true), 200);
      return () => clearTimeout(t);
    }
  }, []);

  if (!webglSupported) return <HeroFallback />;

  return (
    <Suspense fallback={<HeroFallback />}>
      {canRender3d ? <HeroScene reduceMotion={!!prefersReduced} /> : <HeroFallback />}
    </Suspense>
  );
}
