import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

const tiles = [
  '/images/products/cake-1.svg',
  '/images/products/donut-2.svg',
  '/images/products/cupcake-3.svg',
  '/images/products/sundae-1.svg',
  '/images/products/brownie-2.svg',
  '/images/products/cookie-3.svg',
];

export default function GalleryTeaser() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="layers-eyebrow">From the Bakeshop</p>
          <h2 className="mt-3 font-display text-4xl text-layers-ink sm:text-5xl">Gallery</h2>
        </div>
        <Link to="/gallery" data-cursor-hover className="group flex items-center gap-1.5 text-sm font-semibold text-layers-primary">
          View Full Gallery
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
        {tiles.map((src, i) => (
          <motion.div
            key={src}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className={`overflow-hidden rounded-2xl ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="h-full w-full scale-105 object-cover transition-transform duration-700 hover:scale-100"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
