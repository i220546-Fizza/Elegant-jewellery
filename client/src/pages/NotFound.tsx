import { Link } from 'react-router-dom';
import { useTitle } from '../lib/useTitle';

const NotFound = () => {
  useTitle('Page not found');
  return (
    <section className="container-lux flex min-h-[80vh] flex-col items-center justify-center pt-24 text-center">
      <p className="font-serif text-[9rem] font-light leading-none text-taupe sm:text-[14rem]">404</p>
      <h1 className="mt-4 font-serif text-4xl">This page has evaporated.</h1>
      <p className="mt-4 text-sm text-stone">Like the finest top notes, it is no longer here.</p>
      <div className="mt-10 flex gap-4">
        <Link to="/" className="btn-dark">
          Return home
        </Link>
        <Link to="/fragrances" className="btn-outline">
          Explore fragrances
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
