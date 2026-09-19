import { Payment } from '../models/Payment.js';
import { PaymentHistory } from '../models/PaymentHistory.js';
import { Order } from '../models/Order.js';
import { PaymentSettings } from '../models/Settings.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.js';
import { submitManualPaymentSchema, updatePaymentStatusSchema } from '../validators/payment.js';
import { createNotification } from '../services/notificationService.js';

const enabledMethod = (settings: any, method: string) => ({
  BANK_TRANSFER: settings.bankTransferEnabled,
  JAZZCASH: settings.jazzcashEnabled,
  EASYPAISA: settings.easypaisaEnabled,
}[method] ?? false);

export const getPaymentSettings = asyncHandler(async (_req: AuthRequest, res) => {
  const settings = await PaymentSettings.findOneAndUpdate(
    {},
    {},
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
  return success(res, settings);
});

export const submitManualPayment = asyncHandler(async (req: AuthRequest, res) => {
  const data = submitManualPaymentSchema.parse(req.body);
  const settings = await PaymentSettings.findOne().lean();
  if (!settings || !enabledMethod(settings, data.method)) return error(res, 'This payment method is currently unavailable', 400);
  if (!req.body.receiptUrl) return error(res, 'Payment receipt is required', 400);
  const order = await Order.findOne({ _id: data.orderId, user: req.user!.userId });
  if (!order) return error(res, 'Order not found', 404);
  if (order.paymentStatus === 'paid') return error(res, 'Order payment is already complete', 400);

  const duplicate = await Payment.findOne({ transactionId: data.transactionId });
  if (duplicate) return error(res, 'This transaction ID has already been submitted', 409);

  const payment = await Payment.findOneAndUpdate(
    { order: order._id, user: req.user!.userId },
    {
      order: order._id,
      user: req.user!.userId,
      method: data.method,
      amount: order.total,
      status: 'PENDING',
      transactionId: data.transactionId,
      accountReference: data.accountReference,
      receiptUrl: req.body.receiptUrl,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await PaymentHistory.create({ payment: payment._id, status: 'PENDING', note: 'Payment receipt submitted', updatedBy: req.user!.userId });
  order.paymentMethod = data.method;
  order.paymentReference = data.transactionId;
  order.paymentStatus = 'pending';
  order.orderStatus = 'PAYMENT_PENDING';
  order.statusHistory.push({ status: 'PAYMENT_PENDING', note: 'Payment submitted for verification', updatedBy: req.user!.userId as any, createdAt: new Date() });
  await order.save();

  await createNotification(req.user!.userId, {
    type: 'PAYMENT',
    title: 'Payment submitted',
    message: `Your payment for order #${order.orderNumber} is awaiting verification.`,
    link: `/account/orders/${order._id}`,
  });
  return success(res, payment, 'Payment submitted for verification', 201);
});

export const getMyPayments = asyncHandler(async (req: AuthRequest, res) => {
  const payments = await Payment.find({ user: req.user!.userId }).populate('order', 'orderNumber total').sort({ createdAt: -1 }).lean();
  return success(res, payments);
});

export const getMyPayment = asyncHandler(async (req: AuthRequest, res) => {
  const payment = await Payment.findOne({ _id: req.params.id, user: req.user!.userId }).populate('order', 'orderNumber total').lean();
  if (!payment) return error(res, 'Payment not found', 404);
  const history = await PaymentHistory.find({ payment: payment._id }).sort({ createdAt: 1 }).lean();
  return success(res, { payment, history });
});

export const listPayments = asyncHandler(async (req: AuthRequest, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
  const query: any = {};
  if (req.query.status && req.query.status !== 'all') query.status = req.query.status;
  if (req.query.method && req.query.method !== 'all') query.method = req.query.method;
  if (req.query.search) query.$or = [{ transactionId: { $regex: req.query.search, $options: 'i' } }];
  const [payments, total] = await Promise.all([
    Payment.find(query).populate('user', 'name email').populate('order', 'orderNumber total').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Payment.countDocuments(query),
  ]);
  return success(res, { data: payments, total, page, limit, totalPages: Math.ceil(total / limit) });
});

export const getPaymentForAdmin = asyncHandler(async (req: AuthRequest, res) => {
  const payment = await Payment.findById(req.params.id).populate('user', 'name email').populate('order').lean();
  if (!payment) return error(res, 'Payment not found', 404);
  const history = await PaymentHistory.find({ payment: payment._id }).populate('updatedBy', 'name email').sort({ createdAt: 1 }).lean();
  return success(res, { payment, history });
});

export const updatePaymentStatus = asyncHandler(async (req: AuthRequest, res) => {
  const data = updatePaymentStatusSchema.parse(req.body);
  const payment = await Payment.findById(req.params.id);
  if (!payment) return error(res, 'Payment not found', 404);
  const order = await Order.findById(payment.order);
  if (!order) return error(res, 'Order not found', 404);

  payment.status = data.status;
  payment.adminNote = data.note;
  payment.verifiedBy = req.user!.userId as any;
  payment.verifiedAt = new Date();
  await payment.save();
  await PaymentHistory.create({ payment: payment._id, status: data.status, note: data.note, updatedBy: req.user!.userId });

  if (data.status === 'CONFIRMED' || data.status === 'RECEIVED') {
    order.paymentStatus = data.status === 'RECEIVED' ? 'paid' : 'pending';
    order.orderStatus = 'PAYMENT_CONFIRMED';
  } else if (data.status === 'NOT_RECEIVED' || data.status === 'REJECTED') {
    order.paymentStatus = 'failed';
    order.orderStatus = 'PAYMENT_PENDING';
  }
  order.statusHistory.push({ status: order.orderStatus, note: data.note || `Payment ${data.status.toLowerCase()}`, updatedBy: req.user!.userId as any, createdAt: new Date() });
  await order.save();

  const messages: Record<string, string> = {
    CONFIRMED: `Your payment for order #${order.orderNumber} has been verified.`,
    RECEIVED: `Payment received for order #${order.orderNumber}.`,
    NOT_RECEIVED: `We could not confirm payment for order #${order.orderNumber}.`,
    REJECTED: `Payment for order #${order.orderNumber} was rejected.`,
  };
  if (messages[data.status]) await createNotification(payment.user.toString(), { type: 'PAYMENT', title: `Payment ${data.status.toLowerCase()}`, message: messages[data.status], link: `/account/orders/${order._id}` });
  return success(res, payment, 'Payment status updated');
});

export { enabledMethod };