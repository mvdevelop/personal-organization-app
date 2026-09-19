import { registerSchema, loginSchema } from '../../src/validators/authValidator';

describe('Auth Validators', () => {
  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepass123',
      };
      const result = registerSchema.parse(data);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
    });

    it('should reject email that is too short', () => {
      expect(() => {
        registerSchema.parse({
          name: 'John',
          email: 'a@b.c',
          password: '123456',
        });
      }).toThrow();
    });

    it('should reject password shorter than 6 characters', () => {
      expect(() => {
        registerSchema.parse({
          name: 'John',
          email: 'john@example.com',
          password: '12345',
        });
      }).toThrow();
    });

    it('should reject name shorter than 2 characters', () => {
      expect(() => {
        registerSchema.parse({
          name: 'J',
          email: 'john@example.com',
          password: '123456',
        });
      }).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const result = loginSchema.parse({
        email: 'user@example.com',
        password: 'anypassword',
      });
      expect(result.email).toBe('user@example.com');
    });

    it('should reject missing password', () => {
      expect(() => {
        loginSchema.parse({
          email: 'user@example.com',
          password: '',
        });
      }).toThrow();
    });

    it('should reject invalid email format', () => {
      expect(() => {
        loginSchema.parse({
          email: 'not-an-email',
          password: 'password',
        });
      }).toThrow();
    });
  });
});
