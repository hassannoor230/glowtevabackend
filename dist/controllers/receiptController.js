"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReceipt = exports.uploadReceipt = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
const index_js_1 = require("../config/index.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
cloudinary_1.default.v2.config({
    cloud_name: index_js_1.config.cloudinary.cloudName,
    api_key: index_js_1.config.cloudinary.apiKey,
    api_secret: index_js_1.config.cloudinary.apiSecret,
});
exports.uploadReceipt = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        return (0, apiResponse_js_1.error)(res, 'No file uploaded', 400);
    }
    const file = req.file;
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
        return (0, apiResponse_js_1.error)(res, 'Invalid file type. Only JPEG, PNG, and WebP are allowed.', 400);
    }
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        return (0, apiResponse_js_1.error)(res, 'File too large. Maximum size is 5MB.', 400);
    }
    try {
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.default.v2.uploader.upload_stream({
                folder: 'glowteva/payments/receipts',
                resource_type: 'image',
                transformation: [
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' },
                ],
            }, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
            uploadStream.end(file.buffer);
        });
        return (0, apiResponse_js_1.success)(res, {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
        }, 'Receipt uploaded successfully');
    }
    catch (err) {
        console.error('Receipt upload failed:', err);
        return (0, apiResponse_js_1.error)(res, 'Failed to upload receipt. Please try again.', 500);
    }
});
exports.deleteReceipt = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { publicId } = req.body;
    if (!publicId) {
        return (0, apiResponse_js_1.error)(res, 'Public ID is required', 400);
    }
    try {
        await cloudinary_1.default.v2.uploader.destroy(publicId);
        return (0, apiResponse_js_1.success)(res, null, 'Receipt deleted successfully');
    }
    catch (err) {
        console.error('Receipt delete failed:', err);
        return (0, apiResponse_js_1.error)(res, 'Failed to delete receipt.', 500);
    }
});
//# sourceMappingURL=receiptController.js.map