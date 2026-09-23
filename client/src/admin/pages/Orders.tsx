import { useCallback, useEffect, useState } from 'react';
import { orderApi } from '../../services';
import type { Order } from '../../types';
import { AdminHeader, Pager, RowLink, Table, Td } from '../components/ui';
import { StatusBadge } from '../../components/account/OrderView';
import { ErrorState, Spinner } from '../../components/ui/Feedback';
import { formatPrice, formatShortDate } from '../../lib/format';
import { getErrorMessage } from '../../lib/api';

const STATUSES = ['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENTS = ['all', 'Cash on Delivery', 'Card Payment', 'Online Payment'];

const Orders = () => {
  const [status, setStatus] = useState('all');
  const [payment, setPayment] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ orders: Order[]; page: number; pages: number; total: number } | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    orderApi
      .all({ status, payment, search: search || undefined, page })
      .then(setData)
      .catch((e) => setError(getErrorMessage(e)));
  }, [status, payment, search, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <>
      <AdminHeader eyebrow="Sales" title="Orders" />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Order number, name, email or phone" className="field-box max-w-xs" aria-label="Search orders" />
        <select value={payment} onChange={(e) => { setPayment(e.target.value); setPage(1); }} className="field-box w-auto" aria-label="Payment method">
          {PAYMENTS.map((p) => (
            <option key={p} value={p}>
              {p === 'all' ? 'All payment methods' : p}
            </option>
          ))}
        </select>
      </div>
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto" role="tablist">
        {STATUSES.map((s) => (
          <button key={s} type="button" role="tab" aria-selected={status === s} onClick={() => { setStatus(s); setPage(1); }} className={`chip shrink-0 ${status === s ? 'border-ink bg-ink text-ivory' : 'border-taupe hover:border-gold'}`}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !data ? (
        <Spinner />
      ) : (
        <>
          <p className="mb-3 text-xs text-stone">{data.total} orders</p>
          <Table head={['Order', 'Date', 'Customer', 'Items', 'Payment', 'Status', 'Total']} empty={data.orders.length === 0}>
            {data.orders.map((o) => (
              <tr key={o._id}>
                <Td>
                  <RowLink to={`/admin/orders/${o._id}`}>{o.orderNumber}</RowLink>
                </Td>
                <Td className="whitespace-nowrap text-stone">{formatShortDate(o.createdAt)}</Td>
                <Td>
                  {o.customerInfo.name}
                  <p className="text-xs text-stone">{o.customerInfo.email}</p>
                </Td>
                <Td className="text-stone">{o.orderItems.reduce((s, i) => s + i.quantity, 0)}</Td>
                <Td>
                  {o.paymentMethod}
                  <p className="text-xs text-stone">{o.paymentStatus}</p>
                </Td>
                <Td>
                  <StatusBadge status={o.status} />
                </Td>
                <Td className="whitespace-nowrap text-right">{formatPrice(o.totalPrice)}</Td>
              </tr>
            ))}
          </Table>
          <Pager page={data.page} pages={data.pages} onPage={setPage} />
        </>
      )}
    </>
  );
};

export default Orders;
