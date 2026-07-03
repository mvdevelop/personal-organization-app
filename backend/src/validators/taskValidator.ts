import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Título é obrigatório' })
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  description: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .default(''),
  priority: z
    .enum(['low', 'medium', 'high'])
    .default('medium'),
  dueDate: z
    .string()
    .nullable()
    .default(null),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .optional(),
  description: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),
  completed: z
    .boolean()
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high'])
    .optional(),
  dueDate: z
    .string()
    .nullable()
    .optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
