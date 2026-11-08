import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env.js';

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

function getBodyCsrfToken(body: unknown): string | undefined {
  if (!body || typeof body !== 'object' || !('_csrf' in body)) return undefined;
  const token = (body as { _csrf?: unknown })._csrf;
  return typeof token === 'string' ? token : undefined;
}

function tokensMatch(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}


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
    secure: env.useCrossOriginCookies,
    sameSite: env.useCrossOriginCookies ? 'none' : 'lax',
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
  // Login and registration do not rely on an existing authentication cookie.
  // Exempting them also allows a first-time cross-origin client to establish
  // a session when the CSRF cookie has not been persisted yet.
  if (req.method === 'POST' && ['/auth/login', '/auth/register'].includes(req.path)) {
    next();
    return;
  }

  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // Ensure CSRF cookie exists for initial GET requests
    if (!req.cookies?.[CSRF_COOKIE_NAME]) {
      const token = setCsrfToken(req, res);
      req.cookies = req.cookies || {};
      req.cookies[CSRF_COOKIE_NAME] = token;
    }
    next();
    return;
  }

  // For state-changing requests, validate CSRF token
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.get(CSRF_HEADER_NAME) || getBodyCsrfToken(req.body);

  if (!cookieToken || !headerToken || !tokensMatch(cookieToken, headerToken)) {
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
  const shouldRotate = req.query.refresh === '1';
  const token = !shouldRotate && req.cookies?.[CSRF_COOKIE_NAME]
    ? req.cookies[CSRF_COOKIE_NAME]
    : setCsrfToken(req, res);
  res.json({ csrfToken: token });
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
