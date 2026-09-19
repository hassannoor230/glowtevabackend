import { Response } from 'express';

export const success = (res: Response, data: any = null, message = 'Success', status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

export const error = (res: Response, message = 'Error', status = 400, errors: any = null) => {
  return res.status(status).json({ success: false, message, errors });
};
