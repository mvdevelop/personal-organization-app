import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    res.status(409).json({ error: 'Registro já existe' });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
}
