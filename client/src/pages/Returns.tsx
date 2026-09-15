import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldIcon } from '../components/Icons';

const Returns = () => {
  useEffect(() => {
    document.title = 'Returns & Exchanges | Elegant Jewellery';
  }, []);

  return (
    <div className="container-luxe py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-champagne/15 text-champagne-dark">
          <ShieldIcon width={24} height={24} />
        </span>
        <p className="section-kicker mt-6">Our Promise</p>
        <h1 className="section-heading mt-3">Returns &amp; Exchanges</h1>
      </div>

      <div className="mx-auto mt-12 max-w-2xl space-y-8 text-sm leading-relaxed text-brown-light">
        <div>
          <h2 className="font-display text-xl text-brown-dark">7-Day Return Window</h2>
          <p className="mt-2">
            We want you to love every piece you order. Unworn items in their original packaging can be returned
            or exchanged within 7 days of delivery.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-brown-dark">How to Start a Return</h2>
          <p className="mt-2">
            Reach out through our{' '}
            <Link to="/contact" className="text-champagne-dark hover:underline">
              Contact page
            </Link>{' '}
            with your order ID and reason for return. Our team will guide you through the next steps within 24
            hours.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-brown-dark">Non-Returnable Items</h2>
          <p className="mt-2">
            For hygiene reasons, earrings that have been worn cannot be returned unless faulty. Customised or
            engraved pieces are final sale.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-brown-dark">Refunds</h2>
          <p className="mt-2">
            Once your return is received and inspected, refunds are processed within 5-7 business days to your
            original payment method, or as store credit if preferred.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Returns;
