import { Router } from 'express';
import * as order from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, order.createOrder);
router.get('/my', protect, order.getMyOrders);
router.get('/:id', protect, order.getOrderById);
router.get('/', protect, restrictTo('admin'), order.getAllOrders);
router.put('/:id/status', protect, restrictTo('admin'), order.updateOrderStatus);

export default router;
