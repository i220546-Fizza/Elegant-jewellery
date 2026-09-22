import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import ProductGrid from './ProductGrid';
import { getProducts } from '../services/productService';
import type { Product } from '../types';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    getProducts({ featured: true })
      .then((data) => setProducts(data.slice(0, 8)))
      .catch(() => setError('We had trouble reaching our kitchen. Please try again.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="layers-eyebrow">Signature Selection</p>
          <h2 className="mt-3 font-display text-4xl text-layers-ink sm:text-5xl">Fan Favourites</h2>
        </div>
        <Link
          to="/menu"
          data-cursor-hover
          className="group flex items-center gap-1.5 text-sm font-semibold text-layers-primary"
        >
          View Full Menu
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>

      <div className="mt-10">
        <ProductGrid products={products} loading={loading} error={error} onRetry={load} />
      </div>
    </section>
  );
}
