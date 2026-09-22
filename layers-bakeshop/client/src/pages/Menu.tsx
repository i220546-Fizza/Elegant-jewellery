import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import Reveal from '../components/Reveal';
import CategoryTabs from '../components/CategoryTabs';
import ProductGrid from '../components/ProductGrid';
import { getProducts } from '../services/productService';
import type { Product, ProductCategory } from '../types';

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as ProductCategory) || 'All';
  const [category, setCategory] = useState<ProductCategory | 'All'>(initialCategory);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    getProducts({ category })
      .then(setProducts)
      .catch(() => setError('We had trouble reaching our kitchen. Please try again.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [category]);

  function handleCategoryChange(next: ProductCategory | 'All') {
    setCategory(next);
    setSearchParams(next === 'All' ? {} : { category: next });
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [products, search]);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8 md:pt-36">
      <Reveal>
        <p className="layers-eyebrow">Full Menu</p>
        <h1 className="mt-3 font-display text-4xl text-layers-ink sm:text-5xl">Everything We Bake</h1>
        <p className="mt-3 max-w-lg text-layers-muted">
          Browse cakes, cupcakes, brownies and more — every item is made fresh and finished by hand.
        </p>
      </Reveal>

      <div className="sticky top-[72px] z-30 -mx-5 mt-8 bg-layers-background/90 px-5 py-4 backdrop-blur-md md:-mx-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CategoryTabs active={category} onChange={handleCategoryChange} />
          <div className="relative sm:w-64">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-layers-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search desserts..."
              aria-label="Search desserts"
              className="w-full rounded-full border border-layers-border bg-layers-surface py-2.5 pl-10 pr-4 text-sm focus:border-layers-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ProductGrid products={filtered} loading={loading} error={error} onRetry={load} />
      </div>
    </div>
  );
}
