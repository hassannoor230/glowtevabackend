import { Router } from 'express';
import * as payment from '../controllers/paymentController.js';
import * as manual from '../controllers/manualPaymentController.js';
import { protect } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import * as receipt from '../controllers/receiptController.js';

const router = Router();

router.post('/create-checkout-session', protect, payment.createCheckoutSession);
router.get('/session/:sessionId', payment.getSessionStatus);
router.get('/settings', protect, manual.getPaymentSettings);
router.post('/manual', protect, manual.submitManualPayment);
router.post('/receipt', protect, uploadSingle('receipt'), receipt.uploadReceipt);
router.get('/mine', protect, manual.getMyPayments);
router.get('/mine/:id', protect, manual.getMyPayment);

export default router;
