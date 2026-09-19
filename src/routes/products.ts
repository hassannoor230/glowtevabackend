import { Router } from 'express';
import * as product from '../controllers/productController.js';
import * as variant from '../controllers/variantController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

router.get('/', product.getProducts);
router.get('/featured', product.getFeatured);
router.get('/best-sellers', product.getBestSellers);
router.get('/slug/:slug', product.getProductBySlug);
router.get('/:id/related', product.getRelated);
router.get('/:id', product.getProductById);
router.get('/:productId/variant/by-options', variant.getVariantByOptions);
router.post('/', protect, restrictTo('admin'), product.createProduct);
router.put('/:id', protect, restrictTo('admin'), product.updateProduct);
router.delete('/:id', protect, restrictTo('admin'), product.deleteProduct);

export default router;
