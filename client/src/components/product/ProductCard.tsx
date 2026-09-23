import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useUI } from '../../context/UIContext';
import ProductImage from './ProductImage';
import Price from './Price';
import Stars from '../ui/Stars';
import { EyeIcon, HeartIcon } from '../ui/Icons';

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { setQuickView } = useUI();
  const wished = has(product._id);
  const firstAvailable = product.variants.find((v) => v.stock > 0);
  const defaultVariant = product.variants.find((v) => v.size.startsWith('50') && v.stock > 0) || firstAvailable;
  const sizes = product.variants.map((v) => v.size).join(' · ');
  const lowest = Math.min(...product.variants.map((v) => v.price));

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 1.1, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-taupe/45">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(248,247,243,0.85),transparent_65%)]" />
        <Link to={`/fragrance/${product.slug}`} aria-label={product.name} className="absolute inset-0">
          <ProductImage
            src={product.images[0]}
            alt={`${product.name} ${product.concentration} bottle`}
            className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-[1400ms] ease-lux group-hover:scale-[1.035]"
          />
          {product.images[1] && (
            <ProductImage
              src={product.images[1]}
              alt=""
              className="!opacity-0 absolute inset-0 h-full w-full object-contain p-4 transition-all duration-[1200ms] ease-lux group-hover:!opacity-100 group-hover:scale-[1.035]"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
          {product.discountPercent > 0 && <span className="bg-ink px-2.5 py-1 font-sans text-[9.5px] uppercase tracking-wide2 text-ivory">−{product.discountPercent}%</span>}
          {product.categories.some((c) => c.slug === 'limited-edition') && (
            <span className="border border-ink/70 bg-ivory/70 px-2.5 py-1 font-sans text-[9.5px] uppercase tracking-wide2">Limited</span>
          )}
          {product.isNewArrival && <span className="bg-ivory/80 px-2.5 py-1 font-sans text-[9.5px] uppercase tracking-wide2">New</span>}
          {!product.inStock && <span className="bg-stone px-2.5 py-1 font-sans text-[9.5px] uppercase tracking-wide2 text-ivory">Sold out</span>}
        </div>

        <button
          type="button"
          onClick={() => toggle(product)}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={wished}
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/80 transition-colors duration-500 hover:text-gold ${wished ? 'text-gold' : 'text-ink'}`}
        >
          <HeartIcon size={17} filled={wished} />
        </button>

        <div className="absolute inset-x-0 bottom-0 flex translate-y-0 gap-px opacity-100 transition-all duration-700 ease-lux lg:translate-y-full lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
          <button type="button" onClick={() => setQuickView(product)} className="flex flex-1 items-center justify-center gap-2 bg-ivory/95 py-3.5 font-sans text-[10px] uppercase tracking-wide2 text-ink transition hover:text-gold">
            <EyeIcon size={15} /> Quick view
          </button>
          <button
            type="button"
            disabled={!defaultVariant}
            onClick={() => defaultVariant && addItem(product, defaultVariant)}
            className="flex-1 bg-ink py-3.5 font-sans text-[10px] uppercase tracking-wide2 text-ivory transition hover:text-gold disabled:bg-stone"
          >
            {defaultVariant ? `Add ${defaultVariant.size}` : 'Sold out'}
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow !text-[9.5px]">{product.fragranceFamily}</p>
          <h3 className="mt-2 font-serif text-2xl leading-none">
            <Link to={`/fragrance/${product.slug}`} className="transition-colors duration-500 hover:text-stone">
              {product.name}
            </Link>
          </h3>
          <p className="mt-2 truncate text-[12.5px] text-stone">{product.tagline}</p>
        </div>
        <div className="shrink-0 text-right">
          <Price price={lowest} discountPercent={product.discountPercent} from={product.variants.length > 1} className="flex-col !items-end !gap-0.5 text-sm" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-taupe/70 pt-3 text-[11px] text-stone">
        <span className="tracking-wide">{sizes}</span>
        {product.numReviews > 0 ? (
          <span className="flex items-center gap-2">
            <Stars value={product.rating} size={11} /> <span>({product.numReviews})</span>
          </span>
        ) : (
          <span className="uppercase tracking-wide2 text-[9.5px]">{product.concentration}</span>
        )}
      </div>
    </motion.article>
  );
};

export const ProductCardSkeleton = () => (
  <div>
    <div className="skeleton aspect-[4/5]" />
    <div className="skeleton mt-5 h-3 w-24" />
    <div className="skeleton mt-3 h-6 w-40" />
    <div className="skeleton mt-3 h-3 w-full" />
  </div>
);

export default ProductCard;
