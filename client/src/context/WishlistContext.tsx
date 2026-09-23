import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { wishlistApi } from '../services';
import { readStorage, writeStorage } from '../lib/storage';
import type { Product } from '../types';

interface WishlistContextValue {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (product: Product) => Promise<void>;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);
const KEY = 'nb_wishlist';

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const [ids, setIds] = useState<string[]>(() => readStorage<string[]>(KEY, []));
  const prevUser = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (loading) return;
    const uid = user?._id ?? null;
    const prev = prevUser.current;
    prevUser.current = uid;
    if (uid && uid !== prev) {
      wishlistApi
        .merge(readStorage<string[]>(KEY, []))
        .then((products) => {
          setIds(products.map((p) => p._id));
          writeStorage(KEY, []);
        })
        .catch(() => {});
    } else if (!uid && prev) {
      setIds([]);
    }
  }, [user, loading]);

  useEffect(() => {
    if (!user) writeStorage(KEY, ids);
  }, [ids, user]);

  const toggle = useCallback(
    async (product: Product) => {
      const had = ids.includes(product._id);
      setIds((prev) => (had ? prev.filter((i) => i !== product._id) : [...prev, product._id]));
      if (user) {
        try {
          const res = await wishlistApi.toggle(product._id);
          setIds(res.ids);
        } catch {
          setIds((prev) => (had ? [...prev, product._id] : prev.filter((i) => i !== product._id)));
          toast.error('We could not update your wishlist');
          return;
        }
      }
      toast.success(had ? `${product.name} removed from your wishlist` : `${product.name} saved to your wishlist`);
    },
    [ids, user]
  );

  const value = useMemo(() => ({ ids, has: (id: string) => ids.includes(id), toggle, count: ids.length }), [ids, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
