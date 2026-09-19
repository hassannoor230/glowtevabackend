import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  productType: string;
  skinConcerns: string[];
  ingredients: string[];
  benefits: string[];
  howToUse: string;
  images: string[];
  thumbnail: string;
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  tags: string[];
  options: IProductOption[];
  variants: IProductVariant[];
  status: 'active' | 'draft' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductOption {
  name: string;
  values: string[];
}

export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  sku: string;
  options: Record<string, string>;
  price?: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  weight?: string;
  image?: string;
  images: string[];
  barcode?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt?: Date;
  updatedAt?: Date;
}

const productOptionSchema = new Schema<IProductOption>({
  name: { type: String, required: true, trim: true },
  values: { type: [String], required: true, validate: (values: string[]) => values.length > 0 },
}, { _id: false });

const productVariantSchema = new Schema<IProductVariant>({
  sku: { type: String, required: true, trim: true },
  options: { type: Schema.Types.Mixed, required: true },
  price: { type: Number, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  lowStockThreshold: { type: Number, min: 0, default: 5 },
  weight: String,
  image: String,
  images: { type: [String], default: [] },
  barcode: String,
  status: { type: String, enum: ['active', 'inactive', 'out_of_stock'], default: 'active' },
}, { _id: true, timestamps: true });

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    category: { type: String, required: true, index: true },
    productType: { type: String, required: true, index: true },
    skinConcerns: [{ type: String }],
    ingredients: [{ type: String }],
    benefits: [{ type: String }],
    howToUse: { type: String, default: '' },
    images: [{ type: String }],
    thumbnail: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    tags: [{ type: String, default: [] }],
    options: { type: [productOptionSchema], default: [] },
    variants: { type: [productVariantSchema], default: [] },
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', ingredients: 'text' });
productSchema.index({ category: 1, productType: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1, bestSeller: 1, newArrival: 1 });
productSchema.index({ 'variants.sku': 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
