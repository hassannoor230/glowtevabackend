import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    user: mongoose.Types.ObjectId;
    type: 'ORDER' | 'PAYMENT' | 'SYSTEM' | 'PROMOTION';
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map