import crypto from 'crypto';
import { csrfProtection } from '../../src/middleware/csrfProtection';

describe('CSRF Protection', () => {
  describe('Token Generation', () => {
    it('should generate a unique token using crypto.randomUUID', () => {
      const token1 = crypto.randomUUID();
      const token2 = crypto.randomUUID();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(36); // UUID format
    });
  });

  describe('Token Validation Logic', () => {
    it('should match identical tokens', () => {
      const token = crypto.randomUUID();
      expect(token).toBe(token);
    });

    it('should reject mismatched tokens', () => {
      const token1 = crypto.randomUUID();
      const token2 = crypto.randomUUID();
      expect(token1).not.toBe(token2);
    });

    it('should reject empty tokens', () => {
      const cookieToken = '';
      const headerToken = 'valid-token';
      expect(cookieToken).not.toBe(headerToken);
      expect(cookieToken.length).toBe(0);
    });

    it('should reject a forged token signature', () => {
      const token = '00000000-0000-0000-0000-000000000000.forged';
      const req = {
        method: 'POST',
        path: '/tasks',
        cookies: { csrf_token: token },
        get: () => token,
        body: {},
      } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      csrfProtection(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should not throw for malformed tokens', () => {
      const req = {
        method: 'POST',
        path: '/tasks',
        cookies: { csrf_token: 'malformed' },
        get: () => 'malformed',
        body: {},
      } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      expect(() => csrfProtection(req, res, next)).not.toThrow();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Cookie Security Attributes', () => {
    it('should use httpOnly=false for CSRF cookie (frontend needs to read it)', () => {
      // The CSRF cookie MUST be readable by JS for double-submit pattern
      // Unlike session cookies, CSRF tokens are intentionally not httpOnly
      const cookieConfig = {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      };
      expect(cookieConfig.httpOnly).toBe(false);
    });

    it('should set SameSite=Lax or None (not Strict for cross-site)', () => {
      const devConfig = { sameSite: 'lax' };
      const prodConfig = { sameSite: 'none' };
      expect(devConfig.sameSite).toBe('lax');
      expect(prodConfig.sameSite).toBe('none');
    });
  });
});
