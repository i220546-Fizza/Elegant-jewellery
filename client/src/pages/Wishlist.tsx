import { useEffect, useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { productApi } from '../services';
import type { Product } from '../types';
import ProductCard, { ProductCardSkeleton } from '../components/product/ProductCard';
import { EmptyState } from '../components/ui/Feedback';
import PageHeader from '../components/ui/PageHeader';
import { useTitle } from '../lib/useTitle';

/** Wishlist grid. Used standalone (/wishlist) and inside the account area. */
export const WishlistGrid = () => {
  const { ids } = useWishlist();
  const [products, setProducts] = useState<Product[] | null>(null);
  const key = [...ids].sort().join(',');

  useEffect(() => {
    if (!key) {
      setProducts([]);
      return;
    }
    productApi
      .list({ ids: key, limit: 60 })
      .then((r) => setProducts(r.products))
      .catch(() => setProducts([]));
  }, [key]);

  // Keep the grid in step when an item is removed from the wishlist.
  const visible = products?.filter((p) => ids.includes(p._id));

  if (!visible) {
    return (
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (visible.length === 0) return <EmptyState title="Your wishlist is empty" text="Tap the heart on any fragrance to save it here." action={{ label: 'Explore fragrances', to: '/fragrances' }} />;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
      {visible.map((p, i) => (
        <ProductCard key={p._id} product={p} index={i} />
      ))}
    </div>
  );
};

const Wishlist = () => {
  useTitle('Wishlist');
  return (
    <>
      <PageHeader eyebrow="Saved for later" title="Wishlist" crumbs={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
      <section className="container-lux py-16 lg:py-20">
        <WishlistGrid />
      </section>
    </>
  );
};

export default Wishlist;
