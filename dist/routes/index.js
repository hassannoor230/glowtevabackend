"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = __importDefault(require("./auth.js"));
const products_js_1 = __importDefault(require("./products.js"));
const orders_js_1 = __importDefault(require("./orders.js"));
const reviews_js_1 = __importDefault(require("./reviews.js"));
const payments_js_1 = __importDefault(require("./payments.js"));
const users_js_1 = __importDefault(require("./users.js"));
const journal_js_1 = __importDefault(require("./journal.js"));
const admin_js_1 = __importDefault(require("./admin.js"));
const misc_js_1 = __importDefault(require("./misc.js"));
const notifications_js_1 = __importDefault(require("./notifications.js"));
const router = (0, express_1.Router)();
router.use('/auth', auth_js_1.default);
router.use('/products', products_js_1.default);
router.use('/orders', orders_js_1.default);
router.use('/reviews', reviews_js_1.default);
router.use('/payments', payments_js_1.default);
router.use('/users', users_js_1.default);
router.use('/journal', journal_js_1.default);
router.use('/notifications', notifications_js_1.default);
router.use('/admin', admin_js_1.default);
router.use('/', misc_js_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map