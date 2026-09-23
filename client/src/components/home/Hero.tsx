import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight } from '../ui/Icons';
import { WebGLBoundary, hasWebGL } from '../product/webgl';
import { useDeviceQuality } from '../../hooks/useDeviceQuality';
import { assetUrl } from '../../lib/format';

const HeroScene = lazy(() => import('../../three/HeroScene'));
const ease = [0.22, 1, 0.36, 1] as const;

// The typography arrives last, after the bottle, mist and pour have played.
const TEXT_DELAY = 2.2;

const Line = ({ children, delay, reduced }: { children: React.ReactNode; delay: number; reduced: boolean }) => (
  <span className="block overflow-hidden pb-[0.06em]">
    <motion.span className="block" initial={reduced ? false : { y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.6, delay, ease }}>
      {children}
    </motion.span>
  </span>
);

/**
 * A perfume commercial as a hero: a sticky, full-bleed stage where the bottle
 * arrives, mist blooms, liquid arcs pour around it and light crosses the
 * glass. Scrolling carries the bottle to centre while the mist disperses.
 */
const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const reduced = !!useReducedMotion();
  const quality = useDeviceQuality();
  const [supported, setSupported] = useState(true);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    setSupported(hasWebGL());
    const t = setTimeout(() => setSlow(true), 3200);
    return () => clearTimeout(t);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // explicit clamped ramps (0..1 progress through the sticky stage)
  const ramp = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));
  const textOpacity = useTransform(scrollYProgress, (v) => 1 - ramp(v, 0, 0.28));
  const textY = useTransform(scrollYProgress, (v) => (reduced ? 0 : -90 * ramp(v, 0, 0.35)));
  const stageOpacity = useTransform(scrollYProgress, (v) => 1 - ramp(v, 0.8, 1));
  const cueOpacity = useTransform(scrollYProgress, (v) => 1 - ramp(v, 0, 0.08));

  // the backdrop drifts a few pixels against the cursor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const bx = useSpring(mx, { stiffness: 30, damping: 20 });
  const by = useSpring(my, { stiffness: 30, damping: 20 });
  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      mx.set(((e.clientX / window.innerWidth) * 2 - 1) * -14);
      my.set(((e.clientY / window.innerHeight) * 2 - 1) * -10);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [mx, my, reduced]);

  const showPoster = !supported || (slow && !ready);

  return (
    <section ref={ref} className="relative h-[190svh] bg-ivory" aria-label="NB Classic Scents">
      <motion.div style={{ opacity: stageOpacity }} className="sticky top-0 h-[100svh] overflow-hidden">
        {/* backdrop: studio light pools that move very slightly with the cursor */}
        <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4 }} style={{ x: bx, y: by }} className="absolute -inset-8">
          <div className="absolute right-[-6%] top-[2%] h-[90%] w-[68%] rounded-full bg-[radial-gradient(closest-side,rgba(216,208,194,0.8),rgba(216,208,194,0.25)_55%,transparent)] max-lg:right-[-20%] max-lg:top-[-8%] max-lg:h-[70%] max-lg:w-[140%]" />
          <div className="absolute left-[8%] top-[18%] h-[50%] w-[40%] rounded-full bg-[radial-gradient(closest-side,rgba(201,178,124,0.12),transparent)]" />
          <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-taupe/45 to-transparent" />
          <div className="grain absolute inset-0" />
        </motion.div>

        {/* the 3D commercial */}
        {supported && (
          <WebGLBoundary fallback={null}>
            <Suspense fallback={null}>
              <HeroScene
                quality={quality}
                reduced={reduced}
                scrollProgress={() => scrollYProgress.get()}
                onReady={() => setReady(true)}
                className={`absolute inset-0 transition-opacity duration-[1600ms] ease-lux ${ready ? 'opacity-100' : 'opacity-0'}`}
              />
            </Suspense>
          </WebGLBoundary>
        )}
        {/* studio render while three.js loads on slow connections, or without WebGL */}
        <img
          src={assetUrl('/uploads/products/eclat-1.webp')}
          alt=""
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-[30%] h-[36svh] -translate-x-1/2 -translate-y-1/2 object-contain transition-opacity duration-1000 lg:left-[70%] lg:top-1/2 lg:h-[62svh] ${showPoster ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* typography */}
        <div className="container-lux pointer-events-none relative z-10 flex h-full items-end pb-16 lg:items-center lg:pb-0">
          <motion.div style={{ opacity: textOpacity, y: textY }} className="pointer-events-auto">
            <motion.p initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, delay: TEXT_DELAY }} className="eyebrow flex items-center gap-4">
              <span className="gold-rule" />
              The art of timeless fragrance
            </motion.p>
            <h1 className="mt-6 font-serif text-display font-light uppercase text-ink">
              <Line delay={TEXT_DELAY + 0.15} reduced={reduced}>
                Scents that
              </Line>
              <Line delay={TEXT_DELAY + 0.35} reduced={reduced}>
                <span className="italic text-stone">become</span>
              </Line>
              <Line delay={TEXT_DELAY + 0.55} reduced={reduced}>
                Signatures.
              </Line>
            </h1>
            <motion.p initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: TEXT_DELAY + 1.0, ease }} className="mt-7 max-w-md text-[15px] leading-relaxed text-stone">
              Discover timeless fragrances crafted to leave a lasting impression.
            </motion.p>
            <motion.div initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: TEXT_DELAY + 1.2, ease }} className="mt-9 flex flex-wrap gap-3 sm:gap-4">
              <Link to="/collections" className="btn-dark">
                Explore collection <ArrowRight size={14} />
              </Link>
              <Link to="/our-story" className="btn-outline bg-ivory/40 backdrop-blur-[2px]">
                Discover our story
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div style={{ opacity: cueOpacity }} className="pointer-events-none absolute bottom-8 right-8 hidden text-right lg:block">
          <motion.div initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: TEXT_DELAY + 1.6, duration: 1.4 }}>
            <p className="font-serif text-lg italic text-stone">Éclat</p>
            <p className="eyebrow mt-1 !text-[9px]">Signature Nº 01 — Eau de Parfum</p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <span className="eyebrow !text-[9px]">Scroll</span>
              <span className="relative block h-px w-12 overflow-hidden bg-taupe">
                <motion.span className="absolute inset-y-0 left-0 w-1/2 bg-gold" animate={reduced ? {} : { x: ['-100%', '200%'] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
