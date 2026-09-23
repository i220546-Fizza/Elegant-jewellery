import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Bottle3D from '../product/Bottle3D';
import { ArrowRight } from '../ui/Icons';
import type { BottleSpec } from '../../types';

const HERO_BOTTLE: BottleSpec = { shape: 'classic', liquid: '#EBDDB4', cap: 'gold', glass: 'clear' };
const ease = [0.22, 1, 0.36, 1] as const;

const Line = ({ children, delay }: { children: React.ReactNode; delay: number }) => (
  <span className="block overflow-hidden pb-[0.06em]">
    <motion.span className="block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.5, delay, ease }}>
      {children}
    </motion.span>
  </span>
);

const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const bottleY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '12%']);

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] overflow-hidden bg-ivory">
      {/* soft studio light pools */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute right-[-10%] top-[5%] h-[80vh] w-[70vw] rounded-full bg-[radial-gradient(closest-side,rgba(216,208,194,0.75),transparent)]" />
        <div className="absolute bottom-0 left-0 h-[35vh] w-full bg-gradient-to-t from-taupe/40 to-transparent" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="container-lux grid min-h-[100svh] grid-cols-1 items-center pb-16 pt-28 lg:grid-cols-12 lg:pb-0 lg:pt-24">
        <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10 order-2 lg:order-1 lg:col-span-7">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, delay: 0.2 }} className="eyebrow flex items-center gap-4">
            <span className="gold-rule" />
            The art of timeless fragrance
          </motion.p>

          <h1 className="mt-7 font-serif text-display font-light uppercase text-ink">
            <Line delay={0.3}>Scents that</Line>
            <Line delay={0.45}>
              <span className="italic text-stone">become</span>
            </Line>
            <Line delay={0.6}>Signatures.</Line>
          </h1>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 1.1, ease }} className="mt-8 max-w-md text-[15px] leading-relaxed text-stone">
            Discover timeless fragrances crafted to leave a lasting impression.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 1.3, ease }} className="mt-10 flex flex-wrap gap-4">
            <Link to="/collections" className="btn-dark">
              Explore collection <ArrowRight size={14} />
            </Link>
            <Link to="/our-story" className="btn-outline">
              Discover our story
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: bottleY }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.2, ease }}
          className="relative order-1 h-[52svh] min-h-[340px] lg:order-2 lg:col-span-5 lg:h-[86svh]"
        >
          <Bottle3D
            spec={HERO_BOTTLE}
            name="Éclat"
            mode="hero"
            poster="/uploads/products/eclat-1.webp"
            posterAlt="NB Classic Scents Éclat eau de parfum"
            scrollProgress={() => scrollYProgress.get()}
            zoom={0.86}
            className="absolute inset-0"
          />
          <div className="pointer-events-none absolute bottom-6 right-0 hidden text-right lg:block">
            <p className="font-serif text-lg italic text-stone">Éclat</p>
            <p className="eyebrow mt-1 !text-[9px]">Signature Nº 01 — Eau de Parfum</p>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1.5 }} className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex">
        <span className="eyebrow !text-[9px]">Scroll</span>
        <span className="relative h-12 w-px overflow-hidden bg-taupe">
          <motion.span className="absolute inset-x-0 top-0 h-1/2 bg-gold" animate={reduced ? {} : { y: ['-100%', '200%'] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
        </span>
      </motion.div>
    </section>
  );
};

export default Hero;
