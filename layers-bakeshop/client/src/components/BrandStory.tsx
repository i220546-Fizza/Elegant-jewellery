import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wheat, Sparkles, Truck } from 'lucide-react';
import Reveal from './Reveal';

const pillars = [
  { icon: Wheat, title: 'Premium Ingredients', desc: 'Real butter, Belgian chocolate and farm-fresh dairy, sourced with care.' },
  { icon: Sparkles, title: 'Baked Fresh Daily', desc: 'Every layer, torted and finished by hand each morning — nothing sits.' },
  { icon: Truck, title: 'Delivered With Love', desc: 'Temperature-controlled delivery so every bite arrives as intended.' },
];

export default function BrandStory() {
  return (
    <section className="bg-layers-surface-alt py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 md:px-8 lg:grid-cols-2">
        <Reveal direction="left" className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <motion.div
              initial={{ scale: 1.15 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full"
              style={{
                background:
                  'linear-gradient(160deg, #8c3341 0%, #6e1e2c 45%, #2b1b14 100%)',
              }}
            />
          </div>
          <div className="absolute -bottom-6 -right-6 hidden rounded-2xl border border-layers-border bg-layers-surface p-5 shadow-xl sm:block">
            <p className="font-display text-3xl text-layers-primary">10+ Years</p>
            <p className="text-xs uppercase tracking-widest text-layers-muted">Of Layered Craft</p>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="layers-eyebrow">Our Story</p>
            <h2 className="mt-3 text-balance font-display text-4xl text-layers-ink sm:text-5xl">
              Every Layer Tells a Story of Craft
            </h2>
            <p className="mt-5 max-w-lg text-layers-ink-soft">
              Layers Bakeshop began with a simple belief: dessert should feel like a celebration. From our first
              velvet cake to today's full menu of cupcakes, brownies and sundaes, we still bake in small batches,
              layer by layer, the same way we did on day one.
            </p>
          </Reveal>

          <div className="mt-9 space-y-6">
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 0.1} direction="none">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-layers-accent-soft text-layers-primary">
                    <pillar.icon size={20} strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-medium text-layers-ink">{pillar.title}</h3>
                    <p className="text-sm text-layers-muted">{pillar.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <Link
              to="/about"
              data-cursor-hover
              className="mt-9 inline-block rounded-full border border-layers-ink px-7 py-3 text-sm font-semibold text-layers-ink transition-colors hover:bg-layers-ink hover:text-white"
            >
              Read Our Full Story
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
