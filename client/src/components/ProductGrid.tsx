import type { Product } from '../types';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';
import { SparkleIcon } from './Icons';

interface Props {
  products: Product[];
  loading?: boolean;
  onQuickView?: (product: Product) => void;
}

const SkeletonCard = () => (
  <div className="flex flex-col overflow-hidden rounded-2xl border border-brown-dark/5 bg-white/60">
    <div className="skeleton aspect-square" />
    <div className="space-y-3 p-4">
      <div className="skeleton h-3 w-1/3 rounded" />
      <div className="skeleton h-4 w-2/3 rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
    </div>
  </div>
);

const ProductGrid = ({ products, loading, onQuickView }: Props) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        message="Try adjusting your filters or search terms to find what you're looking for."
        icon={<SparkleIcon width={32} height={32} />}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <div key={product._id} className="animate-fadeInUp">
          <ProductCard product={product} onQuickView={onQuickView} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
