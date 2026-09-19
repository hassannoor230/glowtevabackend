import mongoose, { Document } from 'mongoose';
export interface IPayment extends Document {
    order: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    method: 'COD' | 'BANK_TRANSFER' | 'JAZZCASH' | 'EASYPAISA' | 'STRIPE';
    amount: number;
    status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'NOT_RECEIVED' | 'REJECTED';
    transactionId?: string;
    receiptUrl?: string;
    accountReference?: string;
    adminNote?: string;
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Payment: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}, {}> & IPayment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Payment.d.ts.map