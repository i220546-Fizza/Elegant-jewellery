const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Product = require('../models/Product');
const slugify = require('../utils/slugify');

// @route   GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const isAdmin = req.user && req.user.role === 'admin';
  const filter = isAdmin && req.query.all === 'true' ? {} : { isActive: true };
  const [categories, counts] = await Promise.all([
    Category.find(filter).sort({ kind: 1, order: 1, name: 1 }),
    Product.aggregate([{ $match: { isActive: true } }, { $unwind: '$categories' }, { $group: { _id: '$categories', count: { $sum: 1 } } }]),
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
  res.json({
    success: true,
    categories: categories.map((c) => ({ ...c.toObject(), productCount: countMap[c._id.toString()] || 0 })),
  });
});

const pick = (body) => {
  const data = {};
  ['name', 'description', 'image', 'kind', 'order', 'isActive'].forEach((f) => {
    if (body[f] !== undefined) data[f] = body[f];
  });
  return data;
};

// @route   POST /api/categories
const createCategory = asyncHandler(async (req, res) => {
  const data = pick(req.body);
  if (!data.name) {
    res.status(400);
    throw new Error('Category name is required');
  }
  data.slug = slugify(req.body.slug || data.name);
  const category = await Category.create(data);
  res.status(201).json({ success: true, category });
});

// @route   PUT /api/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  Object.assign(category, pick(req.body));
  if (req.body.slug) category.slug = slugify(req.body.slug);
  await category.save();
  res.json({ success: true, category });
});

// @route   DELETE /api/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  await Promise.all([category.deleteOne(), Product.updateMany({}, { $pull: { categories: category._id } })]);
  res.json({ success: true });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
