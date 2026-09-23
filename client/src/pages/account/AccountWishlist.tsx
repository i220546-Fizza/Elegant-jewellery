import { WishlistGrid } from '../Wishlist';
import { useTitle } from '../../lib/useTitle';

const AccountWishlist = () => {
  useTitle('Wishlist');
  return (
    <div>
      <h2 className="mb-8 font-serif text-3xl">Wishlist</h2>
      <WishlistGrid />
    </div>
  );
};

export default AccountWishlist;
