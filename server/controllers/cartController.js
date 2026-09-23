const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const { hydrateItems } = require('../utils/cartHydrate');
const { shippingFor, resolveCoupon, FREE_SHIPPING_THRESHOLD } = require('../utils/pricing');

const toRaw = (lines) =>
  lines.filter((l) => l.quantity > 0).map((l) => ({ product: l.product, variantId: l.variantId, quantity: l.quantity }));

const buildQuote = async (rawItems, couponCode) => {
  const lines = await hydrateItems(rawItems);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  let discount = 0;
  let couponError = '';
  let appliedCode = '';
  if (couponCode) {
    try {
      ({ discount } = await resolveCoupon(couponCode, subtotal));
      appliedCode = String(couponCode).trim().toUpperCase();
    } catch (err) {
      couponError = err.message;
    }
  }
  const shipping = lines.length ? shippingFor(subtotal - discount) : 0;
  return {
    items: lines,
    couponCode: appliedCode,
    couponError,
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  };
};

// @route   POST /api/cart/quote   (public) body: { items, couponCode }
const quoteCart = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await buildQuote(req.body.items, req.body.couponCode)) });
});

// @route   GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const quote = await buildQuote(cart ? cart.items : [], cart ? cart.couponCode : '');
  res.json({ success: true, ...quote });
});

// @route   PUT /api/cart   body: { items, couponCode }  - replaces the saved cart
const saveCart = asyncHandler(async (req, res) => {
  const quote = await buildQuote(req.body.items, req.body.couponCode);
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: toRaw(quote.items), couponCode: quote.couponCode },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, ...quote });
});

// @route   POST /api/cart/merge   body: { items } - merges a guest cart after sign-in
const mergeCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const existing = cart ? cart.items.map((i) => ({ product: i.product.toString(), variantId: i.variantId.toString(), quantity: i.quantity })) : [];
  const incoming = Array.isArray(req.body.items) ? req.body.items : [];
  // Guest lines replace (not add to) matching saved lines so re-merging never doubles quantities.
  const keyOf = (i) => `${i.product}:${i.variantId}`;
  const incomingKeys = new Set(incoming.map(keyOf));
  const combined = [...existing.filter((i) => !incomingKeys.has(keyOf(i))), ...incoming];
  const quote = await buildQuote(combined, req.body.couponCode || (cart && cart.couponCode));
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: toRaw(quote.items), couponCode: quote.couponCode },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, ...quote });
});

module.exports = { quoteCart, getCart, saveCart, mergeCart, buildQuote };
