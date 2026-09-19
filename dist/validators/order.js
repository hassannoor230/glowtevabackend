"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsletterSchema = exports.contactSchema = exports.reviewSchema = exports.createOrderSchema = exports.shippingAddressSchema = void 0;
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
        quantity: zod_1.z.number().int().min(1),
    })).min(1),
    shippingAddress: exports.shippingAddressSchema,
    couponCode: zod_1.z.string().optional(),
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
//# sourceMappingURL=order.js.map