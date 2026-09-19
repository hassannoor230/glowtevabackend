import { Request, Response } from 'express';
export declare const createCheckoutSession: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const webhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSessionStatus: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=paymentController.d.ts.map