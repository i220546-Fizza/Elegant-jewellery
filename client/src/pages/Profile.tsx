import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { fetchMyOrders } from '../services/orderService';
import { updateProfile } from '../services/authService';
import { getErrorMessage } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import type { Order } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { BagIcon } from '../components/Icons';

type Tab = 'orders' | 'settings';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Processing: 'bg-indigo-100 text-indigo-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address?.address || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || '',
    password: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'My Account | Elegant Jewellery';
    fetchMyOrders()
      .then(setOrders)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: form.name,
        phone: form.phone,
        address: {
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        },
        ...(form.password ? { password: form.password } : {}),
      });
      updateUser(updated);
      setForm((f) => ({ ...f, password: '' }));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-luxe py-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-kicker">My Account</p>
          <h1 className="section-heading mt-2">Welcome, {user?.name}</h1>
        </div>
        <button onClick={logout} className="btn-secondary">
          Sign Out
        </button>
      </div>

      <div className="mb-8 flex gap-6 border-b border-brown-dark/10">
        <button
          onClick={() => setTab('orders')}
          className={`pb-3 text-sm uppercase tracking-widest ${
            tab === 'orders' ? 'border-b-2 border-champagne-dark text-brown-dark' : 'text-brown-light'
          }`}
        >
          Order History
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`pb-3 text-sm uppercase tracking-widest ${
            tab === 'settings' ? 'border-b-2 border-champagne-dark text-brown-dark' : 'text-brown-light'
          }`}
        >
          Account Settings
        </button>
      </div>

      {tab === 'orders' ? (
        loading ? (
          <LoadingSpinner label="Loading your orders" />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            message="Once you place an order, it will appear here."
            icon={<BagIcon width={28} height={28} />}
            actionLabel="Start Shopping"
            actionTo="/shop"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="card-luxe p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-brown-dark">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-brown-light">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="font-medium text-brown-dark">{formatCurrency(order.totalPrice)}</span>
                  <Link to={`/order-confirmation/${order._id}`} className="text-xs uppercase tracking-widest text-champagne-dark hover:underline">
                    View Details
                  </Link>
                </div>
                <div className="mt-3 flex -space-x-3">
                  {order.orderItems.slice(0, 5).map((item, i) => (
                    <img
                      key={i}
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 rounded-full border-2 border-white bg-beige object-cover"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <form onSubmit={handleSave} className="card-luxe max-w-2xl space-y-4 p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Full Name"
              className="input-luxe"
            />
            <input value={user?.email || ''} disabled placeholder="Email" className="input-luxe opacity-60" />
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Phone Number"
              className="input-luxe"
            />
            <input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Address"
              className="input-luxe"
            />
            <input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="City"
              className="input-luxe"
            />
            <input
              value={form.postalCode}
              onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
              placeholder="Postal Code"
              className="input-luxe"
            />
            <input
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              placeholder="Country"
              className="input-luxe"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="New Password (optional)"
              className="input-luxe"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;
