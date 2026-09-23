const Coupon = require('../models/Coupon');

const FREE_SHIPPING_THRESHOLD = Number(process.env.FREE_SHIPPING_THRESHOLD) || 20000;
const SHIPPING_FEE = Number(process.env.SHIPPING_FEE) || 450;

const shippingFor = (subtotalAfterDiscount) =>
  subtotalAfterDiscount === 0 || subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

// Resolve a coupon code against a subtotal. Throws a user-facing error when invalid.
const resolveCoupon = async (code, subtotal) => {
  if (!code) return { coupon: null, discount: 0 };
  const coupon = await Coupon.findOne({ code: String(code).trim().toUpperCase() });
  if (!coupon) throw new Error('That discount code is not valid');
  const discount = coupon.evaluate(subtotal);
  return { coupon, discount };
};

module.exports = { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, shippingFor, resolveCoupon };
