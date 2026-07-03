import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchGoals, createGoal, updateGoal, deleteGoal, type Goal } from '../store/slices/goalsSlice';
import { Plus, Target, CheckCircle, Clock, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const GOAL_TYPES: { value: Goal['type']; label: string; emoji: string }[] = [
  { value: 'purchase', label: 'Compra', emoji: '🛒' },
  { value: 'travel', label: 'Viagem', emoji: '✈️' },
  { value: 'learning', label: 'Aprendizado', emoji: '📚' },
  { value: 'health', label: 'Saúde', emoji: '💪' },
  { value: 'career', label: 'Carreira', emoji: '💼' },
  { value: 'custom', label: 'Personalizado', emoji: '🎯' },
]

const Goals: React.FC = () => {
  const dispatch = useAppDispatch()
  const { goals, loading } = useAppSelector(s => s.goals)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<Goal['type']>('custom')
  const [targetValue, setTargetValue] = useState('')
  const [deadline, setDeadline] = useState('')

  useEffect(() => { dispatch(fetchGoals()) }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = { title, type, targetValue: targetValue ? Number(targetValue) : null, deadline: deadline || null }
      if (editingId) {
        await dispatch(updateGoal({ id: editingId, data })).unwrap()
        toast.success('Meta atualizada!')
      } else {
        await dispatch(createGoal(data)).unwrap()
        toast.success('Meta criada!')
      }
      setShowForm(false); setEditingId(null); setTitle(''); setTargetValue(''); setDeadline('')
    } catch { toast.error('Erro ao salvar meta') }
  }

  const handleToggleStatus = async (goal: Goal) => {
    const newStatus = goal.status === 'active' ? 'completed' : 'active'
    try { await dispatch(updateGoal({ id: goal.id, data: { status: newStatus } })).unwrap() }
    catch { toast.error('Erro ao atualizar') }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deletar esta meta?')) return
    try { await dispatch(deleteGoal(id)).unwrap(); toast.success('Meta removida!') }
    catch { toast.error('Erro ao remover') }
  }

  const getTypeEmoji = (t: Goal['type']) => GOAL_TYPES.find(g => g.value === t)?.emoji || '🎯'
  const progress = (g: Goal) => g.targetValue ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Metas</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setTitle(''); setTargetValue(''); setDeadline('') }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        ><Plus className="w-4 h-4" /> Nova Meta</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da meta" required
              className="col-span-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            <select value={type} onChange={e => setType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
              {GOAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
            </select>
            <input value={targetValue} onChange={e => setTargetValue(e.target.value)} type="number" placeholder="Valor alvo (opcional)"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            <input value={deadline} onChange={e => setDeadline(e.target.value)} type="date"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            <button type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover text-sm col-span-full sm:col-span-1">
              {editingId ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      )}

      {loading && goals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : (
        <>
          {activeGoals.length === 0 && completedGoals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Nenhuma meta ainda. Crie uma!</div>
          ) : (
            <div className="space-y-3">
              {activeGoals.map(goal => (
                <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeEmoji(goal.type)}</span>
                        <h3 className="font-medium text-gray-900 dark:text-white">{goal.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{goal.type}</span>
                      </div>
                      {goal.targetValue && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progresso</span>
                            <span>R$ {goal.currentValue} / R$ {goal.targetValue}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress(goal)}%` }} />
                          </div>
                        </div>
                      )}
                      {goal.deadline && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleStatus(goal)} className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-green-500" title="Concluir">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(goal.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {completedGoals.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-2">✅ Concluídas</h2>
                  {completedGoals.map(goal => (
                    <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-green-200 dark:border-green-900/30 opacity-75">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <h3 className="font-medium text-gray-500 dark:text-gray-400 line-through">{goal.title}</h3>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Goals
