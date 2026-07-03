import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string({ required_error: 'Nome é obrigatório' }).min(1).max(100),
  category: z.enum(['faculdade', 'concurso', 'curso', 'personal']).default('personal'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#3b82f6'),
  workload: z.number().default(0),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.enum(['faculdade', 'concurso', 'curso', 'personal']).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  workload: z.number().optional(),
});

export const createStudySessionSchema = z.object({
  subjectId: z.string({ required_error: 'Matéria é obrigatória' }),
  duration: z.number({ required_error: 'Duração é obrigatória' }).min(1),
  content: z.string().default(''),
  technique: z.enum(['pomodoro', 'revisao', 'exercicio', 'leitura', 'outro']).default('pomodoro'),
  date: z.string().default(() => new Date().toISOString()),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>
export type CreateStudySessionInput = z.infer<typeof createStudySessionSchema>
