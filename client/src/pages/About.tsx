import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GiftIcon, ShieldIcon, SparkleIcon } from '../components/Icons';

const VALUES = [
  {
    icon: SparkleIcon,
    title: 'Timeless Design',
    text: 'Every collection is designed to transcend trends - pieces you will reach for today, and for decades to come.',
  },
  {
    icon: ShieldIcon,
    title: 'Uncompromising Quality',
    text: 'From 18k gold vermeil to ethically sourced stones, we hold every material and every hand to the highest standard.',
  },
  {
    icon: GiftIcon,
    title: 'Crafted for Moments',
    text: 'Engagements, milestones, everyday confidence - our jewellery is made to be part of your story.',
  },
];

const About = () => {
  useEffect(() => {
    document.title = 'About Us | Elegant Jewellery';
  }, []);

  return (
    <div>
      <section className="bg-cream py-16 sm:py-24">
        <div className="container-luxe grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="section-kicker">Our Story</p>
            <h1 className="section-heading mt-3">Elegance, Crafted for the Modern Woman</h1>
            <p className="mt-6 leading-relaxed text-brown-light">
              Elegant Jewellery was born from a simple belief: that fine jewellery should feel personal, not
              precious in the untouchable sense. We design each piece to be worn daily, layered freely, and passed
              down with meaning - blending timeless craftsmanship with a modern, minimal sensibility.
            </p>
            <p className="mt-4 leading-relaxed text-brown-light">
              From our first sketch to the final polish, every ring, necklace, earring and bracelet is created with
              intention - using premium materials, ethical sourcing and an obsessive eye for detail. We believe
              elegance isn't about excess; it's about confidence, quality and the quiet luxury of knowing you chose
              well.
            </p>
            <Link to="/shop" className="btn-primary mt-8 inline-flex">
              Explore Our Collections
            </Link>
          </div>
          <img src="/images/about-hero.svg" alt="Elegant Jewellery craftsmanship" className="w-full rounded-3xl shadow-soft" />
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-luxe">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-kicker">What We Stand For</p>
            <h2 className="section-heading mt-3">Our Values</h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card-luxe flex flex-col items-center gap-4 p-8 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-champagne/15 text-champagne-dark">
                  <Icon width={24} height={24} />
                </span>
                <h3 className="font-display text-lg text-brown-dark">{title}</h3>
                <p className="text-sm text-brown-light">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brown-dark py-16 text-center text-ivory sm:py-20">
        <div className="container-luxe">
          <p className="section-kicker text-champagne">Made For You</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">
            Jewellery That Celebrates Every Version of You
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-ivory/70">
            Whether it's a quiet Tuesday or a milestone worth remembering, our pieces are designed to move with
            you - effortless, elegant, unmistakably yours.
          </p>
          <Link to="/shop" className="btn-gold mt-8 inline-flex">
            Shop the Collection
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
