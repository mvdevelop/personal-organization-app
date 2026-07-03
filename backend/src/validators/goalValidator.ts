import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z.string({ required_error: 'Título é obrigatório' }).min(1).max(200),
  description: z.string().max(2000).default(''),
  type: z.enum(['purchase', 'travel', 'learning', 'health', 'career', 'custom']).default('custom'),
  targetValue: z.number().positive().nullable().default(null),
  currentValue: z.number().default(0),
  deadline: z.string().nullable().default(null),
  domainId: z.string().nullable().default(null),
  milestones: z.array(z.object({
    title: z.string().min(1),
    completed: z.boolean().default(false),
    date: z.string().nullable().default(null),
  })).default([]),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  type: z.enum(['purchase', 'travel', 'learning', 'health', 'career', 'custom']).optional(),
  targetValue: z.number().positive().nullable().optional(),
  currentValue: z.number().optional(),
  deadline: z.string().nullable().optional(),
  domainId: z.string().nullable().optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
  milestones: z.array(z.object({
    title: z.string().min(1),
    completed: z.boolean().default(false),
    date: z.string().nullable().default(null),
  })).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
