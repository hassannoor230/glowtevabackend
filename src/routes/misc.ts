import { Router } from 'express';
import * as misc from '../controllers/miscController.js';
import { contactLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/newsletter', misc.subscribeNewsletter);
router.post('/contact', contactLimiter, misc.submitContact);
router.post('/coupon/validate', misc.validateCoupon);
router.get('/categories', misc.getCategories);
router.get('/categories/tree', misc.getCategoriesWithChildren);

export default router;
