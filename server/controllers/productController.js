const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const slugify = require('../utils/slugify');

const EDITABLE_FIELDS = [
  'name',
  'tagline',
  'description',
  'story',
  'gender',
  'categories',
  'fragranceFamily',
  'concentration',
  'notes',
  'ingredients',
  'longevity',
  'sillage',
  'variants',
  'discountPercent',
  'images',
  'model3d',
  'bottle',
  'featured',
  'signatureOrder',
  'bestseller',
  'isNewArrival',
  'isActive',
  'lowStockThreshold',
];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const uniqueSlug = async (name, excludeId) => {
  const base = slugify(name) || 'fragrance';
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await Product.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
};

// @route   GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    gender,
    family,
    minPrice,
    maxPrice,
    sort,
    featured,
    bestseller,
    newArrival,
    stock,
    page = 1,
    limit = 12,
  } = req.query;

  const isAdmin = req.user && req.user.role === 'admin';
  const query = {};
  if (!(isAdmin && req.query.all === 'true')) query.isActive = true;

  if (search) {
    const rx = new RegExp(escapeRegex(String(search).trim()), 'i');
    query.$or = [
      { name: rx },
      { tagline: rx },
      { fragranceFamily: rx },
      { 'notes.top': rx },
      { 'notes.heart': rx },
      { 'notes.base': rx },
    ];
  }
  if (category && category !== 'all') {
    const cat = await Category.findOne({ slug: category });
    if (!cat) {
      res.json({ success: true, products: [], page: 1, pages: 1, total: 0 });
      return;
    }
    query.categories = cat._id;
  }
  if (gender && ['women', 'men', 'unisex'].includes(gender)) query.gender = gender;
  if (req.query.ids) {
    query._id = { $in: String(req.query.ids).split(',').filter((id) => mongoose.isValidObjectId(id)).slice(0, 60) };
  }
  if (family) query.fragranceFamily = new RegExp(`^${escapeRegex(family)}$`, 'i');
  if (minPrice || maxPrice) {
    query.basePrice = {};
    if (minPrice) query.basePrice.$gte = Number(minPrice);
    if (maxPrice) query.basePrice.$lte = Number(maxPrice);
  }
  if (featured === 'true') query.featured = true;
  if (bestseller === 'true') query.bestseller = true;
  if (newArrival === 'true') query.isNewArrival = true;
  if (isAdmin && stock === 'out') query['variants.stock'] = { $not: { $gt: 0 } };

  const sorts = {
    'price-asc': { basePrice: 1 },
    'price-desc': { basePrice: -1 },
    newest: { createdAt: -1 },
    'name-asc': { name: 1 },
    rating: { rating: -1, numReviews: -1 },
    popular: { soldCount: -1 },
    signature: { signatureOrder: 1 },
  };
  const sortOption = sorts[sort] || { featured: -1, bestseller: -1, createdAt: -1 };

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Math.min(60, Number(limit) || 12));

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('categories', 'name slug kind')
      .sort(sortOption)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize),
    Product.countDocuments(query),
  ]);

  res.json({ success: true, products, page: pageNum, pages: Math.ceil(total / pageSize) || 1, total });
});

// @route   GET /api/products/meta
const getProductMeta = asyncHandler(async (req, res) => {
  const [families, priceRange] = await Promise.all([
    Product.distinct('fragranceFamily', { isActive: true }),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, min: { $min: '$basePrice' }, max: { $max: '$basePrice' } } },
    ]),
  ]);
  res.json({
    success: true,
    families: families.sort(),
    priceRange: priceRange[0] ? { min: priceRange[0].min, max: priceRange[0].max } : { min: 0, max: 0 },
  });
});

// @route   GET /api/products/:idOrSlug
const getProductByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const filter = mongoose.isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };
  const product = await Product.findOne(filter).populate('categories', 'name slug kind');

  const isAdmin = req.user && req.user.role === 'admin';
  if (!product || (!product.isActive && !isAdmin)) {
    res.status(404);
    throw new Error('This fragrance could not be found');
  }
  res.json({ success: true, product });
});

// @route   GET /api/products/:id/related
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('This fragrance could not be found');
  }
  const related = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [{ fragranceFamily: product.fragranceFamily }, { gender: product.gender }, { categories: { $in: product.categories } }],
  })
    .sort({ rating: -1 })
    .limit(4);
  res.json({ success: true, products: related });
});

