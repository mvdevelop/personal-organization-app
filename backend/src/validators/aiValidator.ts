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

/**
 * Validated schemas for AI-proposed actions.
 * Structured responses from AI model with strict validation.
 */
export const aiActionTaskSchema = z.object({
  type: z.literal('create_task'),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional(), // ISO 8601
});

export const aiActionHabitSchema = z.object({
  type: z.literal('create_habit'),
  title: z.string().trim().min(1).max(100),
  frequency: z.enum(['daily', 'weekly']).optional(),
  description: z.string().trim().max(500).optional(),
});

export const aiActionNoteSchema = z.object({
  type: z.literal('create_note'),
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().max(10000),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const aiActionGoalSchema = z.object({
  type: z.literal('create_goal'),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  type_goal: z.enum(['purchase', 'travel', 'learning', 'health', 'career', 'custom']).optional(),
  targetValue: z.number().optional(),
  deadline: z.string().datetime().optional(),
});

export const aiActionGenericSchema = z.object({
  type: z.literal('generic'),
  action: z.string().trim().min(1).max(500),
  description: z.string().trim().max(1000).optional(),
});

export const aiActionSchema = z.discriminatedUnion('type', [
  aiActionTaskSchema,
  aiActionHabitSchema,
  aiActionNoteSchema,
  aiActionGoalSchema,
  aiActionGenericSchema,
]);

export type AIAction = z.infer<typeof aiActionSchema>;

/**
 * AI chat response with optional actions.
 * Returns structured text + validated actions.
 */
export const aiChatResponseSchema = z.object({
  text: z.string().trim().min(1),
  actions: z.array(aiActionSchema).optional(),
  suggestedMetrics: z.record(z.string(), z.unknown()).optional(),
});
