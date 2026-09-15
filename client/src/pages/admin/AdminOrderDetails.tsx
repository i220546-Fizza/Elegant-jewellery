import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Order, OrderStatus } from '../../types';
import { fetchOrderById, updateOrderStatus } from '../../services/orderService';
import { getErrorMessage } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    document.title = 'Order Details | Elegant Jewellery Admin';
    if (!id) return;
    fetchOrderById(id)
      .then(setOrder)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(order._id, status);
      setOrder(updated);
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen label="Loading order" />;
  if (!order) {
    return (
      <div className="text-center">
        <p className="text-brown-light">Order not found.</p>
        <Link to="/admin/orders" className="btn-secondary mt-4 inline-flex">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/orders" className="text-xs uppercase tracking-widest text-champagne-dark hover:underline">
        &larr; Back to Orders
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-brown-dark">Order #{order._id.slice(-8).toUpperCase()}</h1>
        <select
          value={order.status}
          disabled={updating}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          className="input-luxe max-w-[200px]"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card-luxe p-6">
          <h2 className="mb-4 font-display text-lg text-brown-dark">Order Items</h2>
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
          <div className="mt-6 space-y-2 border-t border-brown-dark/10 pt-4 text-sm">
            <div className="flex justify-between text-brown-light"><span>Subtotal</span><span>{formatCurrency(order.itemsPrice)}</span></div>
            <div className="flex justify-between text-brown-light"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : formatCurrency(order.shippingPrice)}</span></div>
            <div className="flex justify-between border-t border-brown-dark/10 pt-2 text-base font-medium text-brown-dark"><span>Total</span><span>{formatCurrency(order.totalPrice)}</span></div>
          </div>
          {order.orderNotes && (
            <div className="mt-4 rounded-lg bg-cream p-3 text-sm text-brown-dark">
              <span className="font-medium">Order Notes: </span>{order.orderNotes}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card-luxe p-6">
            <h2 className="mb-3 font-display text-lg text-brown-dark">Customer</h2>
            <p className="text-sm text-brown-light">{order.customerInfo.name}</p>
            <p className="text-sm text-brown-light">{order.customerInfo.email}</p>
            <p className="text-sm text-brown-light">{order.customerInfo.phone}</p>
          </div>
          <div className="card-luxe p-6">
            <h2 className="mb-3 font-display text-lg text-brown-dark">Shipping Address</h2>
            <p className="text-sm text-brown-light">{order.shippingAddress.address}</p>
            <p className="text-sm text-brown-light">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            <p className="text-sm text-brown-light">{order.shippingAddress.country}</p>
          </div>
          <div className="card-luxe p-6">
            <h2 className="mb-3 font-display text-lg text-brown-dark">Payment</h2>
            <p className="text-sm text-brown-light">{order.paymentMethod}</p>
            <p className="mt-2 text-xs text-brown-light">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
