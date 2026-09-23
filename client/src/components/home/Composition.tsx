import { useState } from 'react';
import { motion } from 'framer-motion';
import Bottle3D from '../product/Bottle3D';
import Reveal from '../ui/Reveal';
import type { BottleSpec } from '../../types';

const LAYERS = [
  { key: 'top', title: 'Top Notes', notes: ['Bergamot', 'Citrus', 'Pink Pepper'], time: 'The first 15 minutes', text: 'The bright opening — the first impression, lifted and luminous.', level: 0.86 },
  { key: 'heart', title: 'Heart Notes', notes: ['Jasmine', 'Rose', 'Iris'], time: 'From 30 minutes to 4 hours', text: 'The soul of the fragrance, unfolding as the opening settles.', level: 0.52 },
  { key: 'base', title: 'Base Notes', notes: ['Vanilla', 'Amber', 'Sandalwood'], time: 'Lasting 8 hours and beyond', text: 'The lasting signature — warm, deep and remembered long after.', level: 0.14 },
] as const;

const BOTTLE: BottleSpec = { shape: 'round', liquid: '#E3B98E', cap: 'gold', glass: 'clear' };

const Layer = ({ i, align, active, setActive }: { i: number; align: 'left' | 'right'; active: number | null; setActive: (n: number | null) => void }) => {
  const l = LAYERS[i];
  const on = active === i;
  return (
    <button
      type="button"
      onMouseEnter={() => setActive(i)}
      onFocus={() => setActive(i)}
      onClick={() => setActive(on ? null : i)}
      aria-pressed={on}
      className={`group relative block w-full py-7 text-left transition-colors duration-700 ${align === 'right' ? 'lg:text-right' : ''}`}
    >
      <span className={`absolute top-0 h-px bg-taupe ${align === 'right' ? 'right-0' : 'left-0'} w-full`} />
      <motion.span
        className={`absolute top-0 h-px bg-gold ${align === 'right' ? 'right-0' : 'left-0'}`}
        animate={{ width: on ? '100%' : '0%' }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className="eyebrow block">{`0${i + 1} · ${l.time}`}</span>
      <span className={`mt-3 block font-serif text-3xl uppercase tracking-[0.1em] transition-colors duration-700 sm:text-4xl ${on ? 'text-ink' : 'text-ink/55'}`}>{l.title}</span>
      <span className={`mt-3 flex flex-wrap gap-x-3 gap-y-1 font-sans text-[12px] uppercase tracking-wide2 ${align === 'right' ? 'lg:justify-end' : ''}`}>
        {l.notes.map((n, k) => (
          <motion.span key={n} animate={{ color: on ? '#0D0E10' : '#8D8A83' }} transition={{ duration: 0.8, delay: on ? k * 0.08 : 0 }}>
            {n}
            {k < l.notes.length - 1 && <span className="ml-3 text-gold">·</span>}
          </motion.span>
        ))}
      </span>
      <motion.span
        className="block overflow-hidden text-sm leading-relaxed text-stone"
        initial={false}
        animate={{ height: on ? 'auto' : 0, opacity: on ? 1 : 0, marginTop: on ? 12 : 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        {l.text}
      </motion.span>
    </button>
  );
};


const Composition = () => {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden bg-taupe/35 py-28 lg:py-36" aria-labelledby="composition-heading" onMouseLeave={() => setActive(null)}>
      <div className="container-lux">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow flex items-center justify-center gap-4">
            <span className="gold-rule" /> Anatomy of a fragrance <span className="gold-rule" />
          </p>
          <h2 id="composition-heading" className="heading-xl mt-6">
            The Composition
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-stone">Every NB fragrance is built in three movements. Explore each layer to see how a scent evolves on the skin.</p>
        </Reveal>

        <div className="mt-16 grid items-center gap-6 lg:mt-20 lg:grid-cols-[1fr_minmax(320px,1.1fr)_1fr] lg:gap-12">
          <div className="order-2 lg:order-1">
            <Layer i={0} align="right" active={active} setActive={setActive} />
            <Layer i={1} align="right" active={active} setActive={setActive} />
          </div>
          <div className="relative order-1 mx-auto h-[420px] w-full max-w-[460px] lg:order-2 lg:h-[600px]">
            <div aria-hidden className="absolute inset-[8%] rounded-full border border-ivory/80" />
            <div aria-hidden className="absolute inset-[18%] rounded-full bg-[radial-gradient(closest-side,rgba(248,247,243,0.9),transparent)]" />
            <Bottle3D spec={BOTTLE} name="Essence" mode="viewer" highlight={active === null ? null : LAYERS[active].level} poster="/uploads/products/essence-1.webp" posterAlt="Essence perfume bottle" className="absolute inset-0" />
          </div>
          <div className="order-3">
            <Layer i={2} align="left" active={active} setActive={setActive} />
            <div className="hidden py-7 lg:block">
              <span className="block h-px w-full bg-taupe" />
              <p className="mt-6 font-serif text-xl italic leading-relaxed text-stone">“A fragrance is a story told in time — the first line, the heart of it, and what stays with you.”</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Composition;
