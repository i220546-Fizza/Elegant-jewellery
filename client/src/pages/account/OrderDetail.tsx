import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderApi } from '../../services';
import type { Order } from '../../types';
import OrderView, { StatusBadge } from '../../components/account/OrderView';
import { EmptyState, Spinner } from '../../components/ui/Feedback';
import { ArrowLeft } from '../../components/ui/Icons';
import { formatDate } from '../../lib/format';
import { getErrorMessage } from '../../lib/api';
import { useTitle } from '../../lib/useTitle';

const OrderDetail = () => {
  const { id = '' } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  useTitle(order ? `Order ${order.orderNumber}` : 'Order');

  useEffect(() => {
    orderApi.get(id).then(setOrder).catch(() => setFailed(true));
  }, [id]);

  const cancel = async () => {
    if (!order || !window.confirm('Cancel this order? This cannot be undone.')) return;
    setBusy(true);
    try {
      setOrder(await orderApi.cancel(order._id));
      toast.success('Your order has been cancelled');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (failed) return <EmptyState title="Order not found" action={{ label: 'Back to orders', to: '/account/orders' }} />;
  if (!order) return <Spinner />;

  return (
    <div>
      <Link to="/account/orders" className="link-lux">
        <ArrowLeft size={14} /> All orders
      </Link>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Placed {formatDate(order.createdAt)}</p>
          <h2 className="mt-2 font-serif text-4xl">{order.orderNumber}</h2>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={order.status} />
          {['Pending', 'Confirmed'].includes(order.status) && (
            <button type="button" onClick={cancel} disabled={busy} className="font-sans text-[10.5px] uppercase tracking-wide2 text-stone underline-offset-4 hover:text-ink hover:underline">
              Cancel order
            </button>
          )}
        </div>
      </div>
      <div className="mt-10 border-t border-taupe pt-10">
        <OrderView order={order} />
      </div>
    </div>
  );
};

export default OrderDetail;
