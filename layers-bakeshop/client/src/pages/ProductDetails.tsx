import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Minus, Plus, ShoppingBag, Zap, Check, Cookie } from 'lucide-react';
import Reveal from '../components/Reveal';
import ProductGrid from '../components/ProductGrid';
import StateMessage from '../components/StateMessage';
import { getProductBySlug, getProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import type { Product } from '../types';

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setActiveImage(0);
    setQuantity(1);
    getProductBySlug(slug)
      .then((data) => {
        setProduct(data);
        setSelectedSize(data.sizes?.[0]?.label);
        return getProducts({ category: data.category });
      })
      .then((all) => setRelated(all.filter((p) => p.slug !== slug).slice(0, 4)))
      .catch(() => setError('We could not find this item.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="flex min-h-[70vh] items-center justify-center text-layers-muted">Loading...</div>;
  }

  if (error || !product) {
    return (
      <div className="pt-32">
        <StateMessage
          icon={Cookie}
          title="Product unavailable"
          description={error ?? 'This item may have been removed.'}
          action={{ label: 'Back to Menu', onClick: () => navigate('/menu') }}
        />
      </div>
    );
  }

  const activePrice = product.sizes?.find((s) => s.label === selectedSize)?.price ?? product.price;

  function handleAdd(buyNow = false) {
    if (!product) return;
    addItem({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: activePrice,
      size: selectedSize,
      quantity,
      stock: product.stock,
    });
    if (buyNow) {
      navigate('/checkout');
      return;
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8 md:pt-36">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <Reveal direction="left">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-layers-surface-alt">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={product.images[activeImage]}
                alt={product.name}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="h-full w-full object-cover"
              />
            </AnimatePresence>
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  data-cursor-hover
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    activeImage === i ? 'border-layers-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal direction="right">
          <p className="text-xs font-medium uppercase tracking-widest text-layers-accent-hover">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl text-layers-ink">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm text-layers-ink-soft">
              <Star size={15} className="fill-layers-accent text-layers-accent" />
              {product.rating.toFixed(1)} ({product.numReviews} reviews)
            </span>
            <span className={`text-sm font-medium ${product.isAvailable ? 'text-layers-success' : 'text-layers-error'}`}>
              {product.isAvailable ? 'In Stock' : 'Currently Unavailable'}
            </span>
          </div>

          <p className="mt-5 font-display text-3xl text-layers-primary">{formatCurrency(activePrice)}</p>
          <p className="mt-5 leading-relaxed text-layers-ink-soft">{product.description}</p>

          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-layers-ink">Ingredients</h3>
              <p className="mt-1.5 text-sm text-layers-muted">{product.ingredients.join(', ')}</p>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-layers-ink">Size</h3>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.label}
                    type="button"
                    onClick={() => setSelectedSize(size.label)}
                    data-cursor-hover
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedSize === size.label
                        ? 'border-layers-primary bg-layers-primary text-white'
                        : 'border-layers-border text-layers-ink-soft hover:border-layers-primary'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-layers-border px-2 py-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                data-cursor-hover
                className="rounded-full p-2 hover:bg-layers-surface-alt"
              >
                <Minus size={15} />
              </button>
              <span className="w-6 text-center font-medium">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                aria-label="Increase quantity"
                data-cursor-hover
                disabled={quantity >= product.stock}
                className="rounded-full p-2 hover:bg-layers-surface-alt disabled:opacity-30"
              >
                <Plus size={15} />
              </button>
            </div>
            <span className="text-xs text-layers-muted">{product.stock} available</span>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleAdd(false)}
              disabled={!product.isAvailable}
              data-cursor-hover
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-layers-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-layers-primary-hover disabled:opacity-40 sm:flex-none"
            >
              <AnimatePresence mode="wait" initial={false}>
                {justAdded ? (
                  <motion.span key="added" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <Check size={16} /> Added
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <ShoppingBag size={16} /> Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              type="button"
              onClick={() => handleAdd(true)}
              disabled={!product.isAvailable}
              data-cursor-hover
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-layers-ink px-8 py-3.5 text-sm font-semibold text-layers-ink transition-colors hover:bg-layers-ink hover:text-white disabled:opacity-40 sm:flex-none"
            >
              <Zap size={16} /> Buy Now
            </button>
          </div>
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <Reveal>
            <h2 className="font-display text-3xl text-layers-ink">You Might Also Like</h2>
          </Reveal>
          <div className="mt-8">
            <ProductGrid products={related} loading={false} error={null} />
          </div>
        </section>
      )}
    </div>
  );
}
