"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enabledMethod = exports.updatePaymentStatus = exports.getPaymentForAdmin = exports.listPayments = exports.getMyPayment = exports.getMyPayments = exports.submitManualPayment = exports.getPaymentSettings = void 0;
const Payment_js_1 = require("../models/Payment.js");
const PaymentHistory_js_1 = require("../models/PaymentHistory.js");
const Order_js_1 = require("../models/Order.js");
const Settings_js_1 = require("../models/Settings.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
const payment_js_1 = require("../validators/payment.js");
const notificationService_js_1 = require("../services/notificationService.js");
const enabledMethod = (settings, method) => ({
    BANK_TRANSFER: settings.bankTransferEnabled,
    JAZZCASH: settings.jazzcashEnabled,
    EASYPAISA: settings.easypaisaEnabled,
}[method] ?? false);
exports.enabledMethod = enabledMethod;
exports.getPaymentSettings = (0, asyncHandler_js_1.asyncHandler)(async (_req, res) => {
    const settings = await Settings_js_1.PaymentSettings.findOneAndUpdate({}, {}, { new: true, upsert: true, setDefaultsOnInsert: true }).lean();
    return (0, apiResponse_js_1.success)(res, settings);
});
exports.submitManualPayment = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const data = payment_js_1.submitManualPaymentSchema.parse(req.body);
    const settings = await Settings_js_1.PaymentSettings.findOne().lean();
    if (!settings || !enabledMethod(settings, data.method))
        return (0, apiResponse_js_1.error)(res, 'This payment method is currently unavailable', 400);
    if (!req.body.receiptUrl)
        return (0, apiResponse_js_1.error)(res, 'Payment receipt is required', 400);
    const order = await Order_js_1.Order.findOne({ _id: data.orderId, user: req.user.userId });
    if (!order)
        return (0, apiResponse_js_1.error)(res, 'Order not found', 404);
    if (order.paymentStatus === 'paid')
        return (0, apiResponse_js_1.error)(res, 'Order payment is already complete', 400);
    const duplicate = await Payment_js_1.Payment.findOne({ transactionId: data.transactionId });
    if (duplicate)
        return (0, apiResponse_js_1.error)(res, 'This transaction ID has already been submitted', 409);
    const payment = await Payment_js_1.Payment.findOneAndUpdate({ order: order._id, user: req.user.userId }, {
        order: order._id,
        user: req.user.userId,
        method: data.method,
        amount: order.total,
        status: 'PENDING',
        transactionId: data.transactionId,
        accountReference: data.accountReference,
        receiptUrl: req.body.receiptUrl,
    }, { new: true, upsert: true, setDefaultsOnInsert: true });
    await PaymentHistory_js_1.PaymentHistory.create({ payment: payment._id, status: 'PENDING', note: 'Payment receipt submitted', updatedBy: req.user.userId });
    order.paymentMethod = data.method;
    order.paymentReference = data.transactionId;
    order.paymentStatus = 'pending';
    order.orderStatus = 'PAYMENT_PENDING';
    order.statusHistory.push({ status: 'PAYMENT_PENDING', note: 'Payment submitted for verification', updatedBy: req.user.userId, createdAt: new Date() });
    await order.save();
    await (0, notificationService_js_1.createNotification)(req.user.userId, {
        type: 'PAYMENT',
        title: 'Payment submitted',
        message: `Your payment for order #${order.orderNumber} is awaiting verification.`,
        link: `/account/orders/${order._id}`,
    });
    return (0, apiResponse_js_1.success)(res, payment, 'Payment submitted for verification', 201);
});
exports.getMyPayments = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const payments = await Payment_js_1.Payment.find({ user: req.user.userId }).populate('order', 'orderNumber total').sort({ createdAt: -1 }).lean();
    return (0, apiResponse_js_1.success)(res, payments);
});
exports.getMyPayment = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const payment = await Payment_js_1.Payment.findOne({ _id: req.params.id, user: req.user.userId }).populate('order', 'orderNumber total').lean();
    if (!payment)
        return (0, apiResponse_js_1.error)(res, 'Payment not found', 404);
    const history = await PaymentHistory_js_1.PaymentHistory.find({ payment: payment._id }).sort({ createdAt: 1 }).lean();
    return (0, apiResponse_js_1.success)(res, { payment, history });
});
exports.listPayments = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const query = {};
    if (req.query.status && req.query.status !== 'all')
        query.status = req.query.status;
    if (req.query.method && req.query.method !== 'all')
        query.method = req.query.method;
    if (req.query.search)
        query.$or = [{ transactionId: { $regex: req.query.search, $options: 'i' } }];
    const [payments, total] = await Promise.all([
        Payment_js_1.Payment.find(query).populate('user', 'name email').populate('order', 'orderNumber total').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Payment_js_1.Payment.countDocuments(query),
    ]);
    return (0, apiResponse_js_1.success)(res, { data: payments, total, page, limit, totalPages: Math.ceil(total / limit) });
});
exports.getPaymentForAdmin = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const payment = await Payment_js_1.Payment.findById(req.params.id).populate('user', 'name email').populate('order').lean();
    if (!payment)
        return (0, apiResponse_js_1.error)(res, 'Payment not found', 404);
    const history = await PaymentHistory_js_1.PaymentHistory.find({ payment: payment._id }).populate('updatedBy', 'name email').sort({ createdAt: 1 }).lean();
    return (0, apiResponse_js_1.success)(res, { payment, history });
});
exports.updatePaymentStatus = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const data = payment_js_1.updatePaymentStatusSchema.parse(req.body);
    const payment = await Payment_js_1.Payment.findById(req.params.id);
    if (!payment)
        return (0, apiResponse_js_1.error)(res, 'Payment not found', 404);
    const order = await Order_js_1.Order.findById(payment.order);
    if (!order)
        return (0, apiResponse_js_1.error)(res, 'Order not found', 404);
    payment.status = data.status;
    payment.adminNote = data.note;
    payment.verifiedBy = req.user.userId;
    payment.verifiedAt = new Date();
    await payment.save();
    await PaymentHistory_js_1.PaymentHistory.create({ payment: payment._id, status: data.status, note: data.note, updatedBy: req.user.userId });
    if (data.status === 'CONFIRMED' || data.status === 'RECEIVED') {
        order.paymentStatus = data.status === 'RECEIVED' ? 'paid' : 'pending';
        order.orderStatus = 'PAYMENT_CONFIRMED';
    }
    else if (data.status === 'NOT_RECEIVED' || data.status === 'REJECTED') {
        order.paymentStatus = 'failed';
        order.orderStatus = 'PAYMENT_PENDING';
    }
    order.statusHistory.push({ status: order.orderStatus, note: data.note || `Payment ${data.status.toLowerCase()}`, updatedBy: req.user.userId, createdAt: new Date() });
    await order.save();
    const messages = {
        CONFIRMED: `Your payment for order #${order.orderNumber} has been verified.`,
        RECEIVED: `Payment received for order #${order.orderNumber}.`,
        NOT_RECEIVED: `We could not confirm payment for order #${order.orderNumber}.`,
        REJECTED: `Payment for order #${order.orderNumber} was rejected.`,
    };
    if (messages[data.status])
        await (0, notificationService_js_1.createNotification)(payment.user.toString(), { type: 'PAYMENT', title: `Payment ${data.status.toLowerCase()}`, message: messages[data.status], link: `/account/orders/${order._id}` });
    return (0, apiResponse_js_1.success)(res, payment, 'Payment status updated');
});
//# sourceMappingURL=manualPaymentController.js.map