import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../../services';
import { AdminHeader, Panel, RowLink, Stat, Table, Td, Toggle } from '../components/ui';
import { StatusBadge } from '../../components/account/OrderView';
import { Spinner } from '../../components/ui/Feedback';
import Stars from '../../components/ui/Stars';
import { formatDate, formatPrice, formatShortDate } from '../../lib/format';
import { getErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

type Data = Awaited<ReturnType<typeof adminApi.customer>>;

const CustomerDetail = () => {
  const { id = '' } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<Data | null>(null);

  const load = useCallback(() => {
    adminApi
      .customer(id)
      .then(setData)
      .catch((e) => {
        toast.error(getErrorMessage(e));
        navigate('/admin/customers');
      });
  }, [id, navigate]);
  useEffect(load, [load]);

  if (!data) return <Spinner />;
  const { customer, orders, reviews } = data;
  const isSelf = me?._id === customer._id;
  const spent = orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.totalPrice, 0);

  const update = async (payload: { isActive?: boolean; role?: string }) => {
    try {
      await adminApi.updateCustomer(customer._id, payload);
      toast.success('Customer updated');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${customer.name}'s account? Their orders are kept for your records.`)) return;
    try {
      await adminApi.deleteCustomer(customer._id);
      toast.success('Account deleted');
      navigate('/admin/customers');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <AdminHeader eyebrow={`Customer since ${formatDate(customer.createdAt || new Date())}`} title={customer.name} />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Orders" value={String(orders.length)} />
        <Stat label="Total spent" value={formatPrice(spent)} />
        <Stat label="Reviews" value={String(reviews.length)} />
        <Stat label="Last sign-in" value={customer.lastLoginAt ? formatShortDate(customer.lastLoginAt) : '—'} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel title="Orders">
            <Table head={['Order', 'Date', 'Payment', 'Status', 'Total']} empty={orders.length === 0}>
              {orders.map((o) => (
                <tr key={o._id}>
                  <Td>
                    <RowLink to={`/admin/orders/${o._id}`}>{o.orderNumber}</RowLink>
                  </Td>
                  <Td className="text-stone">{formatShortDate(o.createdAt)}</Td>
                  <Td className="text-stone">{o.paymentMethod}</Td>
                  <Td>
                    <StatusBadge status={o.status} />
                  </Td>
                  <Td className="text-right">{formatPrice(o.totalPrice)}</Td>
                </tr>
              ))}
            </Table>
          </Panel>
          {reviews.length > 0 && (
            <Panel title="Reviews">
              <ul className="divide-y divide-taupe/60">
                {reviews.map((r) => (
                  <li key={r._id} className="py-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>{r.product?.name}</span>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-1 text-stone">{r.comment}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
        <div className="space-y-4">
          <Panel title="Contact">
            <p className="text-sm">{customer.email}</p>
            <p className="text-sm text-stone">{customer.phone || 'No phone saved'}</p>
          </Panel>
          <Panel title="Saved addresses">
            {customer.addresses.length === 0 ? (
              <p className="text-sm text-stone">None</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {customer.addresses.map((a) => (
                  <li key={a._id}>
                    <p className="text-[10px] uppercase tracking-wide2">
                      {a.label} {a.isDefault && <span className="text-gold">· Default</span>}
                    </p>
                    <p className="text-stone">
                      {a.address}, {a.city} {a.postalCode}, {a.country}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Access">
            {isSelf ? (
              <p className="text-sm text-stone">This is your own account.</p>
            ) : (
              <div className="space-y-4">
                <Toggle checked={customer.isActive} onChange={(v) => update({ isActive: v })} label={customer.isActive ? 'Account active' : 'Account deactivated'} />
                <Toggle checked={customer.role === 'admin'} onChange={(v) => update({ role: v ? 'admin' : 'customer' })} label="Administrator" />
                <button type="button" onClick={remove} className="font-sans text-[10px] uppercase tracking-wide2 text-stone hover:text-ink">
                  Delete account
                </button>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
};

export default CustomerDetail;
