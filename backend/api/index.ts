import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

// Vercel serverless handler — lazy DB connection
export default async function handler(req: any, res: any) {
  // Connect to DB on first request (subsequent calls are cached via isConnected flag)
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect to DB:', error);
  }
  return app(req, res);
}
