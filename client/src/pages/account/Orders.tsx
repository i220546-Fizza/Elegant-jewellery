import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../services';
import type { Order } from '../../types';
import { StatusBadge } from '../../components/account/OrderView';
import ProductImage from '../../components/product/ProductImage';
import { EmptyState, ErrorState, Spinner } from '../../components/ui/Feedback';
import { formatDate, formatPrice } from '../../lib/format';
import { getErrorMessage } from '../../lib/api';
import { useTitle } from '../../lib/useTitle';

const Orders = () => {
  useTitle('Order history');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  const load = () => {
    setError('');
    orderApi.mine().then(setOrders).catch((e) => setError(getErrorMessage(e)));
  };
  useEffect(load, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!orders) return <Spinner />;
  if (orders.length === 0) return <EmptyState title="No orders yet" text="When you place an order, it will appear here." action={{ label: 'Explore fragrances', to: '/fragrances' }} />;

  return (
    <div>
      <h2 className="font-serif text-3xl">Order history</h2>
      <ul className="mt-8 space-y-4">
        {orders.map((o) => (
          <li key={o._id}>
            <Link to={`/account/orders/${o._id}`} className="card-panel flex flex-col gap-5 p-6 transition-colors duration-500 hover:border-gold sm:flex-row sm:items-center">
              <div className="flex -space-x-4">
                {o.orderItems.slice(0, 3).map((i) => (
                  <div key={i.variantId} className="h-20 w-16 border border-ivory bg-taupe/60">
                    <ProductImage src={i.image} alt={i.name} className="h-full w-full object-contain p-1" />
                  </div>
                ))}
              </div>
              <div className="flex-1">
                <p className="font-sans text-sm tracking-wide">{o.orderNumber}</p>
                <p className="mt-1 text-xs text-stone">
                  {formatDate(o.createdAt)} · {(() => { const n = o.orderItems.reduce((s, i) => s + i.quantity, 0); return `${n} ${n === 1 ? 'item' : 'items'}`; })()} · {o.paymentMethod}
                </p>
              </div>
              <StatusBadge status={o.status} />
              <p className="text-sm sm:w-32 sm:text-right">{formatPrice(o.totalPrice)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Orders;
