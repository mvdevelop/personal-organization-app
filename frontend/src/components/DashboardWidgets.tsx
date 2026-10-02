import React, { useMemo, useState } from 'react';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { BarChart, Bar, Cell, Legend, LineChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type ChartView = 'workload' | 'progress' | 'consistency'
type DashboardTasks = { total: number; pending: number; completed: number; today: number; overdue: number }
type DashboardHabits = { total: number; todayCheckIns: number }
type DashboardGoals = { active: number; completed: number }
type DashboardStudies = { weekSessions: number; weekStudyHours: number }

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface ChartsWidgetProps {
  tasks: DashboardTasks | undefined
  habits: DashboardHabits | undefined
  goals: DashboardGoals | undefined
  studies: DashboardStudies | undefined
}

const COLORS = {
  primary: '#3b82f6',
  positive: '#10b981',
  attention: '#f59e0b',
  accent: '#8b5cf6',
  cyan: '#14b8a6',
}

export const buildWorkloadData = (tasks?: DashboardTasks, goals?: DashboardGoals, studies?: DashboardStudies, habits?: DashboardHabits) => [
  { name: 'Tarefas', pendentes: tasks?.pending ?? 0, atrasadas: tasks?.overdue ?? 0 },
  { name: 'Metas', ativas: goals?.active ?? 0, concluídas: goals?.completed ?? 0 },
  { name: 'Estudos', sessões: studies?.weekSessions ?? 0, horas: studies?.weekStudyHours ?? 0 },
  { name: 'Hábitos', total: habits?.total ?? 0, hoje: habits?.todayCheckIns ?? 0 },
]

export const buildProgressData = (tasks?: DashboardTasks, goals?: DashboardGoals) => [
  { name: 'Tarefas', concluído: tasks?.completed ?? 0, restante: tasks?.pending ?? 0 },
  { name: 'Metas', concluído: goals?.completed ?? 0, restante: goals?.active ?? 0 },
]

export const buildConsistencyData = (tasks?: DashboardTasks, habits?: DashboardHabits, studies?: DashboardStudies) => [
  { name: 'Hoje', valor: tasks?.today ?? 0 },
  { name: 'Check-ins', valor: habits?.todayCheckIns ?? 0 },
  { name: 'Sessões', valor: studies?.weekSessions ?? 0 },
]

const viewOptions: { key: ChartView; icon: React.FC<{ className?: string }>; label: string; question: string }[] = [
  { key: 'workload', icon: BarChart3, label: 'Carga', question: 'Onde está concentrado o trabalho?' },
  { key: 'progress', icon: PieChartIcon, label: 'Progresso', question: 'Quanto já foi concluído?' },
  { key: 'consistency', icon: TrendingUp, label: 'Constância', question: 'Como está o ritmo recente?' },
]

const ChartsWidget: React.FC<ChartsWidgetProps> = ({ tasks, habits, goals, studies }) => {
  const [view, setView] = useState<ChartView>('workload')
  const workloadData = useMemo(() => buildWorkloadData(tasks, goals, studies, habits), [tasks, goals, studies, habits])
  const progressData = useMemo(() => buildProgressData(tasks, goals), [tasks, goals])
  const consistencyData = useMemo(() => buildConsistencyData(tasks, habits, studies), [tasks, habits, studies])
  const selectedView = viewOptions.find((option) => option.key === view) ?? viewOptions[0]
  const hasData = [...workloadData, ...progressData, ...consistencyData].some((item) => Object.entries(item).some(([key, value]) => key !== 'name' && Number(value) > 0))

  return (
    <section className="dashboard-card" aria-labelledby="dashboard-analytics-title">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <p className="dashboard-card__eyebrow">Análise</p>
          <h2 id="dashboard-analytics-title" className="dashboard-card__title">Seu ritmo de organização</h2>
          <p className="dashboard-card__description">{selectedView.question}</p>
        </div>
        <div className="flex gap-1 bg-[var(--bg-elevated)] rounded-lg p-0.5" role="group" aria-label="Escolher análise">
          {viewOptions.map(({ key, icon: Icon, label }) => (
            <button key={key} type="button" onClick={() => setView(key)} aria-label={`Ver análise: ${label}`} aria-pressed={view === key}
              className={`cursor-pointer p-1.5 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)] ${view === key ? 'bg-[var(--bg-surface)] shadow-sm text-primary' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-surface)]'}`}>
              <Icon className="w-4 h-4" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <div className="h-64" role="img" aria-label={`Gráfico de ${selectedView.label.toLowerCase()}`}>
        {!hasData ? <div className="flex items-center justify-center h-full text-[var(--text-tertiary)] text-sm">Sem dados suficientes para análise</div> : view === 'workload' ? (
          <ResponsiveContainer width="100%" height="100%"><BarChart data={workloadData}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Legend /><Bar dataKey="pendentes" name="Pendentes" fill={COLORS.attention} radius={[4, 4, 0, 0]} /><Bar dataKey="atrasadas" name="Atrasadas" fill="#ef4444" radius={[4, 4, 0, 0]} /><Bar dataKey="ativas" name="Ativas" fill={COLORS.accent} radius={[4, 4, 0, 0]} /><Bar dataKey="hoje" name="Hoje" fill={COLORS.primary} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        ) : view === 'progress' ? (
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={progressData} dataKey="concluído" nameKey="name" innerRadius={52} outerRadius={86} paddingAngle={3}><Cell fill={COLORS.positive} /><Cell fill={COLORS.accent} /></Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%"><LineChart data={consistencyData}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="valor" name="Volume" stroke={COLORS.primary} strokeWidth={2} dot={{ fill: COLORS.primary, r: 4 }} /></LineChart></ResponsiveContainer>
        )}
      </div>
    </section>
  )
}

interface CalWidgetProps { tasks?: { recent?: { id: string; title: string; dueDate: string | null }[] } }

const MiniCalendar: React.FC<CalWidgetProps> = ({ tasks }) => {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [viewDate, setViewDate] = useState(new Date(today))
  const dueDateKeys = useMemo(() => new Set(
    (tasks?.recent ?? []).flatMap((task) => {
      if (!task.dueDate) return []
      const dueDate = new Date(task.dueDate)
      return Number.isNaN(dueDate.getTime()) ? [] : [dueDate.toDateString()]
    }),
  ), [tasks?.recent])
  const days = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    return {
      firstDay,
      items: Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1
        const dateKey = new Date(year, month, day).toDateString()
        return { day, isToday: dateKey === today.toDateString(), hasTasks: dueDateKeys.has(dateKey) }
      }),
    }
  }, [viewDate, today, dueDateKeys])

  const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]'

  return <section className="dashboard-card" aria-labelledby="dashboard-calendar-title"><div className="flex items-center justify-between mb-3"><h2 id="dashboard-calendar-title" className="dashboard-card__title">Calendário</h2><div className="flex items-center gap-1"><button type="button" aria-label="Mês anterior" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} className={`p-1 hover:bg-[var(--bg-elevated)] rounded text-[var(--text-tertiary)] ${focusClass}`}>&lt;</button><span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</span><button type="button" aria-label="Próximo mês" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} className={`p-1 hover:bg-[var(--bg-elevated)] rounded text-[var(--text-tertiary)] ${focusClass}`}>&gt;</button></div></div><div className="grid grid-cols-7 gap-0 text-center font-ui text-xs font-semibold text-[var(--text-tertiary)] mb-1">{WEEKDAYS.map((day) => <div key={day} className="py-1">{day}</div>)}</div><div className="grid grid-cols-7 gap-0">{Array.from({ length: days.firstDay }).map((_, i) => <div key={`empty-${i}`} />)}{days.items.map((day) => <div key={day.day} className={`text-center py-1.5 text-sm rounded-full w-8 h-8 mx-auto flex items-center justify-center ${day.isToday ? 'bg-primary text-white font-bold' : day.hasTasks ? 'bg-primary/10 text-primary font-medium' : 'text-[var(--text-secondary)]'}`}>{day.day}</div>)}</div></section>
}

export { ChartsWidget, MiniCalendar }
