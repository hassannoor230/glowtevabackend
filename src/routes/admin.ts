import { Router } from 'express';
import * as admin from '../controllers/adminController.js';
import * as product from '../controllers/productController.js';
import * as order from '../controllers/orderController.js';
import * as review from '../controllers/reviewController.js';
import * as user from '../controllers/userController.js';
import * as settings from '../controllers/settingsController.js';
import * as upload from '../controllers/uploadController.js';
import * as manualPayment from '../controllers/manualPaymentController.js';
import * as variant from '../controllers/variantController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = Router();

router.use(protect, restrictTo('admin'));

// Dashboard & Analytics
router.get('/stats', admin.getDashboardStats);
router.get('/analytics', admin.getAnalytics);

// Products
router.get('/products', admin.getAdminProducts);
router.get('/products/categories', admin.getAdminCategories);
router.post('/products', admin.createProduct);
router.get('/products/:id', admin.getAdminProductById);
router.put('/products/:id', admin.updateProduct);
router.delete('/products/:id', admin.deleteProduct);
router.put('/products/:id/stock', admin.updateProductStock);
router.put('/products/:productId/variants', variant.replaceVariants);
router.post('/products/:productId/variants', variant.addVariant);
router.post('/products/:productId/variants/generate', variant.generateVariants);
router.put('/products/:productId/variants/:variantId', variant.updateVariant);
router.delete('/products/:productId/variants/:variantId', variant.deleteVariant);

// Categories
router.get('/categories', admin.getAdminCategories);
router.post('/categories', admin.createCategory);
router.put('/categories/:id', admin.updateCategory);
router.delete('/categories/:id', admin.deleteCategory);

// Orders
router.get('/orders', admin.getAdminOrders);
router.get('/orders/:id', admin.getAdminOrderById);
router.put('/orders/:id', admin.updateOrder);
router.put('/orders/:id/status', admin.updateOrderStatus);
router.put('/orders/:id/tracking', admin.updateOrderTracking);

// Reviews
router.get('/reviews', admin.getAdminReviews);
router.put('/reviews/:id/status', admin.updateReviewStatus);
router.post('/reviews/:id/response', admin.addReviewResponse);

// Users
router.get('/users', admin.getAdminUsers);
router.put('/users/:id', admin.updateUser);
router.put('/users/:id/status', admin.updateUserStatus);
router.put('/users/:id/role', admin.updateUserRole);

// Inventory
router.get('/inventory', admin.getInventory);

// Settings
router.get('/settings', settings.getSettings);
router.put('/settings/site', settings.updateSiteSettings);
router.put('/settings/hero', settings.updateHeroSettings);
router.put('/settings/blog', settings.updateBlogSettings);
router.get('/settings/payment', settings.getPaymentSettings);
router.put('/settings/payment', settings.updatePaymentSettings);

// Payments
router.get('/payments', manualPayment.listPayments);
router.get('/payments/:id', manualPayment.getPaymentForAdmin);
router.put('/payments/:id/status', manualPayment.updatePaymentStatus);

// Upload
router.post('/upload/image', uploadSingle('image'), upload.uploadImage);
router.post('/upload/media', uploadSingle('file'), upload.uploadMedia);

export default router;
