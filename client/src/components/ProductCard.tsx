import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Product } from '../types';
import { formatCurrency, categoryLabel } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { BagIcon, EyeIcon, HeartIcon } from './Icons';
import StarRating from './StarRating';

interface Props {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard = ({ product, onQuickView }: Props) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [imgError, setImgError] = useState(false);
  const wishlisted = isWishlisted(product._id);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-brown-dark/5 bg-white/60 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-beige">
        {!imgError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brown-light">No image</div>
        )}

        {product.isNewArrival && (
          <span className="absolute left-3 top-3 rounded-full bg-brown-dark px-3 py-1 text-[10px] uppercase tracking-widest text-ivory">
            New
          </span>
        )}
        {!product.isNewArrival && product.bestseller && (
          <span className="absolute left-3 top-3 rounded-full bg-champagne-dark px-3 py-1 text-[10px] uppercase tracking-widest text-ivory">
            Bestseller
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-brown-dark/50 text-xs uppercase tracking-widest text-ivory backdrop-blur-[1px]">
            Out of stock
          </span>
        )}

        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
            className="absolute inset-x-0 bottom-0 translate-y-full bg-ivory/95 py-3 text-center text-[11px] uppercase tracking-widest text-brown-dark transition-transform duration-300 group-hover:translate-y-0 flex items-center justify-center gap-2"
          >
            <EyeIcon width={16} height={16} /> Quick View
          </button>
        )}
      </Link>

      <button
        type="button"
        aria-label="Toggle wishlist"
        onClick={() => toggle(product)}
        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur transition-colors hover:text-champagne-dark ${
          wishlisted ? 'text-champagne-dark' : 'text-brown-dark'
        }`}
      >
        <HeartIcon filled={wishlisted} width={17} height={17} />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-[11px] uppercase tracking-widest text-champagne-dark">
          {categoryLabel(product.category)}
        </span>
        <Link to={`/product/${product.slug}`} className="font-display text-lg text-brown-dark hover:text-champagne-dark">
          {product.name}
        </Link>
        <StarRating rating={product.rating} count={product.numReviews} />
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-brown-dark">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-brown-light line-through">{formatCurrency(product.compareAtPrice)}</span>
            )}
          </div>
          <button
            type="button"
            aria-label="Add to cart"
            disabled={outOfStock}
            onClick={() => addToCart(product, 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brown-dark text-ivory transition-colors hover:bg-champagne-dark disabled:opacity-30"
          >
            <BagIcon width={16} height={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
