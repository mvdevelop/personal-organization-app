import mongoose, { Schema, type Document } from 'mongoose';

export interface IUnlockedAchievement {
  slug: string
  unlockedAt: Date
}

export interface IUserStats extends Document {
  userId: mongoose.Types.ObjectId
  xp: number
  level: number
  unlockedAchievements: IUnlockedAchievement[]
  counters: {
    tasksCreated: number
    tasksCompleted: number
    habitsCreated: number
    goalsCreated: number
    goalsCompleted: number
    studySessions: number
    studyMinutes: number
    notesCreated: number
  }
  createdAt: Date
  updatedAt: Date
}

const userStatsSchema = new Schema<IUserStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    unlockedAchievements: [
      {
        slug: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
    counters: {
      tasksCreated: { type: Number, default: 0 },
      tasksCompleted: { type: Number, default: 0 },
      habitsCreated: { type: Number, default: 0 },
      goalsCreated: { type: Number, default: 0 },
      goalsCompleted: { type: Number, default: 0 },
      studySessions: { type: Number, default: 0 },
      studyMinutes: { type: Number, default: 0 },
      notesCreated: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const UserStats = mongoose.model<IUserStats>('UserStats', userStatsSchema);

export function xpForLevel(level: number): number {
  return 100 * Math.pow(level, 1.5);
}

export function calculateLevel(totalXp: number): number {
  let level = 1;
  while (totalXp >= xpForLevel(level)) {
    totalXp -= xpForLevel(level);
    level++;
  }
  return level;
}

export function levelProgress(totalXp: number): { currentLevel: number; currentXp: number; nextLevelXp: number; progress: number } {
  let remaining = totalXp;
  let level = 1;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  const needed = xpForLevel(level);
  return {
    currentLevel: level,
    currentXp: remaining,
    nextLevelXp: needed,
    progress: Math.round((remaining / needed) * 100),
  };
}
