import { Link } from 'react-router-dom';
import type { Order } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Processing: 'bg-indigo-100 text-indigo-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

interface Props {
  orders: Order[];
}

const OrderTable = ({ orders }: Props) => (
  <div className="card-luxe overflow-x-auto">
    <table className="w-full min-w-[720px] text-sm">
      <thead>
        <tr className="border-b border-brown-dark/10 text-left text-xs uppercase tracking-widest text-brown-light">
          <th className="p-4">Order ID</th>
          <th className="p-4">Customer</th>
          <th className="p-4">Date</th>
          <th className="p-4">Total</th>
          <th className="p-4">Status</th>
          <th className="p-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order._id} className="border-b border-brown-dark/5 last:border-none">
            <td className="p-4 font-medium text-brown-dark">#{order._id.slice(-8).toUpperCase()}</td>
            <td className="p-4 text-brown-light">{order.customerInfo.name}</td>
            <td className="p-4 text-brown-light">{formatDate(order.createdAt)}</td>
            <td className="p-4 text-brown-dark">{formatCurrency(order.totalPrice)}</td>
            <td className="p-4">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                {order.status}
              </span>
            </td>
            <td className="p-4 text-right">
              <Link to={`/admin/orders/${order._id}`} className="text-xs uppercase tracking-widest text-champagne-dark hover:underline">
                View
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default OrderTable;
