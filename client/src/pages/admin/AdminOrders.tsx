import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Order, OrderStatus } from '../../types';
import { fetchAllOrders } from '../../services/orderService';
import { getErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import OrderTable from '../../components/OrderTable';
import { BagIcon } from '../../components/Icons';

const STATUSES: (OrderStatus | 'all')[] = ['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    document.title = 'Manage Orders | Elegant Jewellery Admin';
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAllOrders({ status: status === 'all' ? undefined : status })
      .then((res) => setOrders(res.orders))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-brown-dark">Orders</h1>
          <p className="mt-1 text-sm text-brown-light">Track and manage all customer orders</p>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | 'all')} className="input-luxe max-w-[200px]">
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Statuses' : s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading orders" />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" icon={<BagIcon width={28} height={28} />} />
      ) : (
        <OrderTable orders={orders} />
      )}
    </div>
  );
};

export default AdminOrders;
