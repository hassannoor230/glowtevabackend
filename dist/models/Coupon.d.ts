import mongoose, { Document } from 'mongoose';
export interface ICoupon extends Document {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minimumOrder: number;
    maxDiscount?: number;
    expiryDate: Date;
    usageLimit: number;
    usedCount: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Coupon: mongoose.Model<ICoupon, {}, {}, {}, mongoose.Document<unknown, {}, ICoupon, {}, {}> & ICoupon & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Coupon.d.ts.map