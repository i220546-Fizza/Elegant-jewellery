import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services';
import { getErrorMessage } from '../lib/api';
import { formatPrice } from '../lib/format';
import { useTitle } from '../lib/useTitle';
import Logo from '../components/ui/Logo';
import ProductImage from '../components/product/ProductImage';
import CouponForm from '../components/product/CouponForm';
import { Totals } from '../components/product/OrderSummary';
import { EmptyState, Spinner } from '../components/ui/Feedback';
import { ShieldIcon } from '../components/ui/Icons';
import type { PaymentMethod } from '../types';

const COUNTRIES = ['Pakistan', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'United Kingdom', 'United States', 'Canada'];
const ONLINE = ['Bank Transfer', 'JazzCash', 'Easypaisa'] as const;

const PAYMENT_OPTIONS: { value: PaymentMethod; title: string; text: string }[] = [
  { value: 'Cash on Delivery', title: 'Cash on Delivery', text: 'Pay in cash when your order arrives.' },
  { value: 'Card Payment', title: 'Card Payment', text: 'Visa, Mastercard or American Express.' },
  { value: 'Online Payment', title: 'Online Payment', text: 'Bank transfer, JazzCash or Easypaisa.' },
];

const formatCard = (v: string) =>
  v
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

type Errors = Partial<Record<string, string>>;

const Field = ({ label, error, children, className = '' }: { label: string; error?: string; children: React.ReactNode; className?: string }) => (
  <label className={`block ${className}`}>
    <span className="label">{label}</span>
    {children}
    {error && <span className="mt-1 block text-xs text-ink">{error}</span>}
  </label>
);

