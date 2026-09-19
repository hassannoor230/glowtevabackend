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
const payment = __importStar(require("../controllers/paymentController.js"));
const manual = __importStar(require("../controllers/manualPaymentController.js"));
const auth_js_1 = require("../middleware/auth.js");
const upload_js_1 = require("../middleware/upload.js");
const receipt = __importStar(require("../controllers/receiptController.js"));
const router = (0, express_1.Router)();
router.post('/create-checkout-session', auth_js_1.protect, payment.createCheckoutSession);
router.get('/session/:sessionId', payment.getSessionStatus);
router.get('/settings', auth_js_1.protect, manual.getPaymentSettings);
router.post('/manual', auth_js_1.protect, manual.submitManualPayment);
router.post('/receipt', auth_js_1.protect, (0, upload_js_1.uploadSingle)('receipt'), receipt.uploadReceipt);
router.get('/mine', auth_js_1.protect, manual.getMyPayments);
router.get('/mine/:id', auth_js_1.protect, manual.getMyPayment);
exports.default = router;
//# sourceMappingURL=payments.js.map