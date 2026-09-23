import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderApi } from '../services';
import type { Order } from '../types';
import OrderView, { StatusBadge } from '../components/account/OrderView';
import { EmptyState, Spinner } from '../components/ui/Feedback';
import { formatDate } from '../lib/format';
import { useTitle } from '../lib/useTitle';

/** Order confirmation (right after checkout) and guest order lookup. */
const OrderPage = () => {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const placed = params.get('placed') === '1';
  const email = params.get('email') || '';
  const [order, setOrder] = useState<Order | null>(null);
  const [failed, setFailed] = useState(false);
  useTitle(placed ? 'Thank you' : 'Your order');

  useEffect(() => {
    orderApi
      .get(id, email || undefined)
      .then(setOrder)
      .catch(() => setFailed(true));
  }, [id, email]);

  if (failed) return <div className="pt-32"><EmptyState title="We could not find that order" text="Please check the link or look it up with your order email." action={{ label: 'Track an order', to: '/track-order' }} /></div>;
  if (!order) return <div className="pt-32"><Spinner label="Retrieving your order" /></div>;

  return (
    <div className="pb-24 pt-32 lg:pt-44">
      <div className="container-lux max-w-5xl">
        {placed ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} className="text-center">
            <span className="mx-auto block h-16 w-px bg-gold" />
            <p className="eyebrow mt-8">Order {order.orderNumber}</p>
            <h1 className="heading-xl mt-5">Thank you, {order.customerInfo.name.split(' ')[0]}.</h1>
            <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-stone">
              Your order has been received and is being prepared with care. A confirmation has been sent to {order.customerInfo.email}.
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Placed {formatDate(order.createdAt)}</p>
              <h1 className="mt-3 font-serif text-5xl">Order {order.orderNumber}</h1>
            </div>
            <StatusBadge status={order.status} />
          </div>
        )}
        <div className="mt-16 border-t border-taupe pt-12">
          <OrderView order={order} />
        </div>
        <div className="mt-16 flex flex-wrap justify-center gap-4">
          <Link to="/fragrances" className="btn-dark">
            Continue shopping
          </Link>
          {order.user && (
            <Link to="/account/orders" className="btn-outline">
              View my orders
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
