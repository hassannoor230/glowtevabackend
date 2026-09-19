import { Request, Response, NextFunction } from 'express';
interface HttpError extends Error {
    statusCode?: number;
    status?: number;
    code?: number;
    errors?: Record<string, any>;
    keyPattern?: Record<string, number>;
}
export declare const errorHandler: (err: HttpError, req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map