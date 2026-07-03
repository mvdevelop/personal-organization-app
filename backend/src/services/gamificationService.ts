import { UserStats, calculateLevel, xpForLevel, type IUserStats } from '../models/UserStats.js';
import { Achievement, type IAchievement } from '../models/Achievement.js';
import { Task } from '../models/Task.js';
import { Habit, HabitLog } from '../models/Habit.js';
import { Goal } from '../models/Goal.js';
import { StudySession } from '../models/Subject.js';
import { Note } from '../models/Note.js';

type CounterKey = keyof IUserStats['counters'];

const XP_EVENTS: Record<string, { xp: number; counter?: CounterKey }> = {
  task_created: { xp: 5, counter: 'tasksCreated' },
  task_completed: { xp: 15, counter: 'tasksCompleted' },
  habit_created: { xp: 10, counter: 'habitsCreated' },
  goal_created: { xp: 20, counter: 'goalsCreated' },
  goal_completed: { xp: 50, counter: 'goalsCompleted' },
  study_session: { xp: 10, counter: 'studySessions' },
  study_minute: { xp: 1, counter: 'studyMinutes' },
  note_created: { xp: 5, counter: 'notesCreated' },
  habit_checkin: { xp: 3 },
};

export async function awardXP(
  userId: string,
  event: string,
  metadata?: { duration?: number },
): Promise<{ xpGained: number; newLevel: number; newAchievements: string[] }> {
  const eventConfig = XP_EVENTS[event];
  if (!eventConfig) return { xpGained: 0, newLevel: 0, newAchievements: [] };

  let xpGained = eventConfig.xp;

  // Bonus for study minutes
  if (event === 'study_minute' && metadata?.duration) {
    xpGained = Math.round(metadata.duration / 60) * 1;
  }

  let stats = await UserStats.findOne({ userId });
  if (!stats) {
    stats = await UserStats.create({ userId });
  }

  stats.xp += xpGained;
  if (eventConfig.counter) {
    const key = eventConfig.counter;
    stats.counters[key] = (stats.counters[key] || 0) + 1;
  }

  const newLevel = calculateLevel(stats.xp);
  const leveledUp = newLevel > stats.level;
  stats.level = newLevel;

  const newAchievements = await checkAchievements(stats);
  if (newAchievements.length > 0) {
    for (const slug of newAchievements) {
      if (!stats.unlockedAchievements.find((a) => a.slug === slug)) {
        stats.unlockedAchievements.push({ slug, unlockedAt: new Date() });
      }
    }
  }

  await stats.save();

  return {
    xpGained,
    newLevel: leveledUp ? newLevel : 0,
    newAchievements,
  };
}

async function checkAchievements(stats: IUserStats): Promise<string[]> {
  const allAchievements = await Achievement.find();
  const unlocked = stats.unlockedAchievements.map((a) => a.slug);
  const newlyUnlocked: string[] = [];

  for (const ach of allAchievements) {
    if (unlocked.includes(ach.slug)) continue;

    let earned = false;
    const { type, value } = ach.condition;

    switch (type) {
      case 'tasks_created':
        earned = stats.counters.tasksCreated >= value;
        break;
      case 'tasks_completed':
        earned = stats.counters.tasksCompleted >= value;
        break;
      case 'habits_created':
        earned = stats.counters.habitsCreated >= value;
        break;
      case 'goals_created':
        earned = stats.counters.goalsCreated >= value;
        break;
      case 'goals_completed':
        earned = stats.counters.goalsCompleted >= value;
        break;
      case 'study_sessions':
        earned = stats.counters.studySessions >= value;
        break;
      case 'study_hours':
        earned = Math.floor(stats.counters.studyMinutes / 60) >= value;
        break;
      case 'notes_created':
        earned = stats.counters.notesCreated >= value;
        break;
      case 'total_items': {
        const total =
          stats.counters.tasksCreated +
          stats.counters.notesCreated +
          stats.counters.habitsCreated;
        earned = total >= value;
        break;
      }
      case 'streak_7':
      case 'streak_30': {
        // Check if user has a habit with streak >= value
        const habits = await Habit.find({ userId: stats.userId });
        for (const habit of habits) {
          const logs = await HabitLog.find({ habitId: habit._id, completed: true })
            .sort({ date: -1 })
            .limit(value);
          // Simple streak check
          if (logs.length >= value) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let streakOk = true;
            for (let i = 0; i < value; i++) {
              const expected = new Date(today);
              expected.setDate(expected.getDate() - i);
              const logDate = new Date(logs[i].date);
              logDate.setHours(0, 0, 0, 0);
              if (logDate.getTime() !== expected.getTime()) {
                streakOk = false;
                break;
              }
            }
            if (streakOk) { earned = true; break; }
          }
        }
        break;
      }
    }

    if (earned) {
      newlyUnlocked.push(ach.slug);
    }
  }

  return newlyUnlocked;
}

export async function recalculateAllStats(userId: string): Promise<void> {
  const tasks = await Task.find({ userId });
  const completedTasks = tasks.filter((t) => t.completed);
  const habits = await Habit.find({ userId });
  const goals = await Goal.find({ userId });
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const sessions = await StudySession.find({ userId });
  const notes = await Note.find({ userId });

  let stats = await UserStats.findOne({ userId });
  if (!stats) {
    stats = await UserStats.create({ userId });
  }

  stats.counters.tasksCreated = tasks.length;
  stats.counters.tasksCompleted = completedTasks.length;
  stats.counters.habitsCreated = habits.length;
  stats.counters.goalsCreated = goals.length;
  stats.counters.goalsCompleted = completedGoals.length;
  stats.counters.studySessions = sessions.length;
  stats.counters.studyMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
  stats.counters.notesCreated = notes.length;

  // Recalculate XP from events
  stats.xp = 0;
  stats.xp += stats.counters.tasksCreated * (XP_EVENTS.task_created?.xp || 0);
  stats.xp += stats.counters.tasksCompleted * (XP_EVENTS.task_completed?.xp || 0);
  stats.xp += stats.counters.habitsCreated * (XP_EVENTS.habit_created?.xp || 0);
  stats.xp += stats.counters.goalsCreated * (XP_EVENTS.goal_created?.xp || 0);
  stats.xp += stats.counters.goalsCompleted * (XP_EVENTS.goal_completed?.xp || 0);
  stats.xp += stats.counters.studySessions * (XP_EVENTS.study_session?.xp || 0);
  stats.xp += stats.counters.studyMinutes * (XP_EVENTS.study_minute?.xp || 0);
  stats.xp += stats.counters.notesCreated * (XP_EVENTS.note_created?.xp || 0);

  stats.level = calculateLevel(stats.xp);
  await stats.save();
}
