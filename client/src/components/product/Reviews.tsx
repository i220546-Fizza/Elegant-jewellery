import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productApi } from '../../services';
import type { Product, Review } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Stars from '../ui/Stars';
import { StarIcon } from '../ui/Icons';
import { formatDate } from '../../lib/format';
import { getErrorMessage } from '../../lib/api';

const Reviews = ({ product, onChange }: { product: Product; onChange: () => void }) => {
  const { user } = useAuth();
  const [data, setData] = useState<{ reviews: Review[]; total: number; pages: number; distribution: Record<number, number> } | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ rating: 0, title: '', comment: '' });
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(() => {
    setError('');
    productApi
      .reviews(product._id, page)
      .then((r) => setData((prev) => (page > 1 && prev ? { ...r, reviews: [...prev.reviews, ...r.reviews] } : r)))
      .catch((e) => setError(getErrorMessage(e)));
  }, [product._id, page]);

  useEffect(load, [load]);

  const mine = data?.reviews.find((r) => user && r.user === user._id);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rating) {
      toast.error('Please choose a rating');
      return;
    }
    setBusy(true);
    try {
      await productApi.addReview(product._id, form);
      toast.success('Thank you for your review');
      setForm({ rating: 0, title: '', comment: '' });
      setOpen(false);
      setPage(1);
      load();
      onChange();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await productApi.deleteReview(product._id, id);
      setPage(1);
      load();
      onChange();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const total = data?.total ?? 0;

  return (
    <section id="reviews" className="container-lux border-t border-taupe/70 py-20 lg:py-28" aria-labelledby="reviews-heading">
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow">Client impressions</p>
          <h2 id="reviews-heading" className="mt-4 font-serif text-5xl">
            Reviews
          </h2>
          <div className="mt-8 flex items-end gap-4">
            <span className="font-serif text-7xl font-light leading-none">{product.rating ? product.rating.toFixed(1) : '—'}</span>
            <div className="pb-2">
              <Stars value={product.rating} size={15} />
              <p className="mt-1 text-xs text-stone">
                {total} {total === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
          {data && (
            <ul className="mt-8 space-y-2">
              {[5, 4, 3, 2, 1].map((s) => {
                const n = data.distribution[s] || 0;
                return (
                  <li key={s} className="flex items-center gap-3 text-xs text-stone">
                    <span className="w-3">{s}</span>
                    <span className="h-px flex-1 bg-taupe">
                      <span className="block h-px bg-gold" style={{ width: total ? `${(n / total) * 100}%` : 0 }} />
                    </span>
                    <span className="w-6 text-right">{n}</span>
                  </li>
                );
              })}
            </ul>
          )}
          {user ? (
            !mine && (
              <button type="button" onClick={() => setOpen((o) => !o)} className="btn-outline mt-10">
                {open ? 'Close' : 'Write a review'}
              </button>
            )
          ) : (
            <p className="mt-10 text-sm text-stone">
              <Link to="/login" state={{ from: `/fragrance/${product.slug}` }} className="text-ink underline decoration-gold underline-offset-4">
                Sign in
              </Link>{' '}
              to share your impression.
            </p>
          )}
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          {open && (
            <form onSubmit={submit} className="mb-14 border border-taupe p-6 sm:p-8">
              <p className="label">Your rating</p>
              <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" aria-label={`${n} stars`} onMouseEnter={() => setHover(n)} onClick={() => setForm((f) => ({ ...f, rating: n }))} className="text-gold">
                    <StarIcon size={24} amount={(hover || form.rating) >= n ? 1 : 0} />
                  </button>
                ))}
              </div>
              <label className="mt-6 block">
                <span className="label">Title</span>
                <input className="field" maxLength={100} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="In a few words" />
              </label>
              <label className="mt-6 block">
                <span className="label">Review</span>
                <textarea className="field min-h-[110px] resize-y" required maxLength={2000} value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} placeholder="How does it wear? When do you reach for it?" />
              </label>
              <button type="submit" disabled={busy} className="btn-dark mt-8">
                {busy ? 'Submitting…' : 'Submit review'}
              </button>
            </form>
          )}

          {error && <p className="text-sm text-stone">{error}</p>}
          {data && data.reviews.length === 0 && <p className="font-serif text-2xl text-stone">Be the first to review {product.name}.</p>}
          <ul className="divide-y divide-taupe/70">
            {data?.reviews.map((r) => (
              <li key={r._id} className="py-8 first:pt-0">
                <div className="flex items-center justify-between gap-4">
                  <Stars value={r.rating} />
                  <span className="text-xs text-stone">{formatDate(r.createdAt)}</span>
                </div>
                {r.title && <p className="mt-4 font-serif text-2xl">{r.title}</p>}
                <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{r.comment}</p>
                <p className="mt-4 flex items-center gap-3 font-sans text-[10.5px] uppercase tracking-wide2 text-stone">
                  {r.name}
                  {r.verifiedPurchase && <span className="text-gold">· Verified purchase</span>}
                  {user && (user._id === r.user || user.role === 'admin') && (
                    <button type="button" onClick={() => remove(r._id)} className="ml-auto uppercase tracking-wide2 hover:text-ink">
                      Delete
                    </button>
                  )}
                </p>
              </li>
            ))}
          </ul>
          {data && page < data.pages && (
            <button type="button" onClick={() => setPage((p) => p + 1)} className="btn-outline mt-6">
              More reviews
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
