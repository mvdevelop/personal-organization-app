import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchHabits, createHabit, updateHabit, deleteHabit,
  fetchLogs, createLog, fetchStreaks,
  type HabitLog,
} from '../store/slices/habitsSlice';
import { Plus, Check, Trash2, ChevronLeft, ChevronRight, Palette, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const Habits: React.FC = () => {
  const dispatch = useAppDispatch()
  const { habits, streaks, logs, loading } = useAppSelector(s => s.habits)
  const [newTitle, setNewTitle] = useState('')
  const [newColor, setNewColor] = useState('#3b82f6')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [calDate, setCalDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')

  useEffect(() => {
    dispatch(fetchHabits())
    dispatch(fetchStreaks())
  }, [dispatch])

  // Fetch logs for visible range (derived from calDate to avoid stale week)
  const weekStart = useMemo(() => {
    const d = new Date(calDate)
    const day = d.getDay()
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
    d.setHours(0, 0, 0, 0)
    return d
  }, [calDate])

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 6)
    return d
  }, [weekStart])

  const monthStart = useMemo(() => new Date(calDate.getFullYear(), calDate.getMonth(), 1), [calDate])
  const monthEnd = useMemo(() => new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0), [calDate])

  useEffect(() => {
    const start = viewMode === 'week' ? weekStart : monthStart
    const end = viewMode === 'week' ? weekEnd : monthEnd
    dispatch(fetchLogs({ start: start.toISOString(), end: end.toISOString() }))
  }, [dispatch, viewMode, weekStart, weekEnd, monthStart, monthEnd])

  // Build week days
  const weekDays = useMemo(() => {
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      days.push(d)
    }
    return days
  }, [weekStart])

  const getLog = (habitId: string, date: Date): HabitLog | undefined => {
    const dateStr = date.toISOString().split('T')[0]
    return logs.find(l => l.habitId === habitId && l.date.startsWith(dateStr))
  }

  const handleToggle = async (habitId: string, date: Date) => {
    const existing = getLog(habitId, date)
    try {
      await dispatch(createLog({
        habitId,
        date: date.toISOString().split('T')[0],
        completed: !existing?.completed,
      })).unwrap()
      dispatch(fetchStreaks())
    } catch { toast.error('Erro ao registrar') }
  }

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    try {
      await dispatch(createHabit({ title: newTitle.trim(), color: newColor, frequency: 'daily' })).unwrap()
      setNewTitle('')
      toast.success('Hábito criado!')
    } catch { toast.error('Erro ao criar') }
  }

  const handleEditSave = async (id: string) => {
    if (!editTitle.trim()) return
    try {
      await dispatch(updateHabit({ id, data: { title: editTitle.trim() } })).unwrap()
      setEditingId(null)
      toast.success('Hábito atualizado!')
    } catch { toast.error('Erro ao atualizar') }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deletar este hábito?')) return
    try { await dispatch(deleteHabit(id)).unwrap(); dispatch(fetchStreaks()); toast.success('Removido!') }
    catch { toast.error('Erro ao remover') }
  }

  const getStreak = (habitId: string) => streaks.find(s => s.habitId === habitId)?.streak || 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Calendar heatmap data
  const calDays = useMemo(() => {
    const days: { date: Date; count: number }[] = []
    const first = new Date(calDate.getFullYear(), calDate.getMonth(), 1)
    const last = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0)
    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const count = logs.filter(l => l.date.startsWith(dateStr) && l.completed).length
      days.push({ date: new Date(d), count })
    }
    return days
  }, [calDate, logs])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Zap className="w-7 h-7 text-primary" />
          Hábitos
        </h1>
      </div>

      {/* Add habit form */}
      <form onSubmit={handleAddHabit} className="flex gap-3 flex-wrap">
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
          placeholder="Novo hábito..." required
          className="flex-1 min-w-[200px] px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
        <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
          className="w-10 h-10 rounded-xl cursor-pointer border border-gray-300 dark:border-gray-600" />
        <button type="submit"
          className="flex items-center gap-2 px-5 py-2.5 btn-primary font-medium rounded-xl text-sm">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </form>

      {/* Week/Month toggle */}
      <div className="flex items-center gap-2">
        <button onClick={() => setViewMode('week')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'week' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>Semana</button>
        <button onClick={() => setViewMode('month')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'month' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>Mês</button>
      </div>

      {loading && habits.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16">
          <Palette className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Crie seu primeiro hábito acima!</p>
        </div>
      ) : viewMode === 'week' ? (
        /* === WEEKLY TABLE === */
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/4">Hábito</th>
                {weekDays.map((d, i) => (
                  <th key={i} className={`text-center px-2 py-3 text-xs font-semibold ${d.getTime() === today.getTime() ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                    <div>{WEEKDAYS[d.getDay()]}</div>
                    <div className="text-lg font-bold">{d.getDate()}</div>
                  </th>
                ))}
                <th className="text-center px-3 py-3 text-xs font-semibold text-orange-500 uppercase">🔥</th>
                <th className="text-center px-2 py-3 text-xs font-semibold text-gray-400 uppercase">Ação</th>
              </tr>
            </thead>
            <tbody>
              {habits.map(habit => (
                <tr key={habit.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
                      {editingId === habit.id ? (
                        <div className="flex gap-2">
                          <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-32" autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') handleEditSave(habit.id); if (e.key === 'Escape') setEditingId(null) }} />
                          <button onClick={() => handleEditSave(habit.id)} className="text-xs text-primary">OK</button>
                          <button onClick={() => setEditingId(null)} className="text-xs text-gray-400">Cancelar</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingId(habit.id); setEditTitle(habit.title) }}
                          className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary truncate max-w-[150px]">
                          {habit.title}
                        </button>
                      )}
                    </div>
                  </td>
                  {weekDays.map((d, i) => {
                    const log = getLog(habit.id, d)
                    const isToday = d.getTime() === today.getTime()
                    return (
                      <td key={i} className={`text-center px-2 py-2 ${isToday ? 'bg-primary/5' : ''}`}>
                        <button
                          onClick={() => handleToggle(habit.id, d)}
                          className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center transition-all hover:scale-110 ${
                            log?.completed
                              ? 'text-white shadow-sm'
                              : 'border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary'
                          }`}
                          style={log?.completed ? { backgroundColor: habit.color } : {}}
                        >
                          {log?.completed ? <Check className="w-4 h-4" /> : null}
                        </button>
                      </td>
                    )
                  })}
                  <td className="text-center px-3 py-3">
                    <span className="text-sm font-bold text-orange-500">🔥 {getStreak(habit.id)}</span>
                  </td>
                  <td className="text-center px-2 py-3">
                    <button onClick={() => handleDelete(habit.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* === MONTHLY CALENDAR === */
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {MONTHS[calDate.getMonth()]} {calDate.getFullYear()}
            </h2>
            <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            {WEEKDAYS.map(d => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: calDays[0]?.date.getDay() || 0 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {calDays.map((d, i) => {
              const isToday = d.date.getTime() === today.getTime()
              const maxCount = habits.length || 1
              const intensity = d.count / maxCount
              return (
                <div key={i} className={`relative p-2 rounded-lg text-center min-h-[44px] ${isToday ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-gray-800' : ''}`}
                  style={{ backgroundColor: d.count > 0 ? `rgba(59, 130, 246, ${0.1 + intensity * 0.3})` : undefined }}>
                  <div className={`text-sm ${isToday ? 'font-bold text-primary' : 'text-gray-700 dark:text-gray-300'}`}>{d.date.getDate()}</div>
                  {d.count > 0 && <div className="text-xs text-primary font-medium mt-0.5">{d.count}✓</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Habits
