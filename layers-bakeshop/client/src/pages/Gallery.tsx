import { motion } from 'framer-motion';
import Reveal from '../components/Reveal';

const images = [
  { src: '/images/products/cake-1.svg', tall: true },
  { src: '/images/products/cupcake-2.svg', tall: false },
  { src: '/images/products/donut-3.svg', tall: false },
  { src: '/images/products/brownie-1.svg', tall: true },
  { src: '/images/products/sundae-2.svg', tall: false },
  { src: '/images/products/cookie-1.svg', tall: false },
  { src: '/images/products/cake-3.svg', tall: false },
  { src: '/images/products/dessert-2.svg', tall: true },
  { src: '/images/products/beverage-1.svg', tall: false },
  { src: '/images/products/cupcake-1.svg', tall: false },
  { src: '/images/products/donut-1.svg', tall: true },
  { src: '/images/products/sundae-3.svg', tall: false },
];

export default function Gallery() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8 md:pt-36">
      <Reveal>
        <p className="layers-eyebrow">Visual Menu</p>
        <h1 className="mt-3 font-display text-4xl text-layers-ink sm:text-5xl">Gallery</h1>
        <p className="mt-3 max-w-lg text-layers-muted">
          A closer look at what leaves our kitchen every day — cakes, cupcakes, brownies and more.
        </p>
      </Reveal>

      <div className="mt-10 columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
        {images.map((img, i) => (
          <motion.div
            key={img.src + i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
            className={`overflow-hidden rounded-2xl break-inside-avoid ${img.tall ? 'aspect-[3/4]' : 'aspect-square'}`}
          >
            <img
              src={img.src}
              alt=""
              loading="lazy"
              className="h-full w-full scale-100 object-cover transition-transform duration-500 hover:scale-110"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
