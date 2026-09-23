const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

const populated = (userId) =>
  Wishlist.findOne({ user: userId }).populate({ path: 'products', match: { isActive: true } });

// @route   GET /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await populated(req.user._id);
  res.json({ success: true, products: wishlist ? wishlist.products.filter(Boolean) : [] });
});

// @route   POST /api/wishlist/:productId   - toggles
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.isValidObjectId(productId) || !(await Product.exists({ _id: productId }))) {
    res.status(404);
    throw new Error('Product not found');
  }
  const wishlist = (await Wishlist.findOne({ user: req.user._id })) || new Wishlist({ user: req.user._id, products: [] });
  const index = wishlist.products.findIndex((id) => id.toString() === productId);
  const added = index === -1;
  if (added) wishlist.products.push(productId);
  else wishlist.products.splice(index, 1);
  await wishlist.save();
  res.json({ success: true, added, ids: wishlist.products.map(String) });
});

// @route   POST /api/wishlist/merge   body: { ids } - merges a guest wishlist after sign-in
const mergeWishlist = asyncHandler(async (req, res) => {
  const ids = (Array.isArray(req.body.ids) ? req.body.ids : []).filter((id) => mongoose.isValidObjectId(id));
  await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $addToSet: { products: { $each: ids } } },
    { upsert: true, setDefaultsOnInsert: true }
  );
  const wishlist = await populated(req.user._id);
  res.json({ success: true, products: wishlist ? wishlist.products.filter(Boolean) : [] });
});

module.exports = { getWishlist, toggleWishlist, mergeWishlist };
