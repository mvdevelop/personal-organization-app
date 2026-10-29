/**
 * Illustrative content used only when an account has no data yet.
 * Every consumer must label these values as demo content — nothing here
 * pretends to be a real API response, weather service or AI result.
 */

export interface DemoTask {
  id: string
  title: string
  category: string
  tagClass: string
  due: string
  completed: boolean
}

export interface DemoHabit {
  id: string
  title: string
  description: string
  color: string
  streak: number
  checkedToday: boolean
}

export interface DemoGoal {
  title: string
  icon: 'laptop' | 'music' | 'monitor' | 'sparkles'
  percent: number
}

export interface DemoNote {
  title: string
  date: string
  category: string
  excerpt: string
}

export const DEMO_WEATHER = {
  temperature: '14 °C',
  condition: 'Nevoeiro',
  location: 'Teresópolis, Rio de Janeiro, Brasil',
  feelsLike: '14 °C',
  humidity: '98%',
} as const

export const DEMO_TASKS: DemoTask[] = [
  {
    id: 'demo-task-1',
    title: 'Organizar entregas da semana',
    category: 'Trabalho',
    tagClass: 'is-work',
    due: '6 de jun.',
    completed: false,
  },
  {
    id: 'demo-task-2',
    title: 'Revisar conteúdo da graduação',
    category: 'Estudos',
    tagClass: 'is-study',
    due: '6 de jun.',
    completed: false,
  },
  {
    id: 'demo-task-3',
    title: 'Planejar próximas leituras',
    category: 'Estudos',
    tagClass: 'is-study',
    due: '4 de jul.',
    completed: false,
  },
]

export const DEMO_HABITS: DemoHabit[] = [
  {
    id: 'demo-habit-1',
    title: 'Leitura Graduação',
    description: 'Seu hábito de aprendizado',
    color: '#7778F6',
    streak: 0,
    checkedToday: false,
  },
  {
    id: 'demo-habit-2',
    title: 'Leitura Livre',
    description: 'Um tempo para você',
    color: '#45C49A',
    streak: 0,
    checkedToday: false,
  },
]

export const DEMO_GOALS: DemoGoal[] = [
  { title: 'Upgrade Notebooks', icon: 'laptop', percent: 0 },
  { title: 'Guitarra Ibanez / Jackson', icon: 'music', percent: 0 },
  { title: 'Upgrade PC', icon: 'monitor', percent: 0 },
  { title: 'Desenvolvimento pessoal', icon: 'sparkles', percent: 0 },
]

export const DEMO_NOTE: DemoNote = {
  title: 'Organização',
  date: '11 de jul.',
  category: 'Nota pessoal',
  excerpt: 'Capture ideias importantes e encontre tudo em um só lugar.',
}

export const DEMO_ACHIEVEMENTS = [
  { key: 'first-task', label: 'Primeira tarefa', description: 'Conclua sua primeira tarefa' },
  { key: 'focus', label: 'Foco', description: 'Conclua 10 tarefas' },
  { key: 'consistency', label: 'Consistência', description: 'Mantenha um hábito por 7 dias' },
  { key: 'learning', label: 'Aprendizado', description: 'Registre uma sessão de estudo' },
  { key: 'organization', label: 'Organização', description: 'Crie sua primeira nota' },
] as const

export const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const
