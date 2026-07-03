import { z } from 'zod';

export const createHabitSchema = z.object({
  title: z.string({ required_error: 'Título é obrigatório' }).min(1).max(100),
  description: z.string().max(500).default(''),
  frequency: z.enum(['daily', 'weekly']).default('daily'),
  daysOfWeek: z.array(z.number().min(0).max(6)).default([1,2,3,4,5]),
  domainId: z.string().nullable().default(null),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#3b82f6'),
  reminderTime: z.string().nullable().default(null),
});

export const updateHabitSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  frequency: z.enum(['daily', 'weekly']).optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  domainId: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  reminderTime: z.string().nullable().optional(),
});

export const createHabitLogSchema = z.object({
  habitId: z.string({ required_error: 'Habit ID é obrigatório' }),
  date: z.string({ required_error: 'Data é obrigatória' }),
  completed: z.boolean().default(true),
  note: z.string().default(''),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>
