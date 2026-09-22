import { useRef } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Spring-driven 3D tilt-on-hover for cards, using CSS 3D transforms
 * (no WebGL) so it stays cheap enough to use on every product card.
 */
export function useTilt(maxTilt = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);
  const scale = useSpring(1, springConfig);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onMouseEnter() {
    scale.set(1.02);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
    scale.set(1);
  }

  return { ref, rotateX, rotateY, scale, onMouseMove, onMouseEnter, onMouseLeave };
}
