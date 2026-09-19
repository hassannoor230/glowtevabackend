import { Response } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/apiResponse.js';
import { createOrderSchema } from '../validators/payment.js';
import { Payment } from '../models/Payment.js';
import { PaymentSettings } from '../models/Settings.js';
import { AuthRequest } from '../middleware/auth.js';

const generateOrderNumber = () => {
  const date = new Date();
  const prefix = 'GT';
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${random}`;
};

export const createOrder = asyncHandler(async (req: AuthRequest, res) => {
  const data = createOrderSchema.parse(req.body);
  const paymentMethod = data.paymentMethod || 'COD';
  const paymentSettings = await PaymentSettings.findOne().lean();
  const methodEnabled = paymentMethod === 'COD' ? paymentSettings?.codEnabled !== false : paymentMethod === 'STRIPE' || Boolean(paymentSettings?.[{
    BANK_TRANSFER: 'bankTransferEnabled',
    JAZZCASH: 'jazzcashEnabled',
    EASYPAISA: 'easypaisaEnabled',
  }[paymentMethod] as 'bankTransferEnabled' | 'jazzcashEnabled' | 'easypaisaEnabled']);
  if (!methodEnabled) return error(res, 'This payment method is currently unavailable', 400);
  let subtotal = 0;
  const orderItems = [];

  for (const item of data.items) {
    const product = await Product.findById(item.productId);
    if (!product || product.status !== 'active') {
      return error(res, `Product not found: ${item.productId}`, 400);
    }
    let price = product.price;
    let compareAtPrice = product.compareAtPrice;
    let sku = product.sku;
    let thumbnail = product.thumbnail;
    let variantId: any;
    let selectedOptions: Record<string, string> | undefined;
    let stockFilter: any = { _id: product._id, stock: { $gte: item.quantity } };
    let stockUpdate: any = { $inc: { stock: -item.quantity } };
    if (item.variantId) {
      const variant: any = product.variants.find((entry: any) => entry._id?.toString() === item.variantId);
      if (!variant || variant.status !== 'active') return error(res, `Selected variation is unavailable for ${product.name}`, 400);
      if (item.selectedOptions && JSON.stringify(item.selectedOptions) !== JSON.stringify(variant.options)) return error(res, 'Selected variation does not match the product', 400);
      if (variant.stock < item.quantity) return error(res, `Insufficient stock for selected ${product.name} variation`, 400);
      price = variant.price ?? product.price;
      compareAtPrice = variant.compareAtPrice ?? product.compareAtPrice;
      sku = variant.sku;
      thumbnail = variant.image || variant.images?.[0] || product.thumbnail;
      variantId = variant._id;
      selectedOptions = variant.options;
      stockFilter = { _id: product._id, 'variants._id': variant._id, 'variants.stock': { $gte: item.quantity } };
      stockUpdate = { $inc: { 'variants.$.stock': -item.quantity } };
    } else if (product.variants.length > 0) {
      return error(res, `Please select a variation for ${product.name}`, 400);
    } else if (product.stock < item.quantity) {
      return error(res, `Insufficient stock for ${product.name}`, 400);
    }
    const reserved = await Product.findOneAndUpdate(stockFilter, stockUpdate, { new: true });
    if (!reserved) return error(res, `The selected variation is no longer available for ${product.name}`, 409);
    const itemSubtotal = price * item.quantity;
    subtotal += itemSubtotal;
    orderItems.push({
      product: product._id,
      variantId,
      selectedOptions,
      name: product.name,
      slug: product.slug,
      thumbnail,
      price,
      sku,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    });
  }

  let discount = 0;
  let couponCode: string | undefined;
  if (data.couponCode) {
    const coupon = await Coupon.findOne({
      code: data.couponCode.toUpperCase(),
      active: true,
      expiryDate: { $gt: new Date() },
    });
    if (!coupon) return error(res, 'Invalid or expired coupon', 400);
    if (coupon.usedCount >= coupon.usageLimit) return error(res, 'Coupon usage limit reached', 400);
    if (subtotal < coupon.minimumOrder) {
      return error(res, `Minimum order of $${coupon.minimumOrder} required for this coupon`, 400);
    }
    if (coupon.type === 'percentage') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }
    couponCode = coupon.code;
  }

  const shippingCost = subtotal >= 75 ? 0 : 8.5;
  const tax = 0;
  const total = Math.max(0, subtotal + shippingCost + tax - discount);

  const order = await Order.create({
    user: req.user!.userId,
    orderNumber: generateOrderNumber(),
    items: orderItems,
    subtotal,
    shippingCost,
    discount,
    tax,
    total,
    shippingAddress: data.shippingAddress,
    paymentStatus: 'pending',
    paymentMethod,
    paymentReference: data.paymentReference,
    orderStatus: paymentMethod !== 'COD' && paymentMethod !== 'STRIPE' ? 'PAYMENT_PENDING' : 'CONFIRMED',
    couponCode,
  });

  await Payment.create({
    order: order._id,
    user: req.user!.userId,
    method: paymentMethod,
    amount: total,
    status: 'PENDING',
    transactionId: data.paymentReference,
  });

  return success(res, order, 'Order created', 201);
});

export const getMyOrders = asyncHandler(async (req: AuthRequest, res) => {
  const orders = await Order.find({ user: req.user!.userId }).sort({ createdAt: -1 }).lean();
  return success(res, orders);
});

export const getOrderById = asyncHandler(async (req: AuthRequest, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) return error(res, 'Order not found', 404);
  if (order.user.toString() !== req.user!.userId && req.user!.role !== 'admin') {
    return error(res, 'Not authorized', 403);
  }
  return success(res, order);
});

export const getAllOrders = asyncHandler(async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;
  const filter: any = {};
  if (status) filter.orderStatus = status;

  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  return success(res, {
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res) => {
  const { status } = req.body;
  if (!['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
    return error(res, 'Invalid status', 400);
  }
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus: status },
    { new: true }
  );
  if (!order) return error(res, 'Order not found', 404);
  return success(res, order, 'Order status updated');
});
