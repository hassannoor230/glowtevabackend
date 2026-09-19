import { Request, Response } from 'express';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.js';

export const createNotification = async (userId: string, data: {
  type: 'ORDER' | 'PAYMENT' | 'SYSTEM' | 'PROMOTION';
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}) => {
  try {
    return await Notification.create({
      user: userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      metadata: data.metadata,
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
};

export const getNotifications = asyncHandler(async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const unreadOnly = req.query.unread === 'true';

  const filter: any = { user: req.user!.userId };
  if (unreadOnly) filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user!.userId, isRead: false }),
  ]);

  return success(res, {
    notifications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    unreadCount,
  });
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user!.userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) return error(res, 'Notification not found', 404);
  return success(res, notification, 'Notification marked as read');
});

export const markAllAsRead = asyncHandler(async (req: AuthRequest, res) => {
  await Notification.updateMany(
    { user: req.user!.userId, isRead: false },
    { isRead: true }
  );
  return success(res, null, 'All notifications marked as read');
});

export const deleteNotification = asyncHandler(async (req: AuthRequest, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user!.userId,
  });
  if (!notification) return error(res, 'Notification not found', 404);
  return success(res, null, 'Notification deleted');
});

export const getUnreadCount = asyncHandler(async (req: AuthRequest, res) => {
  const count = await Notification.countDocuments({
    user: req.user!.userId,
    isRead: false,
  });
  return success(res, { count });
});