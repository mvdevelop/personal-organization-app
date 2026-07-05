import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter — 100 requests per minute per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em instantes.' },
});

/**
 * Strict rate limiter for auth endpoints — 10 attempts per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Aguarde 15 minutos.' },
});
