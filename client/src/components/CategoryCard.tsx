import { Link } from 'react-router-dom';

interface Props {
  name: string;
  category: string;
  image: string;
}

const CategoryCard = ({ name, category, image }: Props) => (
  <Link
    to={`/shop?category=${category}`}
    className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-brown-dark/5 shadow-card transition-all duration-300 hover:shadow-soft"
  >
    <img
      src={image}
      alt={`${name} collection`}
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/60 via-brown-dark/10 to-transparent" />
    <div className="relative z-10 p-6">
      <h3 className="font-display text-2xl text-ivory">{name}</h3>
      <span className="mt-1 inline-block text-xs uppercase tracking-widest text-ivory/80 transition-transform duration-300 group-hover:translate-x-1">
        Shop Now &rarr;
      </span>
    </div>
  </Link>
);

export default CategoryCard;
