import crypto from 'crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derive a stable encryption key from JWT_SECRET.
 * This avoids needing a separate encryption key env var
 * while still ensuring per-deployment uniqueness.
 */
function getEncryptionKey(): Buffer {
  // Use first 32 bytes of a SHA-256 hash of the JWT secret
  return crypto.createHash('sha256').update(env.jwtSecret).digest().slice(0, KEY_LENGTH);
}

/**
 * Encrypt a plaintext string (e.g., API key).
 * Returns a string in format: iv:tag:encrypted
 */
export function encrypt(text: string): string {
  if (!text) return '';

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // Format: iv:tag:encrypted (all base64)
  return [
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

/**
 * Decrypt a string encrypted with encrypt().
 */
export function decrypt(encrypted: string): string {
  if (!encrypted) return '';

  const key = getEncryptionKey();
  const parts = encrypted.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted value format');
  }

  const iv = Buffer.from(parts[0], 'base64');
  const tag = Buffer.from(parts[1], 'base64');
  const encryptedData = Buffer.from(parts[2], 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
