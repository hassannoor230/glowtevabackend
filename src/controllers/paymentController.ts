import Stripe from 'stripe';
import { Request, Response } from 'express';
import { config } from '../config/index.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.js';

const stripe = config.stripeSecretKey
  ? new Stripe(config.stripeSecretKey, { apiVersion: '2024-11-20.acacia' as any })
  : null;

export const createCheckoutSession = asyncHandler(async (req: AuthRequest, res) => {
  if (!stripe) {
    return error(res, 'Stripe is not configured. Please set STRIPE_SECRET_KEY.', 503);
  }

  const { orderId } = req.body;
  if (!orderId) return error(res, 'Order ID is required', 400);

  const order = await Order.findById(orderId);
  if (!order) return error(res, 'Order not found', 404);
  if (order.user.toString() !== req.user!.userId) return error(res, 'Not authorized', 403);
  if (order.paymentStatus === 'paid') return error(res, 'Order already paid', 400);

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

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    success_url: `${config.clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order=${order.orderNumber}`,
    cancel_url: `${config.clientUrl}/checkout?cancelled=true`,
    customer_email: undefined,
    metadata: {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      userId: req.user!.userId,
    },
  };

  if (order.discount > 0) {
    // Apply discount via coupon if needed; for simplicity adjust line items
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  order.paymentIntentId = session.id;
  await order.save();

  return success(res, { sessionId: session.id, url: session.url });
});

export const webhook = async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(503).json({ success: false, message: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    if (config.stripeWebhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, config.stripeWebhookSecret);
    } else {
      event = req.body as Stripe.Event;
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.paymentIntentId = session.payment_intent as string;
        await order.save();

        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          });
        }

        if (order.couponCode) {
          await Coupon.findOneAndUpdate(
            { code: order.couponCode },
            { $inc: { usedCount: 1 } }
          );
        }
      }
    }
  }

  res.json({ received: true });
};

export const getSessionStatus = asyncHandler(async (req, res) => {
  if (!stripe) return error(res, 'Stripe not configured', 503);
  const session = await stripe.checkout.sessions.retrieve(String(req.params.sessionId));
  return success(res, {
    status: session.payment_status,
    orderId: session.metadata?.orderId,
  });
});