const sanitizeBody = (body) => {
  const data = {};
  EDITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });
  if (Array.isArray(data.variants)) {
    data.variants = data.variants.map((v) => ({
      ...(v._id && mongoose.isValidObjectId(v._id) ? { _id: v._id } : {}),
      size: String(v.size || '').trim(),
      price: Number(v.price),
      stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
      sku: v.sku || '',
    }));
  }
  if (data.notes) {
    const clean = (arr) => (Array.isArray(arr) ? arr.map((n) => String(n).trim()).filter(Boolean) : []);
    data.notes = { top: clean(data.notes.top), heart: clean(data.notes.heart), base: clean(data.notes.base) };
  }
  if (Array.isArray(data.categories)) {
    data.categories = data.categories.filter((id) => mongoose.isValidObjectId(id));
  }
  return data;
};

// @route   POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const data = sanitizeBody(req.body);
  if (!data.name || !data.description || !data.fragranceFamily) {
    res.status(400);
    throw new Error('Please provide a name, description and fragrance family');
  }
  data.slug = await uniqueSlug(data.name);
  const product = new Product(data);
  await product.save();
  await product.populate('categories', 'name slug kind');
  res.status(201).json({ success: true, product });
});

// @route   PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const data = sanitizeBody(req.body);
  if (data.name && data.name !== product.name) {
    product.slug = await uniqueSlug(data.name, product._id);
  }
  Object.assign(product, data);
  await product.save();
  await product.populate('categories', 'name slug kind');
  res.json({ success: true, product });
});

// @route   PATCH /api/products/:id/stock   body: { variants: [{ _id, stock }] }
const updateStock = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  (req.body.variants || []).forEach(({ _id, stock }) => {
    const variant = product.variants.id(_id);
    if (variant) variant.stock = Math.max(0, Math.floor(Number(stock) || 0));
  });
  await product.save();
  res.json({ success: true, product });
});

// @route   DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await Promise.all([
    product.deleteOne(),
    Review.deleteMany({ product: product._id }),
    Wishlist.updateMany({}, { $pull: { products: product._id } }),
    Cart.updateMany({}, { $pull: { items: { product: product._id } } }),
  ]);
  res.json({ success: true, message: 'Product removed' });
});

// @route   GET /api/products/:id/reviews
const getProductReviews = asyncHandler(async (req, res) => {
  const pageSize = Math.min(20, Number(req.query.limit) || 6);
  const pageNum = Math.max(1, Number(req.query.page) || 1);
  const filter = { product: req.params.id };
  const [reviews, total, breakdown] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize),
    Review.countDocuments(filter),
    Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(req.params.id) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]),
  ]);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  breakdown.forEach((b) => {
    distribution[b._id] = b.count;
  });
  res.json({ success: true, reviews, total, page: pageNum, pages: Math.ceil(total / pageSize) || 1, distribution });
});

// @route   POST /api/products/:id/reviews
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const numericRating = Number(rating);
  if (!numericRating || numericRating < 1 || numericRating > 5 || !comment || !String(comment).trim()) {
    res.status(400);
    throw new Error('Please choose a rating and write a short review');
  }
  if (await Review.exists({ product: product._id, user: req.user._id })) {
    res.status(400);
    throw new Error('You have already reviewed this fragrance');
  }

  const verifiedPurchase = Boolean(
    await Order.exists({ user: req.user._id, 'orderItems.product': product._id, status: { $ne: 'Cancelled' } })
  );

  const review = await Review.create({
    product: product._id,
    user: req.user._id,
    name: req.user.name,
    rating: Math.round(numericRating),
    title: title || '',
    comment,
    verifiedPurchase,
  });
  await Review.recalculate(product._id);
  res.status(201).json({ success: true, review });
});

// @route   DELETE /api/products/:id/reviews/:reviewId   (author or admin)
const deleteProductReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.reviewId, product: req.params.id });
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only delete your own review');
  }
  await review.deleteOne();
  await Review.recalculate(review.product);
  res.json({ success: true });
});

module.exports = {
  getProducts,
  getProductMeta,
  getProductByIdOrSlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
  getProductReviews,
  createProductReview,
  deleteProductReview,
};
