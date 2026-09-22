import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Truck, CreditCard } from 'lucide-react';
import Reveal from '../components/Reveal';
import StateMessage from '../components/StateMessage';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { formatCurrency } from '../utils/format';
import type { Order } from '../types';

export default function Checkout() {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    address: '',
    city: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Online Payment'>('Cash on Delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const order = await createOrder({
        items,
        shippingInfo: form,
        paymentMethod,
        subtotal,
        deliveryFee,
        total,
      });
      setPlacedOrder(order);
      clearCart();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'We could not place your order. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (placedOrder) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 py-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg rounded-3xl border border-layers-border bg-layers-surface p-10 text-center shadow-sm"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-layers-success/15 text-layers-success"
          >
            <CheckCircle2 size={40} />
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 font-display text-3xl text-layers-ink"
          >
            Order Confirmed!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-layers-muted"
          >
            Thank you, {form.fullName.split(' ')[0]}. Your order <strong>#{placedOrder.orderNumber}</strong> is being
            prepared with care.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 rounded-2xl bg-layers-surface-alt p-5 text-left text-sm"
          >
            <div className="flex justify-between">
              <span className="text-layers-muted">Total Paid</span>
              <span className="font-semibold text-layers-ink">{formatCurrency(placedOrder.total)}</span>
            </div>
            <div className="mt-1.5 flex justify-between">
              <span className="text-layers-muted">Payment Method</span>
              <span className="text-layers-ink">{placedOrder.paymentMethod}</span>
            </div>
            <div className="mt-1.5 flex justify-between">
              <span className="text-layers-muted">Delivering To</span>
              <span className="text-right text-layers-ink">{form.address}, {form.city}</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="flex-1 rounded-full bg-layers-primary py-3 text-sm font-semibold text-white hover:bg-layers-primary-hover"
            >
              Track Order
            </button>
            <button
              type="button"
              onClick={() => navigate('/menu')}
              className="flex-1 rounded-full border border-layers-border py-3 text-sm font-semibold text-layers-ink hover:border-layers-primary"
            >
              Continue Shopping
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-32">
        <StateMessage
          icon={ShoppingBag}
          title="Your bag is empty"
          description="Add something delicious before checking out."
          action={{ label: 'Browse Menu', onClick: () => navigate('/menu') }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 md:px-8 md:pt-36">
      <Reveal>
        <p className="layers-eyebrow">Almost There</p>
        <h1 className="mt-3 font-display text-4xl text-layers-ink sm:text-5xl">Checkout</h1>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr]">
        <Reveal direction="left">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-layers-error/10 px-4 py-3 text-sm text-layers-error" role="alert">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            <div className="rounded-2xl border border-layers-border bg-layers-surface p-6">
              <h2 className="font-medium text-layers-ink">Delivery Details</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="text-sm text-layers-ink-soft">Full Name</label>
                  <input
                    id="fullName"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-sm text-layers-ink-soft">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm text-layers-ink-soft">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="text-sm text-layers-ink-soft">Delivery Address</label>
                  <input
                    id="address"
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="text-sm text-layers-ink-soft">City</label>
                  <input
                    id="city"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="text-sm text-layers-ink-soft">Order Notes (optional)</label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="e.g. Add a birthday candle, ring the bell twice..."
                    className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-layers-border bg-layers-surface p-6">
              <h2 className="font-medium text-layers-ink">Payment Method</h2>
              <div className="mt-4 space-y-3">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                    paymentMethod === 'Cash on Delivery' ? 'border-layers-primary bg-layers-accent-soft/20' : 'border-layers-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={() => setPaymentMethod('Cash on Delivery')}
                    className="accent-layers-primary"
                  />
                  <Truck size={18} className="text-layers-primary" />
                  <div>
                    <p className="text-sm font-medium text-layers-ink">Cash on Delivery</p>
                    <p className="text-xs text-layers-muted">Pay when your order arrives.</p>
                  </div>
                </label>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                    paymentMethod === 'Online Payment' ? 'border-layers-primary bg-layers-accent-soft/20' : 'border-layers-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Online Payment'}
                    onChange={() => setPaymentMethod('Online Payment')}
                    className="accent-layers-primary"
                  />
                  <CreditCard size={18} className="text-layers-primary" />
                  <div>
                    <p className="text-sm font-medium text-layers-ink">Online Payment</p>
                    <p className="text-xs text-layers-muted">Card payment gateway — coming soon.</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-layers-primary py-4 text-sm font-semibold text-white transition-colors hover:bg-layers-primary-hover disabled:opacity-60"
            >
              {loading ? 'Placing Order...' : `Place Order — ${formatCurrency(total)}`}
            </button>
          </form>
        </Reveal>

        <Reveal direction="right">
          <div className="sticky top-28 rounded-2xl border border-layers-border bg-layers-surface p-6">
            <h2 className="font-medium text-layers-ink">Order Summary</h2>
            <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.li
                    key={item.product + (item.size ?? '')}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3"
                  >
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-layers-ink">{item.name}</p>
                      <p className="text-xs text-layers-muted">
                        {item.size ? `${item.size} · ` : ''}Qty {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-layers-ink">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <div className="mt-5 space-y-1.5 border-t border-layers-border pt-4 text-sm">
              <div className="flex justify-between text-layers-ink-soft">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-layers-ink-soft">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-semibold text-layers-ink">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
