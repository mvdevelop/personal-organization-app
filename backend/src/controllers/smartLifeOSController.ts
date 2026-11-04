import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task.js';
import { Habit, HabitLog } from '../models/Habit.js';
import { Goal } from '../models/Goal.js';
import { Subject, StudySession } from '../models/Subject.js';
import { SmartLifeOSPlan } from '../models/SmartLifeOSPlan.js';
import { SmartLifeOSSession } from '../models/SmartLifeOSSession.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { getCached, setCache, cacheKey } from '../utils/cache.js';

/**
 * Attention Signals — Critical alerts that need user's immediate attention.
 * Non-cacheable; computed on demand.
 */
export async function getAttentionSignals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [tasks, habits, habitLogs, goals] = await Promise.all([
      Task.find({ userId, completed: false }),
      Habit.find({ userId }),
      HabitLog.find({ userId }).sort({ date: -1 }).limit(100),
      Goal.find({ userId, status: 'active' }),
    ]);

    const signals: Array<{
      type: string;
      severity: 'critical' | 'warning' | 'info';
      title: string;
      description: string;
      entityId: string;
      action: string;
      actionUrl: string;
    }> = [];

    // Signal: Overdue tasks
    const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < today);
    if (overdueTasks.length > 0) {
      signals.push({
        type: 'overdue_tasks',
        severity: 'critical',
        title: `${overdueTasks.length} tarefa(s) atrasada(s)`,
        description: `Você tem ${overdueTasks.length} tarefa(s) que venceu(eram) o prazo`,
        entityId: overdueTasks[0]._id.toString(),
        action: 'Ver tarefas',
        actionUrl: '/tasks?filter=overdue',
      });
    }

    // Signal: Tasks due today
    const dueToday = tasks.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
    if (dueToday.length > 0) {
      signals.push({
        type: 'due_today',
        severity: 'warning',
        title: `${dueToday.length} tarefa(s) vence hoje`,
        description: `Cumpra ${dueToday.length} tarefa(s) até o final do dia`,
        entityId: dueToday[0]._id.toString(),
        action: 'Começar',
        actionUrl: '/tasks?filter=today',
      });
    }

    // Signal: Broken habit streaks
    const habitStreakBreaks: string[] = [];
    for (const habit of habits) {
      // Check if no log for yesterday and today
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const hasYesterday = habitLogs.some(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === yesterday.getTime() && log.habitId.toString() === habit._id.toString();
      });

      const hasToday = habitLogs.some(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime() && log.habitId.toString() === habit._id.toString();
      });

      if (!hasYesterday && !hasToday && habit.frequency === 'daily') {
        habitStreakBreaks.push(habit.title);
      }
    }

    if (habitStreakBreaks.length > 0) {
      signals.push({
        type: 'habit_streak_break',
        severity: 'warning',
        title: `${habitStreakBreaks.length} hábito(s) em risco`,
        description: `Você perdeu a sequência de: ${habitStreakBreaks.slice(0, 2).join(', ')}${habitStreakBreaks.length > 2 ? '...' : ''}`,
        entityId: '',
        action: 'Fazer check-in',
        actionUrl: '/habits',
      });
    }

    // Signal: No study this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const studySessions = await StudySession.countDocuments({
      userId,
      createdAt: { $gte: weekAgo },
    });

    if (studySessions === 0 && goals.some(g => g.type === 'learning')) {
      signals.push({
        type: 'no_study',
        severity: 'info',
        title: 'Sem progresso nos estudos esta semana',
        description: 'Você não registrou nenhuma sessão de estudo',
        entityId: '',
        action: 'Registrar estudo',
        actionUrl: '/studies',
      });
    }

    res.json({ signals: signals.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }) });
  } catch (error) {
    next(error);
  }
}

/**
 * Next Action — What should the user do RIGHT NOW?
 * Cached for 5 minutes.
 */
