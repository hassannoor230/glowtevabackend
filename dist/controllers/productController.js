"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelated = exports.getBestSellers = exports.getFeatured = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProductBySlug = exports.getProducts = void 0;
const Product_js_1 = require("../models/Product.js");
const Category_js_1 = require("../models/Category.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
const product_js_1 = require("../validators/product.js");
const slugify_js_1 = require("../utils/slugify.js");
exports.getProducts = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const query = product_js_1.productQuerySchema.parse(req.query);
    const filter = { status: 'active' };
    if (query.category) {
        const cat = await Category_js_1.Category.findOne({ $or: [{ slug: query.category }, { name: query.category }] }).lean();
        if (cat?.parent) {
            filter.category = cat.name;
        }
        else if (cat && (!cat.parent || cat.parent === null)) {
            const childSlugs = await Category_js_1.Category.find({ parent: cat._id }).select('name slug').lean();
            const catNames = [cat.name, ...childSlugs.map(c => c.name)];
            filter.category = { $in: catNames };
        }
        else {
            filter.category = query.category;
        }
    }
    if (query.productType)
        filter.productType = query.productType;
    if (query.skinConcern)
        filter.skinConcerns = query.skinConcern;
    if (query.ingredient)
        filter.ingredients = { $regex: query.ingredient, $options: 'i' };
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        filter.price = {};
        if (query.minPrice !== undefined)
            filter.price.$gte = query.minPrice;
        if (query.maxPrice !== undefined)
            filter.price.$lte = query.maxPrice;
    }
    if (query.rating !== undefined)
        filter.rating = { $gte: query.rating };
    if (query.inStock)
        filter.stock = { $gt: 0 };
    if (query.featured)
        filter.featured = true;
    if (query.bestSeller)
        filter.bestSeller = true;
    if (query.newArrival)
        filter.newArrival = true;
    if (query.tags)
        filter.tags = { $in: query.tags.split(',') };
    if (query.onSale)
        filter.compareAtPrice = { $exists: true, $gt: 0 };
    if (query.search)
        filter.$text = { $search: query.search };
    let sort = { createdAt: -1 };
    switch (query.sort) {
        case 'price-asc':
            sort = { price: 1 };
            break;
        case 'price-desc':
            sort = { price: -1 };
            break;
        case 'rating':
            sort = { rating: -1 };
            break;
        case 'name':
            sort = { name: 1 };
            break;
    }
    const skip = (query.page - 1) * query.limit;
    const [products, total] = await Promise.all([
        Product_js_1.Product.find(filter).sort(sort).skip(skip).limit(query.limit).lean(),
        Product_js_1.Product.countDocuments(filter),
    ]);
    return (0, apiResponse_js_1.success)(res, {
        products,
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            pages: Math.ceil(total / query.limit),
        },
    });
});
exports.getProductBySlug = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const product = await Product_js_1.Product.findOne({ slug: req.params.slug, status: 'active' }).lean();
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    return (0, apiResponse_js_1.success)(res, product);
});
exports.getProductById = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const product = await Product_js_1.Product.findById(req.params.id).lean();
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    return (0, apiResponse_js_1.success)(res, product);
});
exports.createProduct = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const data = product_js_1.productSchema.parse(req.body);
    const slug = (0, slugify_js_1.slugify)(data.name);
    const existing = await Product_js_1.Product.findOne({ slug });
    if (existing)
        return (0, apiResponse_js_1.error)(res, 'Product with this name already exists', 409);
    const product = await Product_js_1.Product.create({ ...data, slug });
    return (0, apiResponse_js_1.success)(res, product, 'Product created', 201);
});
exports.updateProduct = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const data = product_js_1.productSchema.partial().parse(req.body);
    const updateData = { ...data };
    if (data.name) {
        updateData.slug = (0, slugify_js_1.slugify)(data.name);
    }
    const product = await Product_js_1.Product.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
    });
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    return (0, apiResponse_js_1.success)(res, product, 'Product updated');
});
exports.deleteProduct = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const product = await Product_js_1.Product.findByIdAndDelete(req.params.id);
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    return (0, apiResponse_js_1.success)(res, null, 'Product deleted');
});
exports.getFeatured = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const products = await Product_js_1.Product.find({ status: 'active', featured: true }).limit(8).lean();
    return (0, apiResponse_js_1.success)(res, products);
});
exports.getBestSellers = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const products = await Product_js_1.Product.find({ status: 'active', bestSeller: true }).limit(8).lean();
    return (0, apiResponse_js_1.success)(res, products);
});
exports.getRelated = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const product = await Product_js_1.Product.findById(req.params.id);
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    const related = await Product_js_1.Product.find({
        _id: { $ne: product._id },
        status: 'active',
        $or: [{ category: product.category }, { productType: product.productType }],
    }).limit(4).lean();
    return (0, apiResponse_js_1.success)(res, related);
});
//# sourceMappingURL=productController.js.map