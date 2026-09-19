import mongoose, { Document, Schema } from 'mongoose';

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

const paymentSchema = new Schema<IPayment>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    method: {
      type: String,
      enum: ['COD', 'BANK_TRANSFER', 'JAZZCASH', 'EASYPAISA', 'STRIPE'],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'RECEIVED', 'NOT_RECEIVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    transactionId: { type: String, trim: true, index: true },
    receiptUrl: { type: String, trim: true },
    accountReference: { type: String, trim: true },
    adminNote: { type: String, trim: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

paymentSchema.index({ order: 1, method: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1, method: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);