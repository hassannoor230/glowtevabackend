"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const User_js_1 = require("../models/User.js");
const Product_js_1 = require("../models/Product.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
exports.getWishlist = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const user = await User_js_1.User.findById(req.user.userId).populate('wishlist');
    if (!user)
        return (0, apiResponse_js_1.error)(res, 'User not found', 404);
    return (0, apiResponse_js_1.success)(res, user.wishlist);
});
exports.addToWishlist = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { productId } = req.body;
    const product = await Product_js_1.Product.findById(productId);
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    const user = await User_js_1.User.findById(req.user.userId);
    if (!user)
        return (0, apiResponse_js_1.error)(res, 'User not found', 404);
    if (user.wishlist.some((id) => id.toString() === productId)) {
        return (0, apiResponse_js_1.error)(res, 'Product already in wishlist', 400);
    }
    user.wishlist.push(product._id);
    await user.save();
    return (0, apiResponse_js_1.success)(res, user.wishlist, 'Added to wishlist');
});
exports.removeFromWishlist = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const user = await User_js_1.User.findById(req.user.userId);
    if (!user)
        return (0, apiResponse_js_1.error)(res, 'User not found', 404);
    user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
    await user.save();
    return (0, apiResponse_js_1.success)(res, user.wishlist, 'Removed from wishlist');
});
exports.addAddress = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const user = await User_js_1.User.findById(req.user.userId);
    if (!user)
        return (0, apiResponse_js_1.error)(res, 'User not found', 404);
    if (req.body.isDefault) {
        user.addresses.forEach((a) => (a.isDefault = false));
    }
    user.addresses.push(req.body);
    await user.save();
    return (0, apiResponse_js_1.success)(res, user.addresses, 'Address added', 201);
});
exports.updateAddress = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const user = await User_js_1.User.findById(req.user.userId);
    if (!user)
        return (0, apiResponse_js_1.error)(res, 'User not found', 404);
    const address = user.addresses.find((item) => item._id?.toString() === req.params.addressId);
    if (!address)
        return (0, apiResponse_js_1.error)(res, 'Address not found', 404);
    Object.assign(address, req.body);
    if (req.body.isDefault) {
        user.addresses.forEach((a) => {
            if (a._id?.toString() !== req.params.addressId)
                a.isDefault = false;
        });
    }
    await user.save();
    return (0, apiResponse_js_1.success)(res, user.addresses, 'Address updated');
});
exports.deleteAddress = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const user = await User_js_1.User.findById(req.user.userId);
    if (!user)
        return (0, apiResponse_js_1.error)(res, 'User not found', 404);
    user.addresses = user.addresses.filter((a) => a._id?.toString() !== req.params.addressId);
    await user.save();
    return (0, apiResponse_js_1.success)(res, user.addresses, 'Address deleted');
});
exports.getAllUsers = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const [users, total] = await Promise.all([
        User_js_1.User.find().select('-password -refreshToken').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        User_js_1.User.countDocuments(),
    ]);
    return (0, apiResponse_js_1.success)(res, {
        users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});
//# sourceMappingURL=userController.js.map