import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Reveal from './Reveal';
import { CheckIcon } from './Icons';

const POINTS = ['Handcrafted quality', 'Timeless, wearable design', 'Ethically sourced materials', 'Made for every special occasion'];

const BrandStory = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [-40, 40]);

  return (
    <section ref={sectionRef} className="overflow-hidden py-16 sm:py-24">
      <div className="container-luxe grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <Reveal className="relative">
          <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-radial-glow" />
          <motion.img
            style={{ y: imageY }}
            src="/images/about-hero.svg"
            alt="Elegant Jewellery craftsmanship"
            className="relative w-full rounded-3xl shadow-lux"
          />
        </Reveal>

        <Reveal delay={0.15}>
          <p className="section-kicker">Our Philosophy</p>
          <h2 className="section-heading mt-3">Crafted for Moments That Matter</h2>
          <p className="mt-6 leading-relaxed text-brown-light">
            Every piece begins with intention - a quiet moment, a milestone, a version of yourself worth
            celebrating. We pair meticulous craftsmanship with premium materials to create jewellery that
            carries meaning far beyond its shine, designed to move through your life with quiet confidence.
          </p>
          <ul className="mt-6 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm text-brown-dark">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-champagne/15 text-champagne-dark">
                  <CheckIcon width={13} height={13} />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <Link to="/about" className="btn-primary mt-8 inline-flex">
            Our Story
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default BrandStory;
