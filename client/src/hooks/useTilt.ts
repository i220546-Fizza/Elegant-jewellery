import { useRef } from 'react';
import { useMotionValue, useSpring, useTransform, useReducedMotion, type MotionValue } from 'framer-motion';

interface TiltOptions {
  max?: number;
  scale?: number;
}

interface TiltResult {
  ref: React.RefObject<HTMLDivElement>;
  style: {
    rotateX: MotionValue<number>;
    rotateY: MotionValue<number>;
    scale: MotionValue<number>;
    transformPerspective: number;
  };
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
}

/**
 * Subtle 3D tilt-on-hover, driven by framer-motion springs so it stays
 * smooth without per-frame React re-renders. No-ops under
 * prefers-reduced-motion (values stay at rest).
 */
const useTilt = ({ max = 10, scale = 1.02 }: TiltOptions = {}): TiltResult => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rawScale = useMotionValue(1);

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [max, -max]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-max, max]), { stiffness: 300, damping: 30 });
  const scaleSpring = useSpring(rawScale, { stiffness: 300, damping: 30 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - bounds.left) / bounds.width - 0.5);
    rawY.set((e.clientY - bounds.top) / bounds.height - 0.5);
    rawScale.set(scale);
  };

  const onMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    rawScale.set(1);
  };

  return {
    ref,
    style: { rotateX, rotateY, scale: scaleSpring, transformPerspective: 1000 },
    onMouseMove,
    onMouseLeave,
  };
};

export default useTilt;
