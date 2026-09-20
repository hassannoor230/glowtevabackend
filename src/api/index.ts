import type { IncomingMessage, ServerResponse } from 'node:http';
import app from '../app.js';
import { emailService } from '../services/emailService.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

emailService.testConnection().then((ok) => {
  if (ok) {
    console.log('SMTP connection verified at startup.');
  } else {
    console.warn('SMTP connection FAILED at startup. Check SMTP_HOST, SMTP_USER, SMTP_PASS.');
  }
});

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await app(req, res);
}