export async function getNextAction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;

    // Check cache
    const cacheKey_ = cacheKey(userId, 'next-action');
    const cached = getCached<{ action: unknown; source: string; confidence: number }>(cacheKey_);
    if (cached) {
      res.json(cached);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [overdueTasks, dueTodayTasks, habits, habitLogs] = await Promise.all([
      Task.find({ userId, completed: false, dueDate: { $lt: today } }).limit(1),
      Task.find({ userId, completed: false, dueDate: { $gte: today, $lt: new Date(today.getTime() + 86400000) } })
        .sort({ priority: -1 })
        .limit(1),
      Habit.find({ userId, frequency: 'daily' }).limit(5),
      HabitLog.find({ userId, date: { $gte: today } }),
    ]);

    let nextAction = null;
    let source = '';
    let confidence = 0.5;

    // Priority 1: Overdue tasks
    if (overdueTasks.length > 0) {
      nextAction = overdueTasks[0];
      source = 'Tarefa atrasada — resolva imediatamente';
      confidence = 0.95;
    }
    // Priority 2: High priority due today
    else if (dueTodayTasks.length > 0) {
      nextAction = dueTodayTasks[0];
      source = 'Tarefa com prazo hoje';
      confidence = 0.85;
    }
    // Priority 3: Missing habit check-in
    else {
      const uncheckedHabits = habits.filter(h => {
        const hasLogToday = habitLogs.some(log => log.habitId.toString() === h._id.toString());
        return !hasLogToday;
      });

      if (uncheckedHabits.length > 0) {
        nextAction = uncheckedHabits[0];
        source = 'Hábito diário — Mantenha a sequência';
        confidence = 0.7;
      }
    }

    const result = {
      action: nextAction ? {
        type: nextAction instanceof Habit ? 'habit' : 'task',
        id: nextAction._id,
        title: nextAction.title,
        description: nextAction.description || '',
      } : null,
      source,
      confidence,
      alternatives: [],
    };

    setCache(cacheKey_, result, 5 * 60 * 1000); // 5 min cache
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get today's plan or generate if it doesn't exist.
 */
export async function getDailyPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let plan = await SmartLifeOSPlan.findOne({
      userId,
      date: today,
    });

    // If no plan exists, create a simple one based on current tasks
    if (!plan) {
      const [tasks, habits, studies] = await Promise.all([
        Task.find({ userId, completed: false }).sort({ priority: -1 }).limit(5),
        Habit.find({ userId, frequency: 'daily' }).limit(3),
        StudySession.find({ userId, date: { $gte: today } }).limit(2),
      ]);

      const actions: any[] = [];
      let sequence = 0;

      // Add high-priority tasks
      for (const task of tasks) {
        actions.push({
          sequence: sequence++,
          type: 'task',
          entityId: task._id,
          entityTitle: task.title,
          estimatedDuration: 30, // Default 30 min
          completed: false,
        });
      }

      // Add habit check-ins
      for (const habit of habits) {
        actions.push({
          sequence: sequence++,
          type: 'habit',
          entityId: habit._id,
          entityTitle: habit.title,
          estimatedDuration: 5,
          completed: false,
        });
      }

      plan = await SmartLifeOSPlan.create({
        userId,
        date: today,
        aiGenerated: false,
        actions,
      });
    }

    res.json({
      plan,
      isToday: true,
      completionRate: plan.completionRate || 0,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a specific action in the daily plan.
 */
export async function updatePlanAction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { planId } = req.params;
    const { actionSequence, completed, notes } = req.body;

    const plan = await SmartLifeOSPlan.findOneAndUpdate(
      { _id: planId, userId },
      {
        $set: {
          [`actions.${actionSequence}.completed`]: completed,
          [`actions.${actionSequence}.notes`]: notes,
        },
      },
      { new: true },
    );

    if (!plan) {
      throw new AppError('Plano não encontrado', 404);
    }

    // Calculate completion rate
    const completedCount = plan.actions.filter(a => a.completed).length;
    plan.completionRate = (completedCount / plan.actions.length) * 100;
    await plan.save();

    res.json({ plan });
  } catch (error) {
    next(error);
  }
}

/**
 * Start a focus session.
 */
export async function startFocusSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { focusedOn, entityId, entityTitle, plannedDuration } = req.body;

    if (!focusedOn || !entityId || !plannedDuration) {
      throw new AppError('focusedOn, entityId, entityTitle e plannedDuration são obrigatórios', 400);
    }

    const session = await SmartLifeOSSession.create({
      userId,
      focusedOn,
      entityId,
      entityTitle,
      plannedDuration,
      startedAt: new Date(),
    });

    res.json({ session });
  } catch (error) {
    next(error);
  }
}

/**
 * Complete a focus session.
 */
export async function completeFocusSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { sessionId } = req.params;
    const { actualDuration, notes, completed } = req.body;

    const session = await SmartLifeOSSession.findOneAndUpdate(
      { _id: sessionId, userId },
      {
        completedAt: new Date(),
        actualDuration,
        notes,
        completed,
      },
      { new: true },
    );

    if (!session) {
      throw new AppError('Sessão não encontrada', 404);
    }

    // TODO: Award XP based on duration and focus
    // TODO: Update related entity (task completed, habit log, etc)

    res.json({ session });
  } catch (error) {
    next(error);
  }
}

/**
 * Get focus session history.
 */
export async function getFocusHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const sessions = await SmartLifeOSSession.find({ userId })
      .sort({ startedAt: -1 })
      .limit(limit);

    const stats = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.completed).length,
      totalMinutes: sessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0),
      averageSessionLength: sessions.length > 0
        ? Math.round(sessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0) / sessions.length)
        : 0,
    };

    res.json({ sessions, stats });
  } catch (error) {
    next(error);
  }
}
