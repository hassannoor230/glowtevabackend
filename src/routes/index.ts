import { Router } from 'express';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import orderRoutes from './orders.js';
import reviewRoutes from './reviews.js';
import paymentRoutes from './payments.js';
import userRoutes from './users.js';
import journalRoutes from './journal.js';
import adminRoutes from './admin.js';
import miscRoutes from './misc.js';
import notificationRoutes from './notifications.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/payments', paymentRoutes);
router.use('/users', userRoutes);
router.use('/journal', journalRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/', miscRoutes);

export default router;
