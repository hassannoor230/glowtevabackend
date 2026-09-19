import mongoose, { Document, Schema } from 'mongoose';

export interface IJournal extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  featured: boolean;
  published: boolean;
  publishedAt?: Date;
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const journalSchema = new Schema<IJournal>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    author: { type: String, default: 'GlowTeva Editorial' },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    publishedAt: Date,
    readingTime: { type: Number, default: 5 },
  },
  { timestamps: true }
);

journalSchema.index({ category: 1, published: 1 });

export const Journal = mongoose.model<IJournal>('Journal', journalSchema);
