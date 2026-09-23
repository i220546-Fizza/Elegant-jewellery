import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services';
import type { DashboardStats } from '../../types';
import { AdminHeader, Panel, Stat, Table, Td, RowLink, StockPill } from '../components/ui';
import { BarList, RevenueChart } from '../components/Charts';
import { StatusBadge } from '../../components/account/OrderView';
import ProductImage from '../../components/product/ProductImage';
import { ErrorState, Spinner } from '../../components/ui/Feedback';
import { formatPrice, formatShortDate } from '../../lib/format';
import { getErrorMessage } from '../../lib/api';

const RANGES = [7, 30, 90];

const Dashboard = () => {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    adminApi
      .stats(days)
      .then(setStats)
      .catch((e) => setError(getErrorMessage(e)));
  }, [days]);
  useEffect(load, [load]);

  const rangeControl = (
    <div className="flex border border-taupe" role="group" aria-label="Date range">
      {RANGES.map((d) => (
        <button key={d} type="button" onClick={() => setDays(d)} aria-pressed={days === d} className={`px-4 py-2 font-sans text-[10.5px] uppercase tracking-wide2 transition ${days === d ? 'bg-ink text-ivory' : 'hover:bg-taupe/40'}`}>
          {d} days
        </button>
      ))}
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) return <Spinner label="Loading analytics" />;

  const inv = stats.inventory;

  return (
    <>
      <AdminHeader eyebrow="NB Classic Scents" title="Analytics" actions={rangeControl} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Total revenue" value={formatPrice(stats.totalRevenue)} hint={`${formatPrice(stats.periodRevenue)} in the last ${stats.periodDays} days`} />
        <Stat label="Total orders" value={String(stats.totalOrders)} hint={`${stats.statusCounts.Pending} awaiting confirmation`} />
        <Stat label="Customers" value={String(stats.totalCustomers)} hint={`${stats.newCustomers} new in ${stats.periodDays} days`} />
        <Stat label="Average order" value={formatPrice(stats.averageOrderValue)} hint="Excluding cancelled orders" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title={`Revenue · last ${stats.periodDays} days`} className="xl:col-span-2">
          <RevenueChart data={stats.salesTrend} />
        </Panel>
        <Panel title="Orders by status">
          <BarList rows={Object.entries(stats.statusCounts).map(([label, value]) => ({ label, value }))} />
          <Link to="/admin/orders" className="link-lux mt-6">
            Manage orders
          </Link>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Bestselling perfumes" className="xl:col-span-2">
          {stats.bestsellers.length === 0 ? (
            <p className="py-8 text-sm text-stone">No sales yet.</p>
          ) : (
            <ul className="divide-y divide-taupe/60">
              {stats.bestsellers.map((b, i) => (
                <li key={b.productId} className="flex items-center gap-4 py-3">
                  <span className="w-5 font-serif text-lg text-stone">{i + 1}</span>
                  <div className="h-14 w-11 shrink-0 bg-taupe/40">
                    <ProductImage src={b.image} alt="" className="h-full w-full object-contain p-0.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-xl">{b.slug ? <RowLink to={`/admin/products/${b.productId}`}>{b.name}</RowLink> : b.name}</p>
                    <p className="text-xs text-stone">{b.units} units sold</p>
                  </div>
                  <p className="text-sm">{formatPrice(b.revenue)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Revenue by payment method">
          <BarList rows={stats.paymentBreakdown.map((p) => ({ label: p.method, value: p.total, sub: `${p.count} orders` }))} format={formatPrice} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Inventory" action={<Link to="/admin/inventory" className="font-sans text-[10px] uppercase tracking-wide2 text-stone hover:text-ink">View all</Link>}>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="eyebrow !text-[9.5px]">Units in stock</dt>
              <dd className="mt-1 font-serif text-3xl">{inv.totalUnits}</dd>
            </div>
            <div>
              <dt className="eyebrow !text-[9.5px]">Stock value</dt>
              <dd className="mt-1 font-serif text-2xl">{formatPrice(inv.inventoryValue)}</dd>
            </div>
            <div>
              <dt className="eyebrow !text-[9.5px]">Low stock sizes</dt>
              <dd className="mt-1 font-serif text-3xl">{inv.lowStockCount}</dd>
            </div>
            <div>
              <dt className="eyebrow !text-[9.5px]">Sold out sizes</dt>
              <dd className="mt-1 font-serif text-3xl">{inv.outOfStockCount}</dd>
            </div>
          </dl>
          {inv.lowStock.length > 0 && (
            <ul className="mt-6 space-y-2 border-t border-taupe pt-4">
              {inv.lowStock.slice(0, 6).map((r) => (
                <li key={r.variantId} className="flex items-center justify-between gap-3 text-sm">
                  <RowLink to={`/admin/products/${r.productId}`}>
                    {r.name} <span className="text-stone">{r.size}</span>
                  </RowLink>
                  <StockPill stock={r.stock} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent orders" className="xl:col-span-2" action={<Link to="/admin/orders" className="font-sans text-[10px] uppercase tracking-wide2 text-stone hover:text-ink">View all</Link>}>
          <Table head={['Order', 'Customer', 'Date', 'Payment', 'Status', 'Total']} empty={stats.recentOrders.length === 0}>
            {stats.recentOrders.map((o) => (
              <tr key={o._id}>
                <Td>
                  <RowLink to={`/admin/orders/${o._id}`}>{o.orderNumber}</RowLink>
                </Td>
                <Td>{o.customerInfo.name}</Td>
                <Td className="whitespace-nowrap text-stone">{formatShortDate(o.createdAt)}</Td>
                <Td className="text-stone">{o.paymentMethod}</Td>
                <Td>
                  <StatusBadge status={o.status} />
                </Td>
                <Td className="text-right">{formatPrice(o.totalPrice)}</Td>
              </tr>
            ))}
          </Table>
        </Panel>
      </div>
    </>
  );
};

export default Dashboard;
