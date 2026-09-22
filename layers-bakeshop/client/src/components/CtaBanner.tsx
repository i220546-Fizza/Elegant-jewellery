import { useNavigate } from 'react-router-dom';
import Reveal from './Reveal';
import MagneticButton from './MagneticButton';

export default function CtaBanner() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-layers-primary py-20 text-center text-white md:py-28">
      <div
        className="absolute inset-0 opacity-40"
        style={{ background: 'radial-gradient(circle at 20% 30%, rgba(201,162,75,0.4), transparent 55%)' }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-2xl px-5">
        <Reveal>
          <p className="layers-eyebrow !text-white/70">Craving Something Sweet?</p>
          <h2 className="mt-3 text-balance font-display text-4xl sm:text-5xl">
            Your Next Favourite Dessert Is One Click Away
          </h2>
          <p className="mt-4 text-white/75">
            Order online for delivery or pickup — freshly baked, beautifully packaged, always on time.
          </p>
          <MagneticButton
            type="button"
            onClick={() => navigate('/menu')}
            data-cursor-hover
            className="mt-8 rounded-full bg-white px-9 py-3.5 text-sm font-semibold text-layers-primary transition-colors hover:bg-layers-accent"
          >
            Order Now
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}
