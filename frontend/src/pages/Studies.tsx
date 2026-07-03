import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchSubjects, createSubject, deleteSubject, type Subject } from '../store/slices/studiesSlice';
import { Plus, BookOpen, Trash2, Clock, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'faculdade', label: 'Faculdade', emoji: '🎓' },
  { value: 'concurso', label: 'Concurso', emoji: '📋' },
  { value: 'curso', label: 'Curso', emoji: '📖' },
  { value: 'personal', label: 'Pessoal', emoji: '🧠' },
] as const

const Studies: React.FC = () => {
  const dispatch = useAppDispatch()
  const { subjects, loading } = useAppSelector(s => s.studies)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Subject['category']>('personal')
  const [color, setColor] = useState('#3b82f6')
  const [workload, setWorkload] = useState('')

  useEffect(() => { dispatch(fetchSubjects()) }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(createSubject({ name, category, color, workload: workload ? Number(workload) : 0 })).unwrap()
      toast.success('Matéria adicionada!')
      setShowForm(false); setName(''); setWorkload('')
    } catch { toast.error('Erro ao criar matéria') }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remover esta matéria e todas as sessões?')) return
    try { await dispatch(deleteSubject(id)).unwrap(); toast.success('Matéria removida!') }
    catch { toast.error('Erro ao remover') }
  }

  const grouped = (CATEGORIES as typeof CATEGORIES).map(cat => ({
    ...cat,
    subjects: subjects.filter(s => s.category === cat.value),
  }))

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Estudos</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        ><Plus className="w-4 h-4" /> Nova Matéria</button>
      </div>

      {/* Pomodoro section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-500" />
          <div>
            <h2 className="font-medium text-gray-900 dark:text-white">Pomodoro</h2>
            <p className="text-xs text-gray-500">Em breve — cronômetro integrado para sessões de estudo</p>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex gap-3 flex-wrap">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome da matéria" required
              className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            <select value={category} onChange={e => setCategory(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
            </select>
            <input value={workload} onChange={e => setWorkload(e.target.value)} type="number" placeholder="Carga horária"
              className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer" />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">Adicionar</button>
          </div>
        </form>
      )}

      {loading && subjects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Nenhuma matéria ainda. Adicione uma!</div>
      ) : (
        <div className="space-y-6">
          {grouped.filter(g => g.subjects.length > 0).map(group => (
            <div key={group.value}>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{group.emoji} {group.label}</h2>
              <div className="grid gap-3">
                {group.subjects.map(subject => (
                  <div key={subject.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: subject.color + '20', color: subject.color }}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white">{subject.name}</h3>
                      {subject.workload > 0 && (
                        <p className="text-xs text-gray-500">{subject.workload}h planejadas</p>
                      )}
                    </div>
                    <button onClick={() => handleDelete(subject.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Studies
