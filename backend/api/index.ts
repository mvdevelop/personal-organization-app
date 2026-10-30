import type { Request, Response } from 'express';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

// Vercel serverless handler — lazy DB connection
export default async function handler(req: Request, res: Response) {
  // Connect to DB on first request (subsequent calls are cached via isConnected flag)
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect to DB:', error);
  }
  return app(req, res);
}
