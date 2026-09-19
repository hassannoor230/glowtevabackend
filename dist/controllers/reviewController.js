"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.getAllReviews = exports.createReview = exports.getReviews = void 0;
const Review_js_1 = require("../models/Review.js");
const Product_js_1 = require("../models/Product.js");
const Order_js_1 = require("../models/Order.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
const order_js_1 = require("../validators/order.js");
exports.getReviews = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const [reviews, total] = await Promise.all([
        Review_js_1.Review.find({ product: req.params.productId, isApproved: true })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Review_js_1.Review.countDocuments({ product: req.params.productId, isApproved: true }),
    ]);
    return (0, apiResponse_js_1.success)(res, {
        reviews,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});
exports.createReview = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const data = order_js_1.reviewSchema.parse(req.body);
    const product = await Product_js_1.Product.findById(req.params.productId);
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    const existing = await Review_js_1.Review.findOne({ product: product._id, user: req.user.userId });
    if (existing)
        return (0, apiResponse_js_1.error)(res, 'You have already reviewed this product', 409);
    const hasPurchased = await Order_js_1.Order.findOne({
        user: req.user.userId,
        'items.product': product._id,
        paymentStatus: 'paid',
    });
    const review = await Review_js_1.Review.create({
        product: product._id,
        user: req.user.userId,
        rating: data.rating,
        title: data.title,
        text: data.text,
        verifiedPurchase: !!hasPurchased,
    });
    const stats = await Review_js_1.Review.aggregate([
        { $match: { product: product._id, isApproved: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length) {
        product.rating = Math.round(stats[0].avg * 10) / 10;
        product.reviewCount = stats[0].count;
        await product.save();
    }
    return (0, apiResponse_js_1.success)(res, review, 'Review submitted', 201);
});
exports.getAllReviews = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const [reviews, total] = await Promise.all([
        Review_js_1.Review.find()
            .populate('user', 'name email')
            .populate('product', 'name slug')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Review_js_1.Review.countDocuments(),
    ]);
    return (0, apiResponse_js_1.success)(res, {
        reviews,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});
exports.deleteReview = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const review = await Review_js_1.Review.findByIdAndDelete(req.params.id);
    if (!review)
        return (0, apiResponse_js_1.error)(res, 'Review not found', 404);
    return (0, apiResponse_js_1.success)(res, null, 'Review deleted');
});
//# sourceMappingURL=reviewController.js.map