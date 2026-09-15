import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Product } from '../types';
import { fetchProducts } from '../services/productService';
import { getErrorMessage } from '../services/api';
import ProductGrid from '../components/ProductGrid';
import CategoryCard from '../components/CategoryCard';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import InstagramSection from '../components/InstagramSection';
import QuickViewModal from '../components/QuickViewModal';
import { ChevronRightIcon } from '../components/Icons';

const CATEGORIES = [
  { name: 'Rings', category: 'rings', image: '/uploads/products/i2.svg' },
  { name: 'Necklaces', category: 'necklaces', image: '/uploads/products/i8.svg' },
  { name: 'Earrings', category: 'earrings', image: '/uploads/products/i15.svg' },
  { name: 'Bracelets', category: 'bracelets', image: '/uploads/products/i16.svg' },
];

const Home = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    document.title = 'Elegant Jewellery | Timeless Elegance, Made to Shine';

    const load = async () => {
      try {
        const [featuredRes, newRes, bestRes] = await Promise.all([
          fetchProducts({ featured: true, limit: 8 }),
          fetchProducts({ sort: 'newest', limit: 4 }),
          fetchProducts({ bestseller: true, limit: 8 }),
        ]);
        setFeatured(featuredRes.products);
        setNewArrivals(newRes.products);
        setBestsellers(bestRes.products);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-ivory">
        <div className="container-luxe grid grid-cols-1 items-center gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:py-32">
          <div className="animate-fadeInUp">
            <p className="section-kicker">Elegant Jewellery</p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-brown-dark sm:text-5xl lg:text-6xl">
              Timeless Elegance,
              <br /> Made to Shine.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-brown-light">
              Discover handcrafted jewellery designed for life's most cherished moments &mdash; refined, feminine
              and made to be treasured.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary">
                Shop Collection
              </Link>
              <Link to="/about" className="btn-secondary">
                Our Story
              </Link>
            </div>
          </div>
          <div className="relative animate-fadeIn">
            <img
              src="/images/hero-banner.svg"
              alt="Elegant Jewellery hero showcase"
              className="w-full rounded-3xl shadow-soft"
            />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-luxe">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-kicker">Shop by Category</p>
            <h2 className="section-heading mt-3">Curated Collections</h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <CategoryCard key={c.category} {...c} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <div className="container-luxe">
          <div className="flex items-end justify-between">
            <div>
              <p className="section-kicker">Handpicked</p>
              <h2 className="section-heading mt-3">Featured Pieces</h2>
            </div>
            <Link to="/shop?featured=true" className="hidden items-center gap-1 text-xs uppercase tracking-widest text-champagne-dark hover:underline sm:flex">
              View All <ChevronRightIcon width={14} height={14} />
            </Link>
          </div>
          <div className="mt-10">
            <ProductGrid products={featured} loading={loading} onQuickView={setQuickViewProduct} />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-luxe">
          <div className="flex items-end justify-between">
            <div>
              <p className="section-kicker">Just In</p>
              <h2 className="section-heading mt-3">New Arrivals</h2>
            </div>
            <Link to="/shop?sort=newest" className="hidden items-center gap-1 text-xs uppercase tracking-widest text-champagne-dark hover:underline sm:flex">
              View All <ChevronRightIcon width={14} height={14} />
            </Link>
          </div>
          <div className="mt-10">
            <ProductGrid products={newArrivals} loading={loading} onQuickView={setQuickViewProduct} />
          </div>
        </div>
      </section>

      <WhyChooseUs />

      <section className="bg-cream py-16 sm:py-20">
        <div className="container-luxe">
          <div className="flex items-end justify-between">
            <div>
              <p className="section-kicker">Customer Favourites</p>
              <h2 className="section-heading mt-3">Best Sellers</h2>
            </div>
            <Link to="/shop?bestseller=true" className="hidden items-center gap-1 text-xs uppercase tracking-widest text-champagne-dark hover:underline sm:flex">
              View All <ChevronRightIcon width={14} height={14} />
            </Link>
          </div>
          <div className="mt-10">
            <ProductGrid products={bestsellers} loading={loading} onQuickView={setQuickViewProduct} />
          </div>
        </div>
      </section>

      <Testimonials />
      <InstagramSection />
      <Newsletter />

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
};

export default Home;
