import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  try {
    await mongoose.connect(env.mongodbUri, {
      maxPoolSize: env.nodeEnv === 'production' ? 5 : 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
    });
    isConnected = true;
    console.log('📦 MongoDB connected');

    await seedAchievements();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't crash in serverless — let the next request retry
    if (env.nodeEnv !== 'production') {
      process.exit(1);
    }
  }
}

async function seedAchievements(): Promise<void> {
  const { Achievement, DEFAULT_ACHIEVEMENTS } = await import('../models/Achievement.js');
  for (const ach of DEFAULT_ACHIEVEMENTS) {
    await Achievement.findOneAndUpdate(
      { slug: ach.slug },
      ach,
      { upsert: true, new: true },
    );
  }
  console.log(`🏆 ${DEFAULT_ACHIEVEMENTS.length} achievements seeded`);
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});
