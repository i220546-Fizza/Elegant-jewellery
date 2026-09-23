const mongoose = require('mongoose');

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_METHODS = ['Cash on Delivery', 'Card Payment', 'Online Payment'];
const PAYMENT_STATUSES = ['Pending', 'Paid', 'Awaiting Transfer', 'Refunded', 'Failed'];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    orderItems: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },
    customerInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      phone: { type: String, required: true },
    },
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: 'Pakistan' },
    },
    orderNotes: { type: String, default: '', maxlength: 500 },
    paymentMethod: { type: String, required: true, enum: PAYMENT_METHODS, default: 'Cash on Delivery' },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'Pending' },
    paymentDetails: {
      brand: { type: String, default: '' },
      last4: { type: String, default: '' },
      provider: { type: String, default: '' },
      reference: { type: String, default: '' },
    },
    couponCode: { type: String, default: '' },
    itemsPrice: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'Pending', index: true },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        note: { type: String, default: '' },
        at: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    trackingNumber: { type: String, default: '' },
    deliveredAt: { type: Date },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.pre('validate', function assignOrderNumber(next) {
  if (!this.orderNumber) {
    const stamp = Date.now().toString(36).toUpperCase().slice(-5);
    const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
    this.orderNumber = `NB-${stamp}${rand}`;
  }
  next();
});

orderSchema.statics.STATUSES = ORDER_STATUSES;
orderSchema.statics.PAYMENT_METHODS = PAYMENT_METHODS;
orderSchema.statics.PAYMENT_STATUSES = PAYMENT_STATUSES;

module.exports = mongoose.model('Order', orderSchema);
