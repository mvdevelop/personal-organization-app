import { Request, Response, NextFunction } from 'express';
import { AIChat } from '../models/AIChat.js';
import { AIProvider, type AIProviderType } from '../models/AIProvider.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { Task } from '../models/Task.js';
import { Note } from '../models/Note.js';
import { Habit, HabitLog } from '../models/Habit.js';
import { Goal } from '../models/Goal.js';
import { Subject } from '../models/Subject.js';
import { User } from '../models/User.js';
import {
  chatWithAI,
  generateDailyBriefing,
  suggestTasks,
  testProviderConnection,
  getUserAIConfig,
} from '../services/aiService.js';
import { AppError } from '../middleware/errorHandler.js';
import { getCached, setCache, cacheKey } from '../utils/cache.js';
import { maskApiKey } from '../models/AIProvider.js';

/**
 * Build user context string from all modules.
 * Cached for 15 seconds to reduce DB load.
 */
async function buildUserContext(userId: string): Promise<string> {
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
Notas recentes: ${notes.map(n => `- ${n.title}`).join('\n  ')}
Tarefas pendentes: ${pendingTasks.map(t => `- ${t.title} (prioridade: ${t.priority})`).join('\n  ')}
  `.trim();

  setCache(key, context, 15_000);
  return context;
}

/**
 * Parse AI response for actionable commands.
 * Returns structured actions the AI wants to propose.
 */
interface AIAction {
  type: 'create_task' | 'create_habit' | 'create_note' | 'create_goal' | 'update_task' | 'generic'
  data?: Record<string, unknown>
  description: string
}

/**
 * Extract structured actions from AI text response.
 * The AI can include JSON action blocks in its response.
 */
function parseAIActions(response: string): { text: string; actions: AIAction[] } {
  const actionRegex = /<action:(create_task|create_habit|create_note|create_goal|update_task)>([\s\S]*?)<\/action>/g;
  const actions: AIAction[] = [];
  let match;

  while ((match = actionRegex.exec(response)) !== null) {
    try {
      const data = JSON.parse(match[2]);
      actions.push({
        type: match[1] as AIAction['type'],
        data,
        description: data.title || data.description || 'Ação proposta',
      });
    } catch {
      // Skip invalid action JSON
    }
  }

  // Remove action blocks from the displayed text
  const text = response.replace(actionRegex, '').trim();

  return { text, actions };
}

export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      throw new AppError('Mensagem é obrigatória', 400);
    }

    const userId = req.user!.userId;

    // Verify AI is configured
    const config = await getUserAIConfig(userId);
    if (!config) {
      throw new AppError(
        'Nenhum provedor de IA configurado. Configure uma API Key nas configurações.',
        400,
      );
    }

    let chat = await AIChat.findOne({ userId });
    if (!chat) {
      chat = await AIChat.create({ userId, messages: [] });
    }

    const userMsg = { role: 'user' as const, content: message, timestamp: new Date() };
    chat.messages.push(userMsg);

    const lastMessages = chat.messages.slice(-20).map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    const context = await buildUserContext(userId);
    const systemWithContext = {
      role: 'system' as const,
      content: `Contexto do usuário:\n${context}\n\nInstruções:\nVocê é um assistente pessoal inteligente. Quando quiser propor ações ao usuário, use o formato: <action:tipo>{...json...}</action>. As ações disponíveis são: create_task, create_habit, create_note, create_goal, update_task.`,
    };

    const { response, tokensUsed, provider } = await chatWithAI(
      userId,
      [systemWithContext, ...lastMessages],
    );

    // Parse any actionable items from the response
    const { text, actions } = parseAIActions(response);

    chat.messages.push({ role: 'assistant', content: response, timestamp: new Date() });
    if (chat.messages.length > 100) {
      chat.messages = chat.messages.slice(-100);
    }
    await chat.save();

    res.json({
      response: text,
      tokensUsed,
      provider,
      actions,
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
    const briefing = await generateDailyBriefing(req.user!.userId);
    res.json({ briefing });
  } catch (error) {
    next(error);
  }
}

export async function suggestTasksEndpoint(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const suggestions = await suggestTasks(req.user!.userId);
    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
}

// ===== AI Settings endpoints =====

export async function getAISettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const doc = await AIProvider.findOne({ userId }).select('-providers.apiKey');

    if (!doc) {
      res.json({
        providers: [],
        maxTokens: 1024,
        temperature: 0.7,
        systemPrompt: undefined,
      });
      return;
    }

    // Mask API keys for display
    const maskedProviders = doc.providers.map(p => ({
      type: p.type,
      model: p.model,
      isEnabled: p.isEnabled,
      isDefault: p.isDefault,
      apiKey: p.apiKey ? maskApiKey(decrypt(p.apiKey)) : '',
    }));

    res.json({
      providers: maskedProviders,
      maxTokens: doc.maxTokens,
      temperature: doc.temperature,
      systemPrompt: doc.systemPrompt,
    });
  } catch (error) {
    next(error);
  }
}

export async function createOrUpdateProvider(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { type, apiKey, model, isEnabled, isDefault, maxTokens, temperature, systemPrompt } = req.body;

    if (!type || !apiKey) {
      throw new AppError('Tipo de provedor e API Key são obrigatórios', 400);
    }

    // Test the connection before saving
    const testResult = await testProviderConnection(type, apiKey, model);
    if (!testResult.success) {
      throw new AppError(`Falha na conexão: ${testResult.error || 'Erro desconhecido'}`, 400);
    }

    let doc = await AIProvider.findOne({ userId });

    if (!doc) {
      doc = await AIProvider.create({ userId });
    }

    const existingProviderIndex = doc.providers.findIndex(p => p.type === type);

    if (existingProviderIndex >= 0) {
      // Update existing
      doc.providers[existingProviderIndex].apiKey = encrypt(apiKey);
      doc.providers[existingProviderIndex].model = model || getDefaultModel(type);
      doc.providers[existingProviderIndex].isEnabled = isEnabled ?? true;
      doc.providers[existingProviderIndex].isDefault = isDefault ?? false;
    } else {
      // Add new provider
      doc.providers.push({
        type,
        apiKey: encrypt(apiKey),
        model: model || getDefaultModel(type),
        isEnabled: isEnabled ?? true,
        isDefault: isDefault ?? false,
      });
    }

    // If this is set as default, unset others
    if (isDefault) {
      doc.providers.forEach((p, idx) => {
        if (idx !== existingProviderIndex && p.isDefault) {
          p.isDefault = false;
        }
      });
    }

    if (maxTokens !== undefined) doc.maxTokens = maxTokens;
    if (temperature !== undefined) doc.temperature = temperature;
    if (systemPrompt !== undefined) doc.systemPrompt = systemPrompt;

    await doc.save();

    // Clear cache
    setCache(cacheKey(userId, 'ai-config'), { config: null }, 0);

    res.json({
      message: 'Configuração salva com sucesso',
      provider: {
        type,
        model: model || getDefaultModel(type),
        isEnabled,
        isDefault,
        apiKey: maskApiKey(apiKey),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { type } = req.params;

    const doc = await AIProvider.findOne({ userId });
    if (!doc) {
      throw new AppError('Configurações de IA não encontradas', 404);
    }

    doc.providers = doc.providers.filter(p => p.type !== type);
    await doc.save();

    // Clear cache
    setCache(cacheKey(userId, 'ai-config'), { config: null }, 0);

    res.json({ message: 'Provedor removido' });
  } catch (error) {
    next(error);
  }
}

export async function testConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, apiKey, model } = req.body;
    if (!type || !apiKey) {
      throw new AppError('Tipo de provedor e API Key são obrigatórios', 400);
    }

    const result = await testProviderConnection(type, apiKey, model);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

function getDefaultModel(providerType: AIProviderType): string {
  switch (providerType) {
    case 'openrouter': return 'gpt-4o-mini';
    case 'openai': return 'gpt-4o-mini';
    case 'anthropic': return 'claude-3-5-sonnet-20241022';
    case 'google': return 'gemini-1.5-flash';
    default: return 'gpt-4o-mini';
  }
}
