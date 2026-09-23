import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { WebGLBoundary, hasWebGL } from '../product/webgl';
import ProductImage from '../product/ProductImage';
import { useDeviceQuality } from '../../hooks/useDeviceQuality';
import { ArrowRight } from '../ui/Icons';

const TrioScene = lazy(() => import('../../three/TrioScene'));

// keep in sync with trioSpacing() in three/TrioScene.tsx (not imported, so three.js stays lazy)
const trioSpacing = (wide: boolean) => (wide ? 0.27 : 0.31);

const NAMES = [
  { name: 'Éclat', slug: 'eclat', notes: 'Bergamot · Jasmine · White Musk' },
  { name: 'Essence', slug: 'essence', notes: 'Rose · Vanilla · Amber' },
  { name: 'Noir', slug: 'noir', notes: 'Oud · Sandalwood · Tonka' },
];

const ramp = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

/**
 * The featured composition: as the hero's mist clears, the three founding
 * signatures rise into frame one after another and settle as a trio.
 */
const SignatureTrio = () => {
  const ref = useRef<HTMLElement>(null);
  const reduced = !!useReducedMotion();
  const quality = useDeviceQuality();
  const [supported, setSupported] = useState(true);
  const [ready, setReady] = useState(false);
  const [wide, setWide] = useState(true);
  useEffect(() => {
    setSupported(hasWebGL());
    const onResize = () => setWide(window.innerWidth / window.innerHeight > 1.05);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  // 0..1 across the section: bottles rise while it scrolls in and sticks
  const headOpacity = useTransform(scrollYProgress, (v) => ramp(v, 0.3, 0.5));
  const headY = useTransform(scrollYProgress, (v) => (reduced ? 0 : 30 * (1 - ramp(v, 0.3, 0.55))));
  const labelOpacity = useTransform(scrollYProgress, (v) => ramp(v, 0.55, 0.72));

  return (
    <section ref={ref} className="relative h-[200svh] bg-ivory" aria-labelledby="trio-heading">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {supported ? (
          <WebGLBoundary fallback={null}>
            <Suspense fallback={null}>
              <TrioScene
                quality={quality}
                reduced={reduced}
                progress={() => scrollYProgress.get()}
                onReady={() => setReady(true)}
                className={`absolute inset-0 transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
              />
            </Suspense>
          </WebGLBoundary>
        ) : (
          <div className="absolute inset-x-0 top-[22%] flex h-[50%] justify-center gap-[6%]">
            {NAMES.map((n) => (
              <ProductImage key={n.slug} src={`/uploads/products/${n.slug}-1.webp`} alt={n.name} className="h-full w-[26%] object-contain" />
            ))}
          </div>
        )}

        <motion.div style={{ opacity: headOpacity, y: headY }} className="container-lux pointer-events-none relative z-10 pt-24 text-center lg:pt-28">
          <p className="eyebrow flex items-center justify-center gap-4">
            <span className="gold-rule" /> The founding trio <span className="gold-rule" />
          </p>
          <h2 id="trio-heading" className="heading-xl mt-5">
            Our Signature Scents
          </h2>
        </motion.div>

        <motion.ul style={{ opacity: labelOpacity }} className="absolute inset-x-0 bottom-[30%] z-10 lg:bottom-[9%]" aria-label="Signature fragrances">
          {NAMES.map((n, i) => (
            <li key={n.slug} className="absolute w-[30%] -translate-x-1/2 text-center" style={{ left: `${50 + (i - 1) * trioSpacing(wide) * 100}%` }}>
              <Link to={`/fragrance/${n.slug}`} className="group inline-block">
                <span className="block font-serif text-lg uppercase tracking-[0.14em] sm:text-3xl">
                  <span className="hidden text-stone sm:inline">0{i + 1} — </span>
                  {n.name}
                </span>
                <span className="mt-2 hidden font-sans text-[10.5px] uppercase tracking-wide2 text-stone sm:block">{n.notes}</span>
                <span className="mt-3 inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-wide2 text-ink opacity-70 transition group-hover:opacity-100">
                  Discover <ArrowRight size={12} />
                </span>
              </Link>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
};

export default SignatureTrio;
