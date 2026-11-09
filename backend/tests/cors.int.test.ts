import request from 'supertest';
import app from '../src/app';

describe('Production CORS behavior', () => {
  const allowedOrigin = 'http://localhost:5173';

  it('allows the configured frontend origin with credentials', async () => {
    const response = await request(app)
      .get('/api/csrf-token')
      .set('Origin', allowedOrigin);

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe(allowedOrigin);
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('does not grant CORS access to an unknown origin', async () => {
    const response = await request(app)
      .get('/api/csrf-token')
      .set('Origin', 'https://evil.example');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('handles preflight requests for the configured origin', async () => {
    const response = await request(app)
      .options('/api/auth/me')
      .set('Origin', allowedOrigin)
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'authorization');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(allowedOrigin);
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
});

it('does not expose secrets in the health response', async () => {
  const response = await request(app).get('/health');
  const body = JSON.stringify(response.body);

  expect(body).not.toContain(process.env.JWT_SECRET);
  expect(body).not.toContain(process.env.CSRF_SECRET || 'never-present');
});

it('sets Helmet security headers', async () => {
  const response = await request(app).get('/health');

  expect(response.headers['x-content-type-options']).toBe('nosniff');
  expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
  expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
});
