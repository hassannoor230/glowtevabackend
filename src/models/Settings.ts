import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteSettings extends Document {
  name: string;
  tagline: string;
  description: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
    pinterest: string;
    youtube: string;
    tiktok: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  };
}

export interface IPaymentSettings extends Document {
  codEnabled: boolean;
  bankTransferEnabled: boolean;
  jazzcashEnabled: boolean;
  easypaisaEnabled: boolean;
  bankTransfer: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    branch: string;
    instructions: string;
  };
  jazzcash: {
    accountName: string;
    accountNumber: string;
    instructions: string;
  };
  easypaisa: {
    accountName: string;
    accountNumber: string;
    instructions: string;
  };
  generalInstructions: string;
}

export interface IHeroSection extends Document {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  position: number;
  active: boolean;
}

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  tags: string[];
  published: boolean;
  publishedAt?: Date;
}

export interface IMedia extends Document {
  url: string;
  alt: string;
  type: 'image' | 'video';
  folder: string;
  size: number;
}

const siteSettingsSchema = new Schema<ISiteSettings>({
  name: { type: String, default: 'GlowTeva Organics' },
  tagline: { type: String, default: 'Pure by Nature. Luxury by Choice.' },
  description: String,
  logo: String,
  favicon: String,
  contactEmail: String,
  contactPhone: String,
  address: String,
  socialLinks: {
    instagram: String,
    facebook: String,
    twitter: String,
    pinterest: String,
    youtube: String,
    tiktok: String,
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    ogImage: String,
  },
}, { timestamps: true });

const paymentSettingsSchema = new Schema<IPaymentSettings>({
  codEnabled: { type: Boolean, default: true },
  bankTransferEnabled: { type: Boolean, default: true },
  jazzcashEnabled: { type: Boolean, default: true },
  easypaisaEnabled: { type: Boolean, default: true },
  bankTransfer: {
    bankName: { type: String, default: '' },
    accountTitle: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    iban: { type: String, default: '' },
    branch: { type: String, default: '' },
    instructions: { type: String, default: '' },
  },
  jazzcash: {
    accountName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    instructions: { type: String, default: '' },
  },
  easypaisa: {
    accountName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    instructions: { type: String, default: '' },
  },
  generalInstructions: { type: String, default: '' },
}, { timestamps: true });

const heroSectionSchema = new Schema<IHeroSection>({
  title: { type: String, required: true },
  subtitle: String,
  description: String,
  image: String,
  ctaText: { type: String, default: 'Shop Now' },
  ctaLink: { type: String, default: '/shop' },
  position: { type: Number, default: 0 },
  active: { type: Boolean, default: false },
}, { timestamps: true });

const blogPostSchema = new Schema<IBlogPost>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  excerpt: String,
  content: String,
  featuredImage: String,
  author: String,
  tags: [String],
  published: { type: Boolean, default: false },
  publishedAt: Date,
}, { timestamps: true });

const mediaSchema = new Schema<IMedia>({
  url: { type: String, required: true },
  alt: String,
  type: { type: String, enum: ['image', 'video'], required: true },
  folder: { type: String, default: 'general' },
  size: { type: Number, required: true },
}, { timestamps: true });

export const SiteSettings = mongoose.model<ISiteSettings>('SiteSettings', siteSettingsSchema);
export const PaymentSettings = mongoose.model<IPaymentSettings>('PaymentSettings', paymentSettingsSchema);
export const HeroSection = mongoose.model<IHeroSection>('HeroSection', heroSectionSchema);
export const BlogPost = mongoose.model<IBlogPost>('BlogPost', blogPostSchema);
export const Media = mongoose.model<IMedia>('Media', mediaSchema);