const Checkout = () => {
  useTitle('Checkout');
  const { refs, quote, clear, couponCode, syncing } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [info, setInfo] = useState({ name: '', email: '', phone: '' });
  const [addr, setAddr] = useState({ address: '', city: '', postalCode: '', country: 'Pakistan' });
  const [notes, setNotes] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [provider, setProvider] = useState<(typeof ONLINE)[number]>('Bank Transfer');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [saveAddress, setSaveAddress] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string>('new');
  const [errors, setErrors] = useState<Errors>({});
  const [placing, setPlacing] = useState(false);

  // Prefill from the account and default saved address.
  useEffect(() => {
    if (!user) return;
    setInfo((i) => ({ name: i.name || user.name, email: i.email || user.email, phone: i.phone || user.phone || '' }));
    const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
    if (def?._id) setSelectedAddress(def._id);
  }, [user]);

  useEffect(() => {
    if (!user || selectedAddress === 'new') return;
    const a = user.addresses.find((x) => x._id === selectedAddress);
    if (a) {
      setAddr({ address: a.address, city: a.city, postalCode: a.postalCode, country: a.country });
      setInfo((i) => ({ ...i, phone: i.phone || a.phone }));
    }
  }, [selectedAddress, user]);

  const validate = () => {
    const e: Errors = {};
    if (info.name.trim().length < 2) e.name = 'Please enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(info.email)) e.email = 'Please enter a valid email';
    if (info.phone.replace(/\D/g, '').length < 7) e.phone = 'Please enter a valid phone number';
    if (addr.address.trim().length < 5) e.address = 'Please enter your street address';
    if (!addr.city.trim()) e.city = 'Required';
    if (!addr.postalCode.trim()) e.postalCode = 'Required';
    if (method === 'Card Payment') {
      if (card.number.replace(/\D/g, '').length < 13) e.cardNumber = 'Please enter your card number';
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry = 'MM/YY';
      if (!/^\d{3,4}$/.test(card.cvc)) e.cvc = '3–4 digits';
      if (card.name.trim().length < 2) e.cardName = 'Name on card';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const place = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error('Please review the highlighted fields');
      return;
    }
    setPlacing(true);
    try {
      const order = await orderApi.place({
        items: refs,
        customerInfo: info,
        shippingAddress: addr,
        orderNotes: notes,
        paymentMethod: method,
        onlineProvider: method === 'Online Payment' ? provider : undefined,
        card: method === 'Card Payment' ? card : undefined,
        couponCode: couponCode || undefined,
        saveAddress: !!user && selectedAddress === 'new' && saveAddress,
      });
      clear();
      try {
        sessionStorage.setItem('nb_last_order_email', info.email);
      } catch {
        /* ignore */
      }
      navigate(`/order/${order._id}?email=${encodeURIComponent(info.email)}&placed=1`, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  };

  const itemCount = useMemo(() => refs.reduce((s, r) => s + r.quantity, 0), [refs]);

  if (refs.length === 0 && !placing) {
    return (
      <div className="pt-32">
        <EmptyState title="Your bag is empty" text="Add a fragrance to begin checkout." action={{ label: 'Explore fragrances', to: '/fragrances' }} />
      </div>
    );
  }

  return (
    <div className="pb-24 pt-28 lg:pt-36">
      <div className="container-lux">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-taupe pb-8">
          <div>
            <p className="eyebrow">Secure checkout</p>
            <h1 className="mt-3 font-serif text-5xl sm:text-6xl">Checkout</h1>
          </div>
          {!user && (
            <p className="text-sm text-stone">
              Have an account?{' '}
              <Link to="/login" state={{ from: '/checkout' }} className="text-ink underline decoration-gold underline-offset-4">
                Sign in
              </Link>{' '}
              for faster checkout.
            </p>
          )}
        </div>

        <form onSubmit={place} noValidate className="mt-12 grid gap-16 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-7">
            <section aria-labelledby="contact-h">
              <h2 id="contact-h" className="flex items-baseline gap-4 font-serif text-3xl">
                <span className="font-sans text-xs text-gold">01</span> Contact
              </h2>
              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <Field label="Full name" error={errors.name} className="sm:col-span-2">
                  <input className="field" autoComplete="name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input className="field" type="email" autoComplete="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <input className="field" type="tel" autoComplete="tel" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} placeholder="+92 300 0000000" />
                </Field>
              </div>
            </section>

            <section aria-labelledby="delivery-h">
              <h2 id="delivery-h" className="flex items-baseline gap-4 font-serif text-3xl">
                <span className="font-sans text-xs text-gold">02</span> Delivery
              </h2>
              {user && user.addresses.length > 0 && (
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {user.addresses.map((a) => (
                    <button key={a._id} type="button" onClick={() => setSelectedAddress(a._id!)} className={`border p-4 text-left text-sm transition ${selectedAddress === a._id ? 'border-ink' : 'border-taupe hover:border-gold'}`}>
                      <span className="font-sans text-[10.5px] uppercase tracking-wide2">{a.label}</span>
                      <span className="mt-2 block text-stone">
                        {a.address}, {a.city} {a.postalCode}
                      </span>
                    </button>
                  ))}
                  <button type="button" onClick={() => { setSelectedAddress('new'); setAddr({ address: '', city: '', postalCode: '', country: 'Pakistan' }); }} className={`border border-dashed p-4 text-left text-sm transition ${selectedAddress === 'new' ? 'border-ink' : 'border-taupe hover:border-gold'}`}>
                    <span className="font-sans text-[10.5px] uppercase tracking-wide2">+ New address</span>
                  </button>
                </div>
              )}
              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <Field label="Address" error={errors.address} className="sm:col-span-2">
                  <input className="field" autoComplete="street-address" value={addr.address} onChange={(e) => { setSelectedAddress('new'); setAddr({ ...addr, address: e.target.value }); }} placeholder="House, street, area" />
                </Field>
                <Field label="City" error={errors.city}>
                  <input className="field" autoComplete="address-level2" value={addr.city} onChange={(e) => { setSelectedAddress('new'); setAddr({ ...addr, city: e.target.value }); }} />
                </Field>
                <Field label="Postal code" error={errors.postalCode}>
                  <input className="field" autoComplete="postal-code" value={addr.postalCode} onChange={(e) => { setSelectedAddress('new'); setAddr({ ...addr, postalCode: e.target.value }); }} />
                </Field>
                <Field label="Country" className="sm:col-span-2">
                  <select className="field" value={addr.country} onChange={(e) => setAddr({ ...addr, country: e.target.value })}>
                    {COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Delivery notes (optional)" className="sm:col-span-2">
                  <input className="field" maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Gift message, landmark or delivery preference" />
                </Field>
              </div>
              {user && selectedAddress === 'new' && (
                <label className="mt-6 flex items-center gap-3 text-sm text-stone">
                  <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 accent-ink" />
                  Save this address to my account
                </label>
              )}
            </section>

            <section aria-labelledby="payment-h">
              <h2 id="payment-h" className="flex items-baseline gap-4 font-serif text-3xl">
                <span className="font-sans text-xs text-gold">03</span> Payment
              </h2>
              <div role="radiogroup" aria-label="Payment method" className="mt-8 divide-y divide-taupe border border-taupe">
                {PAYMENT_OPTIONS.map((o) => (
                  <div key={o.value}>
                    <label className="flex cursor-pointer items-start gap-4 p-5">
                      <input type="radio" name="payment" value={o.value} checked={method === o.value} onChange={() => setMethod(o.value)} className="mt-1 h-4 w-4 accent-ink" />
                      <span>
                        <span className="block font-sans text-[12px] uppercase tracking-wide2">{o.title}</span>
                        <span className="mt-1 block text-sm text-stone">{o.text}</span>
                      </span>
                    </label>
                    {method === 'Card Payment' && o.value === 'Card Payment' && (
                      <div className="grid gap-6 bg-white/50 px-5 pb-6 pt-2 sm:grid-cols-2">
                        <Field label="Card number" error={errors.cardNumber} className="sm:col-span-2">
                          <input className="field tracking-[0.12em]" inputMode="numeric" autoComplete="cc-number" value={card.number} onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })} placeholder="0000 0000 0000 0000" />
                        </Field>
                        <Field label="Expiry" error={errors.expiry}>
                          <input className="field" inputMode="numeric" autoComplete="cc-exp" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} placeholder="MM/YY" />
                        </Field>
                        <Field label="Security code" error={errors.cvc}>
                          <input className="field" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '') })} placeholder="CVC" />
                        </Field>
                        <Field label="Name on card" error={errors.cardName} className="sm:col-span-2">
                          <input className="field" autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
                        </Field>
                        <p className="flex items-center gap-2 text-xs text-stone sm:col-span-2">
                          <ShieldIcon size={14} className="text-gold" /> Your card details are sent securely and never stored — only the last four digits are kept for your receipt.
                        </p>
                      </div>
                    )}
                    {method === 'Online Payment' && o.value === 'Online Payment' && (
                      <div className="bg-white/50 px-5 pb-6 pt-2">
                        <div className="flex flex-wrap gap-2">
                          {ONLINE.map((p) => (
                            <button key={p} type="button" onClick={() => setProvider(p)} className={`chip ${provider === p ? 'border-ink bg-ink text-ivory' : 'border-taupe hover:border-gold'}`}>
                              {p}
                            </button>
                          ))}
                        </div>
                        <p className="mt-4 text-sm text-stone">After you place your order we will show the {provider} details and your order reference. Your order is confirmed as soon as the transfer is received.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-5">
            <div className="card-panel p-8 lg:sticky lg:top-28">
              <div className="flex items-center justify-between">
                <p className="font-serif text-3xl">Your order</p>
                <p className="eyebrow">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </p>
              </div>
              {!quote ? (
                <Spinner />
              ) : (
                <>
                  <ul className="mt-8 max-h-[320px] space-y-5 overflow-y-auto pr-1">
                    {quote.items.map((l) => (
                      <li key={l.variantId} className="flex gap-4">
                        <div className="relative h-20 w-16 shrink-0 bg-taupe/40">
                          <ProductImage src={l.image} alt={l.name} className="h-full w-full object-contain p-1" />
                          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-ivory">{l.quantity}</span>
                        </div>
                        <div className="flex flex-1 justify-between gap-3">
                          <div>
                            <p className="font-serif text-xl leading-tight">{l.name}</p>
                            <p className="text-xs text-stone">{l.size}</p>
                          </div>
                          <p className="text-sm">{formatPrice(l.price * l.quantity)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 border-t border-taupe pt-8">
                    <CouponForm />
                  </div>
                  <div className={`mt-8 transition-opacity ${syncing ? 'opacity-60' : ''}`}>
                    <Totals subtotal={quote.subtotal} discount={quote.discount} shipping={quote.shipping} total={quote.total} couponCode={quote.couponCode} />
                  </div>
                </>
              )}
              <button type="submit" disabled={placing || !quote || syncing} className="btn-dark mt-8 w-full">
                {placing ? 'Placing your order…' : method === 'Card Payment' ? `Pay ${quote ? formatPrice(quote.total) : ''}` : 'Place order'}
              </button>
              <p className="mt-4 text-center text-xs text-stone">
                By placing your order you agree to our{' '}
                <Link to="/terms" className="underline underline-offset-4">
                  terms
                </Link>
                .
              </p>
              <div className="mt-8 flex justify-center opacity-70">
                <Logo compact />
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
