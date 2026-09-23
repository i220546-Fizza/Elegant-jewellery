import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { accountApi, orderApi } from '../../services';
import { getErrorMessage } from '../../lib/api';
import { formatDate, formatPrice } from '../../lib/format';
import type { Order } from '../../types';
import { StatusBadge } from '../../components/account/OrderView';
import { useTitle } from '../../lib/useTitle';

const Profile = () => {
  useTitle('My account');
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', newsletter: !!user?.newsletter });
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    orderApi.mine().then(setOrders).catch(() => setOrders([]));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      setUser(await accountApi.updateProfile(form));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const spent = orders?.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.totalPrice, 0) ?? 0;

  return (
    <div className="space-y-16">
      <div className="grid gap-px bg-taupe sm:grid-cols-3">
        {[
          { label: 'Orders', value: orders ? String(orders.length) : '—' },
          { label: 'Total spent', value: orders ? formatPrice(spent) : '—' },
          { label: 'Member since', value: user?.createdAt ? formatDate(user.createdAt, { month: 'long', year: 'numeric' }) : '—' },
        ].map((s) => (
          <div key={s.label} className="bg-ivory p-6">
            <p className="eyebrow">{s.label}</p>
            <p className="mt-3 font-serif text-3xl">{s.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-serif text-3xl">Personal details</h2>
        <form onSubmit={save} className="mt-8 grid max-w-2xl gap-8 sm:grid-cols-2">
          <label className="block">
            <span className="label">Full name</span>
            <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="block">
            <span className="label">Email</span>
            <input className="field text-stone" value={user?.email} disabled />
          </label>
          <label className="block">
            <span className="label">Phone</span>
            <input className="field" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="flex items-center gap-3 self-end text-sm text-stone">
            <input type="checkbox" className="h-4 w-4 accent-ink" checked={form.newsletter} onChange={(e) => setForm({ ...form, newsletter: e.target.checked })} />
            Receive private previews by email
          </label>
          <div className="sm:col-span-2">
            <button type="submit" disabled={busy} className="btn-dark">
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      {orders && orders.length > 0 && (
        <section>
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl">Recent orders</h2>
            <Link to="/account/orders" className="link-lux">
              View all
            </Link>
          </div>
          <ul className="mt-6 divide-y divide-taupe/70 border-y border-taupe/70">
            {orders.slice(0, 3).map((o) => (
              <li key={o._id}>
                <Link to={`/account/orders/${o._id}`} className="flex flex-wrap items-center justify-between gap-4 py-5 transition hover:bg-white/40">
                  <span className="font-sans text-sm tracking-wide">{o.orderNumber}</span>
                  <span className="text-sm text-stone">{formatDate(o.createdAt)}</span>
                  <StatusBadge status={o.status} />
                  <span className="text-sm">{formatPrice(o.totalPrice)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default Profile;
