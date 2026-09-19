import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.js';

const normalizeOptions = (options: Record<string, string>) => Object.fromEntries(
  Object.entries(options).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key.trim(), value.trim()])
);

const sameOptions = (left: Record<string, string>, right: Record<string, string>) => JSON.stringify(normalizeOptions(left)) === JSON.stringify(normalizeOptions(right));

const validateVariantSet = (variants: any[]) => {
  const skus = new Set<string>();
  const combinations: Record<string, boolean> = {};
  for (const variant of variants) {
    if (!variant.sku?.trim()) throw new Error('Every variant requires a SKU');
    if (skus.has(variant.sku.trim().toLowerCase())) throw new Error(`Duplicate variant SKU: ${variant.sku}`);
    skus.add(variant.sku.trim().toLowerCase());
    const key = JSON.stringify(normalizeOptions(variant.options || {}));
    if (combinations[key]) throw new Error('Duplicate variant combination');
    combinations[key] = true;
  }
};

export const replaceVariants = asyncHandler(async (req: AuthRequest, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return error(res, 'Product not found', 404);
  const variants = Array.isArray(req.body.variants) ? req.body.variants : [];
  const options = Array.isArray(req.body.options) ? req.body.options : [];
  try {
    validateVariantSet(variants);
  } catch (validationError: any) {
    return error(res, validationError.message, 400);
  }
  const optionNames = new Set(options.map((option: any) => option.name?.trim().toLowerCase()));
  if (optionNames.size !== options.length || options.some((option: any) => !option.name || !Array.isArray(option.values) || option.values.length === 0)) {
    return error(res, 'Variation attributes must have unique names and at least one value', 400);
  }
  if (variants.some((variant: any) => Object.keys(variant.options || {}).some((name) => !optionNames.has(name.trim().toLowerCase())))) {
    return error(res, 'Variant options must match the product attributes', 400);
  }
  product.options = options;
  product.variants = variants;
  await product.save();
  return success(res, { options: product.options, variants: product.variants }, 'Variants saved');
});

export const addVariant = asyncHandler(async (req: AuthRequest, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return error(res, 'Product not found', 404);
  const variant = req.body;
  if (!variant.sku || !variant.options) return error(res, 'SKU and options are required', 400);
  if (product.variants.some((item: any) => item.sku.toLowerCase() === variant.sku.toLowerCase())) return error(res, 'Variant SKU already exists', 409);
  if (product.variants.some((item: any) => sameOptions(item.options, variant.options))) return error(res, 'Variant combination already exists', 409);
  product.variants.push(variant);
  await product.save();
  return success(res, product.variants[product.variants.length - 1], 'Variant created', 201);
});

export const updateVariant = asyncHandler(async (req: AuthRequest, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return error(res, 'Product not found', 404);
  const variant: any = product.variants.find((item: any) => item._id?.toString() === req.params.variantId);
  if (!variant) return error(res, 'Variant not found', 404);
  const duplicateSku = product.variants.some((item: any) => item._id.toString() !== variant._id.toString() && item.sku.toLowerCase() === req.body.sku?.toLowerCase());
  if (duplicateSku) return error(res, 'Variant SKU already exists', 409);
  Object.assign(variant, req.body);
  await product.save();
  return success(res, variant, 'Variant updated');
});

export const deleteVariant = asyncHandler(async (req: AuthRequest, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return error(res, 'Product not found', 404);
  const variant: any = product.variants.find((item: any) => item._id?.toString() === req.params.variantId);
  if (!variant) return error(res, 'Variant not found', 404);
  product.variants = product.variants.filter((item: any) => item._id?.toString() !== req.params.variantId) as any;
  await product.save();
  return success(res, null, 'Variant deleted');
});

export const generateVariants = asyncHandler(async (req: AuthRequest, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return error(res, 'Product not found', 404);
  const attributes = Array.isArray(req.body.options) ? req.body.options : product.options;
  const combinations: Record<string, string>[] = [];
  const build = (index: number, current: Record<string, string>) => {
    if (index === attributes.length) { combinations.push({ ...current }); return; }
    for (const value of attributes[index].values || []) build(index + 1, { ...current, [attributes[index].name]: value });
  };
  build(0, {});
  const existing = product.variants.map((variant: any) => JSON.stringify(normalizeOptions(variant.options)));
  const generated = combinations.filter((options) => !existing.includes(JSON.stringify(normalizeOptions(options)))).map((options, index) => ({ sku: `${product.sku}-${index + 1}`, options, stock: 0, lowStockThreshold: 5, images: [], status: 'inactive' }));
  return success(res, { options: attributes, variants: generated }, 'Variant combinations generated');
});

export const getVariantByOptions = asyncHandler(async (req: AuthRequest, res) => {
  const { productId } = req.params;
  const options = req.query.options ? JSON.parse(req.query.options as string) : {};
  const product = await Product.findById(productId);
  if (!product) return error(res, 'Product not found', 404);
  const variant = product.variants.find((v: any) => sameOptions(v.options, options));
  if (!variant) return error(res, 'Variant not found', 404);
  return success(res, variant);
});
