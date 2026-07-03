import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchHabits, createHabit, updateHabit, deleteHabit,
  fetchLogs, createLog, fetchStreaks,
  type Habit,
} from '../store/slices/habitsSlice';
import { Plus, Check, Circle, Trash2, Dumbbell, BookOpen, Brain, Heart, Music, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';

const ICON_MAP: Record<string, React.FC<any>> = {
  dumbbell: Dumbbell, 'book-open': BookOpen, brain: Brain, heart: Heart, music: Music, coffee: Coffee,
}

const Habits: React.FC = () => {
  const dispatch = useAppDispatch()
  const { habits, streaks, loading } = useAppSelector(s => s.habits)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')
  const [color, setColor] = useState('#3b82f6')

  useEffect(() => {
    dispatch(fetchHabits())
    dispatch(fetchStreaks())
  }, [dispatch])

  const today = new Date().toISOString().split('T')[0]

  const handleCheckIn = async (habitId: string) => {
    try {
      await dispatch(createLog({ habitId, date: today })).unwrap()
      dispatch(fetchStreaks())
      toast.success('Check-in realizado!')
    } catch { toast.error('Erro ao registrar') }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await dispatch(updateHabit({ id: editingId, data: { title, frequency, color } })).unwrap()
        toast.success('Hábito atualizado!')
      } else {
        await dispatch(createHabit({ title, frequency, color })).unwrap()
        toast.success('Hábito criado!')
      }
      setShowForm(false)
      setEditingId(null)
      setTitle('')
    } catch { toast.error('Erro ao salvar hábito') }
  }

  const handleEdit = (h: Habit) => {
    setEditingId(h.id)
    setTitle(h.title)
    setFrequency(h.frequency)
    setColor(h.color)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deletar este hábito?')) return
    try { await dispatch(deleteHabit(id)).unwrap(); toast.success('Hábito removido!'); dispatch(fetchStreaks()) }
    catch { toast.error('Erro ao remover') }
  }

  const getStreak = (habitId: string) => streaks.find(s => s.habitId === habitId)?.streak || 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hábitos</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setTitle(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        ><Plus className="w-4 h-4" /> Novo Hábito</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex gap-3 flex-wrap">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do hábito" required
              className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            <select value={frequency} onChange={e => setFrequency(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
            </select>
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              className="w-9 h-9 rounded cursor-pointer" />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
              {editingId ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      )}

      {loading && habits.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Nenhum hábito ainda. Crie um!</div>
      ) : (
        <div className="grid gap-3">
          {habits.map(habit => (
            <div key={habit.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-shadow">
              <button onClick={() => handleCheckIn(habit.id)}
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: habit.color + '20', color: habit.color }}>
                <Check className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{habit.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {habit.frequency === 'daily' ? 'Diário' : 'Semanal'} · 🔥 {getStreak(habit.id)} dias
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(habit)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Circle className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(habit.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Habits
