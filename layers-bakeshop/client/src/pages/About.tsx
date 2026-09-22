import { motion } from 'framer-motion';
import Reveal from '../components/Reveal';
import { Wheat, Heart, Award, Users } from 'lucide-react';

const values = [
  { icon: Wheat, title: 'Quality Ingredients', desc: 'Real butter, Belgian chocolate, and fresh dairy sourced from trusted local suppliers.' },
  { icon: Heart, title: 'Made With Care', desc: 'Every cake is hand-finished by our pastry team — no shortcuts, no mixes.' },
  { icon: Award, title: 'Consistently Excellent', desc: 'The same recipe, the same standard, every single time you order.' },
  { icon: Users, title: 'For Every Celebration', desc: 'From birthdays to weddings, we bake for the moments that matter most.' },
];

export default function About() {
  return (
    <div className="pb-24 pt-32 md:pt-36">
      <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
        <Reveal>
          <p className="layers-eyebrow">Our Story</p>
          <h1 className="mt-3 font-display text-5xl text-layers-ink sm:text-6xl">About Layers</h1>
          <p className="mt-6 text-balance text-lg leading-relaxed text-layers-ink-soft">
            Layers Bakeshop was born from a simple idea — dessert should be an experience, not an afterthought.
            What started as a single cake counter has grown into a full bakeshop, but our promise hasn't changed:
            every layer, baked fresh, finished by hand, and delivered with care.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 max-w-6xl px-5 md:px-8">
        <Reveal>
          <div
            className="aspect-[21/9] w-full rounded-[2rem]"
            style={{ background: 'linear-gradient(120deg, #6e1e2c, #2b1b14 60%, #c9a24b)' }}
          />
        </Reveal>
      </div>

      <div className="mx-auto mt-20 max-w-6xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, i) => (
            <Reveal key={value.title} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                className="h-full rounded-2xl border border-layers-border bg-layers-surface p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-layers-accent-soft text-layers-primary">
                  <value.icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 font-medium text-layers-ink">{value.title}</h3>
                <p className="mt-1.5 text-sm text-layers-muted">{value.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-24 max-w-4xl px-5 md:px-8">
        <Reveal>
          <div className="rounded-3xl bg-layers-surface-alt p-10 text-center sm:p-14">
            <h2 className="font-display text-3xl text-layers-ink">Fresh Baking, Every Single Day</h2>
            <p className="mx-auto mt-4 max-w-xl text-layers-ink-soft">
              Nothing leaves our kitchen a day old. Our bakers start before sunrise so every cake, cupcake and
              cookie reaches you at its absolute best.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
