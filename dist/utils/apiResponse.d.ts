import { Response } from 'express';
export declare const success: (res: Response, data?: any, message?: string, status?: number) => Response<any, Record<string, any>>;
export declare const error: (res: Response, message?: string, status?: number, errors?: any) => Response<any, Record<string, any>>;
//# sourceMappingURL=apiResponse.d.ts.map