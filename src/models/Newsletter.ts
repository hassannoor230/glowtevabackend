import mongoose, { Document, Schema } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
}

const newsletterSchema = new Schema<INewsletter>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now },
});

export const Newsletter = mongoose.model<INewsletter>('Newsletter', newsletterSchema);
