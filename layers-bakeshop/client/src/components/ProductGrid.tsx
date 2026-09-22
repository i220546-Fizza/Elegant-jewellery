import { Cookie, WifiOff } from 'lucide-react';
import ProductCard from './ProductCard';
import StateMessage from './StateMessage';
import type { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-layers-border bg-layers-surface">
      <div className="aspect-square animate-pulse bg-layers-surface-alt" />
      <div className="space-y-2 p-4">
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-layers-surface-alt" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-layers-surface-alt" />
        <div className="h-3 w-full animate-pulse rounded bg-layers-surface-alt" />
      </div>
    </div>
  );
}

export default function ProductGrid({ products, loading, error, onRetry }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <StateMessage
        icon={WifiOff}
        title="Couldn't load the menu"
        description={error}
        action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
      />
    );
  }

  if (products.length === 0) {
    return (
      <StateMessage
        icon={Cookie}
        title="No products found"
        description="Try a different category or check back soon — we're always baking something new."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product._id} product={product} index={i} />
      ))}
    </div>
  );
}
