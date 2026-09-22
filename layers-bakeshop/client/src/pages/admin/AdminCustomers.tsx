import { useEffect, useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import StateMessage from '../../components/StateMessage';
import { getCustomers } from '../../services/adminService';
import { getAllOrders } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/format';
import type { User, Order } from '../../types';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<User | null>(null);

  useEffect(() => {
    Promise.all([getCustomers(), getAllOrders()])
      .then(([c, o]) => {
        setCustomers(c.filter((u) => u.role === 'customer'));
        setOrders(o);
      })
      .finally(() => setLoading(false));
  }, []);

  const ordersByCustomer = useMemo(() => {
    if (!selected) return [];
    return orders.filter((o) => o.user === selected._id || o.shippingInfo.email === selected.email);
  }, [orders, selected]);

  function orderCount(customer: User) {
    return orders.filter((o) => o.user === customer._id || o.shippingInfo.email === customer.email).length;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-layers-ink">Customers</h1>
      <p className="mt-1 text-sm text-layers-muted">{customers.length} registered customers.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-layers-border bg-layers-surface">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-layers-surface-alt" />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <StateMessage icon={Users} title="No customers yet" description="Registered customers will appear here." />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-layers-border text-xs uppercase tracking-wider text-layers-muted">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Orders</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer._id}
                    onClick={() => setSelected(customer)}
                    className={`cursor-pointer border-b border-layers-border last:border-0 hover:bg-layers-surface-alt ${
                      selected?._id === customer._id ? 'bg-layers-accent-soft/20' : ''
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-layers-ink">{customer.name}</td>
                    <td className="px-5 py-3 text-layers-ink-soft">{customer.email}</td>
                    <td className="px-5 py-3 text-layers-ink-soft">{orderCount(customer)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl border border-layers-border bg-layers-surface p-5">
          {selected ? (
            <>
              <h2 className="font-medium text-layers-ink">{selected.name}'s Orders</h2>
              {ordersByCustomer.length === 0 ? (
                <p className="mt-3 text-sm text-layers-muted">No orders from this customer yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {ordersByCustomer.map((order) => (
                    <li key={order._id} className="flex items-center justify-between border-b border-layers-border pb-2.5 text-sm last:border-0">
                      <div>
                        <p className="font-medium text-layers-ink">#{order.orderNumber}</p>
                        <p className="text-xs text-layers-muted">{formatDate(order.createdAt)}</p>
                      </div>
                      <span className="text-layers-ink-soft">{formatCurrency(order.total)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-sm text-layers-muted">Select a customer to view their order history.</p>
          )}
        </div>
      </div>
    </div>
  );
}
