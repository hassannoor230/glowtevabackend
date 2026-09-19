import type { IncomingMessage, ServerResponse } from 'node:http';
import app from '../app.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await app(req, res);
}
