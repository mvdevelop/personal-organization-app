import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { Task } from '../src/models/Task';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

describe('Task Controller', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create a user and get auth token
    const user = await User.create({
      name: 'Task Test User',
      email: 'tasks@example.com',
      password: 'password123',
    });
    userId = user.id;
    authToken = jwt.sign(
      { userId: user.id, email: user.email },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as any },
    );
  });

  describe('GET /api/tasks', () => {
    it('should return tasks for authenticated user', async () => {
      // Create some tasks
      await Task.create([
        { title: 'Task 1', userId },
        { title: 'Task 2', userId },
      ]);

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app).get('/api/tasks');

      expect(res.status).toBe(401);
    });

    it('should filter by status', async () => {
      await Task.create([
        { title: 'Active Task', userId, completed: false },
        { title: 'Completed Task', userId, completed: true },
      ]);

      const activeRes = await request(app)
        .get('/api/tasks?filter=active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(activeRes.status).toBe(200);
      expect(activeRes.body.length).toBe(1);
      expect(activeRes.body[0].title).toBe('Active Task');

      const completedRes = await request(app)
        .get('/api/tasks?filter=completed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(completedRes.status).toBe(200);
      expect(completedRes.body.length).toBe(1);
      expect(completedRes.body[0].title).toBe('Completed Task');
    });

    it('should search tasks by title', async () => {
      await Task.create([
        { title: 'Buy groceries', userId },
        { title: 'Walk the dog', userId },
      ]);

      const res = await request(app)
        .get('/api/tasks?search=groceries')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Buy groceries');
    });

    it('should prevent NoSQL injection in search', async () => {
      // Attempt regex injection — should be escaped
      await Task.create([
        { title: 'Normal Task', userId },
        { title: '(special*chars)', userId },
      ]);

      const res = await request(app)
        .get('/api/tasks?search=(special*chars)')
        .set('Authorization', `Bearer ${authToken}`);

      // Should escape special chars and match literally
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('(special*chars)');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Task',
          description: 'Task description',
          priority: 'high',
          dueDate: '2025-12-31',
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('New Task');
      expect(res.body.priority).toBe('high');
      expect(res.body.userId).toBe(userId);
    });

    it('should reject task without title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'No title',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('BUL — Broken Object Level Authorization', () => {
    it('should not allow access to another user task', async () => {
      // Create task as user 1
      const task = await Task.create({
        title: 'Private Task',
        userId,
      });

      // Create user 2
      const user2 = await User.create({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password123',
      });

      const token2 = jwt.sign(
        { userId: user2.id, email: user2.email },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn as any },
      );

      // User 2 tries to update user 1's task
      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ title: 'Hacked' });

      expect(res.status).toBe(404); // Not found — user 2 can't see user 1's task
    });
  });
});
