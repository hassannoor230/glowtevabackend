import { Response } from 'express';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/apiResponse.js';
import { productSchema, productQuerySchema } from '../validators/product.js';
import { slugify } from '../utils/slugify.js';
import { AuthRequest } from '../middleware/auth.js';

export const getProducts = asyncHandler(async (req, res) => {
  const query = productQuerySchema.parse(req.query);
  const filter: any = { status: 'active' };

  if (query.category) {
    const cat = await Category.findOne({ $or: [{ slug: query.category }, { name: query.category }] }).lean();
    if (cat?.parent) {
      filter.category = cat.name;
    } else if (cat && (!cat.parent || cat.parent === null)) {
      const childSlugs = await Category.find({ parent: cat._id }).select('name slug').lean();
      const catNames = [cat.name, ...childSlugs.map(c => c.name)];
      filter.category = { $in: catNames };
    } else {
      filter.category = query.category;
    }
  }
  if (query.productType) filter.productType = query.productType;
  if (query.skinConcern) filter.skinConcerns = query.skinConcern;
  if (query.ingredient) filter.ingredients = { $regex: query.ingredient, $options: 'i' };
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }
  if (query.rating !== undefined) filter.rating = { $gte: query.rating };
  if (query.inStock) filter.stock = { $gt: 0 };
  if (query.featured) filter.featured = true;
  if (query.bestSeller) filter.bestSeller = true;
  if (query.newArrival) filter.newArrival = true;
  if (query.tags) filter.tags = { $in: query.tags.split(',') };
  if (query.onSale) filter.compareAtPrice = { $exists: true, $gt: 0 };
  if (query.search) filter.$text = { $search: query.search };

  let sort: any = { createdAt: -1 };
  switch (query.sort) {
    case 'price-asc': sort = { price: 1 }; break;
    case 'price-desc': sort = { price: -1 }; break;
    case 'rating': sort = { rating: -1 }; break;
    case 'name': sort = { name: 1 }; break;
  }

  const skip = (query.page - 1) * query.limit;
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(query.limit).lean(),
    Product.countDocuments(filter),
  ]);

  return success(res, {
    products,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit),
    },
  });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, status: 'active' }).lean();
  if (!product) return error(res, 'Product not found', 404);
  return success(res, product);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) return error(res, 'Product not found', 404);
  return success(res, product);
});

export const createProduct = asyncHandler(async (req: AuthRequest, res) => {
  const data = productSchema.parse(req.body);
  const slug = slugify(data.name);
  const existing = await Product.findOne({ slug });
  if (existing) return error(res, 'Product with this name already exists', 409);

  const product = await Product.create({ ...data, slug });
  return success(res, product, 'Product created', 201);
});

export const updateProduct = asyncHandler(async (req: AuthRequest, res) => {
  const data = productSchema.partial().parse(req.body);
  const updateData = { ...data } as typeof data & { slug?: string };
  if (data.name) {
    updateData.slug = slugify(data.name);
  }
  const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!product) return error(res, 'Product not found', 404);
  return success(res, product, 'Product updated');
});

export const deleteProduct = asyncHandler(async (req: AuthRequest, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return error(res, 'Product not found', 404);
  return success(res, null, 'Product deleted');
});

export const getFeatured = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: 'active', featured: true }).limit(8).lean();
  return success(res, products);
});

export const getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: 'active', bestSeller: true }).limit(8).lean();
  return success(res, products);
});

export const getRelated = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return error(res, 'Product not found', 404);
  const related = await Product.find({
    _id: { $ne: product._id },
    status: 'active',
    $or: [{ category: product.category }, { productType: product.productType }],
  }).limit(4).lean();
  return success(res, related);
});
