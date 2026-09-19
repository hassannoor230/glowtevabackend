import { Router } from 'express';
import * as user from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

router.get('/wishlist', protect, user.getWishlist);
router.post('/wishlist', protect, user.addToWishlist);
router.delete('/wishlist/:productId', protect, user.removeFromWishlist);
router.post('/addresses', protect, user.addAddress);
router.put('/addresses/:addressId', protect, user.updateAddress);
router.delete('/addresses/:addressId', protect, user.deleteAddress);
router.get('/', protect, restrictTo('admin'), user.getAllUsers);

export default router;
