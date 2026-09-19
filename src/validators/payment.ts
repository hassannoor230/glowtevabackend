import { z } from 'zod';

export const shippingAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.literal('Pakistan'),
  phone: z.string().optional(),
});

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().optional(),
    selectedOptions: z.record(z.string().min(1), z.string().min(1)).optional(),
    quantity: z.number().int().min(1),
  })).min(1),
  shippingAddress: shippingAddressSchema,
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER', 'JAZZCASH', 'EASYPAISA', 'STRIPE']).optional(),
  paymentReference: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2).max(100),
  text: z.string().min(10).max(1000),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(2000),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export const submitManualPaymentSchema = z.object({
  orderId: z.string().min(1),
  method: z.enum(['BANK_TRANSFER', 'JAZZCASH', 'EASYPAISA']),
  transactionId: z.string().min(1).max(100),
  accountReference: z.string().max(200).optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'RECEIVED', 'NOT_RECEIVED', 'REJECTED']),
  note: z.string().max(500).optional(),
});

export const updateOrderTrackingSchema = z.object({
  courier: z.string().max(100).optional(),
  trackingNumber: z.string().max(100).optional(),
  estimatedDelivery: z.string().optional(),
  lastUpdate: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'PAYMENT_PENDING',
    'PAYMENT_CONFIRMED',
    'CONFIRMED',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
    'REFUNDED',
  ]),
  note: z.string().max(500).optional(),
});

export const paymentSettingsSchema = z.object({
  codEnabled: z.boolean().optional(),
  bankTransferEnabled: z.boolean().optional(),
  jazzcashEnabled: z.boolean().optional(),
  easypaisaEnabled: z.boolean().optional(),
  bankTransfer: z.object({
    bankName: z.string().max(200).optional(),
    accountTitle: z.string().max(200).optional(),
    accountNumber: z.string().max(100).optional(),
    iban: z.string().max(100).optional(),
    branch: z.string().max(100).optional(),
    instructions: z.string().max(2000).optional(),
  }).optional(),
  jazzcash: z.object({
    accountName: z.string().max(200).optional(),
    accountNumber: z.string().max(100).optional(),
    instructions: z.string().max(2000).optional(),
  }).optional(),
  easypaisa: z.object({
    accountName: z.string().max(200).optional(),
    accountNumber: z.string().max(100).optional(),
    instructions: z.string().max(2000).optional(),
  }).optional(),
  generalInstructions: z.string().max(2000).optional(),
});