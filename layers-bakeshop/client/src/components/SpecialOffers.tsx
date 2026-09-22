import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Reveal from './Reveal';

const offers = [
  {
    label: 'New Arrivals',
    title: 'Autumn Spice Collection',
    desc: 'Cinnamon, caramel and roasted pecan flavours, here for a limited season.',
    to: '/menu?tag=new',
    bg: 'linear-gradient(135deg, #6e1e2c, #8c3341)',
  },
  {
    label: 'Best Sellers',
    title: 'The Velvet Signature',
    desc: 'Our most-loved red velvet, now available in cake, cupcake and sundae form.',
    to: '/menu?tag=bestseller',
    bg: 'linear-gradient(135deg, #2b1b14, #5a4a3f)',
  },
  {
    label: 'Limited Edition',
    title: "Baker's Table",
    desc: 'Small-batch flavours crafted with our pastry chef — while stocks last.',
    to: '/menu?tag=limited',
    bg: 'linear-gradient(135deg, #b38a36, #c9a24b)',
  },
];

export default function SpecialOffers() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <p className="layers-eyebrow">Right Now</p>
        <h2 className="mt-3 font-display text-4xl text-layers-ink sm:text-5xl">Special Offers</h2>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {offers.map((offer, i) => (
          <Reveal key={offer.title} delay={i * 0.1}>
            <Link to={offer.to} data-cursor-hover className="group block">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="relative flex h-80 flex-col justify-end overflow-hidden rounded-3xl p-7 text-white shadow-lg"
                style={{ background: offer.bg }}
              >
                <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative w-fit rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest backdrop-blur">
                  {offer.label}
                </span>
                <h3 className="relative mt-4 font-display text-2xl">{offer.title}</h3>
                <p className="relative mt-2 text-sm text-white/75">{offer.desc}</p>
              </motion.div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
