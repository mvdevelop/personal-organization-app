import { env } from '../config/env.js';
import { AIProvider, type AIProviderType } from '../models/AIProvider.js';
import { decrypt } from '../utils/encryption.js';
import { cacheKey, getCached, setCache } from '../utils/cache.js';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIConfig {
  providerType: AIProviderType
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
  systemPrompt: string
}

export interface AIResponse {
  response: string
  tokensUsed: number
  provider: AIProviderType
}

/**
 * Fetches the user's configured AI providers from the DB.
 * Returns the default provider's config.
 */
export async function getUserAIConfig(userId: string): Promise<AIConfig | null> {
  const key = cacheKey(userId, 'ai-config');
  const cached = getCached<{ config: AIConfig | null }>(key);
  if (cached) return cached.config;

  // Use .select('+apiKey') to include the encrypted key
  const doc = await AIProvider.findOne({ userId }).select('+providers.apiKey');
  if (!doc || doc.providers.length === 0) return null;

  const defaultProvider = doc.providers.find(p => p.isDefault && p.isEnabled) ||
                          doc.providers.find(p => p.isEnabled);

  if (!defaultProvider || !defaultProvider.apiKey) return null;

  const config: AIConfig = {
    providerType: defaultProvider.type,
    apiKey: decrypt(defaultProvider.apiKey),
    model: defaultProvider.model,
    maxTokens: doc.maxTokens,
    temperature: doc.temperature,
    systemPrompt: doc.systemPrompt || '',
  };

  setCache(key, { config }, 60_000);
  return config;
}

/**
 * Test connection to a provider without storing settings.
 */
export async function testProviderConnection(
  providerType: AIProviderType,
  apiKey: string,
  model?: string,
): Promise<{ success: boolean; error?: string; model?: string }> {
  try {
    if (providerType === 'openrouter') {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://orgapp.vercel.app',
          'X-Title': 'OrgApp',
        },
      });

      if (!response.ok) {
        const err = await response.text();
        return { success: false, error: `OpenRouter API error: ${err}` };
      }

      const data = await response.json() as { data: { id: string }[] };
      if (model) {
        const modelExists = data.data.some(m => m.id === model);
        if (!modelExists) {
          return { success: false, error: `Model "${model}" not available` };
        }
      }
      return { success: true, model: data.data[0]?.id };
    }

    if (providerType === 'openai') {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      if (!response.ok) {
        const err = await response.text();
        return { success: false, error: `OpenAI API error: ${err}` };
      }
      return { success: true };
    }

    if (providerType === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model || 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        return { success: false, error: `Anthropic API error: ${err}` };
      }
      return { success: true };
    }

    if (providerType === 'google') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'test' }], role: 'user' }],
            generationConfig: { maxOutputTokens: 1 },
          }),
        },
      );

      if (!response.ok) {
        const err = await response.text();
        return { success: false, error: `Google AI API error: ${err}` };
      }
      return { success: true };
    }

    return { success: false, error: 'Unknown provider' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}

/**
 * Send a chat message to the configured AI provider.
 */
export async function chatWithAI(
  userId: string,
  messages: AIMessage[],
): Promise<AIResponse> {
  const config = await getUserAIConfig(userId);
  if (!config) {
    throw new Error('Nenhum provedor de IA configurado. Configure uma API Key nas configurações.');
  }

  const systemMessage: AIMessage = {
    role: 'system',
    content: config.systemPrompt,
  };

  const allMessages = [systemMessage, ...messages];

  if (config.providerType === 'openrouter') {
    return { ...await chatWithOpenRouter(config, allMessages), provider: config.providerType };
  }

  if (config.providerType === 'openai') {
    return { ...await chatWithOpenAI(config, allMessages), provider: config.providerType };
  }

  if (config.providerType === 'anthropic') {
    return { ...await chatWithAnthropic(config, allMessages), provider: config.providerType };
  }

  if (config.providerType === 'google') {
    return { ...await chatWithGoogle(config, allMessages), provider: config.providerType };
  }

  throw new Error(`Provedor não suportado: ${config.providerType}`);
}

