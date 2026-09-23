const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { hydrateItems, MAX_QTY } = require('../utils/cartHydrate');
const { shippingFor, resolveCoupon } = require('../utils/pricing');
const { authorizeCard } = require('../utils/payments');
const { sendEmail } = require('../utils/sendEmail');

const required = (res, condition, message) => {
  if (!condition) {
    res.status(400);
    throw new Error(message);
  }
};

const restock = (items) =>
  Promise.all(
    items.map((item) =>
      Product.updateOne(
        { _id: item.product, 'variants._id': item.variantId },
        { $inc: { 'variants.$.stock': item.quantity, soldCount: -item.quantity } }
      )
    )
  );

const formatPKR = (n) => `PKR ${Number(n).toLocaleString('en-US')}`;

// @route   POST /api/orders   (guests and signed-in customers)
const createOrder = asyncHandler(async (req, res) => {
  const { items, customerInfo = {}, shippingAddress = {}, orderNotes, paymentMethod, card, couponCode, saveAddress } = req.body;

  required(res, Array.isArray(items) && items.length > 0, 'Your bag is empty');
  required(res, customerInfo.name && customerInfo.email && customerInfo.phone, 'Please provide your full name, email and phone number');
  required(res, /^\S+@\S+\.\S+$/.test(String(customerInfo.email)), 'Please provide a valid email address');
  required(
    res,
    shippingAddress.address && shippingAddress.city && shippingAddress.postalCode && shippingAddress.country,
    'Please provide a complete delivery address'
  );
  const method = paymentMethod || 'Cash on Delivery';
  required(res, Order.PAYMENT_METHODS.includes(method), 'Please choose a valid payment method');

  const lines = await hydrateItems(items);
  required(res, lines.length > 0, 'The fragrances in your bag are no longer available');
  lines.forEach((line) => {
    required(res, line.requestedQuantity <= MAX_QTY, `You can order up to ${MAX_QTY} of each fragrance`);
    required(res, line.stock >= line.requestedQuantity, `Only ${line.stock} of ${line.name} (${line.size}) left in stock`);
  });

  const itemsPrice = lines.reduce((sum, l) => sum + l.price * l.requestedQuantity, 0);
  let discountPrice = 0;
  let coupon = null;
  if (couponCode) {
    try {
      ({ coupon, discount: discountPrice } = await resolveCoupon(couponCode, itemsPrice));
    } catch (err) {
      res.status(400);
      throw err;
    }
  }
  const shippingPrice = shippingFor(itemsPrice - discountPrice);
  const totalPrice = itemsPrice - discountPrice + shippingPrice;

  // Authorise payment before touching stock so a declined card changes nothing.
  let paymentStatus = 'Pending';
  let paymentDetails = {};
  let paidAt;
  if (method === 'Card Payment') {
    try {
      const auth = authorizeCard(card || {});
      paymentDetails = { brand: auth.brand, last4: auth.last4, provider: 'Card', reference: auth.reference };
    } catch (err) {
      res.status(402);
      throw err;
    }
    paymentStatus = 'Paid';
    paidAt = new Date();
  } else if (method === 'Online Payment') {
    const provider = ['Bank Transfer', 'JazzCash', 'Easypaisa'].includes(req.body.onlineProvider) ? req.body.onlineProvider : 'Bank Transfer';
    paymentDetails = { provider, reference: '' };
    paymentStatus = 'Awaiting Transfer';
  }

  // Reserve stock atomically per line; roll back everything if any line fails.
  const reserved = [];
  for (const line of lines) {
    // eslint-disable-next-line no-await-in-loop
    const result = await Product.updateOne(
      { _id: line.product, variants: { $elemMatch: { _id: line.variantId, stock: { $gte: line.requestedQuantity } } } },
      { $inc: { 'variants.$.stock': -line.requestedQuantity, soldCount: line.requestedQuantity } }
    );
    if (result.modifiedCount !== 1) {
      // eslint-disable-next-line no-await-in-loop
      await restock(reserved);
      res.status(409);
      throw new Error(`${line.name} (${line.size}) just sold out. Please review your bag`);
    }
    reserved.push({ product: line.product, variantId: line.variantId, quantity: line.requestedQuantity });
  }

  let order;
  try {
    order = await Order.create({
      user: req.user ? req.user._id : null,
      orderItems: lines.map((l) => ({
        product: l.product,
        variantId: l.variantId,
        name: l.name,
        image: l.image,
        size: l.size,
        price: l.price,
        quantity: l.requestedQuantity,
      })),
      customerInfo: {
        name: String(customerInfo.name).trim(),
        email: String(customerInfo.email).trim(),
        phone: String(customerInfo.phone).trim(),
      },
      shippingAddress,
      orderNotes: orderNotes || '',
      paymentMethod: method,
      paymentStatus,
      paymentDetails,
      paidAt,
      couponCode: coupon ? coupon.code : '',
      itemsPrice,
      discountPrice,
      shippingPrice,
      totalPrice,
      statusHistory: [{ status: 'Pending', note: 'Order placed' }],
    });
  } catch (err) {
    await restock(reserved);
    throw err;
  }

  if (coupon) await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });

  if (req.user) {
    await Cart.updateOne({ user: req.user._id }, { items: [], couponCode: '' });
    if (saveAddress) {
      const user = await User.findById(req.user._id);
      const exists = user.addresses.some(
        (a) => a.address === shippingAddress.address && a.city === shippingAddress.city && a.postalCode === shippingAddress.postalCode
      );
      if (!exists && user.addresses.length < 10) {
        user.addresses.push({
          label: 'Home',
          fullName: customerInfo.name,
          phone: customerInfo.phone,
          ...shippingAddress,
          isDefault: user.addresses.length === 0,
        });
        if (!user.phone) user.phone = customerInfo.phone;
        await user.save();
      }
    }
  }

  sendEmail({
    to: order.customerInfo.email,
    subject: `Your NB Classic Scents order ${order.orderNumber}`,
    text: `Thank you, ${order.customerInfo.name}.\n\nWe have received your order ${order.orderNumber}.\nView it any time: ${(process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim()}/order/${order._id}?email=${encodeURIComponent(order.customerInfo.email)}\n\n${order.orderItems
      .map((i) => `${i.quantity} x ${i.name} (${i.size}) - ${formatPKR(i.price * i.quantity)}`)
      .join('\n')}\n\nTotal: ${formatPKR(order.totalPrice)}\nPayment: ${order.paymentMethod}\n\nNB Classic Scents`,
  }).catch((err) => console.error(`Order email failed: ${err.message}`));

  res.status(201).json({ success: true, order });
});

