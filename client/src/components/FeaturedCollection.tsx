import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatCurrency, categoryLabel } from '../utils/format';
import { useWishlist } from '../context/WishlistContext';
import Reveal from './Reveal';
import { HeartIcon } from './Icons';

interface Props {
  products: Product[];
}

// Asymmetric bento placement for up to 5 tiles - the large hero tile leads,
// the rest fan out around it at varying scales for visual depth.
const TILE_CLASSES = [
  'sm:col-span-2 sm:row-span-2',
  'sm:col-span-2 sm:row-span-1',
  'sm:col-span-1 sm:row-span-1',
  'sm:col-span-1 sm:row-span-1',
  'sm:col-span-2 sm:row-span-1',
];

const FeaturedTile = ({ product, className, large }: { product: Product; className: string; large?: boolean }) => {
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product._id);

  return (
    <div className={`group relative aspect-square overflow-hidden rounded-2xl border border-brown-dark/5 shadow-card transition-all duration-500 ease-lux hover:shadow-lux sm:aspect-auto ${className}`}>
      <Link to={`/product/${product.slug}`} className="absolute inset-0">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-lux group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/70 via-brown-dark/5 to-transparent" />
      </Link>

      <button
        type="button"
        aria-label="Toggle wishlist"
        onClick={() => toggle(product)}
        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur transition-colors hover:text-champagne-dark ${
          wishlisted ? 'text-champagne-dark' : 'text-brown-dark'
        }`}
      >
        <HeartIcon filled={wishlisted} width={16} height={16} />
      </button>

      <div className="relative z-10 flex h-full flex-col justify-end p-5">
        <span className="text-[10px] uppercase tracking-widest text-gold-light/90">{categoryLabel(product.category)}</span>
        <Link
          to={`/product/${product.slug}`}
          className={`font-display text-ivory hover:text-gold-light ${large ? 'text-2xl sm:text-3xl' : 'text-lg'}`}
        >
          {product.name}
        </Link>
        <span className="mt-1 text-sm font-medium text-ivory/90">{formatCurrency(product.price)}</span>
      </div>
    </div>
  );
};

const FeaturedCollection = ({ products }: Props) => {
  const tiles = products.slice(0, 5);

  if (tiles.length === 0) return null;

  return (
    <section id="featured-collection" className="bg-cream py-16 sm:py-24">
      <div className="container-luxe">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="section-kicker">Handpicked</p>
          <h2 className="section-heading mt-3">Featured Collection</h2>
          <p className="mt-3 text-sm text-brown-light">
            A curated edit of our most coveted pieces, arranged for the way you actually browse.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:auto-rows-[190px] sm:gap-5">
            {tiles.map((product, i) => (
              <FeaturedTile
                key={product._id}
                product={product}
                className={TILE_CLASSES[i] || ''}
                large={i === 0}
              />
            ))}
          </div>
        </Reveal>

        <div className="mt-10 text-center">
          <Link to="/shop?featured=true" className="btn-secondary">
            View Full Collection
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
