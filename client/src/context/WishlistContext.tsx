import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import * as userService from '../services/userService';
import type { Product } from '../types';

interface WishlistContextValue {
  ids: Set<string>;
  products: Product[];
  toggle: (product: Product) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);
const STORAGE_KEY = 'ej_wishlist';

const loadLocal = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set(loadLocal()));
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (user) {
      userService
        .fetchWishlist()
        .then((fetched) => {
          setIds(new Set(fetched.map((p) => p._id)));
          setProducts(fetched);
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
    }
  }, [ids, user]);

  const toggle = useCallback(
    async (product: Product) => {
      const wasWishlisted = ids.has(product._id);
      if (user) {
        try {
          const { added } = await userService.toggleWishlistItem(product._id);
          setIds((prev) => {
            const next = new Set(prev);
            if (added) next.add(product._id);
            else next.delete(product._id);
            return next;
          });
          setProducts((prev) => (added ? [...prev, product] : prev.filter((p) => p._id !== product._id)));
          toast.success(added ? `${product.name} added to wishlist` : `${product.name} removed from wishlist`);
        } catch {
          toast.error('Could not update wishlist');
        }
      } else {
        setIds((prev) => {
          const next = new Set(prev);
          if (wasWishlisted) next.delete(product._id);
          else next.add(product._id);
          return next;
        });
        setProducts((prev) => (wasWishlisted ? prev.filter((p) => p._id !== product._id) : [...prev, product]));
        toast.success(wasWishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`);
      }
    },
    [ids, user]
  );

  const isWishlisted = useCallback((productId: string) => ids.has(productId), [ids]);

  const value = useMemo(
    () => ({ ids, products, toggle, isWishlisted }),
    [ids, products, toggle, isWishlisted]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = (): WishlistContextValue => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
};
