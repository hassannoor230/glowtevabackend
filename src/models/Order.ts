import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  selectedOptions?: Record<string, string>;
  name: string;
  slug: string;
  thumbnail: string;
  price: number;
  sku: string;
  quantity: number;
  subtotal?: number;
}

export interface IShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface IOrderStatusHistory {
  status: string;
  note?: string;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ITrackingInfo {
  courier?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  lastUpdate?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  shippingAddress: IShippingAddress;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: 'COD' | 'BANK_TRANSFER' | 'JAZZCASH' | 'EASYPAISA' | 'STRIPE';
  paymentReference?: string;
  paymentIntentId?: string;
  orderStatus: 'PENDING' | 'PAYMENT_PENDING' | 'PAYMENT_CONFIRMED' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';
  couponCode?: string;
  notes?: string;
  tracking?: ITrackingInfo;
  statusHistory: IOrderStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId },
  selectedOptions: { type: Schema.Types.Mixed },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  thumbnail: { type: String, required: true },
  price: { type: Number, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number },
});

const shippingAddressSchema = new Schema<IShippingAddress>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: String,
});

const orderStatusHistorySchema = new Schema<IOrderStatusHistory>({
  status: { type: String, required: true },
  note: { type: String, trim: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const trackingSchema = new Schema<ITrackingInfo>({
  courier: { type: String, trim: true },
  trackingNumber: { type: String, trim: true },
  estimatedDelivery: { type: Date },
  lastUpdate: { type: String, trim: true },
});

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'BANK_TRANSFER', 'JAZZCASH', 'EASYPAISA', 'STRIPE'],
    },
    paymentReference: { type: String, trim: true },
    paymentIntentId: String,
    orderStatus: {
      type: String,
      enum: [
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
      ],
      default: 'PENDING',
    },
    couponCode: String,
    notes: String,
    tracking: { type: trackingSchema, default: {} },
    statusHistory: { type: [orderStatusHistorySchema], default: [] },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ paymentMethod: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);