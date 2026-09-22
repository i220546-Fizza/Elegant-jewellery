import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem } from '../types';

interface CartContextValue {
  items: CartItem[];
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (product: string, size?: string) => void;
  increment: (product: string, size?: string) => void;
  decrement: (product: string, size?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'layers_cart';
const FREE_DELIVERY_THRESHOLD = 5000;
const DELIVERY_FEE = 250;

function lineKey(product: string, size?: string) {
  return `${product}__${size ?? ''}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable, cart stays in-memory only
    }
  }, [items]);

  function addItem(newItem: CartItem) {
    setItems((prev) => {
      const key = lineKey(newItem.product, newItem.size);
      const existing = prev.find((i) => lineKey(i.product, i.size) === key);
      if (existing) {
        return prev.map((i) =>
          lineKey(i.product, i.size) === key
            ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, i.stock) }
            : i,
        );
      }
      return [...prev, newItem];
    });
    setDrawerOpen(true);
  }

  function removeItem(product: string, size?: string) {
    const key = lineKey(product, size);
    setItems((prev) => prev.filter((i) => lineKey(i.product, i.size) !== key));
  }

  function increment(product: string, size?: string) {
    const key = lineKey(product, size);
    setItems((prev) =>
      prev.map((i) =>
        lineKey(i.product, i.size) === key ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i,
      ),
    );
  }

  function decrement(product: string, size?: string) {
    const key = lineKey(product, size);
    setItems((prev) =>
      prev
        .map((i) => (lineKey(i.product, i.size) === key ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const deliveryFee = useMemo(
    () => (items.length === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE),
    [items.length, subtotal],
  );
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        isDrawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
        addItem,
        removeItem,
        increment,
        decrement,
        clearCart,
        itemCount,
        subtotal,
        deliveryFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