const canView = (order, req) => {
  const isOwner = order.user && req.user && order.user.toString() === req.user._id.toString();
  const isAdmin = req.user && req.user.role === 'admin';
  const email = String(req.query.email || '').toLowerCase();
  // Anyone holding the order link plus the checkout email may view it (guest checkout).
  const isGuestMatch = email && email === order.customerInfo.email;
  return isOwner || isAdmin || isGuestMatch;
};

// @route   GET /api/orders/:id   (owner, admin, or guest with ?email=)
const getOrderById = asyncHandler(async (req, res) => {
  const order = mongoose.isValidObjectId(req.params.id) ? await Order.findById(req.params.id) : null;
  if (!order || !canView(order, req)) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json({ success: true, order });
});

// @route   GET /api/orders/lookup?orderNumber=&email=   (guest order tracking)
const lookupOrder = asyncHandler(async (req, res) => {
  const orderNumber = String(req.query.orderNumber || '').trim().toUpperCase();
  const email = String(req.query.email || '').trim().toLowerCase();
  const order = orderNumber && email ? await Order.findOne({ orderNumber, 'customerInfo.email': email }) : null;
  if (!order) {
    res.status(404);
    throw new Error('We could not find an order with those details');
  }
  res.json({ success: true, order });
});

// @route   GET /api/orders/my-orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @route   PUT /api/orders/:id/cancel   (customer, while still Pending/Confirmed)
const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || !order.user || order.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (!['Pending', 'Confirmed'].includes(order.status)) {
    res.status(400);
    throw new Error('This order is already being prepared and can no longer be cancelled online. Please contact us');
  }
  order.status = 'Cancelled';
  order.statusHistory.push({ status: 'Cancelled', note: 'Cancelled by customer' });
  if (order.paymentStatus === 'Paid') order.paymentStatus = 'Refunded';
  await order.save();
  await restock(order.orderItems);
  res.json({ success: true, order });
});

// @route   GET /api/orders   (admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, payment, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status && status !== 'all') query.status = status;
  if (payment && payment !== 'all') query.paymentMethod = payment;
  if (search) {
    const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ orderNumber: rx }, { 'customerInfo.name': rx }, { 'customerInfo.email': rx }, { 'customerInfo.phone': rx }];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(limit) || 20));

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize),
    Order.countDocuments(query),
  ]);

  res.json({ success: true, orders, page: pageNum, pages: Math.ceil(total / pageSize) || 1, total });
});

// @route   PUT /api/orders/:id/status   (admin) body: { status, note, trackingNumber, paymentStatus }
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingNumber, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (status && status !== order.status) {
    if (!Order.STATUSES.includes(status)) {
      res.status(400);
      throw new Error(`Status must be one of: ${Order.STATUSES.join(', ')}`);
    }
    if (order.status === 'Cancelled') {
      res.status(400);
      throw new Error('Cancelled orders cannot be reopened. Please create a new order');
    }
    order.status = status;
    order.statusHistory.push({ status, note: note || '' });
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'Cash on Delivery' && order.paymentStatus !== 'Paid') {
        order.paymentStatus = 'Paid';
        order.paidAt = new Date();
      }
    }
    if (status === 'Cancelled') {
      await restock(order.orderItems);
      if (order.paymentStatus === 'Paid') order.paymentStatus = 'Refunded';
    }
  }
  if (trackingNumber !== undefined) order.trackingNumber = String(trackingNumber).trim();
  if (paymentStatus && Order.PAYMENT_STATUSES.includes(paymentStatus) && paymentStatus !== order.paymentStatus) {
    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'Paid' && !order.paidAt) order.paidAt = new Date();
  }

  await order.save();
  res.json({ success: true, order });
});

module.exports = { lookupOrder, createOrder, getOrderById, getMyOrders, cancelMyOrder, getAllOrders, updateOrderStatus };
