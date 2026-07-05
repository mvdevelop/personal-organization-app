import { Request, Response, NextFunction } from 'express';
import { AIChat } from '../models/AIChat.js';
import { Task } from '../models/Task.js';
import { Note } from '../models/Note.js';
import { Habit, HabitLog } from '../models/Habit.js';
import { Goal } from '../models/Goal.js';
import { Subject } from '../models/Subject.js';
import { User } from '../models/User.js';
import { chatWithAI, generateDailyBriefing, suggestTasks } from '../services/aiService.js';
import { AppError } from '../middleware/errorHandler.js';
import { getCached, setCache, cacheKey } from '../utils/cache.js';

async function buildUserContext(userId: string): Promise<string> {
  // Cache context for 15s to avoid 6+ DB queries on rapid messages
  const key = cacheKey(userId, 'ai-context');
  const cached = getCached<string>(key);
  if (cached) return cached;

  const [user, tasks, notes, habits, logs, goals, subjects] = await Promise.all([
    User.findById(userId),
    Task.find({ userId }).sort({ createdAt: -1 }).limit(10),
    Note.find({ userId }).sort({ updatedAt: -1 }).limit(5),
    Habit.find({ userId }),
    HabitLog.find({ userId }).sort({ date: -1 }).limit(30),
    Goal.find({ userId, status: 'active' }),
    Subject.find({ userId }),
  ]);

  const today = new Date().toLocaleDateString('pt-BR');
  const pendingTasks = tasks.filter(t => !t.completed);
  const todayLogs = logs.filter(l => {
    const logDate = new Date(l.date).toLocaleDateString('pt-BR');
    return logDate === today;
  });

  const context = `
Nome: ${user?.name || 'Usuário'}
Data: ${today}
Tarefas pendentes: ${pendingTasks.length}
Tarefas totais: ${tasks.length}
Hábitos cadastrados: ${habits.length}
Check-ins hoje: ${todayLogs.length}
Metas ativas: ${goals.length}
Matérias de estudo: ${subjects.length}
Notas recentes: ${notes.length}
  `.trim();
  setCache(key, context, 15_000);
  return context;
}

export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      throw new AppError('Mensagem é obrigatória', 400);
    }

    const userId = req.user!.userId;
    const context = await buildUserContext(userId);

    let chat = await AIChat.findOne({ userId });
    if (!chat) {
      chat = await AIChat.create({ userId, messages: [] });
    }

    const userMsg = { role: 'user' as const, content: message, timestamp: new Date() };
    chat.messages.push(userMsg);

    const lastMessages = chat.messages.slice(-20).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const { response, tokensUsed } = await chatWithAI(lastMessages, context);

    chat.messages.push({ role: 'assistant', content: response, timestamp: new Date() });
    if (chat.messages.length > 100) {
      chat.messages = chat.messages.slice(-100);
    }
    await chat.save();

    res.json({
      response,
      tokensUsed,
      historyLength: chat.messages.length,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const chat = await AIChat.findOne({ userId: req.user!.userId });
    if (!chat) {
      res.json({ messages: [] });
      return;
    }
    const messages = chat.messages
      .filter(m => m.role !== 'system')
      .slice(-50)
      .map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp }));
    res.json({ messages });
  } catch (error) {
    next(error);
  }
}

export async function clearHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await AIChat.findOneAndDelete({ userId: req.user!.userId });
    res.json({ message: 'Histórico limpo' });
  } catch (error) {
    next(error);
  }
}

export async function dailyBriefing(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const context = await buildUserContext(req.user!.userId);
    const briefing = await generateDailyBriefing(context);
    res.json({ briefing });
  } catch (error) {
    next(error);
  }
}

export async function suggestTasksEndpoint(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const context = await buildUserContext(req.user!.userId);
    const suggestions = await suggestTasks(context);
    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
}
