"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionStatus = exports.webhook = exports.createCheckoutSession = void 0;
const stripe_1 = __importDefault(require("stripe"));
const index_js_1 = require("../config/index.js");
const Order_js_1 = require("../models/Order.js");
const Product_js_1 = require("../models/Product.js");
const Coupon_js_1 = require("../models/Coupon.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
const stripe = index_js_1.config.stripeSecretKey
    ? new stripe_1.default(index_js_1.config.stripeSecretKey, { apiVersion: '2024-11-20.acacia' })
    : null;
exports.createCheckoutSession = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!stripe) {
        return (0, apiResponse_js_1.error)(res, 'Stripe is not configured. Please set STRIPE_SECRET_KEY.', 503);
    }
    const { orderId } = req.body;
    if (!orderId)
        return (0, apiResponse_js_1.error)(res, 'Order ID is required', 400);
    const order = await Order_js_1.Order.findById(orderId);
    if (!order)
        return (0, apiResponse_js_1.error)(res, 'Order not found', 404);
    if (order.user.toString() !== req.user.userId)
        return (0, apiResponse_js_1.error)(res, 'Not authorized', 403);
    if (order.paymentStatus === 'paid')
        return (0, apiResponse_js_1.error)(res, 'Order already paid', 400);
    const lineItems = order.items.map((item) => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.name,
                images: item.thumbnail ? [item.thumbnail] : [],
            },
            unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
    }));
    if (order.shippingCost > 0) {
        lineItems.push({
            price_data: {
                currency: 'usd',
                product_data: { name: 'Shipping', images: [] },
                unit_amount: Math.round(order.shippingCost * 100),
            },
            quantity: 1,
        });
    }
    const sessionParams = {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        success_url: `${index_js_1.config.clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order=${order.orderNumber}`,
        cancel_url: `${index_js_1.config.clientUrl}/checkout?cancelled=true`,
        customer_email: undefined,
        metadata: {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            userId: req.user.userId,
        },
    };
    if (order.discount > 0) {
        // Apply discount via coupon if needed; for simplicity adjust line items
    }
    const session = await stripe.checkout.sessions.create(sessionParams);
    order.paymentIntentId = session.id;
    await order.save();
    return (0, apiResponse_js_1.success)(res, { sessionId: session.id, url: session.url });
});
const webhook = async (req, res) => {
    if (!stripe) {
        return res.status(503).json({ success: false, message: 'Stripe not configured' });
    }
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        if (index_js_1.config.stripeWebhookSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, index_js_1.config.stripeWebhookSecret);
        }
        else {
            event = req.body;
        }
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (orderId) {
            const order = await Order_js_1.Order.findById(orderId);
            if (order && order.paymentStatus !== 'paid') {
                order.paymentStatus = 'paid';
                order.paymentIntentId = session.payment_intent;
                await order.save();
                for (const item of order.items) {
                    await Product_js_1.Product.findByIdAndUpdate(item.product, {
                        $inc: { stock: -item.quantity },
                    });
                }
                if (order.couponCode) {
                    await Coupon_js_1.Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
                }
            }
        }
    }
    res.json({ received: true });
};
exports.webhook = webhook;
exports.getSessionStatus = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!stripe)
        return (0, apiResponse_js_1.error)(res, 'Stripe not configured', 503);
    const session = await stripe.checkout.sessions.retrieve(String(req.params.sessionId));
    return (0, apiResponse_js_1.success)(res, {
        status: session.payment_status,
        orderId: session.metadata?.orderId,
    });
});
//# sourceMappingURL=paymentController.js.map