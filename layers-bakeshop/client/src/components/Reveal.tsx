import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  once?: boolean;
}

export default function Reveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 0.7,
  once = true,
}: RevealProps) {
  const prefersReduced = useReducedMotion();

  const offsets: Record<string, { x?: number; y?: number }> = {
    up: { y: 32 },
    left: { x: -32 },
    right: { x: 32 },
    none: {},
  };

  const variants: Variants = {
    hidden: { opacity: 0, ...offsets[direction] },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      className={className}
      initial={prefersReduced ? undefined : 'hidden'}
      whileInView={prefersReduced ? undefined : 'visible'}
      viewport={{ once, amount: 0.25 }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
