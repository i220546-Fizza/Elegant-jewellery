import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { cartApi } from '../services';
import { getErrorMessage } from '../lib/api';
import { readStorage, writeStorage } from '../lib/storage';
import type { CartLineRef, CartQuote, Product, Variant } from '../types';

interface CartContextValue {
  refs: CartLineRef[];
  quote: CartQuote | null;
  syncing: boolean;
  itemCount: number;
  couponCode: string;
  addItem: (product: Product, variant: Variant, quantity?: number, opts?: { silent?: boolean }) => void;
  setQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const KEY = 'nb_cart';
const COUPON_KEY = 'nb_coupon';
const MAX_QTY = 20;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [refs, setRefs] = useState<CartLineRef[]>(() => readStorage<CartLineRef[]>(KEY, []));
  const [couponCode, setCouponCode] = useState<string>(() => readStorage<string>(COUPON_KEY, ''));
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const skipSync = useRef(false);
  const prevUserId = useRef<string | null | undefined>(undefined);
  const requestId = useRef(0);
  const merging = useRef(false);

  // Persist locally for guests (and as an offline fallback).
  useEffect(() => {
    writeStorage(KEY, refs);
    writeStorage(COUPON_KEY, couponCode);
  }, [refs, couponCode]);

  const adopt = useCallback((q: CartQuote) => {
    skipSync.current = true;
    setQuote(q);
    setRefs(q.items.filter((i) => i.quantity > 0).map(({ product, variantId, quantity }) => ({ product, variantId, quantity })));
    setCouponCode(q.couponCode);
  }, []);

  // Sign-in merges the guest bag into the saved one; sign-out empties the bag.
  useEffect(() => {
    if (authLoading) return;
    const uid = user?._id ?? null;
    const prev = prevUserId.current;
    prevUserId.current = uid;
    if (uid && uid !== prev) {
      merging.current = true;
      setSyncing(true);
      cartApi
        .merge(refs, couponCode)
        .then(adopt)
        .catch(() => {})
        .finally(() => {
          merging.current = false;
          setSyncing(false);
        });
    } else if (!uid && prev) {
      skipSync.current = true;
      setRefs([]);
      setCouponCode('');
      setQuote(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Price the bag on the server whenever it changes (debounced).
  useEffect(() => {
    if (authLoading || merging.current) return;
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }
    const id = ++requestId.current;
    const handle = window.setTimeout(async () => {
      setSyncing(true);
      try {
        const q = user ? await cartApi.save(refs, couponCode) : await cartApi.quote(refs, couponCode);
        if (id === requestId.current) setQuote(q);
      } catch {
        /* keep last known quote */
      } finally {
        if (id === requestId.current) setSyncing(false);
      }
    }, 250);
    return () => window.clearTimeout(handle);
  }, [refs, couponCode, user, authLoading]);

  const addItem = useCallback((product: Product, variant: Variant, quantity = 1, opts?: { silent?: boolean }) => {
    if (variant.stock <= 0) {
      toast.error(`${product.name} ${variant.size} is currently sold out`);
      return;
    }
    setRefs((prev) => {
      const existing = prev.find((r) => r.product === product._id && r.variantId === variant._id);
      const limit = Math.min(MAX_QTY, variant.stock);
      if (existing) {
        return prev.map((r) => (r === existing ? { ...r, quantity: Math.min(limit, r.quantity + quantity) } : r));
      }
      return [...prev, { product: product._id, variantId: variant._id, quantity: Math.min(limit, quantity) }];
    });
    if (!opts?.silent) setDrawerOpen(true);
  }, []);

  const setQuantity = useCallback((productId: string, variantId: string, quantity: number) => {
    setRefs((prev) => prev.map((r) => (r.product === productId && r.variantId === variantId ? { ...r, quantity: Math.max(1, Math.min(MAX_QTY, quantity)) } : r)));
  }, []);

  const removeItem = useCallback((productId: string, variantId: string) => {
    setRefs((prev) => prev.filter((r) => !(r.product === productId && r.variantId === variantId)));
  }, []);

  const clear = useCallback(() => {
    setRefs([]);
    setCouponCode('');
  }, []);

  const applyCoupon = useCallback(
    async (code: string) => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return false;
      try {
        const q = await cartApi.quote(refs, trimmed);
        if (q.couponError) {
          toast.error(q.couponError);
          return false;
        }
        setCouponCode(trimmed);
        toast.success(`Code ${trimmed} applied`);
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err));
        return false;
      }
    },
    [refs]
  );

  const removeCoupon = useCallback(() => setCouponCode(''), []);

  const itemCount = useMemo(() => refs.reduce((s, r) => s + r.quantity, 0), [refs]);

  const value = useMemo(
    () => ({
      refs,
      quote,
      syncing,
      itemCount,
      couponCode,
      addItem,
      setQuantity,
      removeItem,
      clear,
      applyCoupon,
      removeCoupon,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [refs, quote, syncing, itemCount, couponCode, addItem, setQuantity, removeItem, clear, applyCoupon, removeCoupon, drawerOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
