import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Reveal from '../ui/Reveal';
import ProductImage from '../product/ProductImage';
import { ArrowRight } from '../ui/Icons';

export const PILLARS = [
  { n: '01', title: 'Craftsmanship', text: 'Each composition is refined over hundreds of trials, then macerated and cold-filtered in small batches.' },
  { n: '02', title: 'Premium ingredients', text: 'Oud, rose absolute, orris and sandalwood — sourced for quality, never for convenience.' },
  { n: '03', title: 'Timeless by design', text: 'We compose for the decade, not the season. Fragrances you will still reach for years from now.' },
  { n: '04', title: 'Individuality', text: 'Concentrated eaux de parfum that sit close, evolve with you and become unmistakably yours.' },
];

/** Editorial still life built from the house's own bottles. */
export const EditorialStill = ({ className = '' }: { className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const back = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);
  const front = useTransform(scrollYProgress, [0, 1], ['14%', '-14%']);
  return (
    <div ref={ref} className={`relative overflow-hidden bg-taupe ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(248,247,243,0.8),transparent_55%)]" />
      <div aria-hidden className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[#cbc2b2] to-transparent" />
      <div aria-hidden className="absolute left-[12%] top-[10%] h-[70%] w-[48%] rounded-t-full border border-ivory/70" />
      <motion.div style={{ y: back }} className="absolute bottom-[6%] left-[4%] h-[72%] w-[56%]">
        <ProductImage src="/uploads/products/noir-2.webp" alt="Noir eau de parfum" className="h-full w-full object-contain" />
      </motion.div>
      <motion.div style={{ y: front }} className="absolute bottom-[-2%] right-[2%] h-[62%] w-[52%]">
        <ProductImage src="/uploads/products/essence-1.webp" alt="Essence eau de parfum" className="h-full w-full object-contain" />
      </motion.div>
      <p className="absolute left-6 top-6 font-sans text-[9.5px] uppercase tracking-luxe text-ink/60">Atelier — Nº 03 / 01</p>
      <p className="absolute bottom-6 right-6 font-serif text-sm italic text-ink/60">Noir &amp; Essence</p>
    </div>
  );
};

const StoryTeaser = () => (
  <section className="py-28 lg:py-40" aria-labelledby="story-heading">
    <div className="container-lux grid items-center gap-16 lg:grid-cols-12">
      <EditorialStill className="aspect-[4/5] lg:col-span-6" />
      <div className="lg:col-span-5 lg:col-start-8">
        <Reveal>
          <p className="eyebrow flex items-center gap-4">
            <span className="gold-rule" /> The NB Classic Scents story
          </p>
          <h2 id="story-heading" className="heading-xl mt-6">
            More than a fragrance.
            <br />
            <span className="italic text-stone">A signature.</span>
          </h2>
          <p className="mt-8 text-[15px] leading-relaxed text-stone">
            NB Classic Scents was founded on a simple conviction: that a great fragrance should feel as personal as a handwritten name. We compose slowly, choose our materials without compromise, and
            bottle only what we would wear ourselves.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {PILLARS.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.1}>
              <p className="font-serif text-sm text-gold">{p.n}</p>
              <p className="mt-2 font-sans text-[11px] uppercase tracking-wide2">{p.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-stone">{p.text}</p>
            </Reveal>
          ))}
        </div>
        <Link to="/our-story" className="link-lux mt-12">
          Discover our story <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  </section>
);

export default StoryTeaser;
