import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { productApi } from '../../services';
import type { Product } from '../../types';
import ProductImage from '../product/ProductImage';
import Reveal from '../ui/Reveal';
import { ArrowRight } from '../ui/Icons';
import { formatPrice, pad2 } from '../../lib/format';

const FALLBACK = [
  { name: 'Éclat', tagline: 'Bergamot · Jasmine · White Musk', slug: 'eclat' },
  { name: 'Essence', tagline: 'Rose · Vanilla · Amber', slug: 'essence' },
  { name: 'Noir', tagline: 'Oud · Sandalwood · Tonka', slug: 'noir' },
];

const Row = ({ p, i }: { p: Product | (typeof FALLBACK)[number]; i: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['8%', '-8%']);
  const reverse = i % 2 === 1;
  const full = 'variants' in p ? p : null;

  return (
    <div ref={ref} className={`grid items-center gap-10 lg:grid-cols-12 lg:gap-16 ${i > 0 ? 'mt-24 lg:mt-36' : ''}`}>
      <div className={`relative lg:col-span-7 ${reverse ? 'lg:order-2' : ''}`}>
        <Link to={`/fragrance/${p.slug}`} className="group relative block aspect-[5/4] overflow-hidden bg-taupe/50" aria-label={`Discover ${p.name}`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(248,247,243,0.9),transparent_60%)]" />
          <motion.div style={{ y }} className="absolute inset-0">
            <ProductImage src={full?.images[1] || `/uploads/products/${p.slug}-2.webp`} alt={`${p.name} eau de parfum`} className="h-full w-full object-contain p-6 transition-transform duration-[1600ms] ease-lux group-hover:scale-[1.04]" />
          </motion.div>
          <span className="absolute left-6 top-5 font-serif text-[8rem] font-light leading-none text-ivory/70 sm:text-[11rem]">{pad2(i + 1)}</span>
        </Link>
      </div>
      <Reveal className={`lg:col-span-5 ${reverse ? 'lg:order-1' : ''}`}>
        <p className="eyebrow">Signature Nº {pad2(i + 1)}</p>
        <h3 className="mt-5 font-serif text-5xl font-light uppercase tracking-[0.08em] sm:text-6xl">
          <span className="text-stone">{pad2(i + 1)} — </span>
          {p.name}
        </h3>
        <p className="mt-5 font-sans text-[12px] uppercase tracking-wide2 text-ink/80">{p.tagline}</p>
        {full && <p className="mt-6 max-w-md text-[15px] leading-relaxed text-stone">{full.description}</p>}
        {full && (
          <p className="mt-6 text-sm">
            <span className="text-stone">From </span>
            {formatPrice(full.price)}
          </p>
        )}
        <Link to={`/fragrance/${p.slug}`} className="link-lux mt-10">
          Discover fragrance <ArrowRight size={14} />
        </Link>
      </Reveal>
    </div>
  );
};

const SignatureScents = () => {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    productApi
      .list({ featured: true, sort: 'signature', limit: 3 })
      .then((r) => setProducts(r.products))
      .catch(() => setProducts([]));
  }, []);

  const list = products && products.length ? products : FALLBACK;

  return (
    <section className="py-28 lg:py-40" aria-labelledby="signature-heading">
      <div className="container-lux">
        <Reveal>
          <p id="signature-heading" className="mx-auto max-w-2xl text-center font-serif text-2xl font-light italic leading-snug text-stone sm:text-3xl">
            Three compositions that define the house — each one conceived to be worn for years, and remembered for longer.
          </p>
        </Reveal>
        <div className="mt-20 lg:mt-28">
          {list.map((p, i) => (
            <Row key={p.slug} p={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SignatureScents;
