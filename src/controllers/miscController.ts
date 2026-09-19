import { Newsletter } from '../models/Newsletter.js';
import { Contact } from '../models/Contact.js';
import { Coupon } from '../models/Coupon.js';
import { Category } from '../models/Category.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/apiResponse.js';
import { contactSchema, newsletterSchema } from '../validators/order.js';
import { AuthRequest } from '../middleware/auth.js';
import { emailService } from '../services/emailService.js';

export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const data = newsletterSchema.parse(req.body);
  const existing = await Newsletter.findOne({ email: data.email });
  if (existing) {
    if (existing.isActive) return error(res, 'Already subscribed', 400);
    existing.isActive = true;
    await existing.save();
    return success(res, null, 'Welcome back to GlowTeva');
  }
  await Newsletter.create({ email: data.email });
  return success(res, null, 'Successfully subscribed to GlowTeva', 201);
});

export const submitContact = asyncHandler(async (req, res) => {
  const data = contactSchema.parse(req.body);
  const contact = await Contact.create(data);
  
  // Send email notifications (non-blocking)
  emailService.sendContactNotification(data).catch(console.error);
  emailService.sendContactConfirmation({ name: data.name, email: data.email }).catch(console.error);
  
  return success(res, null, 'Message received. We will be in touch soon.', 201);
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await Coupon.findOne({
    code: code?.toUpperCase(),
    active: true,
    expiryDate: { $gt: new Date() },
  });
  if (!coupon) return error(res, 'Invalid or expired coupon', 400);
  if (coupon.usedCount >= coupon.usageLimit) return error(res, 'Coupon usage limit reached', 400);
  if (subtotal < coupon.minimumOrder) {
    return error(res, `Minimum order of $${coupon.minimumOrder} required`, 400);
  }
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.value;
  }
  return success(res, {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount: Math.round(discount * 100) / 100,
  });
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
  return success(res, categories);
});

export const getCategoriesWithChildren = asyncHandler(async (req, res) => {
  const mainCategories = await Category.find({ isActive: true, parent: null }).sort({ order: 1 }).lean();
  const withChildren = await Promise.all(
    mainCategories.map(async (cat) => {
      const children = await Category.find({ isActive: true, parent: cat._id }).sort({ order: 1 }).lean();
      return { ...cat, children };
    })
  );
  return success(res, withChildren);
});

export const getContacts = asyncHandler(async (req: AuthRequest, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 }).limit(50).lean();
  return success(res, contacts);
});
