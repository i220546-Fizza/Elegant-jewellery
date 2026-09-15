const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const slugify = require('../utils/slugify');

// @desc    Get products with search, filter, sort & pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    sort,
    featured,
    bestseller,
    page = 1,
    limit = 12,
  } = req.query;

  const query = {};

  if (search) {
    query.$text = { $search: search };
  }
  if (category && category !== 'all') {
    query.category = category;
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (featured === 'true') query.featured = true;
  if (bestseller === 'true') query.bestseller = true;

  let sortOption = { createdAt: -1 };
  if (sort === 'price-asc') sortOption = { price: 1 };
  else if (sort === 'price-desc') sortOption = { price: -1 };
  else if (sort === 'newest') sortOption = { createdAt: -1 };
  else if (sort === 'name-asc') sortOption = { name: 1 };
  else if (sort === 'rating') sortOption = { rating: -1 };

  const pageNum = Math.max(1, Number(page));
  const pageSize = Math.max(1, Math.min(48, Number(limit)));

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    products,
    page: pageNum,
    pages: Math.ceil(total / pageSize) || 1,
    total,
  });
});

// @desc    Get single product by id or slug
// @route   GET /api/products/:idOrSlug
// @access  Public
const getProductByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isValidId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);

  const product = isValidId
    ? await Product.findById(idOrSlug)
    : await Product.findOne({ slug: idOrSlug });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @desc    Get related products (same category, excluding current)
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  }).limit(4);
  res.json({ success: true, products: related });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    compareAtPrice,
    category,
    material,
    images,
    sizes,
    stock,
    featured,
    bestseller,
    isNewArrival,
  } = req.body;

  if (!name || !description || !price || !category || !material || !images?.length) {
    res.status(400);
    throw new Error('Please provide name, description, price, category, material and at least one image');
  }

  let slug = slugify(name);
  const slugExists = await Product.findOne({ slug });
  if (slugExists) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const product = await Product.create({
    name,
    slug,
    description,
    price,
    compareAtPrice: compareAtPrice || null,
    category,
    material,
    images,
    sizes: sizes || [],
    stock: stock ?? 0,
    featured: !!featured,
    bestseller: !!bestseller,
    isNewArrival: !!isNewArrival,
  });

  res.status(201).json({ success: true, product });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const fields = [
    'name',
    'description',
    'price',
    'compareAtPrice',
    'category',
    'material',
    'images',
    'sizes',
    'stock',
    'featured',
    'bestseller',
    'isNewArrival',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  if (req.body.name && req.body.name !== product.name) {
    let slug = slugify(req.body.name);
    const slugExists = await Product.findOne({ slug, _id: { $ne: product._id } });
    product.slug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;
  }

  const updated = await product.save();
  res.json({ success: true, product: updated });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product removed' });
});

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  if (!rating || !comment) {
    res.status(400);
    throw new Error('Please provide a rating and comment');
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ success: true, message: 'Review added' });
});

module.exports = {
  getProducts,
  getProductByIdOrSlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};
