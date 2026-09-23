const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: '', trim: true },
    image: { type: String, default: '' },
    // "audience" categories (Women's / Men's / Unisex) and "collection" categories
    // (Oud, Signature, Limited, Gift Sets) are shown as two groups in the shop.
    kind: { type: String, enum: ['audience', 'collection'], default: 'collection' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
