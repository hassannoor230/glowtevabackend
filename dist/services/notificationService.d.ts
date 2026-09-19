export declare const createNotification: (userId: string, data: {
    type: "ORDER" | "PAYMENT" | "SYSTEM" | "PROMOTION";
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, any>;
}) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Notification.js").INotification, {}, {}> & import("../models/Notification.js").INotification & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const getNotifications: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const markAsRead: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const markAllAsRead: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const deleteNotification: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getUnreadCount: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=notificationService.d.ts.map