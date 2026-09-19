import { Router } from 'express';
import * as review from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

router.get('/product/:productId', review.getReviews);
router.post('/product/:productId', protect, review.createReview);
router.get('/', protect, restrictTo('admin'), review.getAllReviews);
router.delete('/:id', protect, restrictTo('admin'), review.deleteReview);

export default router;
