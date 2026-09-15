import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Product } from '../types';
import { fetchProducts } from '../services/productService';
import { getErrorMessage } from '../services/api';
import ProductGrid from '../components/ProductGrid';
import QuickViewModal from '../components/QuickViewModal';
import { SearchIcon } from '../components/Icons';

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Rings', value: 'rings' },
  { label: 'Necklaces', value: 'necklaces' },
  { label: 'Earrings', value: 'earrings' },
  { label: 'Bracelets', value: 'bracelets' },
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Name: A to Z', value: 'name-asc' },
];

const PAGE_SIZE = 12;

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [minPriceInput, setMinPriceInput] = useState(searchParams.get('minPrice') || '');
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get('maxPrice') || '');

  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const featured = searchParams.get('featured') === 'true';
  const bestseller = searchParams.get('bestseller') === 'true';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Number(searchParams.get('page') || 1);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      });
      if (!('page' in updates)) next.delete('page');
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    document.title = 'Shop | Elegant Jewellery';
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProducts({
      category,
      sort,
      featured: featured || undefined,
      bestseller: bestseller || undefined,
      search: search || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page,
      limit: PAGE_SIZE,
    })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.products);
        setPages(res.pages);
        setTotal(res.total);
      })
      .catch((err) => !cancelled && toast.error(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [category, sort, featured, bestseller, search, minPrice, maxPrice, page]);

  const heading = useMemo(() => {
    if (search) return `Results for "${search}"`;
    if (category !== 'all') return CATEGORIES.find((c) => c.value === category)?.label || 'Shop';
    return 'All Jewellery';
  }, [search, category]);

  const applyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ minPrice: minPriceInput || null, maxPrice: maxPriceInput || null });
  };

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput || null });
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
  };

  return (
    <div className="container-luxe py-12">
      <div className="mb-10 text-center">
        <p className="section-kicker">Shop The Collection</p>
        <h1 className="section-heading mt-3">{heading}</h1>
        <p className="mt-2 text-sm text-brown-light">{total} piece{total !== 1 ? 's' : ''} found</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-8">
          <form onSubmit={applySearch} className="flex items-center gap-2 rounded-full border border-brown-dark/15 bg-white px-4 py-2">
            <SearchIcon width={16} height={16} className="text-brown-light" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products"
              className="w-full border-none bg-transparent text-sm outline-none"
            />
          </form>

          <div>
            <h3 className="mb-3 text-xs uppercase tracking-widest2 text-champagne-dark">Category</h3>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => updateParams({ category: c.value === 'all' ? null : c.value })}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    category === c.value ? 'bg-brown-dark text-ivory' : 'text-brown-dark hover:bg-beige'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs uppercase tracking-widest2 text-champagne-dark">Price Range (Rs.)</h3>
            <form onSubmit={applyPriceFilter} className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="input-luxe"
              />
              <span className="text-brown-light">-</span>
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="input-luxe"
              />
            </form>
            <button onClick={applyPriceFilter} type="button" className="btn-secondary mt-3 w-full !py-2 text-[11px]">
              Apply
            </button>
          </div>

          <div>
            <h3 className="mb-3 text-xs uppercase tracking-widest2 text-champagne-dark">Highlight</h3>
            <label className="flex items-center gap-2 text-sm text-brown-dark">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => updateParams({ featured: e.target.checked ? 'true' : null })}
              />
              Featured
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm text-brown-dark">
              <input
                type="checkbox"
                checked={bestseller}
                onChange={(e) => updateParams({ bestseller: e.target.checked ? 'true' : null })}
              />
              Bestselling
            </label>
          </div>

          <button onClick={clearFilters} className="text-xs uppercase tracking-widest text-champagne-dark hover:underline">
            Clear all filters
          </button>
        </aside>

        <div>
          <div className="mb-6 flex justify-end">
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="input-luxe max-w-[220px]"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  Sort: {s.label}
                </option>
              ))}
            </select>
          </div>

          <ProductGrid products={products} loading={loading} onQuickView={setQuickViewProduct} />

          {pages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateParams({ page: String(i + 1) })}
                  className={`h-9 w-9 rounded-full text-sm transition-colors ${
                    page === i + 1 ? 'bg-brown-dark text-ivory' : 'bg-white text-brown-dark hover:bg-beige'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
};

export default Shop;
