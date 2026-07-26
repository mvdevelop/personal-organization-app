import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchGoals, createGoal, updateGoal, deleteGoal, type Goal } from '../store/slices/goalsSlice';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, CheckCircle, Clock, Trash2, Trophy, Target } from 'lucide-react';
import { GOAL_TYPES } from '../shared/constants';
import toast from 'react-hot-toast';

const Goals: React.FC = () => {
  const dispatch = useAppDispatch()
  const { goals, loading } = useAppSelector(s => s.goals)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<Goal['type']>('custom')
  const [targetValue, setTargetValue] = useState('')
  const [deadline, setDeadline] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; goalId: string | null }>({ isOpen: false, goalId: null })

  useEffect(() => { dispatch(fetchGoals()) }, [dispatch])

  const resetForm = () => {
    setTitle(''); setTargetValue(''); setDeadline(''); setType('custom')
  }

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
      setShowForm(false); setEditingId(null); resetForm()
    } catch { toast.error('Erro ao salvar meta') }
  }

  const handleToggleStatus = async (goal: Goal) => {
    const newStatus = goal.status === 'active' ? 'completed' : 'active'
    try { await dispatch(updateGoal({ id: goal.id, data: { status: newStatus } })).unwrap() }
    catch { toast.error('Erro ao atualizar') }
  }

  const handleDelete = async (id: string) => {
    try { await dispatch(deleteGoal(id)).unwrap(); toast.success('Meta removida!') }
    catch { toast.error('Erro ao remover') }
    finally { setDeleteConfirm({ isOpen: false, goalId: null }) }
  }

  const getTypeEmoji = (t: Goal['type']) => GOAL_TYPES.find(g => g.value === t)?.emoji || '🎯'
  const getTypeLabel = (t: Goal['type']) => GOAL_TYPES.find(g => g.value === t)?.label || t
  const progress = (g: Goal) => g.targetValue ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader icon={Trophy} title="Metas">
        <Button variant="gold" icon={<Plus className="w-4 h-4" />}
          onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm() }}>
          Nova Meta
        </Button>
      </PageHeader>

      {showForm && (
        <form onSubmit={handleSubmit} className="arch-decoration bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-warm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da meta" required
              className="input-retro col-span-full px-3 py-2" />
            <select value={type} onChange={e => setType(e.target.value as Goal['type'])}
              className="select-retro px-3 py-2">
              {GOAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
            </select>
            <input value={targetValue} onChange={e => setTargetValue(e.target.value)} type="number" placeholder="Valor alvo (opcional)"
              className="input-retro px-3 py-2" />
            <input value={deadline} onChange={e => setDeadline(e.target.value)} type="date"
              className="input-retro px-3 py-2" />
            <Button variant="gold" type="submit" className="col-span-full sm:col-span-1">
              {editingId ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      )}

      {loading && goals.length === 0 ? (
        <LoadingSpinner text="Carregando metas..." />
      ) : activeGoals.length === 0 && completedGoals.length === 0 ? (
        <EmptyState icon={Target} title="Nenhuma meta ainda" description="Crie sua primeira meta!" />
      ) : (
        <div className="space-y-3">
          {activeGoals.map(goal => (
            <div key={goal.id} className="arch-decoration bg-white dark:bg-gray-800 rounded-xl p-4 shadow-warm border border-gray-200 dark:border-gray-700 hover:shadow-warm-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg">{getTypeEmoji(goal.type)}</span>
                    <h3 className="font-display font-medium text-gray-900 dark:text-white">{goal.title}</h3>
                    <span className="font-ui text-[11px] px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {getTypeLabel(goal.type)}
                    </span>
                  </div>
                  {goal.targetValue && (
                    <div className="mt-2">
                      <div className="flex justify-between font-mono text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progresso</span>
                        <span>R$ {goal.currentValue} / R$ {goal.targetValue}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progress(goal)}%`,
                            background: 'linear-gradient(90deg, var(--color-primary-light), var(--color-primary))',
                          }} />
                      </div>
                    </div>
                  )}
                  {goal.deadline && (
                    <p className="font-mono text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleToggleStatus(goal)} className="cursor-pointer p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-green-500 transition-colors" title="Concluir">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm({ isOpen: true, goalId: goal.id })} className="cursor-pointer p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {completedGoals.length > 0 && (
            <>
              <div className="divider-diamond my-4" />
              <h2 className="font-display text-lg font-semibold text-gray-500 dark:text-gray-400">✅ Concluídas</h2>
              {completedGoals.map(goal => (
                <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-warm border border-green-200 dark:border-green-900/30 opacity-75">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h3 className="font-body font-medium text-gray-500 dark:text-gray-400 line-through">{goal.title}</h3>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, goalId: null })}
        onConfirm={() => deleteConfirm.goalId && handleDelete(deleteConfirm.goalId)}
        title="Remover Meta"
        message="Tem certeza que deseja deletar esta meta?"
        confirmText="Deletar"
        variant="danger"
      />
    </div>
  )
}

export default Goals
