import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment variable ${key} is required in production`);
    }
    return fallback || '';
  }
  return value;
}

/**
 * Ensure JWT_SECRET is a strong, random value.
 * In production, it MUST be provided via environment variable.
 * In development, generate a random one if not set (so the app still boots).
 *
 * Security rationale:
 * CWE-916: Using a hard-coded password fallback allows an attacker who
 * knows the default to forge JWT tokens.
 *
 * CVSS: 9.8 (Critical) — CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length < 32) {
      throw new Error(
        'JWT_SECRET must be at least 32 characters in production. ' +
        'Generate one with: openssl rand -base64 48'
      );
    }
  }

  // Development: generate a random secret (not persisted, so tokens invalidate on restart — that's fine for dev)
  console.warn('[SECURITY] JWT_SECRET not set or too short — generating random dev secret');
  return crypto.randomBytes(48).toString('base64');
}

export const env = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: requireEnv('MONGODB_URI', 'mongodb://localhost:27017/personal-org'),
  jwtSecret: getJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()),
  openRouterKey: process.env.OPENROUTER_API_KEY || '',
  openRouterModel: process.env.OPENROUTER_MODEL || 'gpt-4o-mini',
};
