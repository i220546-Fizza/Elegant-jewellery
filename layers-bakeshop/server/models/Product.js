import mongoose from 'mongoose';

const CATEGORIES = ['Cakes', 'Cupcakes', 'Brownies', 'Cookies', 'Donuts', 'Desserts', 'Sundaes', 'Beverages'];

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const sizeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    ingredients: [{ type: String, trim: true }],
    category: { type: String, required: true, enum: CATEGORIES },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    sizes: [sizeSchema],
    images: {
      type: [String],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one product image is required',
      },
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    stock: { type: Number, required: true, min: 0, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isLimitedEdition: { type: Boolean, default: false },
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', description: 'text' });

productSchema.pre('validate', function ensureAvailability(next) {
  if (this.stock === 0) this.isAvailable = false;
  next();
});

export const PRODUCT_CATEGORIES = CATEGORIES;
export default mongoose.model('Product', productSchema);
