import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log('📦 MongoDB connected');
    await seedAchievements();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
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
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});
