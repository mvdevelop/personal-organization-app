/**
 * Jest test setup — runs before each test suite.
 */

// Mock environment variables for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = 'test-secret-key-for-jest-min-32-chars';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = 'http://localhost:5173';

// Increase timeout for async operations
jest.setTimeout(15000);
