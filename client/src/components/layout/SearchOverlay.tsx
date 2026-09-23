import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import { useUI } from '../../context/UIContext';
import { productApi } from '../../services';
import type { Product } from '../../types';
import ProductImage from '../product/ProductImage';
import { formatPrice } from '../../lib/format';
import { ArrowRight, SearchIcon } from '../ui/Icons';

const SUGGESTIONS = ['Oud', 'Rose', 'Vanilla', 'Jasmine', 'Sandalwood', 'Bergamot'];

const SearchOverlay = () => {
  const { searchOpen, setSearchOpen } = useUI();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const close = () => setSearchOpen(false);

  useEffect(() => {
    if (searchOpen) setTimeout(() => input.current?.focus(), 300);
    else setQ('');
  }, [searchOpen]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      productApi
        .list({ search: term, limit: 6 })
        .then((r) => setResults(r.products))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    close();
    navigate(`/fragrances?search=${encodeURIComponent(q.trim())}`);
  };

  return (
    <Modal open={searchOpen} onClose={close} side="top" label="Search fragrances">
      <div className="container-lux pb-12 pt-20">
        <form onSubmit={submit} className="flex items-center gap-4 border-b border-ink/80 pb-4" role="search">
          <SearchIcon size={24} className="shrink-0 text-stone" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by fragrance, note or family"
            aria-label="Search"
            className="w-full bg-transparent font-serif text-3xl font-light placeholder:text-stone/60 focus:outline-none sm:text-5xl"
          />
        </form>

        {q.trim().length < 2 ? (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="eyebrow mr-2">Explore by note</span>
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => setQ(s)} className="chip border-taupe hover:border-gold">
                {s}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            {loading && <p className="eyebrow">Searching…</p>}
            {!loading && results.length === 0 && <p className="font-serif text-2xl text-stone">No fragrances match “{q}”.</p>}
            <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((p) => (
                <li key={p._id}>
                  <Link to={`/fragrance/${p.slug}`} onClick={close} className="group flex items-center gap-4">
                    <div className="h-20 w-16 shrink-0 bg-taupe/40">
                      <ProductImage src={p.images[0]} alt={p.name} className="h-full w-full object-contain p-1" />
                    </div>
                    <div>
                      <p className="font-serif text-xl group-hover:text-stone">{p.name}</p>
                      <p className="text-xs text-stone">{p.tagline}</p>
                      <p className="mt-1 text-xs">{formatPrice(p.price)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {results.length > 0 && (
              <button type="button" onClick={submit} className="link-lux mt-8">
                View all results <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SearchOverlay;
