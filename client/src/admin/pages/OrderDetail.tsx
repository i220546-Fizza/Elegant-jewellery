import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderApi } from '../../services';
import type { Order, OrderStatus, PaymentStatus } from '../../types';
import { AdminHeader, Panel } from '../components/ui';
import OrderView, { StatusBadge } from '../../components/account/OrderView';
import { Spinner } from '../../components/ui/Feedback';
import { formatDate } from '../../lib/format';
import { getErrorMessage } from '../../lib/api';

const STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES: PaymentStatus[] = ['Pending', 'Paid', 'Awaiting Transfer', 'Refunded', 'Failed'];

const OrderDetail = () => {
  const { id = '' } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<OrderStatus>('Pending');
  const [note, setNote] = useState('');
  const [tracking, setTracking] = useState('');
  const [payStatus, setPayStatus] = useState<PaymentStatus>('Pending');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    orderApi
      .get(id)
      .then((o) => {
        setOrder(o);
        setStatus(o.status);
        setTracking(o.trackingNumber || '');
        setPayStatus(o.paymentStatus);
      })
      .catch((e) => toast.error(getErrorMessage(e)));
  }, [id]);

  if (!order) return <Spinner />;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'Cancelled' && order.status !== 'Cancelled' && !window.confirm('Cancel this order? Stock will be returned to inventory.')) return;
    setBusy(true);
    try {
      const updated = await orderApi.updateStatus(order._id, { status, note, trackingNumber: tracking, paymentStatus: payStatus });
      setOrder(updated);
      setStatus(updated.status);
      setPayStatus(updated.paymentStatus);
      setNote('');
      toast.success('Order updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminHeader eyebrow={`Placed ${formatDate(order.createdAt)}`} title={order.orderNumber} actions={<StatusBadge status={order.status} />} />
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <OrderView order={order} />
        </Panel>
        <div className="space-y-4">
          <Panel title="Update order">
            <form onSubmit={save} className="space-y-4">
              <label className="block">
                <span className="label">Status</span>
                <select className="field-box" value={status} disabled={order.status === 'Cancelled'} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label">Note (internal history)</span>
                <input className="field-box" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Handed to courier" />
              </label>
              <label className="block">
                <span className="label">Tracking number</span>
                <input className="field-box" value={tracking} onChange={(e) => setTracking(e.target.value)} />
              </label>
              <label className="block">
                <span className="label">Payment status</span>
                <select className="field-box" value={payStatus} onChange={(e) => setPayStatus(e.target.value as PaymentStatus)}>
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <button type="submit" disabled={busy} className="btn-dark w-full !py-3">
                {busy ? 'Saving…' : 'Save'}
              </button>
            </form>
          </Panel>
          <Panel title="Customer">
            <p>{order.customerInfo.name}</p>
            <p className="text-sm text-stone">{order.customerInfo.email}</p>
            <p className="text-sm text-stone">{order.customerInfo.phone}</p>
            {order.user ? (
              <Link to={`/admin/customers/${order.user}`} className="mt-3 inline-block font-sans text-[10px] uppercase tracking-wide2 underline-offset-4 hover:underline">
                View customer profile
              </Link>
            ) : (
              <p className="mt-3 text-xs text-stone">Guest checkout</p>
            )}
          </Panel>
          <Panel title="History">
            <ol className="space-y-3 text-sm">
              {[...order.statusHistory].reverse().map((h, i) => (
                <li key={i} className="border-l border-gold pl-3">
                  <p>{h.status}</p>
                  <p className="text-xs text-stone">
                    {formatDate(h.at, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {h.note && ` · ${h.note}`}
                  </p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
