import { useEffect } from 'react';
import { useWishlist } from '../context/WishlistContext';
import ProductGrid from '../components/ProductGrid';
import EmptyState from '../components/EmptyState';
import { HeartIcon } from '../components/Icons';

const Wishlist = () => {
  const { products } = useWishlist();

  useEffect(() => {
    document.title = 'Wishlist | Elegant Jewellery';
  }, []);

  return (
    <div className="container-luxe py-12">
      <div className="mb-10 text-center">
        <p className="section-kicker">Saved For Later</p>
        <h1 className="section-heading mt-3">My Wishlist</h1>
      </div>
      {products.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          message="Tap the heart icon on any product to save it here for later."
          icon={<HeartIcon width={28} height={28} />}
          actionLabel="Explore Collections"
          actionTo="/shop"
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
};

export default Wishlist;
