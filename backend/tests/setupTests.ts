import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

process.env.JWT_SECRET = 'test-secret-key-for-jest-min-32-chars';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = 'http://localhost:5173';

let mongoServer: MongoMemoryServer;

jest.setTimeout(30000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGODB_URI);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map(collection => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
