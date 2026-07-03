import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z
    .string({ required_error: 'Título é obrigatório' })
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  content: z
    .string()
    .max(10000, 'Conteúdo deve ter no máximo 10000 caracteres')
    .default(''),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve ser um hex válido')
    .default('#ffffff'),
});

export const updateNoteSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .optional(),
  content: z
    .string()
    .max(10000, 'Conteúdo deve ter no máximo 10000 caracteres')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve ser um hex válido')
    .optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
