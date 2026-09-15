import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { DashboardStats } from '../../types';
import { fetchDashboardStats } from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';
import SalesTrendChart from '../../components/SalesTrendChart';
import { BagIcon, GiftIcon, SparkleIcon, UserIcon } from '../../components/Icons';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Admin Dashboard | Elegant Jewellery';
    fetchDashboardStats()
      .then(setStats)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen label="Loading dashboard" />;
  if (!stats) return null;

  return (
    <div>
      <h1 className="font-display text-3xl text-brown-dark">Dashboard</h1>
      <p className="mt-1 text-sm text-brown-light">Overview of your store's performance</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={stats.totalOrders} icon={<BagIcon width={22} height={22} />} />
        <StatCard label="Total Sales" value={formatCurrency(stats.totalSales)} icon={<SparkleIcon width={22} height={22} />} />
        <StatCard label="Total Products" value={stats.totalProducts} icon={<GiftIcon width={22} height={22} />} />
        <StatCard label="Total Customers" value={stats.totalCustomers} icon={<UserIcon width={22} height={22} />} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="card-luxe p-6">
          <h2 className="mb-4 font-display text-lg text-brown-dark">Sales Trend (Last 14 Days)</h2>
          <SalesTrendChart data={stats.salesTrend} />
        </div>

        <div className="card-luxe p-6">
          <h2 className="mb-4 font-display text-lg text-brown-dark">Orders by Status</h2>
          <div className="space-y-3">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="text-brown-light">{status}</span>
                <span className="font-medium text-brown-dark">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-luxe p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg text-brown-dark">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs uppercase tracking-widest text-champagne-dark hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.length === 0 && <p className="text-sm text-brown-light">No orders yet.</p>}
            {stats.recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between border-b border-brown-dark/5 pb-3 text-sm">
                <div>
                  <p className="text-brown-dark">{order.customerInfo.name}</p>
                  <p className="text-xs text-brown-light">{formatDate(order.createdAt)}</p>
                </div>
                <span className="font-medium text-brown-dark">{formatCurrency(order.totalPrice)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-luxe p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg text-brown-dark">Low Stock Alerts</h2>
            <Link to="/admin/products" className="text-xs uppercase tracking-widest text-champagne-dark hover:underline">
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {stats.lowStockProducts.length === 0 && <p className="text-sm text-brown-light">All products are well stocked.</p>}
            {stats.lowStockProducts.map((p) => (
              <div key={p._id} className="flex items-center gap-3 border-b border-brown-dark/5 pb-3 text-sm">
                <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded-lg bg-beige object-cover" />
                <span className="flex-1 text-brown-dark">{p.name}</span>
                <span className="font-medium text-red-500">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
