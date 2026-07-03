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

    // Tasks
    const totalTasks = await Task.countDocuments({ userId });
    const pendingTasks = await Task.countDocuments({ userId, completed: false });
    const completedTasks = await Task.countDocuments({ userId, completed: true });
    const todayTasks = await Task.countDocuments({
      userId,
      dueDate: { $gte: today, $lt: tomorrow },
    });
    const overdueTasks = await Task.countDocuments({
      userId,
      completed: false,
      dueDate: { $lt: today, $ne: null },
    });
    const recentTasks = await Task.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Habits
    const totalHabits = await Habit.countDocuments({ userId });
    const todayLogs = await HabitLog.countDocuments({
      userId,
      date: { $gte: today, $lt: tomorrow },
      completed: true,
    });

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

    // Goals
    const activeGoals = await Goal.countDocuments({ userId, status: 'active' });
    const completedGoals = await Goal.countDocuments({ userId, status: 'completed' });
    const recentGoals = await Goal.find({ userId, status: 'active' })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    // Studies
    const totalSubjects = await Subject.countDocuments({ userId });
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekSessions = await StudySession.countDocuments({
      userId,
      date: { $gte: weekAgo },
    });
    const weekStudyHours = await StudySession.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: weekAgo } } },
      { $group: { _id: null, total: { $sum: '$duration' } } },
    ]);
    const totalStudyMinutes = weekStudyHours[0]?.total || 0;

    // Notes
    const totalNotes = await Note.countDocuments({ userId });
    const recentNotes = await Note.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(3)
      .select('title updatedAt')
      .lean();

    res.json({
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        completed: completedTasks,
        today: todayTasks,
        overdue: overdueTasks,
        recent: recentTasks.map((t: any) => ({
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
        recent: recentGoals.map((g: any) => ({
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
        recent: recentNotes.map((n: any) => ({
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
