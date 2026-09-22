import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export async function getDashboardStats(req, res, next) {
  try {
    const [totalOrders, totalProducts, totalCustomers, orders] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.find().sort({ createdAt: -1 }),
    ]);

    const totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter((o) => o.status === 'Pending').length;

    const revenueByDay = [];
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayRevenue = orders
        .filter((o) => o.createdAt >= day && o.createdAt < nextDay && o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.total, 0);

      revenueByDay.push({
        date: day.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayRevenue,
      });
    }

    const statusCounts = {};
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
    });
    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

    const productSales = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        productSales[item.name] = (productSales[item.name] ?? 0) + item.quantity;
      });
    });
    const topProducts = Object.entries(productSales)
      .map(([name, sold]) => ({ name, sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    res.json({
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      pendingOrders,
      revenueByDay,
      ordersByStatus,
      topProducts,
    });
  } catch (error) {
    next(error);
  }
}
