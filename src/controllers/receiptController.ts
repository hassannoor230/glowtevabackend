import { Request, Response } from 'express';
import cloudinary from 'cloudinary';
import { config } from '../config/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.js';

cloudinary.v2.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadReceipt = asyncHandler(async (req: AuthRequest, res) => {
  if (!req.file) {
    return error(res, 'No file uploaded', 400);
  }

  const file = req.file;

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return error(res, 'Invalid file type. Only JPEG, PNG, and WebP are allowed.', 400);
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return error(res, 'File too large. Maximum size is 5MB.', 400);
  }

  try {
    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder: 'glowteva/payments/receipts',
          resource_type: 'image',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    return success(res, {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    }, 'Receipt uploaded successfully');
  } catch (err: any) {
    console.error('Receipt upload failed:', err);
    return error(res, 'Failed to upload receipt. Please try again.', 500);
  }
});

export const deleteReceipt = asyncHandler(async (req: AuthRequest, res) => {
  const { publicId } = req.body;
  if (!publicId) {
    return error(res, 'Public ID is required', 400);
  }

  try {
    await cloudinary.v2.uploader.destroy(publicId);
    return success(res, null, 'Receipt deleted successfully');
  } catch (err: any) {
    console.error('Receipt delete failed:', err);
    return error(res, 'Failed to delete receipt.', 500);
  }
});