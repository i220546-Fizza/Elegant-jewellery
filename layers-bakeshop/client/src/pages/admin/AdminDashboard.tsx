import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Users, Package, Clock } from 'lucide-react';
import { getDashboardStats, type DashboardStats } from '../../services/adminService';
import { formatCurrency } from '../../utils/format';

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let frame: number;
    function tick(ts: number) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

function StatCard({ icon: Icon, label, value, format }: { icon: typeof DollarSign; label: string; value: number; format?: 'currency' }) {
  const animated = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-layers-border bg-layers-surface p-5"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-layers-accent-soft text-layers-primary">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 font-display text-3xl text-layers-ink">{format === 'currency' ? formatCurrency(animated) : animated}</p>
      <p className="mt-1 text-xs uppercase tracking-widest text-layers-muted">{label}</p>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-layers-surface" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return <p className="text-layers-muted">Could not load dashboard stats.</p>;
  }

  const maxRevenue = Math.max(...stats.revenueByDay.map((d) => d.revenue), 1);

  return (
    <div>
      <h1 className="font-display text-3xl text-layers-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-layers-muted">Overview of your bakeshop's performance.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={DollarSign} label="Total Revenue" value={stats.totalRevenue} format="currency" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} />
        <StatCard icon={Users} label="Customers" value={stats.totalCustomers} />
        <StatCard icon={Package} label="Products" value={stats.totalProducts} />
        <StatCard icon={Clock} label="Pending Orders" value={stats.pendingOrders} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-layers-border bg-layers-surface p-6">
          <h2 className="font-medium text-layers-ink">Revenue (Last 7 Days)</h2>
          <div className="mt-6 flex h-48 items-end gap-3">
            {stats.revenueByDay.map((d, i) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 4)}%` }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full rounded-t-md bg-layers-primary"
                  style={{ maxHeight: '160px' }}
                  title={formatCurrency(d.revenue)}
                />
                <span className="text-[10px] text-layers-muted">{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-layers-border bg-layers-surface p-6">
          <h2 className="font-medium text-layers-ink">Orders by Status</h2>
          <div className="mt-6 space-y-3">
            {stats.ordersByStatus.map((s, i) => {
              const max = Math.max(...stats.ordersByStatus.map((x) => x.count), 1);
              return (
                <div key={s.status}>
                  <div className="mb-1 flex justify-between text-xs text-layers-ink-soft">
                    <span>{s.status}</span>
                    <span>{s.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-layers-surface-alt">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.count / max) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.06 }}
                      className="h-2 rounded-full bg-layers-accent"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {stats.topProducts.length > 0 && (
        <div className="mt-6 rounded-2xl border border-layers-border bg-layers-surface p-6">
          <h2 className="font-medium text-layers-ink">Top Selling Products</h2>
          <ul className="mt-4 divide-y divide-layers-border">
            {stats.topProducts.map((p) => (
              <li key={p.name} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-layers-ink">{p.name}</span>
                <span className="text-layers-muted">{p.sold} sold</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
