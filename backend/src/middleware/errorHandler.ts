import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import crypto from 'crypto';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Generate a stable error ID for client-side correlation without
 * exposing internal stack traces or error details.
 *
 * @see CWE-209: Generation of Error Message Containing Sensitive Information
 * @see OWASP A04:2021 — Insecure Design
 */
function generateErrorId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const errorId = generateErrorId();
  const requestId = (req as any).requestId || 'unknown';

  if (err instanceof AppError) {
    // Known application errors: return the safe message
    res.status(err.statusCode).json({ error: err.message, errorId, requestId });
    return;
  }

  // Zod validation error
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Dados inválidos', details: err.errors, errorId, requestId });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message, errorId, requestId });
    return;
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    res.status(409).json({ error: 'Registro já existe', errorId, requestId });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({ error: 'ID inválido', errorId, requestId });
    return;
  }

  // Unhandled errors — log full details server-side, return generic message
  // Security: stack traces must NOT be sent to the client (CWE-209)
  // Log to stderr with error ID for correlation, but strip any potential PII
  const safeLog = {
    errorId,
    requestId,
    method: req.method,
    url: req.originalUrl,
    // Only log message, not full stack in production
    message: process.env.NODE_ENV === 'production'
      ? err.message.slice(0, 200)
      : err.stack || err.message,
  };
  console.error('[SERVER ERROR]', JSON.stringify(safeLog));

  res.status(500).json({
    error: 'Erro interno do servidor',
    errorId,
    requestId,
    // Instruct client to reference this ID when contacting support
    message: 'Ocorreu um erro inesperado. Referência: ' + errorId,
  });
}
