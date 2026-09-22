import { useEffect, useState } from 'react';
import { ChevronDown, ShoppingCart } from 'lucide-react';
import StateMessage from '../../components/StateMessage';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { getAllOrders, updateOrderStatus } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Order, OrderStatus } from '../../types';

const statuses: OrderStatus[] = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getAllOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleStatusChange(order: Order, status: OrderStatus) {
    const updated = await updateOrderStatus(order._id, status);
    setOrders((prev) => prev.map((o) => (o._id === order._id ? updated : o)));
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-layers-ink">Orders</h1>
      <p className="mt-1 text-sm text-layers-muted">{orders.length} total orders.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-layers-border bg-layers-surface">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-layers-surface-alt" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <StateMessage icon={ShoppingCart} title="No orders yet" description="Orders placed by customers will appear here." />
        ) : (
          <ul className="divide-y divide-layers-border">
            {orders.map((order) => (
              <li key={order._id}>
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-layers-ink">#{order.orderNumber}</p>
                    <p className="truncate text-xs text-layers-muted">
                      {order.shippingInfo.fullName} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="hidden text-sm font-medium text-layers-ink sm:block">{formatCurrency(order.total)}</span>
                    <OrderStatusBadge status={order.status} />
                    <ChevronDown size={16} className={`transition-transform ${expanded === order._id ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {expanded === order._id && (
                  <div className="grid grid-cols-1 gap-6 border-t border-layers-border bg-layers-surface-alt/50 px-5 py-5 md:grid-cols-2">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-layers-muted">Customer</h3>
                      <p className="mt-1.5 text-sm text-layers-ink">{order.shippingInfo.fullName}</p>
                      <p className="text-sm text-layers-ink-soft">{order.shippingInfo.phone}</p>
                      <p className="text-sm text-layers-ink-soft">{order.shippingInfo.email}</p>
                      <p className="mt-2 text-sm text-layers-ink-soft">
                        {order.shippingInfo.address}, {order.shippingInfo.city}
                      </p>
                      {order.shippingInfo.notes && (
                        <p className="mt-2 text-sm italic text-layers-muted">"{order.shippingInfo.notes}"</p>
                      )}

                      <h3 className="mt-4 text-xs font-semibold uppercase tracking-widest text-layers-muted">Update Status</h3>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                        className="mt-1.5 rounded-xl border border-layers-border px-3 py-2 text-sm focus:border-layers-primary focus:outline-none"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-layers-muted">Items</h3>
                      <ul className="mt-2 space-y-2">
                        {order.items.map((item) => (
                          <li key={item.product + (item.size ?? '')} className="flex items-center gap-3 text-sm">
                            <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                            <span className="flex-1 text-layers-ink">{item.name} {item.size ? `(${item.size})` : ''} × {item.quantity}</span>
                            <span className="text-layers-ink-soft">{formatCurrency(item.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex justify-between border-t border-layers-border pt-3 text-sm font-semibold text-layers-ink">
                        <span>Total</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
