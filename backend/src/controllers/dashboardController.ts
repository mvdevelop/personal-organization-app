import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Task } from '../models/Task.js';
import { Habit, HabitLog } from '../models/Habit.js';
import { Goal } from '../models/Goal.js';
import { Subject, StudySession } from '../models/Subject.js';
import { Note } from '../models/Note.js';

export async function getDashboardData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const objectId = new mongoose.Types.ObjectId(userId);

    // Run all independent queries in parallel
    const [
      totalTasks,
      pendingTasks,
      completedTasks,
      todayTasks,
      overdueTasks,
      recentTasksRaw,
      totalHabits,
      todayLogs,
      activeGoals,
      completedGoals,
      recentGoalsRaw,
      totalSubjects,
      weekSessions,
      weekStudyHoursAgg,
      totalNotes,
      recentNotesRaw,
    ] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, completed: false }),
      Task.countDocuments({ userId, completed: true }),
      Task.countDocuments({ userId, dueDate: { $gte: today, $lt: tomorrow } }),
      Task.countDocuments({ userId, completed: false, dueDate: { $lt: today, $ne: null } }),
      Task.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
      Habit.countDocuments({ userId }),
      HabitLog.countDocuments({ userId, date: { $gte: today, $lt: tomorrow }, completed: true }),
      Goal.countDocuments({ userId, status: 'active' }),
      Goal.countDocuments({ userId, status: 'completed' }),
      Goal.find({ userId, status: 'active' }).sort({ createdAt: -1 }).limit(3).lean(),
      Subject.countDocuments({ userId }),
      StudySession.countDocuments({ userId, date: { $gte: weekAgo } }),
      StudySession.aggregate([
        { $match: { userId: objectId, date: { $gte: weekAgo } } },
        { $group: { _id: null, total: { $sum: '$duration' } } },
      ]),
      Note.countDocuments({ userId }),
      Note.find({ userId }).sort({ updatedAt: -1 }).limit(3).select('title updatedAt').lean(),
    ]);

    // Streaks — also parallelized
    const habits = await Habit.find({ userId }).lean();
    const streaks = await Promise.all(
      habits.map(async (h) => {
        const logs = await HabitLog.find({ habitId: h._id, completed: true })
          .sort({ date: -1 })
          .lean();
        let streak = 0;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        for (let i = 0; i < logs.length; i++) {
          const expected = new Date(now);
          expected.setDate(expected.getDate() - i);
          const logDate = new Date(logs[i].date);
          logDate.setHours(0, 0, 0, 0);
          if (logDate.getTime() === expected.getTime()) streak++;
          else break;
        }
        return { title: h.title, streak, color: h.color };
      }),
    );
    const bestStreak = streaks.reduce((max, s) => (s.streak > max ? s.streak : max), 0);

    const totalStudyMinutes = weekStudyHoursAgg[0]?.total || 0;

    res.json({
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        completed: completedTasks,
        today: todayTasks,
        overdue: overdueTasks,
        recent: recentTasksRaw.map((t: any) => ({
          id: t._id.toString(),
          title: t.title,
          completed: t.completed,
          priority: t.priority,
          dueDate: t.dueDate,
        })),
      },
      habits: {
        total: totalHabits,
        todayCheckIns: todayLogs,
        bestStreak,
        streaks,
      },
      goals: {
        active: activeGoals,
        completed: completedGoals,
        recent: recentGoalsRaw.map((g: any) => ({
          id: g._id.toString(),
          title: g.title,
          type: g.type,
          targetValue: g.targetValue,
          currentValue: g.currentValue,
          deadline: g.deadline,
        })),
      },
      studies: {
        subjects: totalSubjects,
        weekSessions,
        weekStudyHours: Math.round(totalStudyMinutes / 60 * 10) / 10,
      },
      notes: {
        total: totalNotes,
        recent: recentNotesRaw.map((n: any) => ({
          id: n._id.toString(),
          title: n.title,
          updatedAt: n.updatedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}
