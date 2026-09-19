"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const index_js_1 = require("../config/index.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
const Settings_js_1 = require("../models/Settings.js");
cloudinary_1.v2.config({
    cloud_name: index_js_1.config.cloudinary.cloudName,
    api_key: index_js_1.config.cloudinary.apiKey,
    api_secret: index_js_1.config.cloudinary.apiSecret,
});
exports.uploadImage = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        return (0, apiResponse_js_1.error)(res, 'No file uploaded', 400);
    }
    try {
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: 'glowteva/products',
                resource_type: 'image',
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' },
                ],
            }, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
            uploadStream.end(req.file.buffer);
        });
        const uploadResult = result;
        return (0, apiResponse_js_1.success)(res, { url: uploadResult.secure_url }, 'Image uploaded successfully');
    }
    catch (err) {
        console.error('Cloudinary upload error:', err);
        return (0, apiResponse_js_1.error)(res, 'Failed to upload image', 500);
    }
});
exports.uploadMedia = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        return (0, apiResponse_js_1.error)(res, 'No file uploaded', 400);
    }
    try {
        const isVideo = req.file.mimetype.startsWith('video/');
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: 'glowteva/media',
                resource_type: isVideo ? 'video' : 'image',
                transformation: isVideo ? undefined : [
                    { quality: 'auto', fetch_format: 'auto' },
                ],
            }, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
            uploadStream.end(req.file.buffer);
        });
        const uploadResult = result;
        // Save to database
        const media = await Settings_js_1.Media.create({
            url: uploadResult.secure_url,
            alt: req.file.originalname,
            type: isVideo ? 'video' : 'image',
            folder: 'general',
            size: req.file.size,
        });
        return (0, apiResponse_js_1.success)(res, { url: uploadResult.secure_url, _id: media._id }, 'Media uploaded successfully');
    }
    catch (err) {
        console.error('Cloudinary upload error:', err);
        return (0, apiResponse_js_1.error)(res, 'Failed to upload media', 500);
    }
});
//# sourceMappingURL=uploadController.js.map