import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentHistory extends Document {
  payment: mongoose.Types.ObjectId;
  status: string;
  note?: string;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const paymentHistorySchema = new Schema<IPaymentHistory>(
  {
    payment: { type: Schema.Types.ObjectId, ref: 'Payment', required: true, index: true },
    status: { type: String, required: true },
    note: { type: String, trim: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const PaymentHistory = mongoose.model<IPaymentHistory>('PaymentHistory', paymentHistorySchema);