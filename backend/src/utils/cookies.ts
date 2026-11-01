import { Response } from 'express';
import { env } from '../config/env.js';

const COOKIE_NAME = 'auth_token';
const crossOriginCookieOptions = {
  secure: env.useCrossOriginCookies,
  sameSite: (env.useCrossOriginCookies ? 'none' : 'lax') as 'none' | 'lax',
};
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days (matches JWT_EXPIRES_IN)

/**
 * Set the JWT as an httpOnly cookie on the response.
 * This protects against XSS attacks vs localStorage.
 */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    ...crossOriginCookieOptions,
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Clear the auth cookie (for logout).
 */
export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    ...crossOriginCookieOptions,
    path: '/',
  });
}

export { COOKIE_NAME };
