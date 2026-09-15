import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatCurrency, categoryLabel } from '../utils/format';
import { useCart } from '../context/CartContext';
import { CloseIcon } from './Icons';
import StarRating from './StarRating';
import QuantitySelector from './QuantitySelector';

interface Props {
  product: Product | null;
  onClose: () => void;
}

const QuickViewModal = ({ product, onClose }: Props) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brown-dark/50 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-2xl bg-ivory shadow-soft sm:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-brown-dark"
        >
          <CloseIcon width={16} height={16} />
        </button>
        <div className="aspect-square bg-beige">
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col gap-3 p-6 sm:p-8">
          <span className="text-[11px] uppercase tracking-widest text-champagne-dark">
            {categoryLabel(product.category)}
          </span>
          <h2 className="font-display text-2xl text-brown-dark">{product.name}</h2>
          <StarRating rating={product.rating} count={product.numReviews} />
          <p className="font-medium text-lg text-brown-dark">{formatCurrency(product.price)}</p>
          <p className="text-sm text-brown-light line-clamp-3">{product.description}</p>

          {product.sizes.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-brown-dark">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      size === s ? 'border-brown-dark bg-brown-dark text-ivory' : 'border-brown-dark/25 text-brown-dark'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center gap-3">
            <QuantitySelector quantity={quantity} onChange={setQuantity} max={product.stock} />
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => {
                addToCart(product, quantity, size);
                onClose();
              }}
              className="btn-primary flex-1"
            >
              Add to Cart
            </button>
          </div>
          <Link to={`/product/${product.slug}`} className="mt-1 text-xs uppercase tracking-widest text-champagne-dark hover:underline">
            View full details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
