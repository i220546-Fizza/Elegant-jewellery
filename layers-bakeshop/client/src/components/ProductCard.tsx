import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, Eye } from 'lucide-react';
import { useTilt } from '../hooks/useTilt';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { ref, rotateX, rotateY, scale, onMouseMove, onMouseEnter, onMouseLeave } = useTilt(6);
  const { addItem } = useCart();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.isAvailable) return;
    addItem({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity: 1,
      stock: product.stock,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1000 }}
    >
      <Link to={`/product/${product.slug}`} data-cursor-hover className="group block">
        <motion.div
          ref={ref}
          onMouseMove={onMouseMove}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d' }}
          className="relative overflow-hidden rounded-2xl border border-layers-border bg-layers-surface shadow-sm transition-shadow duration-300 hover:shadow-xl"
        >
          <div className="relative aspect-square overflow-hidden bg-layers-surface-alt">
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            {!product.isAvailable && (
              <div className="absolute inset-0 flex items-center justify-center bg-layers-ink/60 backdrop-blur-[2px]">
                <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-layers-ink">
                  Sold Out
                </span>
              </div>
            )}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {product.isBestseller && (
                <span className="rounded-full bg-layers-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Bestseller
                </span>
              )}
              {product.isNewArrival && (
                <span className="rounded-full bg-layers-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-layers-ink">
                  New
                </span>
              )}
              {product.isLimitedEdition && (
                <span className="rounded-full bg-layers-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Limited
                </span>
              )}
            </div>

            <div className="absolute inset-x-3 bottom-3 flex translate-y-3 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.isAvailable}
                aria-label={`Add ${product.name} to cart`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/95 py-2.5 text-xs font-semibold text-layers-ink shadow-md backdrop-blur transition-colors hover:bg-layers-primary hover:text-white disabled:pointer-events-none disabled:opacity-50"
              >
                <ShoppingBag size={14} /> Add
              </button>
              <span
                aria-hidden="true"
                className="flex items-center justify-center rounded-full bg-layers-ink/80 p-2.5 text-white shadow-md backdrop-blur"
              >
                <Eye size={14} />
              </span>
            </div>
          </div>

          <div className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-widest text-layers-accent-hover">
              {product.category}
            </p>
            <h3 className="mt-1 truncate font-display text-lg text-layers-ink">{product.name}</h3>
            <p className="mt-1 line-clamp-1 text-sm text-layers-muted">{product.description}</p>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="font-semibold text-layers-ink">{formatCurrency(product.price)}</span>
              <span className="flex items-center gap-1 text-xs text-layers-ink-soft">
                <Star size={13} className="fill-layers-accent text-layers-accent" />
                {product.rating.toFixed(1)}
                <span className="text-layers-muted">({product.numReviews})</span>
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
