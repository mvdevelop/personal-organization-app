import { Request, Response, NextFunction } from 'express';
import { AIChat } from '../models/AIChat.js';
import { AIProvider, type AIProviderType } from '../models/AIProvider.js';
import { AIAudit } from '../models/AIAudit.js';
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
import { aiConnectionTestSchema, aiProviderInputSchema, aiChatResponseSchema, type AIAction } from '../validators/aiValidator.js';
import { buildSafeContext, validateActionData } from '../utils/aiSecurity.js';

/**
 * Build user context string from all modules.
 * Cached for 15 seconds to reduce DB load.
 * Now uses safe context that prevents injection.
 */
async function buildUserContext(userId: string): Promise<string> {
  const key = cacheKey(userId, 'ai-context');
  const cached = getCached<string>(key);
  if (cached) return cached;

  const [user, tasks, habits, goals] = await Promise.all([
    User.findById(userId),
    Task.find({ userId }).sort({ createdAt: -1 }).limit(10),
    Habit.find({ userId }).limit(20),
    Goal.find({ userId, status: 'active' }).limit(10),
  ]);

  const today = new Date().toLocaleDateString('pt-BR');
  const pendingTasks = tasks.filter(t => !t.completed);

  const context = buildSafeContext({
    userName: user?.name || 'Usuário',
    date: today,
    taskCount: tasks.length,
    habitCount: habits.length,
    goalCount: goals.length,
    recentTasks: pendingTasks.slice(0, 3).map(t => ({
      title: t.title,
      priority: t.priority,
    })),
    recentHabits: habits.slice(0, 3).map(h => ({
      title: h.title,
    })),
    recentGoals: goals.slice(0, 3).map(g => ({
      title: g.title,
    })),
  });

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

    // Enhanced system prompt with clear instructions for JSON responses
    const systemWithContext = {
      role: 'system' as const,
      content: `Você é um assistente pessoal inteligente.

CONTEXTO DO USUÁRIO:
${context}

INSTRUÇÕES DE RESPOSTA:
1. Sempre responda em JSON com o formato: {"text": "sua resposta amigável aqui", "actions": [...]}
2. O campo "text" é obrigatório e deve conter sua resposta em português amigável.
3. O campo "actions" é opcional e contém ações estruturadas que deseja propor.
4. Cada ação deve ter: type, title/description, e dados específicos.
5. Tipos válidos: create_task, create_habit, create_note, create_goal, generic
6. Nunca invente métricas ou dados que o usuário não forneceu.
7. Se não tiver dados suficientes, pergunte ao usuário em vez de adivinhar.

EXEMPLO DE RESPOSTA COM AÇÕES:
{
  "text": "Vejo que você tem 5 tarefas pendentes. Posso criar uma tarefa de revisão para você?",
  "actions": [
    {
      "type": "create_task",
      "title": "Revisar tarefas pendentes",
      "description": "Revisão rápida do que está em aberto",
      "priority": "medium"
    }
  ]
}`,
    };

    const { response, tokensUsed, provider } = await chatWithAI(
      userId,
      [systemWithContext, ...lastMessages],
    );

    // Parse and validate AI response as JSON
    let parsedResponse: { text: string; actions?: AIAction[] } = {
      text: response,
      actions: [],
    };

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const json = JSON.parse(jsonMatch[0]);
        const validated = aiChatResponseSchema.safeParse(json);
        if (validated.success) {
          parsedResponse = validated.data;
        }
      }
    } catch {
      // If JSON parsing fails, treat entire response as text
      parsedResponse = { text: response, actions: [] };
    }

    // Validate action data for injection attacks
    const actions: AIAction[] = [];
    if (parsedResponse.actions) {
      for (const action of parsedResponse.actions) {
        const validation = validateActionData(action);
        if (!validation.valid) {
          console.warn(`Action validation failed: ${validation.reason}`, action);
          continue;
        }
        actions.push(action);
      }
    }

    // Create audit record
    const audit = await AIAudit.create({
      userId,
      provider,
      modelName: config.model,
      prompt: lastMessages.map(m => `${m.role}: ${m.content}`).join('\n---\n'),
      response,
      actions: actions.map((a) => {
        let desc = '';
        if (a.type === 'create_task' && 'title' in a) {
          desc = a.title;
        } else if (a.type === 'create_habit' && 'title' in a) {
          desc = a.title;
        } else if (a.type === 'create_note' && 'title' in a) {
          desc = a.title;
        } else if (a.type === 'create_goal' && 'title' in a) {
          desc = a.title;
        } else if (a.type === 'generic' && 'action' in a) {
          desc = (a as any).action;
        }
        return {
          type: a.type,
          description: desc,
          data: a,
        };
      }),
      tokensUsed,
      decision: 'pending',
    });

    chat.messages.push({ role: 'assistant', content: response, timestamp: new Date() });
    if (chat.messages.length > 100) {
      chat.messages = chat.messages.slice(-100);
    }
    await chat.save();

    res.json({
      response: parsedResponse.text,
      tokensUsed,
      provider,
      actions,
      auditId: audit._id,
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
    const userId = req.user!.userId;
    const config = await getUserAIConfig(userId);
    if (!config) {
      throw new AppError('Nenhum provedor de IA configurado. Configure uma API Key nas configurações.', 400);
    }

    const briefing = await generateDailyBriefing(userId);
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
    const doc = await AIProvider.findOne({ userId }).select('+providers.apiKey');

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
      lastConnectionTestAt: p.lastConnectionTestAt || null,
      lastConnectionTestSuccess: p.lastConnectionTestSuccess ?? null,
      lastConnectionTestError: p.lastConnectionTestError || null,
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
    const parsed = aiProviderInputSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Dados de configuração de IA inválidos', 400, parsed.error.flatten());
    }

    const { type, apiKey, model, isEnabled, isDefault, maxTokens, temperature, systemPrompt } = parsed.data;
    let doc = await AIProvider.findOne({ userId }).select('+providers.apiKey');
    const existingProvider = doc?.providers.find(provider => provider.type === type);
    const keyChanged = Boolean(apiKey);

    if (!existingProvider && !apiKey) {
      throw new AppError('API Key é obrigatória para adicionar um provedor', 400);
    }

    if (keyChanged && apiKey) {
      const testResult = await testProviderConnection(type, apiKey, model);
      if (!testResult.success) {
        throw new AppError(`Falha na conexão: ${sanitizeProviderError(testResult.error)}`, 400);
      }
    }

    if (!doc) {
      doc = await AIProvider.create({ userId });
    }

    const existingProviderIndex = doc.providers.findIndex(p => p.type === type);

    if (existingProviderIndex >= 0) {
      // Update existing
      const provider = doc.providers[existingProviderIndex];
      if (apiKey) {
        provider.apiKey = encrypt(apiKey);
        provider.lastConnectionTestAt = new Date();
        provider.lastConnectionTestSuccess = true;
        provider.lastConnectionTestError = undefined;
      }
      provider.model = model || provider.model || getDefaultModel(type);
      provider.isEnabled = isEnabled ?? provider.isEnabled;
      provider.isDefault = isDefault ?? provider.isDefault;
    } else {
      // Add new provider
      doc.providers.push({
        type,
        apiKey: encrypt(apiKey as string),
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

    const savedProvider = doc.providers.find(provider => provider.type === type)!;
    res.json({
      message: 'Configuração salva com sucesso',
      provider: {
        type: savedProvider.type,
        model: savedProvider.model,
        isEnabled: savedProvider.isEnabled,
        isDefault: savedProvider.isDefault,
        lastConnectionTestAt: savedProvider.lastConnectionTestAt || null,
        lastConnectionTestSuccess: savedProvider.lastConnectionTestSuccess ?? null,
        lastConnectionTestError: savedProvider.lastConnectionTestError || null,
        apiKey: maskApiKey(decrypt(savedProvider.apiKey)),
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
    const parsed = aiConnectionTestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Dados para teste de conexão inválidos', 400, parsed.error.flatten());
    }

    const { type, apiKey, model } = parsed.data;
    const result = await testProviderConnection(type, apiKey, model);
    res.json({
      success: result.success,
      model: result.model,
      error: result.success ? undefined : sanitizeProviderError(result.error),
    });
  } catch (error) {
    next(error);
  }
}

function sanitizeProviderError(error?: string): string {
  if (!error) return 'Erro desconhecido do provedor';
  return error
    .replace(/Bearer\s+[^\s)]+/gi, 'Bearer [redacted]')
    .replace(/key=\w+/gi, 'key=[redacted]')
    .slice(0, 500); // Limit error message length
}

/**
 * Approve AI-proposed actions and execute them.
 */
export async function approveAIActions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { auditId } = req.params;
    const { actionIndices } = req.body as { actionIndices?: number[] };

    const audit = await AIAudit.findById(auditId);
    if (!audit) {
      throw new AppError('Auditoria de IA não encontrada', 404);
    }

    if (audit.userId.toString() !== userId) {
      throw new AppError('Não autorizado', 403);
    }

    if (audit.decision !== 'pending') {
      throw new AppError(`Ação já foi ${audit.decision}`, 400);
    }

    // Execute approved actions
    const indicesToApprove = actionIndices || audit.actions.map((_, i) => i);
    let executedCount = 0;
    let errorMessages: string[] = [];

    for (const idx of indicesToApprove) {
      if (idx < 0 || idx >= audit.actions.length) continue;

      const action = audit.actions[idx];
      try {
        switch (action.type) {
          case 'create_task': {
            const data = action.data as any;
            await Task.create({
              userId,
              title: data.title,
              description: data.description || '',
              priority: data.priority || 'medium',
              dueDate: data.dueDate ? new Date(data.dueDate) : null,
            });
            executedCount++;
            break;
          }
          case 'create_habit': {
            const data = action.data as any;
            await Habit.create({
              userId,
              title: data.title,
              description: data.description || '',
              frequency: data.frequency || 'daily',
            });
            executedCount++;
            break;
          }
          case 'create_note': {
            const data = action.data as any;
            await Note.create({
              userId,
              title: data.title,
              content: data.content,
              color: data.color || '#ffffff',
            });
            executedCount++;
            break;
          }
          case 'create_goal': {
            const data = action.data as any;
            await Goal.create({
              userId,
              title: data.title,
              description: data.description || '',
              type: data.type_goal || 'custom',
              targetValue: data.targetValue,
              deadline: data.deadline ? new Date(data.deadline) : null,
            });
            executedCount++;
            break;
          }
        }
      } catch (error) {
        errorMessages.push(`Action ${idx}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    audit.decision = errorMessages.length === 0 ? 'approved' : 'partial';
    audit.approvedActions = indicesToApprove;
    if (errorMessages.length > 0) {
      audit.executionError = errorMessages.join('; ');
    }
    await audit.save();

    res.json({
      message: `${executedCount} ação(ões) executada(s)`,
      executed: executedCount,
      errors: errorMessages.length > 0 ? errorMessages : undefined,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Reject AI-proposed actions.
 */
export async function rejectAIActions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { auditId } = req.params;

    const audit = await AIAudit.findById(auditId);
    if (!audit) {
      throw new AppError('Auditoria de IA não encontrada', 404);
    }

    if (audit.userId.toString() !== userId) {
      throw new AppError('Não autorizado', 403);
    }

    if (audit.decision !== 'pending') {
      throw new AppError(`Ação já foi ${audit.decision}`, 400);
    }

    audit.decision = 'rejected';
    await audit.save();

    res.json({ message: 'Ações rejeitadas' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Get audit history for the current user.
 */
export async function getAIAuditHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const decision = req.query.decision as string | undefined;

    const query: Record<string, unknown> = { userId };
    if (decision) query.decision = decision;

    const audits = await AIAudit.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-prompt -response'); // Exclude large fields

    res.json({ audits });
  } catch (error) {
    next(error);
  }
}

function getDefaultModel(providerType: AIProviderType): string {
  switch (providerType) {
    case 'openrouter': return 'openai/gpt-4o-mini';
    case 'openai': return 'gpt-4o-mini';
    case 'anthropic': return 'claude-3-5-sonnet-20241022';
    case 'google': return 'gemini-1.5-flash';
    default: return 'gpt-4o-mini';
  }
}
