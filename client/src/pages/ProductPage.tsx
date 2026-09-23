import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productApi } from '../services';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Bottle3D from '../components/product/Bottle3D';
import ProductImage from '../components/product/ProductImage';
import VariantPicker from '../components/product/VariantPicker';
import NotesPyramid from '../components/product/NotesPyramid';
import Reviews from '../components/product/Reviews';
import ProductCard from '../components/product/ProductCard';
import Quantity from '../components/ui/Quantity';
import Stars from '../components/ui/Stars';
import { AccordionItem } from '../components/ui/Accordion';
import { Breadcrumbs } from '../components/ui/PageHeader';
import { EmptyState, ErrorState, Spinner } from '../components/ui/Feedback';
import { ClockIcon, HeartIcon, RotateIcon, TruckIcon, WindIcon, GiftIcon } from '../components/ui/Icons';
import Reveal from '../components/ui/Reveal';
import { discounted, formatPrice, genderLabel } from '../lib/format';
import { getErrorMessage, getStatus } from '../lib/api';
import { useTitle } from '../lib/useTitle';

const ProductPage = () => {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [variantId, setVariantId] = useState<string>();
  const [qty, setQty] = useState(1);
  const [view, setView] = useState<number>(-1); // -1 = live 3D, otherwise image index

  useTitle(product?.name, product ? `${product.name} — ${product.tagline}. ${product.concentration} by NB Classic Scents.` : undefined);

  const load = useCallback(() => {
    setError(null);
    return productApi
      .get(slug)
      .then((p) => {
        setProduct(p);
        setVariantId((prev) => (p.variants.some((v) => v._id === prev) ? prev : (p.variants.find((v) => v.size.startsWith('50') && v.stock > 0) || p.variants.find((v) => v.stock > 0) || p.variants[0])?._id));
        productApi.related(p._id).then(setRelated).catch(() => {});
      })
      .catch((e) => setError({ message: getErrorMessage(e), status: getStatus(e) }));
  }, [slug]);

  useEffect(() => {
    setProduct(null);
    setView(-1);
    setQty(1);
    load();
  }, [load]);

  if (error) {
    return <div className="pt-32">{error.status === 404 ? <EmptyState title="This fragrance could not be found" text="It may have been retired from the collection." action={{ label: 'Explore fragrances', to: '/fragrances' }} /> : <ErrorState message={error.message} onRetry={load} />}</div>;
  }
  if (!product) return <div className="pt-32"><Spinner label="Preparing the showroom" /></div>;

  const variant = product.variants.find((v) => v._id === variantId);
  const price = variant ? discounted(variant.price, product.discountPercent) : product.price;
  const wished = has(product._id);
  const soldOut = !variant || variant.stock <= 0;

  const buyNow = () => {
    if (!variant) return;
    addItem(product, variant, qty, { silent: true });
    navigate('/checkout');
  };

  return (
    <>
      <section className="container-lux pt-24 lg:pt-32">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Fragrances', to: '/fragrances' }, { label: product.name }]} />
      </section>

      <section className="container-lux mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* ---------- viewer ---------- */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24">
            <div className="relative aspect-[4/5] overflow-hidden bg-taupe/45 sm:aspect-square lg:aspect-[5/5.4]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(248,247,243,0.95),transparent_62%)]" />
              {view === -1 ? (
                <>
                  <Bottle3D spec={product.bottle} name={product.name} modelUrl={product.model3d} mode="viewer" zoom={0.8} posterClassName="object-contain scale-[0.8]" poster={product.images[0]} posterAlt={`${product.name} bottle`} className="absolute inset-0" />
                  <p className="pointer-events-none absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2 eyebrow !text-[9.5px]">
                    <RotateIcon size={14} /> Drag to turn the bottle
                  </p>
                </>
              ) : (
                <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }} className="absolute inset-0">
                  <ProductImage src={product.images[view]} alt={`${product.name} view ${view + 1}`} eager className="h-full w-full object-contain p-6" />
                </motion.div>
              )}
              {product.discountPercent > 0 && <span className="absolute left-5 top-5 bg-ink px-3 py-1 font-sans text-[10px] uppercase tracking-wide2 text-ivory">−{product.discountPercent}%</span>}
            </div>
            <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
              <button type="button" onClick={() => setView(-1)} aria-label="3D view" className={`flex h-24 w-20 shrink-0 flex-col items-center justify-center gap-1 border bg-taupe/30 transition ${view === -1 ? 'border-ink' : 'border-transparent hover:border-gold'}`}>
                <RotateIcon size={20} />
                <span className="font-sans text-[9px] uppercase tracking-wide2">3D</span>
              </button>
              {product.images.map((img, i) => (
                <button key={img} type="button" onClick={() => setView(i)} aria-label={`Image ${i + 1}`} className={`h-24 w-20 shrink-0 border bg-taupe/30 transition ${view === i ? 'border-ink' : 'border-transparent hover:border-gold'}`}>
                  <ProductImage src={img} alt="" className="h-full w-full object-contain p-1" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- details ---------- */}
        <div className="lg:col-span-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
            <p className="eyebrow">
              {product.fragranceFamily} · {genderLabel[product.gender]}
            </p>
            <h1 className="mt-4 font-serif text-6xl font-light uppercase leading-none tracking-[0.06em] sm:text-7xl">{product.name}</h1>
            <p className="mt-4 font-sans text-[12px] uppercase tracking-wide2 text-ink/80">{product.tagline}</p>
            <p className="mt-1 font-serif text-lg italic text-stone">{product.concentration}</p>

            {product.numReviews > 0 && (
              <a href="#reviews" className="mt-5 inline-flex items-center gap-3 text-xs text-stone hover:text-ink">
                <Stars value={product.rating} /> {product.rating.toFixed(1)} · {product.numReviews} reviews
              </a>
            )}

            <p className="mt-8 flex items-baseline gap-3 text-3xl font-light">
              {formatPrice(price * qty)}
              {product.discountPercent > 0 && variant && <span className="text-base text-stone line-through">{formatPrice(variant.price * qty)}</span>}
            </p>
            <p className="mt-1 text-xs text-stone">Taxes included. Complimentary delivery above {formatPrice(20000)}.</p>

            <p className="mt-8 text-[15px] leading-relaxed text-ink/80">{product.description}</p>

            <div className="mt-10">
              <p className="label mb-3">Size</p>
              <VariantPicker variants={product.variants} value={variantId} onChange={(id) => { setVariantId(id); setQty(1); }} discountPercent={product.discountPercent} />
            </div>

            <div className="mt-8">
              <p className="label mb-3">Quantity</p>
              <div className="flex gap-3">
                <Quantity value={qty} onChange={setQty} max={Math.max(1, Math.min(20, variant?.stock || 1))} />
                <button type="button" onClick={() => toggle(product)} aria-pressed={wished} className={`flex h-12 items-center gap-2 border border-taupe px-5 font-sans text-[11px] uppercase tracking-wide2 transition hover:border-gold ${wished ? 'text-gold' : ''}`}>
                  <HeartIcon size={17} filled={wished} /> {wished ? 'Saved' : 'Wishlist'}
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button type="button" disabled={soldOut} onClick={() => variant && addItem(product, variant, qty)} className="btn-dark w-full">
                {soldOut ? 'Sold out' : 'Add to bag'}
              </button>
              <button type="button" disabled={soldOut} onClick={buyNow} className="btn-outline w-full">
                Buy now
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 border-y border-taupe/80 py-6 text-center">
              <div>
                <ClockIcon size={20} className="mx-auto text-gold" />
                <p className="mt-2 eyebrow !text-[9px]">Longevity</p>
                <p className="mt-1 text-xs">{product.longevity || '—'}</p>
              </div>
              <div className="border-x border-taupe/80">
                <WindIcon size={20} className="mx-auto text-gold" />
                <p className="mt-2 eyebrow !text-[9px]">Sillage</p>
                <p className="mt-1 text-xs">{product.sillage || '—'}</p>
              </div>
              <div>
                <GiftIcon size={20} className="mx-auto text-gold" />
                <p className="mt-2 eyebrow !text-[9px]">Presentation</p>
                <p className="mt-1 text-xs">Ivory coffret</p>
              </div>
            </div>

            <div className="mt-6">
              <AccordionItem title="Fragrance notes" defaultOpen>
                <dl className="space-y-3">
                  {(['top', 'heart', 'base'] as const).map((k) => (
                    <div key={k} className="grid grid-cols-[90px_1fr] gap-3">
                      <dt className="font-sans text-[10.5px] uppercase tracking-wide2 text-ink">{k} notes</dt>
                      <dd>{product.notes[k].join(', ')}</dd>
                    </div>
                  ))}
                </dl>
              </AccordionItem>
              <AccordionItem title="Ingredients">{product.ingredients || 'Full ingredient list available on request.'}</AccordionItem>
              <AccordionItem title="Longevity & wear">
                Lasts {product.longevity || 'several hours'} on skin with a {product.sillage?.toLowerCase() || 'moderate'} sillage. For a longer trail, apply to pulse points after moisturising and mist lightly over clothing.
              </AccordionItem>
              <AccordionItem title="Shipping & returns">
                <span className="flex items-start gap-3">
                  <TruckIcon size={18} className="mt-0.5 shrink-0 text-gold" />
                  <span>
                    Delivered in 2–4 working days across Pakistan; complimentary above {formatPrice(20000)}. Unopened fragrances may be returned within 14 days. See{' '}
                    <Link to="/shipping" className="text-ink underline decoration-gold underline-offset-4">
                      shipping
                    </Link>{' '}
                    and{' '}
                    <Link to="/returns" className="text-ink underline decoration-gold underline-offset-4">
                      returns
                    </Link>
                    .
                  </span>
                </span>
              </AccordionItem>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- composition & story ---------- */}
      <section className="mt-24 bg-taupe/35 py-24 lg:mt-32 lg:py-32">
        <div className="container-lux grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow flex items-center gap-4">
              <span className="gold-rule" /> The composition
            </p>
            <h2 className="heading-lg mt-6 uppercase tracking-[0.04em]">The story of {product.name}</h2>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-stone">{product.story || product.description}</p>
          </Reveal>
          <NotesPyramid notes={product.notes} />
        </div>
      </section>

      <Reviews product={product} onChange={load} />

      {related.length > 0 && (
        <section className="container-lux border-t border-taupe/70 py-20 lg:py-28">
          <p className="eyebrow">You may also love</p>
          <h2 className="mt-4 font-serif text-5xl">Further discoveries</h2>
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {related.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default ProductPage;
