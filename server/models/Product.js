const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: { type: String, required: [true, 'Variant size is required'], trim: true }, // e.g. "50 ml"
  price: { type: Number, required: [true, 'Variant price is required'], min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  sku: { type: String, trim: true, default: '' },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    tagline: { type: String, default: '', trim: true, maxlength: 140 },
    description: { type: String, required: [true, 'Description is required'] },
    story: { type: String, default: '' },
    gender: { type: String, enum: ['women', 'men', 'unisex'], default: 'unisex' },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true }],
    fragranceFamily: { type: String, required: [true, 'Fragrance family is required'], trim: true },
    concentration: { type: String, default: 'Eau de Parfum', trim: true },
    notes: {
      top: { type: [String], default: [] },
      heart: { type: [String], default: [] },
      base: { type: [String], default: [] },
    },
    ingredients: { type: String, default: '' },
    longevity: { type: String, default: '' },
    sillage: { type: String, default: '' },
    variants: {
      type: [variantSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one size / price variant is required',
      },
    },
    discountPercent: { type: Number, min: 0, max: 90, default: 0 },
    // Denormalised lowest (discounted) price so the shop can sort / filter in the database.
    basePrice: { type: Number, default: 0, index: true },
    images: { type: [String], default: [] },
    model3d: { type: String, default: '' },
    // Parameters for the procedural 3D bottle rendered when no GLB model is uploaded.
    bottle: {
      shape: { type: String, enum: ['classic', 'tall', 'round', 'facet', 'flacon'], default: 'classic' },
      liquid: { type: String, default: '#E9D9AE' },
      cap: { type: String, enum: ['gold', 'black', 'ivory'], default: 'gold' },
      glass: { type: String, enum: ['clear', 'smoke', 'black'], default: 'clear' },
    },
    featured: { type: Boolean, default: false },
    signatureOrder: { type: Number, default: 0 },
    bestseller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', tagline: 'text', description: 'text', fragranceFamily: 'text', 'notes.top': 'text', 'notes.heart': 'text', 'notes.base': 'text' });

const applyDiscount = (price, discount) => Math.round(price * (1 - (discount || 0) / 100));

productSchema.virtual('stock').get(function stock() {
  return (this.variants || []).reduce((sum, v) => sum + v.stock, 0);
});
productSchema.virtual('price').get(function price() {
  const prices = (this.variants || []).map((v) => applyDiscount(v.price, this.discountPercent));
  return prices.length ? Math.min(...prices) : 0;
});
productSchema.virtual('inStock').get(function inStock() {
  return this.stock > 0;
});

productSchema.pre('save', function syncBasePrice(next) {
  const prices = (this.variants || []).map((v) => applyDiscount(v.price, this.discountPercent));
  this.basePrice = prices.length ? Math.min(...prices) : 0;
  next();
});

productSchema.statics.applyDiscount = applyDiscount;

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
