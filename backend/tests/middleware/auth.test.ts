import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('Auth Middleware', () => {
  describe('JWT Token Generation', () => {
    it('should generate a valid token with user payload', () => {
      const payload = { userId: '123456', email: 'test@example.com' };
      const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });

      const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
      expect(decoded.userId).toBe('123456');
      expect(decoded.email).toBe('test@example.com');
    });

    it('should reject invalid tokens', () => {
      const fakeToken = jwt.sign({ userId: '123' }, 'wrong-secret');
      expect(() => {
        jwt.verify(fakeToken, env.jwtSecret);
      }).toThrow();
    });

    it('should reject expired tokens', () => {
      const token = jwt.sign({ userId: '123' }, env.jwtSecret, { expiresIn: '-1h' });
      expect(() => {
        jwt.verify(token, env.jwtSecret);
      }).toThrow(jwt.TokenExpiredError);
    });
  });

  describe('JWT_SECRET Security', () => {
    it('should be at least 32 characters', () => {
      expect(env.jwtSecret.length).toBeGreaterThanOrEqual(32);
    });

    it('should not be the hard-coded fallback', () => {
      expect(env.jwtSecret).not.toBe('fallback-dev-secret');
      expect(env.jwtSecret).not.toBe('dev-secret-key-do-not-use-in-production');
    });
  });
});
