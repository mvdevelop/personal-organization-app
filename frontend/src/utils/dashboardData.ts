type DashboardTasks = { total: number; pending: number; completed: number; today: number; overdue: number }
type DashboardHabits = { total: number; todayCheckIns: number }
type DashboardGoals = { active: number; completed: number }
type DashboardStudies = { weekSessions: number; weekStudyHours: number }

export const buildWorkloadData = (
  tasks?: DashboardTasks,
  goals?: DashboardGoals,
  studies?: DashboardStudies,
  habits?: DashboardHabits,
) => [
  { name: 'Tarefas', pendentes: tasks?.pending ?? 0, atrasadas: tasks?.overdue ?? 0 },
  { name: 'Metas', ativas: goals?.active ?? 0, concluídas: goals?.completed ?? 0 },
  { name: 'Estudos', sessões: studies?.weekSessions ?? 0, horas: studies?.weekStudyHours ?? 0 },
  { name: 'Hábitos', total: habits?.total ?? 0, hoje: habits?.todayCheckIns ?? 0 },
]

export const buildProgressData = (tasks?: DashboardTasks, goals?: DashboardGoals) => [
  { name: 'Tarefas', concluído: tasks?.completed ?? 0, restante: tasks?.pending ?? 0 },
  { name: 'Metas', concluído: goals?.completed ?? 0, restante: goals?.active ?? 0 },
]

export const buildConsistencyData = (
  tasks?: DashboardTasks,
  habits?: DashboardHabits,
  studies?: DashboardStudies,
) => [
  { name: 'Hoje', valor: tasks?.today ?? 0 },
  { name: 'Check-ins', valor: habits?.todayCheckIns ?? 0 },
  { name: 'Sessões', valor: studies?.weekSessions ?? 0 },
]
