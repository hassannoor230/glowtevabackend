"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = exports.createNotification = void 0;
const Notification_js_1 = require("../models/Notification.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
const createNotification = async (userId, data) => {
    try {
        return await Notification_js_1.Notification.create({
            user: userId,
            type: data.type,
            title: data.title,
            message: data.message,
            link: data.link,
            metadata: data.metadata,
        });
    }
    catch (err) {
        console.error('Failed to create notification:', err);
        return null;
    }
};
exports.createNotification = createNotification;
exports.getNotifications = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const unreadOnly = req.query.unread === 'true';
    const filter = { user: req.user.userId };
    if (unreadOnly)
        filter.isRead = false;
    const [notifications, total, unreadCount] = await Promise.all([
        Notification_js_1.Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Notification_js_1.Notification.countDocuments(filter),
        Notification_js_1.Notification.countDocuments({ user: req.user.userId, isRead: false }),
    ]);
    return (0, apiResponse_js_1.success)(res, {
        notifications,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        unreadCount,
    });
});
exports.markAsRead = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const notification = await Notification_js_1.Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, { isRead: true }, { new: true });
    if (!notification)
        return (0, apiResponse_js_1.error)(res, 'Notification not found', 404);
    return (0, apiResponse_js_1.success)(res, notification, 'Notification marked as read');
});
exports.markAllAsRead = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    await Notification_js_1.Notification.updateMany({ user: req.user.userId, isRead: false }, { isRead: true });
    return (0, apiResponse_js_1.success)(res, null, 'All notifications marked as read');
});
exports.deleteNotification = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const notification = await Notification_js_1.Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user.userId,
    });
    if (!notification)
        return (0, apiResponse_js_1.error)(res, 'Notification not found', 404);
    return (0, apiResponse_js_1.success)(res, null, 'Notification deleted');
});
exports.getUnreadCount = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const count = await Notification_js_1.Notification.countDocuments({
        user: req.user.userId,
        isRead: false,
    });
    return (0, apiResponse_js_1.success)(res, { count });
});
//# sourceMappingURL=notificationService.js.map