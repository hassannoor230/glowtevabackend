import { Router } from 'express';
import * as notification from '../services/notificationService.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', notification.getNotifications);
router.get('/unread-count', notification.getUnreadCount);
router.put('/read-all', notification.markAllAsRead);
router.put('/:id/read', notification.markAsRead);
router.delete('/:id', notification.deleteNotification);

export default router;