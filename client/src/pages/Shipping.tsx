import { useEffect } from 'react';
import { TruckIcon } from '../components/Icons';

const Shipping = () => {
  useEffect(() => {
    document.title = 'Shipping Information | Elegant Jewellery';
  }, []);

  return (
    <div className="container-luxe py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-champagne/15 text-champagne-dark">
          <TruckIcon width={24} height={24} />
        </span>
        <p className="section-kicker mt-6">Delivery</p>
        <h1 className="section-heading mt-3">Shipping Information</h1>
      </div>

      <div className="mx-auto mt-12 max-w-2xl space-y-8 text-sm leading-relaxed text-brown-light">
        <div>
          <h2 className="font-display text-xl text-brown-dark">Delivery Times</h2>
          <p className="mt-2">
            Orders are carefully packaged and dispatched within 1-2 business days. Standard delivery across
            Pakistan takes 3-5 business days from dispatch, depending on your location.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-brown-dark">Shipping Fees</h2>
          <p className="mt-2">
            We offer complimentary shipping on all orders over Rs. 15,000. Orders below this amount incur a flat
            shipping fee of Rs. 350, calculated automatically at checkout.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-brown-dark">Order Tracking</h2>
          <p className="mt-2">
            Once your order is placed, you can track its status anytime from your account under{' '}
            <span className="text-brown-dark">My Account &rarr; Order History</span>. Order status updates
            through Pending, Confirmed, Processing, Shipped and Delivered.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-brown-dark">Packaging</h2>
          <p className="mt-2">
            Every piece arrives in signature Elegant Jewellery packaging, ready to gift or treasure - no
            additional wrapping needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
