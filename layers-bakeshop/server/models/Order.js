import mongoose from 'mongoose';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    size: { type: String },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const shippingInfoSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: {
      type: [orderItemSchema],
      validate: { validator: (arr) => arr.length > 0, message: 'Order must contain at least one item' },
    },
    shippingInfo: { type: shippingInfoSchema, required: true },
    paymentMethod: { type: String, enum: ['Cash on Delivery', 'Online Payment'], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'Pending' },
  },
  { timestamps: true },
);

export const ORDER_STATUS_VALUES = ORDER_STATUSES;
export const OrderItemSchema = orderItemSchema;
export default mongoose.model('Order', orderSchema);
