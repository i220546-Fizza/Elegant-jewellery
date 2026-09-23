import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categoryApi, productApi, type ProductPage } from '../services';
import type { Category } from '../types';
import PageHeader from '../components/ui/PageHeader';
import ProductCard, { ProductCardSkeleton } from '../components/product/ProductCard';
import { EmptyState, ErrorState } from '../components/ui/Feedback';
import Modal from '../components/ui/Modal';
import { ChevronDown, CloseIcon } from '../components/ui/Icons';
import { getErrorMessage } from '../lib/api';
import { formatPrice } from '../lib/format';
import { useTitle } from '../lib/useTitle';

const SORTS = [
  { value: '', label: 'Featured' },
  { value: 'popular', label: 'Bestselling' },
  { value: 'newest', label: 'New arrivals' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

const PRICE_BANDS = [
  { label: 'Under PKR 10,000', min: '', max: '10000' },
  { label: 'PKR 10,000 – 20,000', min: '10000', max: '20000' },
  { label: 'PKR 20,000 – 35,000', min: '20000', max: '35000' },
  { label: 'Over PKR 35,000', min: '35000', max: '' },
];

const Fragrances = () => {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [families, setFamilies] = useState<string[]>([]);
  const [data, setData] = useState<ProductPage | null>(null);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const category = params.get('category') || 'all';
  const family = params.get('family') || '';
  const sort = params.get('sort') || '';
  const search = params.get('search') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const page = Number(params.get('page') || 1);

  const activeCategory = categories.find((c) => c.slug === category);
  useTitle(activeCategory?.name || 'Fragrances', 'Shop NB Classic Scents eaux de parfum for women, men and unisex, including oud, limited editions and gift sets.');

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {});
    productApi.meta().then((m) => setFamilies(m.families)).catch(() => {});
  }, []);

  useEffect(() => {
    setData(null);
    setError('');
    productApi
      .list({
        category: category === 'all' ? undefined : category,
        family: family || undefined,
        sort: sort || undefined,
        search: search || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page,
        limit: 12,
      })
      .then(setData)
      .catch((e) => setError(getErrorMessage(e)));
  }, [category, family, sort, search, minPrice, maxPrice, page, attempt]);

  const update = (next: Record<string, string>) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    if (!('page' in next)) p.delete('page');
    setParams(p, { replace: false });
    if ('page' in next) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeChips = useMemo(() => {
    const chips: { label: string; clear: Record<string, string> }[] = [];
    if (search) chips.push({ label: `“${search}”`, clear: { search: '' } });
    if (family) chips.push({ label: family, clear: { family: '' } });
    if (minPrice || maxPrice) chips.push({ label: `${minPrice ? formatPrice(+minPrice) : 'Any'} – ${maxPrice ? formatPrice(+maxPrice) : 'Any'}`, clear: { minPrice: '', maxPrice: '' } });
    return chips;
  }, [search, family, minPrice, maxPrice]);

  const Filters = (
    <div className="space-y-10">
      <div>
        <p className="label mb-4">Category</p>
        <ul className="space-y-2.5">
          {[{ slug: 'all', name: 'All Fragrances' }, ...categories].map((c) => (
            <li key={c.slug}>
              <button type="button" onClick={() => update({ category: c.slug === 'all' ? '' : c.slug })} className={`text-left text-sm transition ${category === c.slug ? 'text-ink underline decoration-gold underline-offset-[6px]' : 'text-stone hover:text-ink'}`}>
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="label mb-4">Fragrance family</p>
        <ul className="space-y-2.5">
          {families.map((f) => (
            <li key={f}>
              <button type="button" onClick={() => update({ family: family === f ? '' : f })} className={`text-left text-sm transition ${family === f ? 'text-ink underline decoration-gold underline-offset-[6px]' : 'text-stone hover:text-ink'}`}>
                {f}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="label mb-4">Price</p>
        <ul className="space-y-2.5">
          {PRICE_BANDS.map((b) => {
            const on = minPrice === b.min && maxPrice === b.max;
            return (
              <li key={b.label}>
                <button type="button" onClick={() => update(on ? { minPrice: '', maxPrice: '' } : { minPrice: b.min, maxPrice: b.max })} className={`text-left text-sm transition ${on ? 'text-ink underline decoration-gold underline-offset-[6px]' : 'text-stone hover:text-ink'}`}>
                  {b.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader eyebrow={activeCategory ? 'Collection' : 'The wardrobe'} title={activeCategory?.name || 'All Fragrances'} crumbs={[{ label: 'Home', to: '/' }, { label: 'Fragrances', to: '/fragrances' }, ...(activeCategory ? [{ label: activeCategory.name }] : [])]}>
        {activeCategory?.description || 'Eaux de parfum composed with rare materials and quiet confidence — for her, for him, and for anyone.'}
      </PageHeader>

      <div className="container-lux py-12 lg:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-taupe/70 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setFiltersOpen(true)} className="chip border-ink lg:hidden">
              Filter
            </button>
            <p className="eyebrow">{data ? `${data.total} ${data.total === 1 ? 'fragrance' : 'fragrances'}` : ' '}</p>
            {activeChips.map((c) => (
              <button key={c.label} type="button" onClick={() => update(c.clear)} className="chip gap-2 border-taupe normal-case tracking-normal hover:border-gold">
                {c.label} <CloseIcon size={12} />
              </button>
            ))}
          </div>
          <label className="relative flex items-center gap-3">
            <span className="eyebrow">Sort</span>
            <select value={sort} onChange={(e) => update({ sort: e.target.value })} className="appearance-none border-0 border-b border-taupe bg-transparent py-1 pl-0 pr-7 font-sans text-sm focus:border-ink focus:outline-none focus:ring-0">
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-0" />
          </label>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-28">{Filters}</div>
          </aside>

          <div>
            {error ? (
              <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />
            ) : data && data.products.length === 0 ? (
              <EmptyState title="No fragrances found" text="Try removing a filter or searching for a different note." action={{ label: 'View all fragrances', to: '/fragrances' }} />
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-14 sm:gap-x-6 xl:grid-cols-3 xl:gap-x-8">
                {data ? data.products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />) : Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            )}

            {data && data.pages > 1 && (
              <nav className="mt-20 flex items-center justify-center gap-2" aria-label="Pagination">
                {Array.from({ length: data.pages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => update({ page: String(i + 1) })}
                    aria-current={page === i + 1 ? 'page' : undefined}
                    className={`h-10 w-10 font-sans text-xs transition ${page === i + 1 ? 'bg-ink text-ivory' : 'border border-taupe hover:border-gold'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
            )}
          </div>
        </div>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} side="left" label="Filters">
        <div className="h-full overflow-y-auto px-8 pb-10 pt-8">
          <p className="mb-10 font-serif text-3xl">Filter</p>
          <div onClick={(e) => (e.target as HTMLElement).tagName === 'BUTTON' && setFiltersOpen(false)}>{Filters}</div>
        </div>
      </Modal>
    </>
  );
};

export default Fragrances;
