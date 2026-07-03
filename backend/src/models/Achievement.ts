import mongoose, { Schema, type Document } from 'mongoose';

export interface IAchievement extends Document {
  slug: string
  title: string
  description: string
  icon: string
  category: 'tasks' | 'habits' | 'goals' | 'studies' | 'streak' | 'social' | 'special'
  xpReward: number
  condition: { type: string; value: number }
}

const achievementSchema = new Schema<IAchievement>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'trophy' },
    category: {
      type: String,
      enum: ['tasks', 'habits', 'goals', 'studies', 'streak', 'special'],
      default: 'special',
    },
    xpReward: { type: Number, default: 50 },
    condition: {
      type: { type: String, required: true },
      value: { type: Number, required: true },
    },
  },
  { timestamps: true },
);

export const Achievement = mongoose.model<IAchievement>('Achievement', achievementSchema);

export const DEFAULT_ACHIEVEMENTS = [
  { slug: 'first-task', title: 'Primeira Tarefa', description: 'Criou sua primeira tarefa', icon: 'check-square', category: 'tasks', xpReward: 10, condition: { type: 'tasks_created', value: 1 } },
  { slug: 'ten-tasks', title: 'Produtivo', description: 'Completou 10 tarefas', icon: 'zap', category: 'tasks', xpReward: 50, condition: { type: 'tasks_completed', value: 10 } },
  { slug: 'fifty-tasks', title: 'Máquina de Tarefas', description: 'Completou 50 tarefas', icon: 'award', category: 'tasks', xpReward: 150, condition: { type: 'tasks_completed', value: 50 } },
  { slug: 'hundred-tasks', title: 'Centenário', description: 'Completou 100 tarefas', icon: 'trophy', category: 'tasks', xpReward: 300, condition: { type: 'tasks_completed', value: 100 } },
  { slug: 'first-habit', title: 'Primeiro Hábito', description: 'Criou seu primeiro hábito', icon: 'heart', category: 'habits', xpReward: 10, condition: { type: 'habits_created', value: 1 } },
  { slug: 'streak-7', title: 'Disciplina', description: 'Manteve um hábito por 7 dias seguidos', icon: 'flame', category: 'streak', xpReward: 70, condition: { type: 'streak_7', value: 7 } },
  { slug: 'streak-30', title: 'Mestre da Rotina', description: 'Manteve um hábito por 30 dias seguidos', icon: 'flame', category: 'streak', xpReward: 300, condition: { type: 'streak_30', value: 30 } },
  { slug: 'first-goal', title: 'Primeira Meta', description: 'Criou sua primeira meta', icon: 'target', category: 'goals', xpReward: 20, condition: { type: 'goals_created', value: 1 } },
  { slug: 'goal-achiever', title: 'Realizador', description: 'Completou uma meta', icon: 'check-circle', category: 'goals', xpReward: 100, condition: { type: 'goals_completed', value: 1 } },
  { slug: 'first-study', title: 'Estudante', description: 'Registrou a primeira sessão de estudo', icon: 'book-open', category: 'studies', xpReward: 15, condition: { type: 'study_sessions', value: 1 } },
  { slug: 'ten-hours', title: 'Dedicado', description: 'Acumulou 10 horas de estudo', icon: 'clock', category: 'studies', xpReward: 100, condition: { type: 'study_hours', value: 10 } },
  { slug: 'fifty-hours', title: 'Sábio', description: 'Acumulou 50 horas de estudo', icon: 'brain', category: 'studies', xpReward: 400, condition: { type: 'study_hours', value: 50 } },
  { slug: 'first-note', title: 'Primeira Nota', description: 'Criou sua primeira nota', icon: 'file-text', category: 'special', xpReward: 5, condition: { type: 'notes_created', value: 1 } },
  { slug: 'organization', title: 'Organizado', description: 'Tem 20 ou mais tarefas, notas e hábitos combinados', icon: 'layers', category: 'special', xpReward: 100, condition: { type: 'total_items', value: 20 } },
];
