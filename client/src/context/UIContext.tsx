import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../types';

interface UIContextValue {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  quickView: Product | null;
  setQuickView: (p: Product | null) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const value = useMemo(() => ({ searchOpen, setSearchOpen, quickView, setQuickView, menuOpen, setMenuOpen }), [searchOpen, quickView, menuOpen]);
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};
