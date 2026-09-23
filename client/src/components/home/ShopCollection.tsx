import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryApi, productApi } from '../../services';
import type { Category, Product } from '../../types';
import ProductCard, { ProductCardSkeleton } from '../product/ProductCard';
import { ErrorState, SectionHeader } from '../ui/Feedback';
import Reveal from '../ui/Reveal';
import { ArrowRight } from '../ui/Icons';
import { getErrorMessage } from '../../lib/api';

const ShopCollection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [active, setActive] = useState('all');
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setProducts(null);
    setError('');
    productApi
      .list({ category: active === 'all' ? undefined : active, limit: 8, sort: active === 'all' ? 'popular' : undefined })
      .then((r) => setProducts(r.products))
      .catch((e) => setError(getErrorMessage(e)));
  }, [active, attempt]);

  const tabs = [{ slug: 'all', name: 'All Fragrances' }, ...categories];

  return (
    <section className="bg-white/40 py-28 lg:py-36" aria-labelledby="shop-heading">
      <div className="container-lux">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeader eyebrow="The wardrobe" title={<span id="shop-heading">Shop the Collection</span>} />
          </Reveal>
          <Link to="/fragrances" className="link-lux self-start lg:self-auto">
            View all fragrances <ArrowRight size={14} />
          </Link>
        </div>

        <div className="no-scrollbar -mx-5 mt-12 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Categories">
          {tabs.map((c) => (
            <button
              key={c.slug}
              type="button"
              role="tab"
              aria-selected={active === c.slug}
              onClick={() => setActive(c.slug)}
              className={`chip shrink-0 ${active === c.slug ? 'border-ink bg-ink text-ivory' : 'border-taupe text-ink hover:border-gold'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-12">
          {error ? (
            <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
              {products === null
                ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>
          )}
          {products && products.length === 0 && !error && <p className="py-16 text-center font-serif text-2xl text-stone">New creations for this collection are coming soon.</p>}
        </div>
      </div>
    </section>
  );
};

export default ShopCollection;
