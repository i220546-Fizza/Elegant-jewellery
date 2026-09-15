import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  top: 8 + ((i * 37) % 85),
  left: 4 + ((i * 53) % 92),
  size: 3 + (i % 3) * 2,
  delay: (i % 5) * 0.8,
  duration: 5 + (i % 4) * 2,
}));

const Hero = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const springX = useSpring(mvX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mvY, { stiffness: 60, damping: 20 });

  const tiltX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const tiltY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  const ringX = useTransform(springX, [-0.5, 0.5], [-18, 18]);
  const ringY = useTransform(springY, [-0.5, 0.5], [-14, 14]);
  const necklaceX = useTransform(springX, [-0.5, 0.5], [12, -12]);
  const necklaceY = useTransform(springY, [-0.5, 0.5], [10, -10]);
  const earringX = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const earringY = useTransform(springY, [-0.5, 0.5], [8, -8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !stageRef.current) return;
    const bounds = stageRef.current.getBoundingClientRect();
    mvX.set((e.clientX - bounds.left) / bounds.width - 0.5);
    mvY.set((e.clientY - bounds.top) / bounds.height - 0.5);
  };

  const handleMouseLeave = () => {
    mvX.set(0);
    mvY.set(0);
  };

  return (
    <section className="relative overflow-hidden bg-ivory">
      {/* ambient background glow */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-radial-glow opacity-70" />
      <div className="pointer-events-none absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-radial-glow opacity-60" />

      {/* floating gold particles */}
      {!prefersReducedMotion &&
        PARTICLES.map((p) => (
          <span
            key={p.id}
            className="pointer-events-none absolute rounded-full bg-gold-light/70 shadow-[0_0_8px_2px_rgba(201,168,106,0.5)] animate-drift"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}

      <div className="container-luxe grid grid-cols-1 items-center gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
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
            <Link to="/shop" className="btn-gold">
              Explore Collection
            </Link>
            <a href="#featured-collection" className="btn-secondary">
              Shop Now
            </a>
          </div>
        </motion.div>

        {/* 3D showroom stage */}
        <motion.div
          ref={stageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="perspective-container relative mx-auto aspect-square w-full max-w-lg"
        >
          <motion.div
            style={{ rotateX: prefersReducedMotion ? 0 : tiltX, rotateY: prefersReducedMotion ? 0 : tiltY }}
            className="preserve-3d relative h-full w-full"
          >
            {/* showroom pedestal glow */}
            <div className="absolute inset-x-10 bottom-6 h-10 rounded-full bg-champagne-dark/25 blur-2xl" />

            {/* main hero piece */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/images/hero-banner.svg"
                alt="Elegant Jewellery showcase"
                className="w-[85%] rounded-[2rem] shadow-lux animate-float"
              />
            </div>

            {/* floating satellite pieces for depth/parallax - hidden below sm to keep the mobile hero uncluttered */}
            <motion.div
              style={{ x: ringX, y: ringY }}
              className="absolute -left-4 top-6 hidden h-28 w-28 rounded-2xl bg-white/70 p-2 shadow-glow backdrop-blur animate-floatSlow sm:block"
            >
              <img src="/uploads/products/i2.svg" alt="Halo ring" className="h-full w-full rounded-xl object-cover" />
            </motion.div>

            <motion.div
              style={{ x: necklaceX, y: necklaceY }}
              className="absolute -right-6 bottom-10 hidden h-32 w-32 rounded-2xl bg-white/70 p-2 shadow-glow backdrop-blur animate-float sm:block"
            >
              <img src="/uploads/products/i8.svg" alt="Layered necklace" className="h-full w-full rounded-xl object-cover" />
            </motion.div>

            <motion.div
              style={{ x: earringX, y: earringY }}
              className="absolute bottom-0 left-4 hidden h-24 w-24 rounded-2xl bg-white/70 p-2 shadow-glow backdrop-blur animate-floatSlow sm:block"
            >
              <img src="/uploads/products/i15.svg" alt="Chandelier earrings" className="h-full w-full rounded-xl object-cover" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
