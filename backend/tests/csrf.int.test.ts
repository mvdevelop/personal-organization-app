import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';

describe('CSRF Protection', () => {
  describe('GET /api/csrf-token', () => {
    it('should issue a CSRF token', async () => {
      const res = await request(app).get('/api/csrf-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('csrfToken');
      expect(typeof res.body.csrfToken).toBe('string');
      expect(res.body.csrfToken.length).toBeGreaterThan(0);
      // Should also set cookie
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });

  describe('POST /api/tasks (CSRF protected)', () => {
    let token: string;
    let userToken: string;
    let cookies: string[];

    beforeEach(async () => {
      // Get CSRF token
      const csrfRes = await request(app).get('/api/csrf-token');
      token = csrfRes.body.csrfToken;
      cookies = csrfRes.headers['set-cookie'] || [];

      // Create user and get auth token
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'csrf@example.com',
          password: 'password123',
        });
      userToken = res.body.token;
    });

    it('should allow POST with matching CSRF token', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Cookie', cookies)
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-csrf-token', token)
        .send({
          title: 'Test Task',
          description: 'A test task',
          priority: 'medium',
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Test Task');
    });

    it('should reject POST without CSRF token', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Cookie', cookies)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Task',
          description: 'A test task',
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('CSRF');
    });

    it('should reject POST with mismatched CSRF token', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Cookie', cookies)
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-csrf-token', 'wrong-token')
        .send({
          title: 'Test Task',
          description: 'A test task',
        });

      expect(res.status).toBe(403);
    });
  });
});
