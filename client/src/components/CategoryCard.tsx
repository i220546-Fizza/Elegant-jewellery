import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useTilt from '../hooks/useTilt';

interface Props {
  name: string;
  category: string;
  image: string;
}

const CategoryCard = ({ name, category, image }: Props) => {
  const tilt = useTilt({ max: 9, scale: 1.03 });

  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={{
        rotateX: tilt.style.rotateX,
        rotateY: tilt.style.rotateY,
        scale: tilt.style.scale,
        transformPerspective: tilt.style.transformPerspective,
      }}
      className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-brown-dark/5 shadow-card transition-shadow duration-500 ease-lux hover:shadow-lux"
    >
      <Link to={`/shop?category=${category}`} className="absolute inset-0 flex flex-col justify-end">
        <img
          src={image}
          alt={`${name} collection`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-lux group-hover:scale-[1.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/65 via-brown-dark/10 to-transparent transition-opacity duration-500 group-hover:from-brown-dark/75" />
        <div className="pointer-events-none absolute inset-0 border-2 border-transparent transition-colors duration-500 group-hover:border-gold-light/70" />

        <div className="relative z-10 p-6">
          <span className="mb-2 block h-px w-8 bg-gold-light/80 transition-all duration-500 group-hover:w-14" />
          <h3 className="font-display text-2xl text-ivory transition-transform duration-500 ease-lux group-hover:-translate-y-1 group-hover:scale-105 origin-left">
            {name}
          </h3>
          <span className="mt-1 inline-block text-xs uppercase tracking-widest text-ivory/80 transition-transform duration-300 group-hover:translate-x-1">
            Shop Now &rarr;
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
