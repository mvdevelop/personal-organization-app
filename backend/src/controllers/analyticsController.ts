import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analyticsService.js';
import { AppError } from '../middleware/errorHandler.js';

type Period = '7d' | '30d' | '90d' | '365d';

function validatePeriod(period: any): period is Period {
  return ['7d', '30d', '90d', '365d'].includes(period);
}

export async function getTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { period = '30d' } = req.query;
    if (!validatePeriod(period)) {
      throw new AppError('Invalid period. Use: 7d, 30d, 90d, 365d', 400);
    }

    const trends = await analyticsService.getTaskTrends(userId, period);

    res.json({
      period,
      data: trends,
      summary: {
        totalTasks: trends.reduce((sum, t) => sum + t.total, 0),
        completed: trends.reduce((sum, t) => sum + t.completed, 0),
        avgCompletionRate:
          trends.length > 0
            ? Math.round(trends.reduce((sum, t) => sum + t.rate, 0) / trends.length)
            : 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getHabitAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { period = '30d' } = req.query;
    if (!validatePeriod(period)) {
      throw new AppError('Invalid period. Use: 7d, 30d, 90d, 365d', 400);
    }

    const consistency = await analyticsService.getHabitConsistency(userId, period);

    // Calculate stats
    const totalHabits = consistency.length;
    let totalDays = 0;
    let totalCompleted = 0;

    consistency.forEach((h) => {
      const dates = Object.values(h.dates);
      totalDays += dates.length;
      totalCompleted += dates.filter((d) => d).length;
    });

    res.json({
      period,
      habits: consistency,
      summary: {
        totalHabits,
        overallConsistency: totalDays > 0 ? Math.round((totalCompleted / totalDays) * 100) : 0,
        bestConsistencyHabit:
          consistency.length > 0
            ? consistency.reduce((best, h) => {
                const hCompleted = Object.values(h.dates).filter((d) => d).length;
                const hTotal = Object.values(h.dates).length;
                const bestCompleted = Object.values(best.dates).filter((d) => d).length;
                const bestTotal = Object.values(best.dates).length;
                return hTotal > 0 && bestTotal > 0 && hCompleted / hTotal > bestCompleted / bestTotal
                  ? h
                  : best;
              })
            : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudyAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { period = '30d' } = req.query;
    if (!validatePeriod(period)) {
      throw new AppError('Invalid period. Use: 7d, 30d, 90d, 365d', 400);
    }

    const analytics = await analyticsService.getStudyAnalytics(userId, period);

    res.json({
      period,
      analytics,
      summary: {
        totalSessions: analytics.daily.reduce((sum, d) => sum + d.sessions, 0),
        totalHours: Math.round(analytics.daily.reduce((sum, d) => sum + d.hours, 0) * 10) / 10,
        avgHoursPerDay:
          analytics.daily.length > 0
            ? Math.round((analytics.daily.reduce((sum, d) => sum + d.hours, 0) / analytics.daily.length) * 10) /
              10
            : 0,
        favoriteSubject: analytics.bySubject[0]?.name || 'N/A',
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { period = '30d' } = req.query;
    if (!validatePeriod(period)) {
      throw new AppError('Invalid period. Use: 7d, 30d, 90d, 365d', 400);
    }

    const metrics = await analyticsService.getProductivityMetrics(userId, period);

    res.json(metrics);
  } catch (error) {
    next(error);
  }
}

export async function exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { period = '30d', format = 'json' } = req.query;

    if (!validatePeriod(period)) {
      throw new AppError('Invalid period. Use: 7d, 30d, 90d, 365d', 400);
    }

    if (!['json', 'csv'].includes(format as string)) {
      throw new AppError('Invalid format. Use: json, csv', 400);
    }

    const data = await analyticsService.getExportData(userId, period);

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${period}-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${period}-${Date.now()}.json"`);
      res.json(data);
    }
  } catch (error) {
    next(error);
  }
}

function convertToCSV(data: any): string {
  const lines: string[] = [];

  // Header
  lines.push(`Analytics Export - ${data.exportedAt}`);
  lines.push(`Period: ${data.period} (${data.dateRange.start} to ${data.dateRange.end})`);
  lines.push('');

  // Metrics
  lines.push('=== PRODUCTIVITY METRICS ===');
  lines.push('Tasks');
  lines.push(`Created,${data.metrics.tasks.created}`);
  lines.push(`Completed,${data.metrics.tasks.completed}`);
  lines.push(`Completion Rate,${data.metrics.tasks.completionRate}%`);
  lines.push('');

  lines.push('Habits');
  lines.push(`Total,${data.metrics.habits.total}`);
  lines.push(`Check-ins,${data.metrics.habits.checkIns}`);
  lines.push(`Consistency,${data.metrics.habits.consistency}%`);
  lines.push('');

  lines.push('Studies');
  lines.push(`Sessions,${data.metrics.studies.sessions}`);
  lines.push(`Total Hours,${data.metrics.studies.totalHours}`);
  lines.push(`Avg Hours/Day,${data.metrics.studies.avgHoursPerDay}`);
  lines.push('');

  // Task data
  if (data.data.tasks.length > 0) {
    lines.push('=== TASKS ===');
    lines.push('Title,Completed,Priority,Due Date,Created');
    data.data.tasks.forEach((t: any) => {
      const title = `"${(t.title || '').replace(/"/g, '""')}"`;
      lines.push(
        `${title},${t.completed ? 'Yes' : 'No'},${t.priority},${t.dueDate || 'N/A'},${t.createdAt}`
      );
    });
    lines.push('');
  }

  // Goals data
  if (data.data.goals.length > 0) {
    lines.push('=== GOALS ===');
    lines.push('Title,Type,Status,Progress');
    data.data.goals.forEach((g: any) => {
      const title = `"${(g.title || '').replace(/"/g, '""')}"`;
      lines.push(`${title},${g.type},${g.status},${g.progress}%`);
    });
    lines.push('');
  }

  return lines.join('\n');
}
