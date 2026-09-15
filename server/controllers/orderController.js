const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

const FREE_SHIPPING_THRESHOLD = 15000;
const SHIPPING_FEE = 350;

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public (works for guests and logged-in customers)
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, customerInfo, shippingAddress, orderNotes, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }
  if (!customerInfo?.name || !customerInfo?.email || !customerInfo?.phone) {
    res.status(400);
    throw new Error('Please provide your name, email and phone number');
  }
  if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.postalCode) {
    res.status(400);
    throw new Error('Please provide a complete shipping address');
  }

  const dbProducts = await Product.find({ _id: { $in: orderItems.map((i) => i.product) } });

  let itemsPrice = 0;
  const verifiedItems = orderItems.map((item) => {
    const dbProduct = dbProducts.find((p) => p._id.toString() === item.product);
    if (!dbProduct) {
      res.status(400);
      throw new Error(`Product ${item.name || item.product} is no longer available`);
    }
    if (dbProduct.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${dbProduct.name}`);
    }
    itemsPrice += dbProduct.price * item.quantity;
    return {
      product: dbProduct._id,
      name: dbProduct.name,
      image: dbProduct.images[0],
      price: dbProduct.price,
      size: item.size || '',
      quantity: item.quantity,
    };
  });

  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const totalPrice = itemsPrice + shippingPrice;

  const order = await Order.create({
    user: req.user ? req.user._id : null,
    orderItems: verifiedItems,
    customerInfo,
    shippingAddress,
    orderNotes: orderNotes || '',
    paymentMethod: paymentMethod || 'Cash on Delivery',
    itemsPrice,
    shippingPrice,
    totalPrice,
  });

  await Promise.all(
    verifiedItems.map((item) => Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } }))
  );

  res.status(201).json({ success: true, order });
});

// @desc    Get order by id
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isOwner = order.user && req.user && order.user.toString() === req.user._id.toString();
  const isAdmin = req.user && req.user.role === 'admin';
  const isGuestMatch = !order.user && req.query.email === order.customerInfo.email;

  if (!isOwner && !isAdmin && !isGuestMatch) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, order });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status && status !== 'all') query.status = status;

  const pageNum = Math.max(1, Number(page));
  const pageSize = Math.max(1, Math.min(100, Number(limit)));

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize),
    Order.countDocuments(query),
  ]);

  res.json({ success: true, orders, page: pageNum, pages: Math.ceil(total / pageSize) || 1, total });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const validStatuses = Order.STATUSES;
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  order.status = status;
  if (status === 'Delivered') order.deliveredAt = new Date();
  await order.save();

  res.json({ success: true, order });
});

module.exports = { createOrder, getOrderById, getMyOrders, getAllOrders, updateOrderStatus };
