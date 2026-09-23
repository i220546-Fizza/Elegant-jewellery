const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');

const DAY = 24 * 60 * 60 * 1000;

const inventorySummary = async () => {
  const products = await Product.find().select('name slug images variants lowStockThreshold isActive bottle fragranceFamily');
  let totalUnits = 0;
  let inventoryValue = 0;
  const low = [];
  let outOfStock = 0;
  products.forEach((p) => {
    p.variants.forEach((v) => {
      totalUnits += v.stock;
      inventoryValue += v.stock * v.price;
      if (v.stock === 0) outOfStock += 1;
      if (v.stock <= p.lowStockThreshold) {
        low.push({ productId: p._id, name: p.name, slug: p.slug, image: p.images[0] || '', bottle: p.bottle, variantId: v._id, size: v.size, stock: v.stock });
      }
    });
  });
  low.sort((a, b) => a.stock - b.stock);
  return { totalUnits, inventoryValue, lowStockCount: low.length, outOfStockCount: outOfStock, lowStock: low.slice(0, 12), productCount: products.length };
};

// @route   GET /api/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
  const since = new Date(Date.now() - (days - 1) * DAY);
  since.setHours(0, 0, 0, 0);
  const notCancelled = { status: { $ne: 'Cancelled' } };

  const [revenueAgg, totalOrders, totalCustomers, statusAgg, trendAgg, bestsellers, recentOrders, paymentAgg, inventory, newCustomers] =
    await Promise.all([
      Order.aggregate([{ $match: notCancelled }, { $group: { _id: null, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } }]),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { ...notCancelled, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$totalPrice' },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $match: notCancelled },
        { $unwind: '$orderItems' },
        {
          $group: {
            _id: '$orderItems.product',
            name: { $first: '$orderItems.name' },
            image: { $first: '$orderItems.image' },
            units: { $sum: '$orderItems.quantity' },
            revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          },
        },
        { $sort: { units: -1 } },
        { $limit: 5 },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(6),
      Order.aggregate([{ $match: notCancelled }, { $group: { _id: '$paymentMethod', total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }]),
      inventorySummary(),
      User.countDocuments({ role: 'customer', createdAt: { $gte: since } }),
    ]);

  const statusCounts = Object.fromEntries(Order.STATUSES.map((s) => [s, 0]));
  statusAgg.forEach((s) => {
    statusCounts[s._id] = s.count;
  });

  const trendMap = new Map(trendAgg.map((t) => [t._id, t]));
  const salesTrend = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(since.getTime() + i * DAY).toISOString().slice(0, 10);
    salesTrend.push({ date: d, total: trendMap.get(d)?.total || 0, orders: trendMap.get(d)?.orders || 0 });
  }

  const productIds = bestsellers.map((b) => b._id);
  const bestsellerProducts = await Product.find({ _id: { $in: productIds } }).select('slug bottle images');
  const productMap = new Map(bestsellerProducts.map((p) => [p._id.toString(), p]));

  const revenue = revenueAgg[0]?.revenue || 0;
  const paidOrders = revenueAgg[0]?.count || 0;

  res.json({
    success: true,
    stats: {
      totalRevenue: revenue,
      totalOrders,
      totalCustomers,
      newCustomers,
      averageOrderValue: paidOrders ? Math.round(revenue / paidOrders) : 0,
      periodRevenue: salesTrend.reduce((s, d) => s + d.total, 0),
      periodDays: days,
      statusCounts,
      salesTrend,
      paymentBreakdown: paymentAgg.map((p) => ({ method: p._id, total: p.total, count: p.count })),
      bestsellers: bestsellers.map((b) => ({
        productId: b._id,
        name: b.name,
        image: b.image,
        units: b.units,
        revenue: b.revenue,
        slug: productMap.get(b._id.toString())?.slug || '',
        bottle: productMap.get(b._id.toString())?.bottle,
      })),
      inventory,
      recentOrders,
    },
  });
});

// @route   GET /api/admin/inventory?status=all|low|out
const getInventory = asyncHandler(async (req, res) => {
  const products = await Product.find().select('name slug images variants lowStockThreshold isActive bottle fragranceFamily soldCount').sort({ name: 1 });
  const status = req.query.status || 'all';
  const rows = products
    .map((p) => {
      const total = p.variants.reduce((s, v) => s + v.stock, 0);
      const low = p.variants.some((v) => v.stock <= p.lowStockThreshold);
      const out = p.variants.every((v) => v.stock === 0);
      return { ...p.toJSON(), totalStock: total, isLow: low, isOut: out };
    })
    .filter((r) => (status === 'low' ? r.isLow : status === 'out' ? r.isOut : true));
  res.json({ success: true, products: rows, summary: await inventorySummary() });
});

// @route   GET /api/admin/customers
const getCustomers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20, role } = req.query;
  const match = {};
  if (role && role !== 'all') match.role = role;
  if (search) {
    const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    match.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(limit) || 20));

  const [customers, total] = await Promise.all([
    User.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: (pageNum - 1) * pageSize },
      { $limit: pageSize },
      {
        $lookup: {
          from: 'orders',
          let: { uid: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user', '$$uid'] } } },
            { $group: { _id: null, count: { $sum: 1 }, spent: { $sum: { $cond: [{ $ne: ['$status', 'Cancelled'] }, '$totalPrice', 0] } }, last: { $max: '$createdAt' } } },
          ],
          as: 'orderStats',
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          role: 1,
          isActive: 1,
          createdAt: 1,
          lastLoginAt: 1,
          orderCount: { $ifNull: [{ $arrayElemAt: ['$orderStats.count', 0] }, 0] },
          totalSpent: { $ifNull: [{ $arrayElemAt: ['$orderStats.spent', 0] }, 0] },
          lastOrderAt: { $arrayElemAt: ['$orderStats.last', 0] },
        },
      },
    ]),
    User.countDocuments(match),
  ]);

  res.json({ success: true, customers, total, page: pageNum, pages: Math.ceil(total / pageSize) || 1 });
});

// @route   GET /api/admin/customers/:id
const getCustomer = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Customer not found');
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Customer not found');
  }
  const [orders, reviews] = await Promise.all([
    Order.find({ user: user._id }).sort({ createdAt: -1 }),
    Review.find({ user: user._id }).populate('product', 'name slug').sort({ createdAt: -1 }),
  ]);
  res.json({ success: true, customer: { ...user.toPublic(), isActive: user.isActive, lastLoginAt: user.lastLoginAt }, orders, reviews });
});

// @route   PUT /api/admin/customers/:id   body: { isActive, role }
const updateCustomer = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Customer not found');
  }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot change your own access from here');
  }
  if (req.body.isActive !== undefined) user.isActive = !!req.body.isActive;
  if (req.body.role && ['customer', 'admin'].includes(req.body.role)) user.role = req.body.role;
  await user.save();
  res.json({ success: true, customer: { ...user.toPublic(), isActive: user.isActive } });
});

// @route   DELETE /api/admin/customers/:id   (orders are kept for accounting)
const deleteCustomer = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Customer not found');
  }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }
  const reviewed = await Review.find({ user: user._id }).distinct('product');
  await Promise.all([
    user.deleteOne(),
    Wishlist.deleteOne({ user: user._id }),
    Cart.deleteOne({ user: user._id }),
    Review.deleteMany({ user: user._id }),
    Order.updateMany({ user: user._id }, { user: null }),
  ]);
  await Promise.all(reviewed.map((pid) => Review.recalculate(pid)));
  res.json({ success: true });
});

module.exports = { getDashboardStats, getInventory, getCustomers, getCustomer, updateCustomer, deleteCustomer };
