const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

const FIELDS = ['code', 'description', 'type', 'value', 'minOrder', 'maxDiscount', 'usageLimit', 'expiresAt', 'isActive'];
const pick = (body) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f] === '' && f === 'expiresAt' ? null : body[f]]));

const listCoupons = asyncHandler(async (req, res) => {
  res.json({ success: true, coupons: await Coupon.find().sort({ createdAt: -1 }) });
});

const createCoupon = asyncHandler(async (req, res) => {
  const data = pick(req.body);
  if (!data.code || data.value === undefined) {
    res.status(400);
    throw new Error('Code and value are required');
  }
  if (data.type === 'percent' && (data.value <= 0 || data.value > 90)) {
    res.status(400);
    throw new Error('Percentage discounts must be between 1 and 90');
  }
  res.status(201).json({ success: true, coupon: await Coupon.create(data) });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Discount code not found');
  }
  Object.assign(coupon, pick(req.body));
  await coupon.save();
  res.json({ success: true, coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = { listCoupons, createCoupon, updateCoupon, deleteCoupon };
