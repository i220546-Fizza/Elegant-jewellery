import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Product } from '../types';
import { fetchProducts } from '../services/productService';
import { getErrorMessage } from '../services/api';
import ProductGrid from '../components/ProductGrid';
import CategoryCard from '../components/CategoryCard';
import Hero from '../components/Hero';
import FeaturedCollection from '../components/FeaturedCollection';
import BrandStory from '../components/BrandStory';
import InteractiveShowcase from '../components/InteractiveShowcase';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import InstagramSection from '../components/InstagramSection';
import QuickViewModal from '../components/QuickViewModal';
import Reveal from '../components/Reveal';
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

  const showcaseProduct = bestsellers[0] || featured[0] || null;

  return (
    <div>
      <Hero />

      <section className="py-16 sm:py-20">
        <div className="container-luxe">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="section-kicker">Shop by Category</p>
            <h2 className="section-heading mt-3">Curated Collections</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.category} delay={i * 0.08}>
                <CategoryCard {...c} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FeaturedCollection products={featured} />

      <BrandStory />

      <section className="py-16 sm:py-20">
        <div className="container-luxe">
          <Reveal className="flex items-end justify-between">
            <div>
              <p className="section-kicker">Just In</p>
              <h2 className="section-heading mt-3">New Arrivals</h2>
            </div>
            <Link to="/shop?sort=newest" className="hidden items-center gap-1 text-xs uppercase tracking-widest text-champagne-dark hover:underline sm:flex">
              View All <ChevronRightIcon width={14} height={14} />
            </Link>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <ProductGrid products={newArrivals} loading={loading} onQuickView={setQuickViewProduct} />
          </Reveal>
        </div>
      </section>

      <InteractiveShowcase product={showcaseProduct} />

      <WhyChooseUs />

      <section className="bg-cream py-16 sm:py-20">
        <div className="container-luxe">
          <Reveal className="flex items-end justify-between">
            <div>
              <p className="section-kicker">Customer Favourites</p>
              <h2 className="section-heading mt-3">Our Best Sellers</h2>
            </div>
            <Link to="/shop?bestseller=true" className="hidden items-center gap-1 text-xs uppercase tracking-widest text-champagne-dark hover:underline sm:flex">
              View All <ChevronRightIcon width={14} height={14} />
            </Link>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <ProductGrid products={bestsellers} loading={loading} onQuickView={setQuickViewProduct} />
          </Reveal>
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
