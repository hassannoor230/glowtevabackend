"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin = __importStar(require("../controllers/adminController.js"));
const settings = __importStar(require("../controllers/settingsController.js"));
const upload = __importStar(require("../controllers/uploadController.js"));
const manualPayment = __importStar(require("../controllers/manualPaymentController.js"));
const variant = __importStar(require("../controllers/variantController.js"));
const auth_js_1 = require("../middleware/auth.js");
const upload_js_1 = require("../middleware/upload.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.protect, (0, auth_js_1.restrictTo)('admin'));
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
router.post('/upload/image', (0, upload_js_1.uploadSingle)('image'), upload.uploadImage);
router.post('/upload/media', (0, upload_js_1.uploadSingle)('file'), upload.uploadMedia);
exports.default = router;
//# sourceMappingURL=admin.js.map