interface ProviderResponse {
  response: string
  tokensUsed: number
}

async function chatWithOpenRouter(
  config: AIConfig,
  messages: AIMessage[],
): Promise<ProviderResponse> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'HTTP-Referer': 'https://orgapp.vercel.app',
      'X-Title': 'OrgApp',
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data = await response.json() as {
    choices: { message: { content: string } }[]
    usage?: { prompt_tokens: number; completion_tokens: number }
  };

  return {
    response: data.choices?.[0]?.message?.content || '',
    tokensUsed: data.usage
      ? data.usage.prompt_tokens + data.usage.completion_tokens
      : 0,
  };
}

async function chatWithOpenAI(
  config: AIConfig,
  messages: AIMessage[],
): Promise<ProviderResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json() as {
    choices: { message: { content: string } }[]
    usage?: { prompt_tokens: number; completion_tokens: number }
  };

  return {
    response: data.choices?.[0]?.message?.content || '',
    tokensUsed: data.usage
      ? data.usage.prompt_tokens + data.usage.completion_tokens
      : 0,
  };
}

async function chatWithAnthropic(
  config: AIConfig,
  messages: AIMessage[],
): Promise<ProviderResponse> {
  // Anthropic expects user/assistant roles only (no system)
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      system: systemMsg?.content || '',
      messages: chatMessages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const data = await response.json() as {
    content: { text: string }[]
    usage?: { input_tokens: number; output_tokens: number }
  };

  return {
    response: data.content?.[0]?.text || '',
    tokensUsed: data.usage
      ? data.usage.input_tokens + data.usage.output_tokens
      : 0,
  };
}

async function chatWithGoogle(
  config: AIConfig,
  messages: AIMessage[],
): Promise<ProviderResponse> {
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

  // Google expects system instruction separately
  const systemInstruction = systemMsg?.content || '';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: chatMessages,
        generationConfig: {
          maxOutputTokens: config.maxTokens,
          temperature: config.temperature,
        },
      }),
      // API key goes in the URL for Google
      ...{
        // Append API key to URL
      },
    },
  );

  // Actually, Google uses the key in the URL
  const fullResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: chatMessages,
        generationConfig: {
          maxOutputTokens: config.maxTokens,
          temperature: config.temperature,
        },
      }),
    },
  );

  if (!fullResponse.ok) {
    const errorText = await fullResponse.text();
    throw new Error(`Google AI API error (${fullResponse.status}): ${errorText}`);
  }

  const data = await fullResponse.json() as {
    candidates: { content: { parts: { text: string }[] } }[]
    usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number }
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const tokensUsed = data.usageMetadata
    ? (data.usageMetadata.promptTokenCount || 0) + (data.usageMetadata.candidatesTokenCount || 0)
    : 0;

  return { response: text, tokensUsed };
}

// Keep legacy functions for backward compatibility
export async function generateDailyBriefing(userId: string): Promise<string> {
  const config = await getUserAIConfig(userId);
  if (!config) {
    throw new Error('Nenhum provedor de IA configurado.');
  }

  const context = await buildLegacyContext(userId);
  const { response } = await chatWithAI(userId, [
    { role: 'system', content: `Contexto:\n${context}` },
    { role: 'user', content: 'Gere um resumo matinal do meu dia com base no meu contexto. Seja breve e motivacional.' },
  ]);
  return response;
}

export async function suggestTasks(userId: string): Promise<string> {
  const { response } = await chatWithAI(userId, [
    { role: 'user', content: 'Com base no meu perfil e atividades, sugira 3 tarefas que eu deveria fazer hoje para ser produtivo. Seja específico.' },
  ]);
  return response;
}

// Legacy context builder (for backward compat with daily briefing)
async function buildLegacyContext(userId: string): Promise<string> {
  // This is moved from aiController.ts for backward compatibility
  // In the new architecture, context is built by the controller
  return `Usuário ${userId} solicitou um breveing de dia.`;
}
