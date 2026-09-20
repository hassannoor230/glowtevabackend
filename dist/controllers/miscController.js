"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContacts = exports.getCategoriesWithChildren = exports.getCategories = exports.validateCoupon = exports.submitContact = exports.subscribeNewsletter = void 0;
const Newsletter_js_1 = require("../models/Newsletter.js");
const Contact_js_1 = require("../models/Contact.js");
const Coupon_js_1 = require("../models/Coupon.js");
const Category_js_1 = require("../models/Category.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
const order_js_1 = require("../validators/order.js");
const emailService_js_1 = require("../services/emailService.js");
const index_js_1 = require("../config/index.js");
exports.subscribeNewsletter = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const data = order_js_1.newsletterSchema.parse(req.body);
    const existing = await Newsletter_js_1.Newsletter.findOne({ email: data.email });
    if (existing) {
        if (existing.isActive)
            return (0, apiResponse_js_1.error)(res, 'Already subscribed', 400);
        existing.isActive = true;
        await existing.save();
        emailService_js_1.emailService.sendNewsletterWelcome(data.email, index_js_1.config.adminEmail).catch(console.error);
        emailService_js_1.emailService.sendNewsletterAdminNotification(data.email).catch(console.error);
        return (0, apiResponse_js_1.success)(res, null, 'Welcome back to GlowTeva');
    }
    await Newsletter_js_1.Newsletter.create({ email: data.email });
    emailService_js_1.emailService.sendNewsletterWelcome(data.email, index_js_1.config.adminEmail).catch(console.error);
    emailService_js_1.emailService.sendNewsletterAdminNotification(data.email).catch(console.error);
    return (0, apiResponse_js_1.success)(res, null, 'Successfully subscribed to GlowTeva', 201);
});
exports.submitContact = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const data = order_js_1.contactSchema.parse(req.body);
    const contact = await Contact_js_1.Contact.create(data);
    // Send email notifications (non-blocking)
    emailService_js_1.emailService.sendContactNotification(data).catch(console.error);
    emailService_js_1.emailService.sendContactConfirmation({ name: data.name, email: data.email }).catch(console.error);
    return (0, apiResponse_js_1.success)(res, null, 'Message received. We will be in touch soon.', 201);
});
exports.validateCoupon = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { code, subtotal } = req.body;
    const coupon = await Coupon_js_1.Coupon.findOne({
        code: code?.toUpperCase(),
        active: true,
        expiryDate: { $gt: new Date() },
    });
    if (!coupon)
        return (0, apiResponse_js_1.error)(res, 'Invalid or expired coupon', 400);
    if (coupon.usedCount >= coupon.usageLimit)
        return (0, apiResponse_js_1.error)(res, 'Coupon usage limit reached', 400);
    if (subtotal < coupon.minimumOrder) {
        return (0, apiResponse_js_1.error)(res, `Minimum order of $${coupon.minimumOrder} required`, 400);
    }
    let discount = 0;
    if (coupon.type === 'percentage') {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount)
            discount = Math.min(discount, coupon.maxDiscount);
    }
    else {
        discount = coupon.value;
    }
    return (0, apiResponse_js_1.success)(res, {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount: Math.round(discount * 100) / 100,
    });
});
exports.getCategories = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const categories = await Category_js_1.Category.find({ isActive: true }).sort({ order: 1 }).lean();
    return (0, apiResponse_js_1.success)(res, categories);
});
exports.getCategoriesWithChildren = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const mainCategories = await Category_js_1.Category.find({ isActive: true, parent: null }).sort({ order: 1 }).lean();
    const withChildren = await Promise.all(mainCategories.map(async (cat) => {
        const children = await Category_js_1.Category.find({ isActive: true, parent: cat._id }).sort({ order: 1 }).lean();
        return { ...cat, children };
    }));
    return (0, apiResponse_js_1.success)(res, withChildren);
});
exports.getContacts = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const contacts = await Contact_js_1.Contact.find().sort({ createdAt: -1 }).limit(50).lean();
    return (0, apiResponse_js_1.success)(res, contacts);
});
//# sourceMappingURL=miscController.js.map