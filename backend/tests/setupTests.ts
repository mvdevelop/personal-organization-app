/**
 * Jest test setup — runs before each test suite.
 * Ensures tests are isolated and don't leak state.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

/**
 * Create an in-memory MongoDB instance before all tests.
 * This provides complete isolation from the dev/prod database.
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

/**
 * Close database connection after all tests complete.
 */
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

/**
 * Clear all collections between tests to maintain isolation.
 */
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
