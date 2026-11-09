import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task.js';
import { Note } from '../models/Note.js';
import { Habit, HabitLog } from '../models/Habit.js';
import { Goal } from '../models/Goal.js';
import { Subject, StudySession } from '../models/Subject.js';
import { User } from '../models/User.js';
import { AIAudit } from '../models/AIAudit.js';
import { AIChat } from '../models/AIChat.js';
import { AIProvider } from '../models/AIProvider.js';
import { SmartLifeOSSession } from '../models/SmartLifeOSSession.js';
import { SmartLifeOSPlan } from '../models/SmartLifeOSPlan.js';
import { UserSettings } from '../models/UserSettings.js';
import { UserStats } from '../models/UserStats.js';
import { Domain } from '../models/Domain.js';
import { Types } from 'mongoose';

function getAuthenticatedUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId || !Types.ObjectId.isValid(userId)) throw new AppError('Unauthorized', 401);
  return userId;
}

function sanitizeProvider(provider: Record<string, unknown>): Record<string, unknown> {
  const { apiKey: _apiKey, ...safeProvider } = provider;
  return safeProvider;
}

function sanitizeAIProvider(document: { toObject: () => Record<string, unknown> } | null): Record<string, unknown> | null {
  if (!document) return null;
  const data = document.toObject();
  return {
    ...data,
    providers: Array.isArray(data.providers)
      ? data.providers.map(provider => sanitizeProvider(provider as Record<string, unknown>))
      : [],
  };
}
import { AppError } from '../middleware/errorHandler.js';

/**
 * Export user's personal data in a standardized format (GDPR/LGPD compliance)
 * GET /api/user/export
 */
export async function exportUserData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) throw new AppError('Unauthorized', 401);

    console.log('[User] Data export requested', { userId });

    // Fetch all user data in parallel
    const [user, tasks, notes, habits, habitLogs, goals, subjects, studySessions, focusSessions, plans, domains, aiAudits, aiChats, aiProvider, settings, stats] = await Promise.all([
      User.findById(userId).select('-password'),
      Task.find({ userId }), Note.find({ userId }), Habit.find({ userId }), HabitLog.find({ userId }),
      Goal.find({ userId }), Subject.find({ userId }), StudySession.find({ userId }),
      SmartLifeOSSession.find({ userId }), SmartLifeOSPlan.find({ userId }), Domain.find({ userId }),
      AIAudit.find({ userId }).select('-prompt'), AIChat.find({ userId }).select('-messages'),
      AIProvider.findOne({ userId }), UserSettings.findOne({ userId }), UserStats.findOne({ userId }),
    ]);

    // Construct export object
    const exportData = {
      exportDate: new Date().toISOString(),
      format: 'smart-agenda-v1',
      user: {
        ...user?.toObject(),
        password: '[redacted]', // Never export password
      },
      data: {
        tasks,
        notes,
        habits,
        habitLogs,
        goals,
        subjects,
        studySessions,
        focusSessions,
        plans,
        domains,
        aiAudits,
        aiChats,
        aiProvider: sanitizeAIProvider(aiProvider),
        settings,
        stats,
      },
      summary: {
        totalTasks: tasks.length,
        totalNotes: notes.length,
        totalHabits: habits.length,
        totalHabitLogs: habitLogs.length,
        totalGoals: goals.length,
        totalSubjects: subjects.length,
        totalStudySessions: studySessions.length,
        totalFocusSessions: focusSessions.length,
        totalPlans: plans.length,
        totalDomains: domains.length,
        totalAIAudits: aiAudits.length,
        totalAIChats: aiChats.length,
      },
    };

    console.log('[User] Data export completed', { userId, summary: exportData.summary });

    // Return as JSON file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="smart-agenda-export-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  } catch (error) {
    next(error);
  }
}

/**
 * Permanently delete user account and all associated data
 * DELETE /api/user
 * Requires password confirmation for security
 */
export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) throw new AppError('Unauthorized', 401);

    const { password } = req.body;
    if (!password || typeof password !== 'string') {
      throw new AppError('Password confirmation required', 400);
    }

    // Verify password before deletion
    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('User not found', 404);

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) throw new AppError('Invalid password', 401);

    console.warn('[User] Account deletion initiated', { userId, email: user.email });

    // Delete all user data in parallel (cascading delete)
    await Promise.all([
      Task.deleteMany({ userId }),
      Note.deleteMany({ userId }),
      Habit.deleteMany({ userId }),
      HabitLog.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
      Subject.deleteMany({ userId }),
      StudySession.deleteMany({ userId }),
      SmartLifeOSSession.deleteMany({ userId }),
      SmartLifeOSPlan.deleteMany({ userId }),
      Domain.deleteMany({ userId }),
      AIAudit.deleteMany({ userId }),
      AIChat.deleteMany({ userId }),
      AIProvider.deleteMany({ userId }),
      UserSettings.deleteMany({ userId }),
      UserStats.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    console.log('[User] Account deleted permanently', { userId, email: user.email });

    res.json({
      success: true,
      message: 'Account and all associated data have been permanently deleted',
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user profile
 * GET /api/user/profile
 */
export async function getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) throw new AppError('Unauthorized', 401);

    const user = await User.findById(userId).select('-password');
    if (!user) throw new AppError('User not found', 404);

    res.json(user);
  } catch (error) {
    next(error);
  }
}

