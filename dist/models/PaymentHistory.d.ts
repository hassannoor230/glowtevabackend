import mongoose, { Document } from 'mongoose';
export interface IPaymentHistory extends Document {
    payment: mongoose.Types.ObjectId;
    status: string;
    note?: string;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
}
export declare const PaymentHistory: mongoose.Model<IPaymentHistory, {}, {}, {}, mongoose.Document<unknown, {}, IPaymentHistory, {}, {}> & IPaymentHistory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=PaymentHistory.d.ts.map