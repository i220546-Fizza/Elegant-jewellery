import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Product } from '../types';
import { formatCurrency, categoryLabel } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import useTilt from '../hooks/useTilt';
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
  const [heartBeat, setHeartBeat] = useState(false);
  const wishlisted = isWishlisted(product._id);
  const outOfStock = product.stock <= 0;
  const tilt = useTilt({ max: 7, scale: 1.015 });

  const handleWishlist = () => {
    setHeartBeat(true);
    toggle(product);
  };

  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={{
        rotateX: tilt.style.rotateX,
        rotateY: tilt.style.rotateY,
        scale: tilt.style.scale,
        transformPerspective: tilt.style.transformPerspective,
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-brown-dark/5 bg-white/70 shadow-card transition-shadow duration-500 ease-lux hover:shadow-glow"
    >
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-beige">
        {!imgError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-lux group-hover:scale-[1.12]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brown-light">No image</div>
        )}

        {/* subtle glass sheen for depth */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brown-dark/10 via-transparent to-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {product.isNewArrival && <span className="badge-luxe absolute left-3 top-3">New</span>}
        {!product.isNewArrival && product.bestseller && (
          <span className="badge-luxe absolute left-3 top-3">Bestseller</span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-brown-dark/50 text-xs uppercase tracking-widest text-ivory backdrop-blur-[1px]">
            Out of stock
          </span>
        )}

        {/* floating add-to-cart pill, slides up on hover */}
        <button
          type="button"
          aria-label="Add to cart"
          disabled={outOfStock}
          onClick={(e) => {
            e.preventDefault();
            addToCart(product, 1);
          }}
          className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-full bg-brown-dark/95 py-2.5 text-[11px] uppercase tracking-widest text-ivory shadow-lux backdrop-blur transition-all duration-500 ease-lux disabled:pointer-events-none disabled:opacity-0 sm:translate-y-16 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
        >
          <BagIcon width={14} height={14} /> Add to Cart
        </button>

        {onQuickView && (
          <button
            type="button"
            aria-label="Quick view"
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
            className="absolute right-3 top-14 hidden h-9 w-9 translate-y-[-8px] items-center justify-center rounded-full bg-white/85 text-brown-dark opacity-0 shadow-card backdrop-blur transition-all duration-300 ease-lux hover:text-champagne-dark sm:flex sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
          >
            <EyeIcon width={15} height={15} />
          </button>
        )}
      </Link>

      <button
        type="button"
        aria-label="Toggle wishlist"
        onClick={handleWishlist}
        onAnimationEnd={() => setHeartBeat(false)}
        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur transition-colors hover:text-champagne-dark ${
          wishlisted ? 'text-champagne-dark' : 'text-brown-dark'
        } ${heartBeat ? 'animate-heartBeat' : ''}`}
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
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
