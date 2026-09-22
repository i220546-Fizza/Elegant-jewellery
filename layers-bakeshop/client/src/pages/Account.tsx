import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, LogOut, User as UserIcon, WifiOff } from 'lucide-react';
import Reveal from '../components/Reveal';
import StateMessage from '../components/StateMessage';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../services/orderService';
import { formatCurrency, formatDate } from '../utils/format';
import type { Order } from '../types';

export default function Account() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    getMyOrders()
      .then(setOrders)
      .catch(() => setError('Could not load your orders right now.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-32 md:px-8 md:pt-36">
      <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-layers-primary text-xl font-semibold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-2xl text-layers-ink">{user?.name}</h1>
            <p className="text-sm text-layers-muted">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 rounded-full border border-layers-border px-5 py-2.5 text-sm font-medium text-layers-ink transition-colors hover:border-layers-error hover:text-layers-error"
        >
          <LogOut size={16} /> Log Out
        </button>
      </Reveal>

      <Reveal delay={0.1} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-layers-border bg-layers-surface p-5">
          <UserIcon size={18} className="text-layers-primary" />
          <div>
            <p className="text-xs uppercase tracking-widest text-layers-muted">Phone</p>
            <p className="text-sm font-medium text-layers-ink">{user?.phone || 'Not provided'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-layers-border bg-layers-surface p-5">
          <Package size={18} className="text-layers-primary" />
          <div>
            <p className="text-xs uppercase tracking-widest text-layers-muted">Total Orders</p>
            <p className="text-sm font-medium text-layers-ink">{orders.length}</p>
          </div>
        </div>
      </Reveal>

      <div className="mt-12">
        <h2 className="font-display text-2xl text-layers-ink">Order History</h2>

        {loading ? (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-layers-surface-alt" />
            ))}
          </div>
        ) : error ? (
          <StateMessage icon={WifiOff} title="Something went wrong" description={error} action={{ label: 'Retry', onClick: load }} />
        ) : orders.length === 0 ? (
          <StateMessage icon={Package} title="No orders yet" description="When you place an order, it will show up here." />
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 6) * 0.05 }}
                className="rounded-2xl border border-layers-border bg-layers-surface p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-layers-ink">#{order.orderNumber}</p>
                    <p className="text-xs text-layers-muted">{formatDate(order.createdAt)}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.items.slice(0, 4).map((item) => (
                    <img
                      key={item.product + (item.size ?? '')}
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ))}
                  {order.items.length > 4 && (
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-layers-surface-alt text-xs text-layers-muted">
                      +{order.items.length - 4}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-layers-muted">{order.items.length} item(s)</span>
                  <span className="font-semibold text-layers-ink">{formatCurrency(order.total)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
