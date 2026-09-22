import Product from '../models/Product.js';
import { useCloudinary } from '../middleware/uploadMiddleware.js';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';
import { slugify } from '../utils/slugify.js';

export async function getProducts(req, res, next) {
  try {
    const { category, search, featured, bestseller, newArrival, limitedEdition } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (bestseller === 'true') filter.isBestseller = true;
    if (newArrival === 'true') filter.isNewArrival = true;
    if (limitedEdition === 'true') filter.isLimitedEdition = true;
    if (search) filter.$text = { $search: search };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function resolveImageUrl(req) {
  if (!req.file) return null;
  if (useCloudinary) {
    const result = await uploadBufferToCloudinary(req.file.buffer);
    return result.secure_url;
  }
  return `/uploads/products/${req.file.filename}`;
}

function parseBool(value, fallback = false) {
  if (value === undefined) return fallback;
  return value === 'true' || value === true;
}

export async function createProduct(req, res, next) {
  try {
    const { name, description, category, price, stock, ingredients } = req.body;

    if (!name || !description || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'Name, description, category, price and stock are required' });
    }

    const imageUrl = await resolveImageUrl(req);
    if (!imageUrl) {
      return res.status(400).json({ message: 'A product image is required' });
    }

    let slug = slugify(name);
    const slugExists = await Product.findOne({ slug });
    if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;

    const product = await Product.create({
      name,
      slug,
      description,
      category,
      price: Number(price),
      stock: Number(stock),
      images: [imageUrl],
      ingredients: ingredients ? ingredients.split(',').map((i) => i.trim()).filter(Boolean) : [],
      isAvailable: parseBool(req.body.isAvailable, true),
      isFeatured: parseBool(req.body.isFeatured),
      isBestseller: parseBool(req.body.isBestseller),
      isNewArrival: parseBool(req.body.isNewArrival),
      isLimitedEdition: parseBool(req.body.isLimitedEdition),
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, category, price, stock, ingredients } = req.body;

    if (name && name !== product.name) {
      product.name = name;
      let slug = slugify(name);
      const slugExists = await Product.findOne({ slug, _id: { $ne: product._id } });
      product.slug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;
    }
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (ingredients !== undefined) {
      product.ingredients = ingredients.split(',').map((i) => i.trim()).filter(Boolean);
    }
    if (req.body.isAvailable !== undefined) product.isAvailable = parseBool(req.body.isAvailable);
    if (req.body.isFeatured !== undefined) product.isFeatured = parseBool(req.body.isFeatured);
    if (req.body.isBestseller !== undefined) product.isBestseller = parseBool(req.body.isBestseller);
    if (req.body.isNewArrival !== undefined) product.isNewArrival = parseBool(req.body.isNewArrival);
    if (req.body.isLimitedEdition !== undefined) product.isLimitedEdition = parseBool(req.body.isLimitedEdition);

    const imageUrl = await resolveImageUrl(req);
    if (imageUrl) product.images = [imageUrl];

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
}
