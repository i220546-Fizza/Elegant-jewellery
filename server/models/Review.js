const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '', trim: true, maxlength: 100 },
    comment: { type: String, required: [true, 'Please write a short review'], trim: true, maxlength: 2000 },
    verifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Keep the denormalised rating / numReviews on the product in sync.
reviewSchema.statics.recalculate = async function recalculate(productId) {
  const [agg] = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await mongoose.model('Product').findByIdAndUpdate(productId, {
    rating: agg ? Math.round(agg.avg * 10) / 10 : 0,
    numReviews: agg ? agg.count : 0,
  });
};

module.exports = mongoose.model('Review', reviewSchema);
