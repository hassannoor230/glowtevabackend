import mongoose, { Document } from 'mongoose';
export interface INewsletter extends Document {
    email: string;
    isActive: boolean;
    subscribedAt: Date;
}
export declare const Newsletter: mongoose.Model<INewsletter, {}, {}, {}, mongoose.Document<unknown, {}, INewsletter, {}, {}> & INewsletter & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Newsletter.d.ts.map