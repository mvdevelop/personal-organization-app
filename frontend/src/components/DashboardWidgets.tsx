import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

type ChartType = 'pie' | 'bar' | 'line'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

interface ChartsWidgetProps {
  tasks: { total: number; pending: number; completed: number; today: number; overdue: number } | undefined
  habits: { total: number; todayCheckIns: number } | undefined
  goals: { active: number; completed: number } | undefined
  studies: { weekSessions: number; weekStudyHours: number } | undefined
}

const ChartsWidget: React.FC<ChartsWidgetProps> = ({ tasks, habits, goals, studies }) => {
  const [chartType, setChartType] = useState<ChartType>('bar')

  const pieData = useMemo(() => [
    { name: 'Tarefas pendentes', value: tasks?.pending || 0, color: '#f59e0b' },
    { name: 'Tarefas concluídas', value: tasks?.completed || 0, color: '#10b981' },
    { name: 'Metas ativas', value: goals?.active || 0, color: '#8b5cf6' },
    { name: 'Metas concluídas', value: goals?.completed || 0, color: '#ec4899' },
    { name: 'Hábitos', value: habits?.total || 0, color: '#3b82f6' },
    { name: 'Sessões estudo', value: studies?.weekSessions || 0, color: '#14b8a6' },
  ].filter(d => d.value > 0), [tasks, habits, goals, studies])

  const barData = useMemo(() => [
    { name: 'Tarefas', Pendentes: tasks?.pending || 0, Concluídas: tasks?.completed || 0 },
    { name: 'Metas', Ativas: goals?.active || 0, Completas: goals?.completed || 0 },
    { name: 'Estudos', Sessões: studies?.weekSessions || 0, Horas: studies?.weekStudyHours || 0 },
    { name: 'Hábitos', Total: habits?.total || 0, Hoje: habits?.todayCheckIns || 0 },
  ], [tasks, habits, goals, studies])

  const lineData = useMemo(() => [
    { name: 'Tarefas', valor: tasks?.total || 0 },
    { name: 'Concluídas', valor: tasks?.completed || 0 },
    { name: 'Metas', valor: goals?.active || 0 },
    { name: 'Hábitos', valor: habits?.total || 0 },
    { name: 'Estudos', valor: studies?.weekSessions || 0 },
  ], [tasks, habits, goals, studies])

  const chartTypes: { key: ChartType; icon: React.FC<any>; label: string }[] = [
    { key: 'bar', icon: BarChart3, label: 'Barras' },
    { key: 'pie', icon: PieChartIcon, label: 'Pizza' },
    { key: 'line', icon: TrendingUp, label: 'Linha' },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Analytics</h3>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
          {chartTypes.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setChartType(key)}
              className={`p-1.5 rounded-md transition-colors ${chartType === key ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              title={label}>
              <Icon className={`w-4 h-4 ${chartType === key ? 'text-primary' : 'text-gray-500'}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        {pieData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">Sem dados suficientes</div>
        ) : chartType === 'pie' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Pendentes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Concluídas" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ativas" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Completas" fill="#ec4899" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Sessões" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Hoje" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Horas" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

// Mini Calendar Widget
interface CalWidgetProps {
  tasks?: { recent?: { id: string; title: string; dueDate: string | null }[] }
}

const MiniCalendar: React.FC<CalWidgetProps> = ({ tasks }) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [viewDate, setViewDate] = useState(new Date(today))
  const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1)
    const isToday = d.getTime() === today.getTime()
    const hasTask = tasks?.recent?.some((t: any) => t.dueDate && new Date(t.dueDate).toDateString() === d.toDateString())
    return { date: d, day: i + 1, isToday, hasTasks: !!hasTask }
  })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">Calendário</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400">&lt;</button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400">&gt;</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
        {WEEKDAYS.map(d => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {days.map(d => (
          <div key={d.day} className={`text-center py-1.5 text-sm rounded-full w-8 h-8 mx-auto flex items-center justify-center ${d.isToday ? 'bg-primary text-white font-bold' : d.hasTasks ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
            {d.day}
          </div>
        ))}
      </div>
    </div>
  )
}

export { ChartsWidget, MiniCalendar }
