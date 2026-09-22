import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import HeroCanvas from './HeroCanvas';
import ScrollIndicator from './ScrollIndicator';
import MagneticButton from './MagneticButton';

export default function Hero() {
  const prefersReduced = useReducedMotion();
  const navigate = useNavigate();

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-layers-ink">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, rgba(140,51,65,0.55), transparent 55%), radial-gradient(circle at 80% 80%, rgba(201,162,75,0.25), transparent 50%), #2b1b14',
        }}
        aria-hidden="true"
      />
      {!prefersReduced && (
        <div className="grain-overlay absolute inset-0" aria-hidden="true" />
      )}

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-5 pt-28 pb-16 md:px-8 lg:grid-cols-2 lg:pt-20">
        <motion.div initial="hidden" animate="visible" variants={container}>
          <motion.p variants={item} className="layers-eyebrow !text-layers-accent">
            Premium Pakistani Dessert House
          </motion.p>
          <motion.h1
            variants={item}
            className="mt-4 font-display text-6xl leading-[0.95] text-white sm:text-7xl lg:text-8xl"
          >
            LAYERS
          </motion.h1>
          <motion.p variants={item} className="mt-6 max-w-lg text-balance font-display text-2xl italic text-white/85 sm:text-3xl">
            Layers of Joy in Every Bite.
          </motion.p>
          <motion.p variants={item} className="mt-4 max-w-md text-white/60">
            Hand-finished cakes, cupcakes and desserts, baked fresh daily with premium ingredients and delivered
            across the city.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap gap-4">
            <MagneticButton
              type="button"
              onClick={() => navigate('/menu')}
              data-cursor-hover
              className="rounded-full bg-layers-accent px-8 py-3.5 text-sm font-semibold tracking-wide text-layers-ink transition-colors hover:bg-white"
            >
              Explore Menu
            </MagneticButton>
            <MagneticButton
              type="button"
              onClick={() => navigate('/menu?order=1')}
              data-cursor-hover
              className="rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Order Now
            </MagneticButton>
          </motion.div>

          <motion.div variants={item} className="mt-14 flex gap-10">
            {[
              { value: '50K+', label: 'Desserts Delivered' },
              { value: '4.9', label: 'Average Rating' },
              { value: '12+', label: 'City Branches' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl text-white">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-white/50">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[420px] sm:h-[520px] lg:h-[620px]"
        >
          <HeroCanvas />
        </motion.div>
      </div>

      <ScrollIndicator />
    </section>
  );
}
