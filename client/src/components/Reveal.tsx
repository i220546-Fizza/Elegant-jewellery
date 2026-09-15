import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'span';
}

/**
 * Fades/slides content up into view once as it enters the viewport - the
 * "luxury fashion site" scroll feel the redesign calls for, without
 * re-triggering on every scroll pass.
 */
const Reveal = ({ children, delay = 0, y = 28, className }: Props) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export default Reveal;
