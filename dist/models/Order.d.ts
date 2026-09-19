import mongoose, { Document } from 'mongoose';
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
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Order.d.ts.map