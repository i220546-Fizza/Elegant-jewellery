import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useIsTouchDevice } from '../hooks/useIsTouchDevice';

export default function CustomCursor() {
  const isTouch = useIsTouchDevice();
  const prefersReduced = useReducedMotion();
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (isTouch || prefersReduced) return;

    document.documentElement.classList.add('no-cursor');

    function onMove(e: MouseEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!isVisible) setIsVisible(true);
      const target = e.target as HTMLElement;
      setIsPointer(!!target.closest('a, button, [data-cursor-hover], input, textarea, select'));
    }

    function onLeave() {
      setIsVisible(false);
    }

    window.addEventListener('mousemove', onMove);
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      document.documentElement.classList.remove('no-cursor');
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTouch, prefersReduced]);

  if (isTouch || prefersReduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
      style={{ x: springX, y: springY, opacity: isVisible ? 1 : 0 }}
    >
      <motion.div
        className="rounded-full border border-layers-accent"
        animate={{
          width: isPointer ? 46 : 26,
          height: isPointer ? 46 : 26,
          x: isPointer ? -23 : -13,
          y: isPointer ? -23 : -13,
          backgroundColor: isPointer ? 'rgba(201,162,75,0.14)' : 'rgba(110,30,44,0.06)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      />
    </motion.div>
  );
}
