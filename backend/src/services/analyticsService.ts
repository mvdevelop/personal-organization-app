import mongoose from 'mongoose';
import { Task } from '../models/Task.js';
import { Habit, HabitLog } from '../models/Habit.js';
import { Goal } from '../models/Goal.js';
import { Subject, StudySession } from '../models/Subject.js';
import { Note } from '../models/Note.js';

type Period = '7d' | '30d' | '90d' | '365d';

function getDateRange(period: Period): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  if (period === '7d') start.setDate(start.getDate() - 7);
  else if (period === '30d') start.setDate(start.getDate() - 30);
  else if (period === '90d') start.setDate(start.getDate() - 90);
  else if (period === '365d') start.setDate(start.getDate() - 365);

  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getTaskTrends(userId: string, period: Period) {
  const { start, end } = getDateRange(period);
  const objectId = new mongoose.Types.ObjectId(userId);

  const trends = await Task.aggregate([
    {
      $match: {
        userId: objectId,
        updatedAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' },
        },
        completed: { $sum: { $cond: ['$completed', 1, 0] } },
        total: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill gaps with zero data
  const filled = fillDateGaps(
    trends.map((t) => ({
      date: t._id,
      completed: t.completed,
      total: t.total,
      rate: t.total > 0 ? Math.round((t.completed / t.total) * 100) : 0,
    })),
    start,
    end
  );

  return filled;
}

export async function getHabitConsistency(userId: string, period: Period) {
  const { start, end } = getDateRange(period);
  const objectId = new mongoose.Types.ObjectId(userId);

  const habits = await Habit.find({ userId }).select('_id title color').lean();
  const logs = await HabitLog.find({
    userId: objectId,
    date: { $gte: start, $lte: end },
  }).lean();

  // Build consistency matrix: habit × date
  const matrix: Record<
    string,
    { habitId: string; habitTitle: string; color: string; dates: Record<string, boolean> }
  > = {};

  habits.forEach((h) => {
    matrix[h._id.toString()] = {
      habitId: h._id.toString(),
      habitTitle: h.title,
      color: h.color || '#3b82f6',
      dates: {},
    };
  });

  // Fill in completed dates
  logs.forEach((log) => {
    const habitId = log.habitId.toString();
    const date = formatDate(new Date(log.date));
    if (habitId in matrix) {
      matrix[habitId].dates[date] = log.completed;
    }
  });

  // Fill missing dates with false
  let current = new Date(start);
  while (current <= end) {
    const dateStr = formatDate(current);
    Object.values(matrix).forEach((h) => {
      if (!(dateStr in h.dates)) {
        h.dates[dateStr] = false;
      }
    });
    current.setDate(current.getDate() + 1);
  }

  return Object.values(matrix).sort((a, b) => a.habitTitle.localeCompare(b.habitTitle));
}

export async function getStudyAnalytics(userId: string, period: Period) {
  const { start, end } = getDateRange(period);
  const objectId = new mongoose.Types.ObjectId(userId);

  // Sessions by subject
  const sessionsBySubject = await StudySession.aggregate([
    {
      $match: {
        userId: objectId,
        date: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: 'subjects',
        localField: 'subjectId',
        foreignField: '_id',
        as: 'subject',
      },
    },
    {
      $group: {
        _id: '$subject.name',
        sessions: { $sum: 1 },
        totalMinutes: { $sum: '$duration' },
      },
    },
    { $sort: { totalMinutes: -1 } },
  ]);

  // Daily distribution
  const dailyDistribution = await StudySession.aggregate([
    {
      $match: {
        userId: objectId,
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' },
        },
        sessions: { $sum: 1 },
        totalMinutes: { $sum: '$duration' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // By technique (if available in schema)
  const byTechnique = await StudySession.aggregate([
    {
      $match: {
        userId: objectId,
        date: { $gte: start, $lte: end },
        technique: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: '$technique',
        sessions: { $sum: 1 },
        totalMinutes: { $sum: '$duration' },
      },
    },
    { $sort: { totalMinutes: -1 } },
  ]);

  return {
    bySubject: sessionsBySubject.map((s) => ({
      name: s._id?.[0] || 'Sem categoria',
      sessions: s.sessions,
      hours: Math.round((s.totalMinutes / 60) * 10) / 10,
    })),
    daily: fillDateGaps(
      dailyDistribution.map((d) => ({
        date: d._id,
        sessions: d.sessions,
        hours: Math.round((d.totalMinutes / 60) * 10) / 10,
      })),
      start,
      end
    ),
    byTechnique: byTechnique.map((t) => ({
      name: t._id || 'Sem técnica',
      sessions: t.sessions,
      hours: Math.round((t.totalMinutes / 60) * 10) / 10,
    })),
  };
}

export async function getProductivityMetrics(userId: string, period: Period) {
  const { start, end } = getDateRange(period);
  const objectId = new mongoose.Types.ObjectId(userId);

  const [
    totalTasks,
    completedTasks,
    totalHabits,
    completedHabits,
    totalSessions,
    totalMinutes,
    activeGoals,
  ] = await Promise.all([
    Task.countDocuments({ userId, createdAt: { $gte: start, $lte: end } }),
    Task.countDocuments({
      userId,
      completed: true,
      updatedAt: { $gte: start, $lte: end },
    }),
    Habit.countDocuments({ userId }),
    HabitLog.countDocuments({
      userId: objectId,
      completed: true,
      date: { $gte: start, $lte: end },
    }),
    StudySession.countDocuments({
      userId: objectId,
      date: { $gte: start, $lte: end },
    }),
    StudySession.aggregate([
      {
        $match: {
          userId: objectId,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$duration' },
        },
      },
    ]),
    Goal.countDocuments({ userId, status: 'active' }),
  ]);

  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const habitConsistency =
    totalHabits > 0 ? Math.round((completedHabits / (totalHabits * 7)) * 100) : 0;
  const avgStudyHoursPerDay =
    Math.round(((totalMinutes[0]?.total || 0) / 60 / Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))) * 10) / 10;

  return {
    period,
    dateRange: { start: formatDate(start), end: formatDate(end) },
    tasks: {
      created: totalTasks,
      completed: completedTasks,
      completionRate: taskCompletionRate,
    },
    habits: {
      total: totalHabits,
      checkIns: completedHabits,
      consistency: habitConsistency,
    },
    studies: {
      sessions: totalSessions,
      totalHours: Math.round((totalMinutes[0]?.total || 0) / 60 * 10) / 10,
      avgHoursPerDay: avgStudyHoursPerDay,
    },
    goals: {
      active: activeGoals,
    },
  };
}

export async function getExportData(userId: string, period: Period) {
  const { start, end } = getDateRange(period);

  const [tasks, habits, goals, notes, studies] = await Promise.all([
    Task.find({ userId, updatedAt: { $gte: start, $lte: end } })
      .select('title completed priority dueDate createdAt updatedAt')
      .lean(),
    Habit.find({ userId })
      .select('title frequency color createdAt')
      .lean(),
    Goal.find({ userId, updatedAt: { $gte: start, $lte: end } })
      .select('title type status targetValue currentValue createdAt')
      .lean(),
    Note.find({ userId, updatedAt: { $gte: start, $lte: end } })
      .select('title content updatedAt')
      .lean(),
    StudySession.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: start, $lte: end },
    })
      .select('duration technique date createdAt')
      .lean(),
  ]);

  const metrics = await getProductivityMetrics(userId, period);

  return {
    exportedAt: new Date().toISOString(),
    period,
    dateRange: { start: formatDate(start), end: formatDate(end) },
    metrics,
    data: {
      tasks: tasks.map((t: any) => ({
        title: t.title,
        completed: t.completed,
        priority: t.priority,
        dueDate: t.dueDate ? formatDate(new Date(t.dueDate)) : null,
        createdAt: formatDate(new Date(t.createdAt)),
      })),
      habits: habits.map((h: any) => ({
        title: h.title,
        frequency: h.frequency,
        createdAt: formatDate(new Date(h.createdAt)),
      })),
      goals: goals.map((g: any) => ({
        title: g.title,
        type: g.type,
        status: g.status,
        progress: g.targetValue ? Math.round((g.currentValue / g.targetValue) * 100) : 0,
      })),
      notes: notes.length,
      studySessions: studies.length,
    },
  };
}

function fillDateGaps(
  data: Array<{ date: string; [key: string]: any }>,
  start: Date,
  end: Date
): Array<{ date: string; [key: string]: any }> {
  const filled: Array<{ date: string; [key: string]: any }> = [];
  let current = new Date(start);

  const dataMap = new Map(data.map((d) => [d.date, d]));

  while (current <= end) {
    const dateStr = formatDate(current);
    const existing = dataMap.get(dateStr);

    if (existing) {
      filled.push(existing);
    } else {
      const template = data[0] || {};
      const empty: { date: string; [key: string]: any } = { date: dateStr };
      Object.keys(template).forEach((k) => {
        if (k !== 'date' && typeof template[k] === 'number') {
          empty[k] = 0;
        }
      });
      filled.push(empty);
    }

    current.setDate(current.getDate() + 1);
  }

  return filled;
}
