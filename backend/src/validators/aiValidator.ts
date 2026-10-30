import { z } from 'zod';

/**
 * Validation schemas for AI-related endpoints.
 * @namespace validators.ai
 */

export const aiProviderSchema = z.object({
  type: z.enum(['openrouter', 'openai', 'anthropic', 'google']),
  apiKey: z.string().min(1, 'API Key é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  isEnabled: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export const aiSettingsSchema = z.object({
  maxTokens: z.number().min(1).max(8192).optional(),
  temperature: z.number().min(0).max(2).optional(),
  systemPrompt: z.string().max(4000).optional(),
});

export const aiTestConnectionSchema = z.object({
  type: z.enum(['openrouter', 'openai', 'anthropic', 'google']),
  apiKey: z.string().min(1, 'API Key é obrigatória'),
  model: z.string().optional(),
});

export const aiChatSchema = z.object({
  message: z.string().min(1, 'Mensagem é obrigatória').max(10000),
});

export type AIProviderInput = z.infer<typeof aiProviderSchema>;
export type AISettingsInput = z.infer<typeof aiSettingsSchema>;
export type AITestConnectionInput = z.infer<typeof aiTestConnectionSchema>;
export type AIChatInput = z.infer<typeof aiChatSchema>;
