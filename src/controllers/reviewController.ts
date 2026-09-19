import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/apiResponse.js';
import { reviewSchema } from '../validators/order.js';
import { AuthRequest } from '../middleware/auth.js';

export const getReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments({ product: req.params.productId, isApproved: true }),
  ]);
  return success(res, {
    reviews,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const createReview = asyncHandler(async (req: AuthRequest, res) => {
  const data = reviewSchema.parse(req.body);
  const product = await Product.findById(req.params.productId);
  if (!product) return error(res, 'Product not found', 404);

  const existing = await Review.findOne({ product: product._id, user: req.user!.userId });
  if (existing) return error(res, 'You have already reviewed this product', 409);

  const hasPurchased = await Order.findOne({
    user: req.user!.userId,
    'items.product': product._id,
    paymentStatus: 'paid',
  });

  const review = await Review.create({
    product: product._id,
    user: req.user!.userId,
    rating: data.rating,
    title: data.title,
    text: data.text,
    verifiedPurchase: !!hasPurchased,
  });

  const stats = await Review.aggregate([
    { $match: { product: product._id, isApproved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length) {
    product.rating = Math.round(stats[0].avg * 10) / 10;
    product.reviewCount = stats[0].count;
    await product.save();
  }

  return success(res, review, 'Review submitted', 201);
});

export const getAllReviews = asyncHandler(async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const [reviews, total] = await Promise.all([
    Review.find()
      .populate('user', 'name email')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments(),
  ]);
  return success(res, {
    reviews,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const deleteReview = asyncHandler(async (req: AuthRequest, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return error(res, 'Review not found', 404);
  return success(res, null, 'Review deleted');
});
