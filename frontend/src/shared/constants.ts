/**
 * Constantes compartilhadas entre módulos
 * Centraliza arrays de dias, meses, técnicas e tipos de meta
 * para evitar duplicação em Habits.tsx, Studies.tsx, DashboardWidgets.tsx
 */

export const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export const TECHNIQUES = ['pomodoro', 'revisao', 'exercicio', 'leitura', 'outro'] as const
export const TECHNIQUE_LABELS: Record<string, string> = {
  pomodoro: 'Pomodoro',
  revisao: 'Revisão',
  exercicio: 'Exercício',
  leitura: 'Leitura',
  outro: 'Outro',
}

export const GOAL_TYPES = [
  { value: 'purchase' as const, label: 'Compra', emoji: '🛒' },
  { value: 'travel' as const, label: 'Viagem', emoji: '✈️' },
  { value: 'learning' as const, label: 'Aprendizado', emoji: '📚' },
  { value: 'health' as const, label: 'Saúde', emoji: '💪' },
  { value: 'career' as const, label: 'Carreira', emoji: '💼' },
  { value: 'custom' as const, label: 'Personalizado', emoji: '🎯' },
]

export const SUBJECT_CATEGORIES = [
  { value: 'faculdade' as const, label: '🎓 Faculdade' },
  { value: 'concurso' as const, label: '📋 Concurso' },
  { value: 'curso' as const, label: '📖 Curso' },
  { value: 'personal' as const, label: '🧠 Pessoal' },
]
