import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { getErrorMessage } from '../services/api';
import { formatCurrency } from '../utils/format';
import { ShieldIcon, TruckIcon } from '../components/Icons';

const FREE_SHIPPING_THRESHOLD = 15000;
const SHIPPING_FEE = 350;

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address?.address || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'Pakistan',
    orderNotes: '',
  });

  useEffect(() => {
    document.title = 'Checkout | Elegant Jewellery';
  }, []);

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.postalCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        orderItems: items.map((i) => ({
          product: i.product,
          name: i.name,
          image: i.image,
          price: i.price,
          size: i.size,
          quantity: i.quantity,
        })),
        customerInfo: { name: form.name, email: form.email, phone: form.phone },
        shippingAddress: {
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        },
        orderNotes: form.orderNotes,
        paymentMethod: 'Cash on Delivery',
      });
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${order._id}`, { state: { guestEmail: form.email } });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-luxe py-12">
      <h1 className="section-heading mb-10 text-center">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <div className="card-luxe p-6">
            <h2 className="mb-5 font-display text-xl text-brown-dark">Customer Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input required name="name" value={form.name} onChange={handleChange} placeholder="Full Name *" className="input-luxe" />
              <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email Address *" className="input-luxe" />
              <input required name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number *" className="input-luxe sm:col-span-2" />
            </div>
          </div>

          <div className="card-luxe p-6">
            <h2 className="mb-5 font-display text-xl text-brown-dark">Delivery Address</h2>
            <div className="grid grid-cols-1 gap-4">
              <input required name="address" value={form.address} onChange={handleChange} placeholder="Street Address *" className="input-luxe" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <input required name="city" value={form.city} onChange={handleChange} placeholder="City *" className="input-luxe" />
                <input required name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Postal Code *" className="input-luxe" />
                <input required name="country" value={form.country} onChange={handleChange} placeholder="Country *" className="input-luxe" />
              </div>
              <textarea
                name="orderNotes"
                value={form.orderNotes}
                onChange={handleChange}
                placeholder="Order notes (optional) - delivery instructions, gift message, etc."
                className="input-luxe min-h-[90px]"
              />
            </div>
          </div>

          <div className="card-luxe p-6">
            <h2 className="mb-5 font-display text-xl text-brown-dark">Payment Method</h2>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-champagne-dark bg-champagne/10 p-4">
              <input type="radio" checked readOnly name="paymentMethod" />
              <div>
                <p className="font-medium text-brown-dark">Cash on Delivery</p>
                <p className="text-xs text-brown-light">Pay with cash when your order arrives at your doorstep.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="card-luxe h-fit space-y-5 p-6">
          <h2 className="font-display text-xl text-brown-dark">Order Summary</h2>
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={`${item.product}-${item.size}`} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg bg-beige object-cover" />
                <div className="flex-1 text-sm">
                  <p className="text-brown-dark">{item.name}</p>
                  <p className="text-xs text-brown-light">
                    {item.size && `Size: ${item.size} · `}Qty: {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium text-brown-dark">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-brown-dark/10 pt-4 text-sm">
            <div className="flex justify-between text-brown-light">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-brown-light">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-brown-dark/10 pt-2 text-base font-medium text-brown-dark">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
          <div className="space-y-2 border-t border-brown-dark/10 pt-4 text-xs text-brown-light">
            <p className="flex items-center gap-2"><ShieldIcon width={16} height={16} /> Secure & confidential checkout</p>
            <p className="flex items-center gap-2"><TruckIcon width={16} height={16} /> Estimated delivery in 3-5 business days</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
