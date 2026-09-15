import StarRating from './StarRating';
import { QuoteIcon } from './Icons';
import Reveal from './Reveal';

const TESTIMONIALS = [
  {
    name: 'Amina R.',
    role: 'Verified Customer',
    quote:
      'The craftsmanship is stunning and the packaging felt so luxurious. My necklace has become an everyday staple.',
    rating: 5,
  },
  {
    name: 'Sara K.',
    role: 'Verified Customer',
    quote:
      'I ordered the halo ring for my engagement and it exceeded every expectation. Truly a piece to treasure forever.',
    rating: 5,
  },
  {
    name: 'Hina M.',
    role: 'Verified Customer',
    quote:
      'Elegant Jewellery has become my go-to for gifts. The quality feels premium and the designs are so timeless.',
    rating: 4,
  },
];

const Testimonials = () => (
  <section className="bg-ivory py-20">
    <div className="container-luxe">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="section-kicker">Customer Love</p>
        <h2 className="section-heading mt-3">What Our Customers Say</h2>
      </Reveal>
      <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.1}>
            <div className="card-luxe flex h-full flex-col gap-4 p-8 transition-all duration-500 ease-lux hover:-translate-y-1 hover:shadow-lux">
              <QuoteIcon width={28} height={28} className="text-champagne" />
              <p className="text-sm leading-relaxed text-brown-light">&ldquo;{t.quote}&rdquo;</p>
              <StarRating rating={t.rating} />
              <div>
                <p className="font-display text-base text-brown-dark">{t.name}</p>
                <p className="text-xs text-brown-light">{t.role}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
