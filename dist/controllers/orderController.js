"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrders = exports.getOrderById = exports.getMyOrders = exports.createOrder = void 0;
const Order_js_1 = require("../models/Order.js");
const Product_js_1 = require("../models/Product.js");
const Coupon_js_1 = require("../models/Coupon.js");
const User_js_1 = require("../models/User.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
const payment_js_1 = require("../validators/payment.js");
const Payment_js_1 = require("../models/Payment.js");
const Settings_js_1 = require("../models/Settings.js");
const emailService_js_1 = require("../services/emailService.js");
const generateOrderNumber = () => {
    const date = new Date();
    const prefix = 'GT';
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `${prefix}${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${random}`;
};
exports.createOrder = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const data = payment_js_1.createOrderSchema.parse(req.body);
    const paymentMethod = data.paymentMethod || 'COD';
    const paymentSettings = await Settings_js_1.PaymentSettings.findOne().lean();
    const methodEnabled = paymentMethod === 'COD' ? paymentSettings?.codEnabled !== false : paymentMethod === 'STRIPE' || Boolean(paymentSettings?.[{
        BANK_TRANSFER: 'bankTransferEnabled',
        JAZZCASH: 'jazzcashEnabled',
        EASYPAISA: 'easypaisaEnabled',
    }[paymentMethod]]);
    if (!methodEnabled)
        return (0, apiResponse_js_1.error)(res, 'This payment method is currently unavailable', 400);
    let subtotal = 0;
    const orderItems = [];
    for (const item of data.items) {
        const product = await Product_js_1.Product.findById(item.productId);
        if (!product || product.status !== 'active') {
            return (0, apiResponse_js_1.error)(res, `Product not found: ${item.productId}`, 400);
        }
        let price = product.price;
        let compareAtPrice = product.compareAtPrice;
        let sku = product.sku;
        let thumbnail = product.thumbnail;
        let variantId;
        let selectedOptions;
        let stockFilter = { _id: product._id, stock: { $gte: item.quantity } };
        let stockUpdate = { $inc: { stock: -item.quantity } };
        if (item.variantId) {
            const variant = product.variants.find((entry) => entry._id?.toString() === item.variantId);
            if (!variant || variant.status !== 'active')
                return (0, apiResponse_js_1.error)(res, `Selected variation is unavailable for ${product.name}`, 400);
            if (item.selectedOptions && JSON.stringify(item.selectedOptions) !== JSON.stringify(variant.options))
                return (0, apiResponse_js_1.error)(res, 'Selected variation does not match the product', 400);
            if (variant.stock < item.quantity)
                return (0, apiResponse_js_1.error)(res, `Insufficient stock for selected ${product.name} variation`, 400);
            price = variant.price ?? product.price;
            compareAtPrice = variant.compareAtPrice ?? product.compareAtPrice;
            sku = variant.sku;
            thumbnail = variant.image || variant.images?.[0] || product.thumbnail;
            variantId = variant._id;
            selectedOptions = variant.options;
            stockFilter = { _id: product._id, 'variants._id': variant._id, 'variants.stock': { $gte: item.quantity } };
            stockUpdate = { $inc: { 'variants.$.stock': -item.quantity } };
        }
        else if (product.variants.length > 0) {
            return (0, apiResponse_js_1.error)(res, `Please select a variation for ${product.name}`, 400);
        }
        else if (product.stock < item.quantity) {
            return (0, apiResponse_js_1.error)(res, `Insufficient stock for ${product.name}`, 400);
        }
        const reserved = await Product_js_1.Product.findOneAndUpdate(stockFilter, stockUpdate, { new: true });
        if (!reserved)
            return (0, apiResponse_js_1.error)(res, `The selected variation is no longer available for ${product.name}`, 409);
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
    let couponCode;
    if (data.couponCode) {
        const coupon = await Coupon_js_1.Coupon.findOne({
            code: data.couponCode.toUpperCase(),
            active: true,
            expiryDate: { $gt: new Date() },
        });
        if (!coupon)
            return (0, apiResponse_js_1.error)(res, 'Invalid or expired coupon', 400);
        if (coupon.usedCount >= coupon.usageLimit)
            return (0, apiResponse_js_1.error)(res, 'Coupon usage limit reached', 400);
        if (subtotal < coupon.minimumOrder) {
            return (0, apiResponse_js_1.error)(res, `Minimum order of $${coupon.minimumOrder} required for this coupon`, 400);
        }
        if (coupon.type === 'percentage') {
            discount = (subtotal * coupon.value) / 100;
            if (coupon.maxDiscount)
                discount = Math.min(discount, coupon.maxDiscount);
        }
        else {
            discount = coupon.value;
        }
        couponCode = coupon.code;
    }
    const shippingCost = subtotal >= 75 ? 0 : 8.5;
    const tax = 0;
    const total = Math.max(0, subtotal + shippingCost + tax - discount);
    const order = await Order_js_1.Order.create({
        user: req.user.userId,
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
    await Payment_js_1.Payment.create({
        order: order._id,
        user: req.user.userId,
        method: paymentMethod,
        amount: total,
        status: 'PENDING',
        transactionId: data.paymentReference,
    });
    const user = await User_js_1.User.findById(req.user.userId).select('name email').lean();
    const userName = user?.name || 'Valued Customer';
    const userEmail = user?.email || '';
    emailService_js_1.emailService.sendOrderConfirmation({
        orderNumber: order.orderNumber,
        orderId: order._id.toString(),
        userEmail,
        userName,
        items: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal ?? 0,
            thumbnail: item.thumbnail,
        })),
        subtotal,
        shippingCost,
        discount,
        total,
        paymentMethod,
        orderStatus: order.orderStatus,
        shippingAddress: data.shippingAddress,
    }).catch(console.error);
    emailService_js_1.emailService.sendOrderAdminNotification({
        orderNumber: order.orderNumber,
        orderId: order._id.toString(),
        userName,
        userEmail,
        items: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal ?? 0,
            thumbnail: item.thumbnail,
        })),
        subtotal,
        shippingCost,
        discount,
        total,
        paymentMethod,
        orderStatus: order.orderStatus,
        shippingAddress: data.shippingAddress,
    }).catch(console.error);
    return (0, apiResponse_js_1.success)(res, order, 'Order created', 201);
});
exports.getMyOrders = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const orders = await Order_js_1.Order.find({ user: req.user.userId }).sort({ createdAt: -1 }).lean();
    return (0, apiResponse_js_1.success)(res, orders);
});
exports.getOrderById = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const order = await Order_js_1.Order.findById(req.params.id).lean();
    if (!order)
        return (0, apiResponse_js_1.error)(res, 'Order not found', 404);
    if (order.user.toString() !== req.user.userId && req.user.role !== 'admin') {
        return (0, apiResponse_js_1.error)(res, 'Not authorized', 403);
    }
    return (0, apiResponse_js_1.success)(res, order);
});
exports.getAllOrders = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const filter = {};
    if (status)
        filter.orderStatus = status;
    const [orders, total] = await Promise.all([
        Order_js_1.Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Order_js_1.Order.countDocuments(filter),
    ]);
    return (0, apiResponse_js_1.success)(res, {
        orders,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});
exports.updateOrderStatus = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { status } = req.body;
    if (!['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
        return (0, apiResponse_js_1.error)(res, 'Invalid status', 400);
    }
    const order = await Order_js_1.Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true });
    if (!order)
        return (0, apiResponse_js_1.error)(res, 'Order not found', 404);
    return (0, apiResponse_js_1.success)(res, order, 'Order status updated');
});
//# sourceMappingURL=orderController.js.map