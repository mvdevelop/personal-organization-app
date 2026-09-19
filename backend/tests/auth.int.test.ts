import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'securepassword123',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'not-an-email',
          password: 'securepassword123',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '12345',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject duplicate email', async () => {
      // Create first user
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      });

      // Try to register with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'existing@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('Email já cadastrado');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await User.create({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('login@example.com');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('inválidos');
    });

    it('should reject login for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data when authenticated', async () => {
      // Register and get token
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Auth User',
          email: 'auth@example.com',
          password: 'securepassword123',
        });

      const token = registerRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('auth@example.com');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  describe('Token security', () => {
    it('should generate valid JWT with correct payload', async () => {
      const user = await User.create({
        name: 'JWT Test',
        email: 'jwt@example.com',
        password: 'password123',
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn as any },
      );

      const decoded = jwt.verify(token, env.jwtSecret) as { userId: string; email: string };
      expect(decoded.userId).toBe(user.id);
      expect(decoded.email).toBe(user.email);
    });

    it('should hash password with bcrypt', async () => {
      const user = await User.create({
        name: 'Hash Test',
        email: 'hash@example.com',
        password: 'mypassword',
      });

      // Password should be hashed (not plain text)
      expect(user.password).not.toBe('mypassword');
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hashes are ~60 chars
    });
  });
});
