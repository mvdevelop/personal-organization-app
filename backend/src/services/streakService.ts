import { Habit, HabitLog } from '../models/Habit.js';

const STREAK_WINDOW_DAYS = 365; // max days to check — avoids loading all logs

export interface StreakResult {
  habitId: string
  title: string
  streak: number
  color: string
}

/**
 * Calculate the current streak for a single habit.
 * Only loads logs from the last STREAK_WINDOW_DAYS for performance.
 */
export async function calculateStreak(habit: any): Promise<StreakResult> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - STREAK_WINDOW_DAYS);
  cutoff.setHours(0, 0, 0, 0);

  const logs = await HabitLog.find({
    habitId: habit._id,
    completed: true,
    date: { $gte: cutoff },
  })
    .sort({ date: -1 })
    .lean();

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < logs.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const logDate = new Date(logs[i].date);
    logDate.setHours(0, 0, 0, 0);
    if (logDate.getTime() === expected.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return {
    habitId: habit._id.toString(),
    title: habit.title,
    streak,
    color: habit.color || '#3b82f6',
  };
}

/**
 * Calculate streaks for all habits of a user.
 */
export async function calculateAllStreaks(userId: string): Promise<StreakResult[]> {
  const habits = await Habit.find({ userId }).lean();
  return Promise.all(habits.map(calculateStreak));
}

/**
 * Get the best streak value across all habits.
 */
export async function getBestStreak(userId: string): Promise<number> {
  const streaks = await calculateAllStreaks(userId);
  return streaks.reduce((max, s) => (s.streak > max ? s.streak : max), 0);
}
