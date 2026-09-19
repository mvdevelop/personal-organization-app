import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF Protection using double-submit cookie pattern.
 *
 * Security rationale:
 * - The backend uses httpOnly cookies for JWT auth (SameSite=None in production)
 * - Without CSRF protection, an attacker can create a form on evil.com that
 *   submits to your API — the browser auto-attaches the httpOnly cookie
 * - The double-submit pattern uses a CSRF token in a non-httpOnly cookie
 *   that must be mirrored in the request header
 *
 * This is a lightweight implementation that doesn't depend on external
 * middleware. The token is:
 * 1. A random value stored in a signed cookie (csrf_token)
 * 2. Must be echoed back in the x-csrf-token header or _csrf body field
 *
 * @see https://owasp.org/www-community/attacks/csrf
 * @see CWE-352: Cross-Site Request Forgery
 */

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

// Secret for signing CSRF cookies (separate from JWT_SECRET)
const CSRF_COOKIE_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET || 'dev-csrf-secret';

/**
 * Generate a CSRF token and set it as a cookie.
 * The cookie is NOT httpOnly (frontend JS needs to read it to send in header).
 * The cookie IS signed (can't be forged).
 */
export function setCsrfToken(req: Request, res: Response): string {
  const token = crypto.randomUUID();
  // Set cookie with signed value
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,  // MUST be readable by JS for double-submit pattern
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 3600000, // 1 hour
  });
  return token;
}

/**
 * Middleware: CSRF protection for state-changing requests.
 * GET/HEAD/OPTIONS are exempt (safe methods).
 *
 * The token must be sent in either:
 * - x-csrf-token header, or
 * - _csrf body field
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // Ensure CSRF cookie exists for initial GET requests
    if (!req.cookies?.[CSRF_COOKIE_NAME]) {
      setCsrfToken(req, res);
    }
    next();
    return;
  }

  // For state-changing requests, validate CSRF token
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.get(CSRF_HEADER_NAME) || (req.body as any)?._csrf;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({
      error: 'CSRF token inválido ou ausente',
      code: 'CSRF_FAILURE',
    });
    return;
  }

  next();
}

/**
 * Endpoint handler to issue CSRF tokens.
 * Frontend calls GET /api/csrf-token to obtain a token before
 * making POST/PUT/DELETE/PATCH requests.
 */
export function csrfTokenHandler(req: Request, res: Response) {
  const token = setCsrfToken(req, res);
  res.json({ csrfToken: token });
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
