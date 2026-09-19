import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/apiResponse.js';
import { Media } from '../models/Settings.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return error(res, 'No file uploaded', 400);
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'glowteva/products',
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    const uploadResult = result as any;
    return success(res, { url: uploadResult.secure_url }, 'Image uploaded successfully');
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return error(res, 'Failed to upload image', 500);
  }
});

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return error(res, 'No file uploaded', 400);
  }

  try {
    const isVideo = req.file.mimetype.startsWith('video/');
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'glowteva/media',
          resource_type: isVideo ? 'video' : 'image',
          transformation: isVideo ? undefined : [
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    const uploadResult = result as any;
    
    // Save to database
    const media = await Media.create({
      url: uploadResult.secure_url,
      alt: req.file!.originalname,
      type: isVideo ? 'video' : 'image',
      folder: 'general',
      size: req.file!.size,
    });

    return success(res, { url: uploadResult.secure_url, _id: media._id }, 'Media uploaded successfully');
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return error(res, 'Failed to upload media', 500);
  }
});