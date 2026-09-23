const mongoose = require('mongoose');
const Product = require('../models/Product');

const MAX_QTY = 20;

// Turns raw cart lines ({ product, variantId, quantity }) into priced lines using
// live database prices and stock. Lines whose product/variant disappeared are dropped.
const hydrateItems = async (rawItems = []) => {
  const valid = (Array.isArray(rawItems) ? rawItems : []).filter(
    (i) => i && mongoose.isValidObjectId(i.product) && mongoose.isValidObjectId(i.variantId)
  );
  const products = await Product.find({ _id: { $in: valid.map((i) => i.product) }, isActive: true });
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const merged = new Map();
  valid.forEach((i) => {
    const key = `${i.product}:${i.variantId}`;
    const qty = Math.max(1, Math.floor(Number(i.quantity) || 1));
    merged.set(key, { product: String(i.product), variantId: String(i.variantId), quantity: (merged.get(key)?.quantity || 0) + qty });
  });

  const lines = [];
  merged.forEach((line) => {
    const product = byId.get(line.product);
    const variant = product && product.variants.id(line.variantId);
    if (!product || !variant) return;
    const unitPrice = Product.applyDiscount(variant.price, product.discountPercent);
    lines.push({
      product: product._id.toString(),
      variantId: variant._id.toString(),
      slug: product.slug,
      name: product.name,
      image: product.images[0] || '',
      bottle: product.bottle,
      fragranceFamily: product.fragranceFamily,
      size: variant.size,
      price: unitPrice,
      originalPrice: variant.price,
      stock: variant.stock,
      quantity: Math.min(line.quantity, MAX_QTY, Math.max(variant.stock, 0)) || 0,
      requestedQuantity: line.quantity,
    });
  });
  return lines;
};

module.exports = { hydrateItems, MAX_QTY };
