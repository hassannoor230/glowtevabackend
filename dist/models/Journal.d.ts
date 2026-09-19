import mongoose, { Document } from 'mongoose';
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
export declare const Journal: mongoose.Model<IJournal, {}, {}, {}, mongoose.Document<unknown, {}, IJournal, {}, {}> & IJournal & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Journal.d.ts.map