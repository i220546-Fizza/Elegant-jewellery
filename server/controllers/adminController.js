const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

const LOW_STOCK_THRESHOLD = 5;

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalOrders, totalProducts, totalCustomers, orders, lowStockProducts, recentOrders] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Order.find({ status: { $ne: 'Cancelled' } }).select('totalPrice status createdAt'),
    Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD } })
      .select('name stock images category')
      .sort({ stock: 1 })
      .limit(10),
    Order.find().sort({ createdAt: -1 }).limit(5).select('customerInfo totalPrice status createdAt orderItems'),
  ]);

  const totalSales = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  const statusCounts = {};
  Order.STATUSES.forEach((s) => {
    statusCounts[s] = 0;
  });
  const allOrders = await Order.find().select('status');
  allOrders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const salesByDay = {};
  orders.forEach((o) => {
    const day = o.createdAt.toISOString().slice(0, 10);
    salesByDay[day] = (salesByDay[day] || 0) + o.totalPrice;
  });
  const salesTrend = Object.entries(salesByDay)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-14)
    .map(([date, total]) => ({ date, total }));

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalProducts,
      totalCustomers,
      totalSales,
      lowStockProducts,
      recentOrders,
      statusCounts,
      salesTrend,
    },
  });
});

module.exports = { getDashboardStats };
