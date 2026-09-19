"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentSettingsSchema = exports.updateOrderStatusSchema = exports.updateOrderTrackingSchema = exports.updatePaymentStatusSchema = exports.submitManualPaymentSchema = exports.newsletterSchema = exports.contactSchema = exports.reviewSchema = exports.createOrderSchema = exports.shippingAddressSchema = void 0;
const zod_1 = require("zod");
exports.shippingAddressSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    street: zod_1.z.string().min(1),
    city: zod_1.z.string().min(1),
    state: zod_1.z.string().min(1),
    postalCode: zod_1.z.string().min(1),
    country: zod_1.z.literal('Pakistan'),
    phone: zod_1.z.string().optional(),
});
exports.createOrderSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().min(1),
        variantId: zod_1.z.string().optional(),
        selectedOptions: zod_1.z.record(zod_1.z.string().min(1), zod_1.z.string().min(1)).optional(),
        quantity: zod_1.z.number().int().min(1),
    })).min(1),
    shippingAddress: exports.shippingAddressSchema,
    couponCode: zod_1.z.string().optional(),
    paymentMethod: zod_1.z.enum(['COD', 'BANK_TRANSFER', 'JAZZCASH', 'EASYPAISA', 'STRIPE']).optional(),
    paymentReference: zod_1.z.string().optional(),
});
exports.reviewSchema = zod_1.z.object({
    rating: zod_1.z.number().int().min(1).max(5),
    title: zod_1.z.string().min(2).max(100),
    text: zod_1.z.string().min(10).max(1000),
});
exports.contactSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    subject: zod_1.z.string().min(2).max(200),
    message: zod_1.z.string().min(10).max(2000),
});
exports.newsletterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.submitManualPaymentSchema = zod_1.z.object({
    orderId: zod_1.z.string().min(1),
    method: zod_1.z.enum(['BANK_TRANSFER', 'JAZZCASH', 'EASYPAISA']),
    transactionId: zod_1.z.string().min(1).max(100),
    accountReference: zod_1.z.string().max(200).optional(),
});
exports.updatePaymentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'RECEIVED', 'NOT_RECEIVED', 'REJECTED']),
    note: zod_1.z.string().max(500).optional(),
});
exports.updateOrderTrackingSchema = zod_1.z.object({
    courier: zod_1.z.string().max(100).optional(),
    trackingNumber: zod_1.z.string().max(100).optional(),
    estimatedDelivery: zod_1.z.string().optional(),
    lastUpdate: zod_1.z.string().max(500).optional(),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'PENDING',
        'PAYMENT_PENDING',
        'PAYMENT_CONFIRMED',
        'CONFIRMED',
        'PROCESSING',
        'PACKED',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'RETURNED',
        'REFUNDED',
    ]),
    note: zod_1.z.string().max(500).optional(),
});
exports.paymentSettingsSchema = zod_1.z.object({
    codEnabled: zod_1.z.boolean().optional(),
    bankTransferEnabled: zod_1.z.boolean().optional(),
    jazzcashEnabled: zod_1.z.boolean().optional(),
    easypaisaEnabled: zod_1.z.boolean().optional(),
    bankTransfer: zod_1.z.object({
        bankName: zod_1.z.string().max(200).optional(),
        accountTitle: zod_1.z.string().max(200).optional(),
        accountNumber: zod_1.z.string().max(100).optional(),
        iban: zod_1.z.string().max(100).optional(),
        branch: zod_1.z.string().max(100).optional(),
        instructions: zod_1.z.string().max(2000).optional(),
    }).optional(),
    jazzcash: zod_1.z.object({
        accountName: zod_1.z.string().max(200).optional(),
        accountNumber: zod_1.z.string().max(100).optional(),
        instructions: zod_1.z.string().max(2000).optional(),
    }).optional(),
    easypaisa: zod_1.z.object({
        accountName: zod_1.z.string().max(200).optional(),
        accountNumber: zod_1.z.string().max(100).optional(),
        instructions: zod_1.z.string().max(2000).optional(),
    }).optional(),
    generalInstructions: zod_1.z.string().max(2000).optional(),
});
//# sourceMappingURL=payment.js.map