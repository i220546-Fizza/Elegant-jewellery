import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryApi } from '../services';
import type { Category } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Reveal from '../components/ui/Reveal';
import ProductImage from '../components/product/ProductImage';
import { ErrorState, Skeleton } from '../components/ui/Feedback';
import { ArrowRight } from '../components/ui/Icons';
import { getErrorMessage } from '../lib/api';
import { pad2 } from '../lib/format';
import { useTitle } from '../lib/useTitle';

// Representative bottle render for each collection (used unless an admin sets a category image).
const COVER: Record<string, string> = {
  women: 'jardin-divoire-2',
  men: 'minuit-2',
  unisex: 'blanc-2',
  oud: 'oud-imperial-2',
  signature: 'eclat-2',
  'limited-edition': 'safran-noir-2',
  'gift-sets': 'the-signature-trio-2',
};

const Collections = () => {
  useTitle('Collections', 'Explore the NB Classic Scents collections: signature, oud, limited edition, gift sets and more.');
  const [cats, setCats] = useState<Category[] | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    categoryApi.list().then(setCats).catch((e) => setError(getErrorMessage(e)));
  };
  useEffect(load, []);

  const collections = cats?.filter((c) => c.kind === 'collection') ?? [];
  const audiences = cats?.filter((c) => c.kind === 'audience') ?? [];

  return (
    <>
      <PageHeader eyebrow="The house collections" title="Collection" crumbs={[{ label: 'Home', to: '/' }, { label: 'Collection' }]}>
        From the founding signatures to rare oud and single-release limited editions — each collection is a chapter of the house.
      </PageHeader>

      <section className="container-lux py-20 lg:py-28">
        {error && <ErrorState message={error} onRetry={load} />}
        {!cats && !error && (
          <div className="grid gap-8 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[5/4]" />
            ))}
          </div>
        )}
        <div className="grid gap-x-8 gap-y-16 md:grid-cols-2">
          {collections.map((c, i) => (
            <Reveal key={c._id} delay={(i % 2) * 0.12} className={i % 2 === 1 ? 'md:mt-24' : ''}>
              <Link to={`/fragrances?category=${c.slug}`} className="group block">
                <div className="relative aspect-[5/4] overflow-hidden bg-taupe/50">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(248,247,243,0.85),transparent_60%)]" />
                  <ProductImage src={c.image || `/uploads/products/${COVER[c.slug] || 'eclat-2'}.webp`} alt={c.name} className="absolute inset-0 h-full w-full object-contain p-8 transition-transform duration-[1600ms] ease-lux group-hover:scale-[1.05]" />
                  <span className="absolute left-6 top-5 font-serif text-7xl font-light text-ivory/80">{pad2(i + 1)}</span>
                </div>
                <div className="mt-6 flex items-end justify-between gap-6">
                  <div>
                    <h2 className="font-serif text-4xl uppercase tracking-[0.06em]">{c.name}</h2>
                    <p className="mt-2 max-w-sm text-sm text-stone">{c.description}</p>
                  </div>
                  <span className="shrink-0 text-right">
                    <span className="eyebrow block">{c.productCount} scents</span>
                    <ArrowRight size={18} className="ml-auto mt-3 transition-transform duration-700 ease-lux group-hover:translate-x-2" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {audiences.length > 0 && (
        <section className="bg-ink py-24 text-ivory lg:py-32">
          <div className="container-lux">
            <p className="eyebrow !text-ivory/50">Shop by wearer</p>
            <div className="mt-10 grid gap-px bg-ivory/10 md:grid-cols-3">
              {audiences.map((c) => (
                <Link key={c._id} to={`/fragrances?category=${c.slug}`} className="group bg-ink p-10 transition-colors duration-700 hover:bg-[#15161a]">
                  <p className="font-serif text-5xl font-light">{c.name}</p>
                  <p className="mt-4 text-sm text-ivory/55">{c.description}</p>
                  <p className="mt-10 flex items-center gap-3 font-sans text-[11px] uppercase tracking-wide2 text-gold">
                    Explore <ArrowRight size={14} className="transition-transform duration-700 group-hover:translate-x-2" />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Collections;
