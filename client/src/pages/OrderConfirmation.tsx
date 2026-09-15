import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Order } from '../types';
import { fetchOrderById } from '../services/orderService';
import { getErrorMessage } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckIcon, TruckIcon } from '../components/Icons';

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const guestEmail = (location.state as { guestEmail?: string } | null)?.guestEmail;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Order Confirmed | Elegant Jewellery';
    if (!id) return;
    fetchOrderById(id, guestEmail)
      .then(setOrder)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, guestEmail]);

  if (loading) return <LoadingSpinner fullScreen label="Loading your order" />;

  if (!order) {
    return (
      <div className="container-luxe py-24 text-center">
        <h1 className="font-display text-2xl text-brown-dark">Order not found</h1>
        <Link to="/shop" className="btn-secondary mt-6 inline-flex">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-luxe py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-champagne/20 text-champagne-dark">
          <CheckIcon width={30} height={30} />
        </span>
        <h1 className="mt-6 font-display text-3xl text-brown-dark sm:text-4xl">Thank you for your order!</h1>
        <p className="mt-3 text-brown-light">
          A confirmation has been recorded for your order. We're preparing your pieces with care.
        </p>
      </div>

      <div className="card-luxe mx-auto mt-10 max-w-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brown-dark/10 pb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-brown-light">Order ID</p>
            <p className="font-display text-lg text-brown-dark">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-brown-light">Order Date</p>
            <p className="text-brown-dark">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-brown-light">Status</p>
            <span className="rounded-full bg-champagne/20 px-3 py-1 text-xs font-medium text-champagne-dark">
              {order.status}
            </span>
          </div>
        </div>

        <div className="border-b border-brown-dark/10 py-6">
          <h2 className="mb-4 font-display text-lg text-brown-dark">Ordered Items</h2>
          <div className="space-y-4">
            {order.orderItems.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl bg-beige object-cover" />
                <div className="flex-1">
                  <p className="text-brown-dark">{item.name}</p>
                  <p className="text-xs text-brown-light">
                    {item.size && `Size: ${item.size} · `}Qty: {item.quantity}
                  </p>
                </div>
                <span className="font-medium text-brown-dark">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between text-brown-light">
              <span>Subtotal</span>
              <span>{formatCurrency(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between text-brown-light">
              <span>Shipping</span>
              <span>{order.shippingPrice === 0 ? 'Free' : formatCurrency(order.shippingPrice)}</span>
            </div>
            <div className="flex justify-between border-t border-brown-dark/10 pt-2 text-base font-medium text-brown-dark">
              <span>Total</span>
              <span>{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 font-display text-lg text-brown-dark">Customer Information</h3>
            <p className="text-sm text-brown-light">{order.customerInfo.name}</p>
            <p className="text-sm text-brown-light">{order.customerInfo.email}</p>
            <p className="text-sm text-brown-light">{order.customerInfo.phone}</p>
          </div>
          <div>
            <h3 className="mb-2 font-display text-lg text-brown-dark">Delivery Information</h3>
            <p className="text-sm text-brown-light">{order.shippingAddress.address}</p>
            <p className="text-sm text-brown-light">
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            </p>
            <p className="text-sm text-brown-light">{order.shippingAddress.country}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-cream p-4 text-sm text-brown-dark">
          <TruckIcon width={22} height={22} className="text-champagne-dark" />
          Estimated delivery within 3-5 business days. We'll notify you as your order progresses.
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-4">
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
        <Link to="/profile" className="btn-secondary">View My Orders</Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
