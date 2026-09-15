import { Link } from 'react-router-dom';
import type { Product } from '../types';
import Reveal from './Reveal';
import { formatCurrency } from '../utils/format';

interface Props {
  product: Product | null;
}

const InteractiveShowcase = ({ product }: Props) => {
  if (!product) return null;

  return (
    <section className="relative overflow-hidden bg-brown-dark py-20 text-ivory sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-light/10 blur-3xl" />

      <div className="container-luxe relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <Reveal className="order-2 lg:order-1">
          <p className="section-kicker text-champagne">In the Spotlight</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">{product.name}</h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/70">{product.description}</p>
          <p className="mt-4 font-display text-2xl text-gold-light">{formatCurrency(product.price)}</p>
          <Link to={`/product/${product.slug}`} className="btn-gold mt-8 inline-flex">
            Discover the Collection
          </Link>
        </Reveal>

        <Reveal delay={0.15} className="order-1 lg:order-2">
          <div className="perspective-container relative mx-auto aspect-square w-full max-w-sm">
            {/* glass display case */}
            <div className="glass absolute inset-6 rounded-[2rem] border-gold-light/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" />
            <div className="absolute inset-x-16 bottom-10 h-8 rounded-full bg-gold-light/20 blur-2xl" />

            {/* slow-rotating gold accent ring */}
            <div className="absolute inset-10 animate-[spin_18s_linear_infinite] rounded-full border border-dashed border-gold-light/30" />

            <img
              src={product.images[0]}
              alt={product.name}
              className="absolute inset-0 m-auto h-[70%] w-[70%] animate-float rounded-2xl object-cover shadow-glow"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default InteractiveShowcase;
