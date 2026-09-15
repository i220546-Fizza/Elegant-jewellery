import { GiftIcon, ShieldIcon, SparkleIcon, TruckIcon } from './Icons';
import Reveal from './Reveal';

const FEATURES = [
  {
    icon: SparkleIcon,
    title: 'Handcrafted Quality',
    text: 'Every piece is carefully crafted with premium materials and meticulous attention to detail.',
  },
  {
    icon: ShieldIcon,
    title: 'Lifetime Assurance',
    text: 'We stand behind our craftsmanship with dedicated after-care and quality guarantees.',
  },
  {
    icon: TruckIcon,
    title: 'Nationwide Delivery',
    text: 'Complimentary shipping on orders over Rs. 15,000, delivered securely to your doorstep.',
  },
  {
    icon: GiftIcon,
    title: 'Gift-Ready Packaging',
    text: 'Every order arrives beautifully boxed and ready to gift or treasure for yourself.',
  },
];

const WhyChooseUs = () => (
  <section className="bg-cream py-20">
    <div className="container-luxe">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="section-kicker">Why Elegant Jewellery</p>
        <h2 className="section-heading mt-3">Crafted With Care, Worn With Confidence</h2>
      </Reveal>
      <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 0.08} className="flex flex-col items-center gap-4 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-champagne-dark shadow-card transition-transform duration-500 hover:-translate-y-1 hover:shadow-glow">
              <Icon width={26} height={26} />
            </span>
            <h3 className="font-display text-lg text-brown-dark">{title}</h3>
            <p className="text-sm text-brown-light">{text}</p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
