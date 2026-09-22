import Reveal from '../components/Reveal';
import FeaturedProducts from '../components/FeaturedProducts';
import SpecialOffers from '../components/SpecialOffers';

export default function Offers() {
  return (
    <div className="pb-8 pt-32 md:pt-36">
      <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
        <Reveal>
          <p className="layers-eyebrow">Limited Time</p>
          <h1 className="mt-3 font-display text-4xl text-layers-ink sm:text-5xl">Special Offers</h1>
          <p className="mt-4 text-layers-muted">
            New arrivals, bestsellers and limited-edition flavours — updated regularly.
          </p>
        </Reveal>
      </div>
      <SpecialOffers />
      <FeaturedProducts />
    </div>
  );
}
