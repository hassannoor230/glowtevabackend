"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariantByOptions = exports.generateVariants = exports.deleteVariant = exports.updateVariant = exports.addVariant = exports.replaceVariants = void 0;
const Product_js_1 = require("../models/Product.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
const normalizeOptions = (options) => Object.fromEntries(Object.entries(options).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key.trim(), value.trim()]));
const sameOptions = (left, right) => JSON.stringify(normalizeOptions(left)) === JSON.stringify(normalizeOptions(right));
const validateVariantSet = (variants) => {
    const skus = new Set();
    const combinations = {};
    for (const variant of variants) {
        if (!variant.sku?.trim())
            throw new Error('Every variant requires a SKU');
        if (skus.has(variant.sku.trim().toLowerCase()))
            throw new Error(`Duplicate variant SKU: ${variant.sku}`);
        skus.add(variant.sku.trim().toLowerCase());
        const key = JSON.stringify(normalizeOptions(variant.options || {}));
        if (combinations[key])
            throw new Error('Duplicate variant combination');
        combinations[key] = true;
    }
};
exports.replaceVariants = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const product = await Product_js_1.Product.findById(req.params.productId);
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    const variants = Array.isArray(req.body.variants) ? req.body.variants : [];
    const options = Array.isArray(req.body.options) ? req.body.options : [];
    try {
        validateVariantSet(variants);
    }
    catch (validationError) {
        return (0, apiResponse_js_1.error)(res, validationError.message, 400);
    }
    const optionNames = new Set(options.map((option) => option.name?.trim().toLowerCase()));
    if (optionNames.size !== options.length || options.some((option) => !option.name || !Array.isArray(option.values) || option.values.length === 0)) {
        return (0, apiResponse_js_1.error)(res, 'Variation attributes must have unique names and at least one value', 400);
    }
    if (variants.some((variant) => Object.keys(variant.options || {}).some((name) => !optionNames.has(name.trim().toLowerCase())))) {
        return (0, apiResponse_js_1.error)(res, 'Variant options must match the product attributes', 400);
    }
    product.options = options;
    product.variants = variants;
    await product.save();
    return (0, apiResponse_js_1.success)(res, { options: product.options, variants: product.variants }, 'Variants saved');
});
exports.addVariant = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const product = await Product_js_1.Product.findById(req.params.productId);
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    const variant = req.body;
    if (!variant.sku || !variant.options)
        return (0, apiResponse_js_1.error)(res, 'SKU and options are required', 400);
    if (product.variants.some((item) => item.sku.toLowerCase() === variant.sku.toLowerCase()))
        return (0, apiResponse_js_1.error)(res, 'Variant SKU already exists', 409);
    if (product.variants.some((item) => sameOptions(item.options, variant.options)))
        return (0, apiResponse_js_1.error)(res, 'Variant combination already exists', 409);
    product.variants.push(variant);
    await product.save();
    return (0, apiResponse_js_1.success)(res, product.variants[product.variants.length - 1], 'Variant created', 201);
});
exports.updateVariant = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const product = await Product_js_1.Product.findById(req.params.productId);
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    const variant = product.variants.find((item) => item._id?.toString() === req.params.variantId);
    if (!variant)
        return (0, apiResponse_js_1.error)(res, 'Variant not found', 404);
    const duplicateSku = product.variants.some((item) => item._id.toString() !== variant._id.toString() && item.sku.toLowerCase() === req.body.sku?.toLowerCase());
    if (duplicateSku)
        return (0, apiResponse_js_1.error)(res, 'Variant SKU already exists', 409);
    Object.assign(variant, req.body);
    await product.save();
    return (0, apiResponse_js_1.success)(res, variant, 'Variant updated');
});
exports.deleteVariant = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const product = await Product_js_1.Product.findById(req.params.productId);
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    const variant = product.variants.find((item) => item._id?.toString() === req.params.variantId);
    if (!variant)
        return (0, apiResponse_js_1.error)(res, 'Variant not found', 404);
    product.variants = product.variants.filter((item) => item._id?.toString() !== req.params.variantId);
    await product.save();
    return (0, apiResponse_js_1.success)(res, null, 'Variant deleted');
});
exports.generateVariants = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const product = await Product_js_1.Product.findById(req.params.productId);
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    const attributes = Array.isArray(req.body.options) ? req.body.options : product.options;
    const combinations = [];
    const build = (index, current) => {
        if (index === attributes.length) {
            combinations.push({ ...current });
            return;
        }
        for (const value of attributes[index].values || [])
            build(index + 1, { ...current, [attributes[index].name]: value });
    };
    build(0, {});
    const existing = product.variants.map((variant) => JSON.stringify(normalizeOptions(variant.options)));
    const generated = combinations.filter((options) => !existing.includes(JSON.stringify(normalizeOptions(options)))).map((options, index) => ({ sku: `${product.sku}-${index + 1}`, options, stock: 0, lowStockThreshold: 5, images: [], status: 'inactive' }));
    return (0, apiResponse_js_1.success)(res, { options: attributes, variants: generated }, 'Variant combinations generated');
});
exports.getVariantByOptions = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const options = req.query.options ? JSON.parse(req.query.options) : {};
    const product = await Product_js_1.Product.findById(productId);
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    const variant = product.variants.find((v) => sameOptions(v.options, options));
    if (!variant)
        return (0, apiResponse_js_1.error)(res, 'Variant not found', 404);
    return (0, apiResponse_js_1.success)(res, variant);
});
//# sourceMappingURL=variantController.js.map