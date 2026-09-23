const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    value: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: 0, min: 0 }, // 0 = no cap
    usageLimit: { type: Number, default: 0, min: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Returns { discount, message } for a given subtotal, or throws a user-facing Error.
couponSchema.methods.evaluate = function evaluate(subtotal) {
  if (!this.isActive) throw new Error('This code is no longer active');
  if (this.expiresAt && this.expiresAt < new Date()) throw new Error('This code has expired');
  if (this.usageLimit && this.usedCount >= this.usageLimit) throw new Error('This code has reached its usage limit');
  if (subtotal < this.minOrder) throw new Error(`This code requires a minimum order of PKR ${this.minOrder.toLocaleString()}`);
  let discount = this.type === 'percent' ? Math.round((subtotal * this.value) / 100) : this.value;
  if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  return Math.min(discount, subtotal);
};

module.exports = mongoose.model('Coupon', couponSchema);
