import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.js';

export const getWishlist = asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.userId).populate('wishlist');
  if (!user) return error(res, 'User not found', 404);
  return success(res, user.wishlist);
});

export const addToWishlist = asyncHandler(async (req: AuthRequest, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) return error(res, 'Product not found', 404);

  const user = await User.findById(req.user!.userId);
  if (!user) return error(res, 'User not found', 404);

  if (user.wishlist.some((id) => id.toString() === productId)) {
    return error(res, 'Product already in wishlist', 400);
  }

  user.wishlist.push(product._id);
  await user.save();
  return success(res, user.wishlist, 'Added to wishlist');
});

export const removeFromWishlist = asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.userId);
  if (!user) return error(res, 'User not found', 404);

  user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
  await user.save();
  return success(res, user.wishlist, 'Removed from wishlist');
});

export const addAddress = asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.userId);
  if (!user) return error(res, 'User not found', 404);

  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  return success(res, user.addresses, 'Address added', 201);
});

export const updateAddress = asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.userId);
  if (!user) return error(res, 'User not found', 404);

  const address = user.addresses.find((item) => item._id?.toString() === req.params.addressId);
  if (!address) return error(res, 'Address not found', 404);

  Object.assign(address, req.body);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => {
      if (a._id?.toString() !== req.params.addressId) a.isDefault = false;
    });
  }
  await user.save();
  return success(res, user.addresses, 'Address updated');
});

export const deleteAddress = asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.userId);
  if (!user) return error(res, 'User not found', 404);

  user.addresses = user.addresses.filter((a) => a._id?.toString() !== req.params.addressId) as any;
  await user.save();
  return success(res, user.addresses, 'Address deleted');
});

export const getAllUsers = asyncHandler(async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const [users, total] = await Promise.all([
    User.find().select('-password -refreshToken').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(),
  ]);
  return success(res, {
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});
