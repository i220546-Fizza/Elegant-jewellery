import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container-luxe flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p className="font-display text-6xl text-champagne-dark">404</p>
    <h1 className="mt-4 font-display text-2xl text-brown-dark">Page Not Found</h1>
    <p className="mt-2 max-w-sm text-sm text-brown-light">
      The page you're looking for doesn't exist or may have been moved.
    </p>
    <Link to="/" className="btn-primary mt-8">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
