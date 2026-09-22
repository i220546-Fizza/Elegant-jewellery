import { motion } from 'framer-motion';
import type { ProductCategory } from '../types';

const categories: (ProductCategory | 'All')[] = [
  'All',
  'Cakes',
  'Cupcakes',
  'Brownies',
  'Cookies',
  'Donuts',
  'Desserts',
  'Sundaes',
  'Beverages',
];

interface CategoryTabsProps {
  active: ProductCategory | 'All';
  onChange: (category: ProductCategory | 'All') => void;
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div role="tablist" aria-label="Product categories" className="scrollbar-none flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => {
        const isActive = active === category;
        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(category)}
            data-cursor-hover
            className={`relative shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'text-white' : 'text-layers-ink-soft hover:text-layers-ink'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="category-pill"
                className="absolute inset-0 rounded-full bg-layers-primary"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative">{category}</span>
          </button>
        );
      })}
    </div>
  );
}
