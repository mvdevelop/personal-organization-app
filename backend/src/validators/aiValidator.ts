import { z } from 'zod';

export const aiProviderTypeSchema = z.enum(['openrouter', 'openai', 'anthropic', 'google']);

export const aiProviderInputSchema = z.object({
  type: aiProviderTypeSchema,
  apiKey: z.string().trim().min(1).optional(),
  model: z.string().trim().min(1).max(200).optional(),
  isEnabled: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  maxTokens: z.number().int().min(1).max(32768).optional(),
  temperature: z.number().min(0).max(2).optional(),
  systemPrompt: z.string().trim().max(10000).optional(),
});

export const aiConnectionTestSchema = z.object({
  type: aiProviderTypeSchema,
  apiKey: z.string().trim().min(1),
  model: z.string().trim().min(1).max(200).optional(),
});
