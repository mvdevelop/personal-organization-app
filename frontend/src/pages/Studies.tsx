import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchSubjects, createSubject, deleteSubject, fetchSessions, createSession, deleteSession, type Subject, type StudySession } from '../store/slices/studiesSlice';
import { Plus, BookOpen, Trash2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const TECHNIQUES = ['pomodoro', 'revisao', 'exercicio', 'leitura', 'outro'] as const
const TECHNIQUE_LABELS: Record<string, string> = { pomodoro: 'Pomodoro', revisao: 'Revisão', exercicio: 'Exercício', leitura: 'Leitura', outro: 'Outro' }

const Studies: React.FC = () => {
  const dispatch = useAppDispatch()
  const { subjects, sessions, loading } = useAppSelector(s => s.studies)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Subject['category']>('personal')
  const [color, setColor] = useState('#3b82f6')
  const [workload, setWorkload] = useState('')
  const [calDate, setCalDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [logSubject, setLogSubject] = useState('')
  const [logDuration, setLogDuration] = useState('')
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0])
  const [logTechnique, setLogTechnique] = useState('pomodoro')
  useEffect(() => { dispatch(fetchSubjects()) }, [dispatch])

  const weekStart = useMemo(() => {
    const d = new Date(calDate); const day = d.getDay()
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
    d.setHours(0, 0, 0, 0); return d
  }, [calDate])

  const weekEnd = useMemo(() => { const d = new Date(weekStart); d.setDate(d.getDate() + 6); return d }, [weekStart])
  const monthStart = useMemo(() => new Date(calDate.getFullYear(), calDate.getMonth(), 1), [calDate])
  const monthEnd = useMemo(() => new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0), [calDate])

  useEffect(() => {
    const s = viewMode === 'week' ? weekStart : monthStart
    const e = viewMode === 'week' ? weekEnd : monthEnd
    dispatch(fetchSessions({ start: s.toISOString(), end: e.toISOString() }))
  }, [dispatch, viewMode, weekStart, weekEnd, monthStart, monthEnd])

  const weekDays = useMemo(() => {
    const days: Date[] = []
    for (let i = 0; i < 7; i++) { const d = new Date(weekStart); d.setDate(d.getDate() + i); days.push(d) }
    return days
  }, [weekStart])

  const getDaySessions = (date: Date): StudySession[] => {
    const dateStr = date.toISOString().split('T')[0]
    return sessions.filter(s => s.date.startsWith(dateStr))
  }

  const getSubjectDayMinutes = (subjectId: string, date: Date): number => {
    return getDaySessions(date).filter(s => s.subjectId === subjectId).reduce((acc, s) => acc + s.duration, 0)
  }

  const handleLogSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!logSubject || !logDuration) return
    try {
      await dispatch(createSession({
        subjectId: logSubject,
        duration: Number(logDuration),
        technique: logTechnique as typeof TECHNIQUES[number],
        date: new Date(logDate).toISOString(),
      })).unwrap()
      setLogDuration('')
      toast.success('Sessão registrada!')
    } catch { toast.error('Erro ao registrar') }
  }

  const handleDeleteSession = async (id: string) => {
    try { await dispatch(deleteSession(id)).unwrap() } catch { toast.error('Erro') }
  }

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(createSubject({ name, category, color, workload: workload ? Number(workload) : 0 })).unwrap()
      toast.success('Matéria adicionada!'); setShowForm(false); setName(''); setWorkload('')
    } catch { toast.error('Erro') }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const calDays = useMemo(() => {
    const toDateStr = (date: Date) => date.toISOString().split('T')[0]
    const dayMinutes = (date: Date): number => {
      const ds = toDateStr(date)
      return sessions.filter(s => s.date.startsWith(ds)).reduce((acc, s) => acc + s.duration, 0)
    }

    const days: { date: Date; minutes: number }[] = []
    const first = new Date(calDate.getFullYear(), calDate.getMonth(), 1)
    const last = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0)
    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
      days.push({ date: new Date(d), minutes: dayMinutes(d) })
    }
    return days
  }, [calDate, sessions])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Estudos</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 btn-primary rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4" /> Matéria
        </button>
      </div>

      {/* Add subject form */}
      {showForm && (
        <form onSubmit={handleAddSubject} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex gap-3 flex-wrap">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome da matéria" required
              className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            <select value={category} onChange={e => setCategory(e.target.value as Subject['category'])}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
              <option value="faculdade">🎓 Faculdade</option>
              <option value="concurso">📋 Concurso</option>
              <option value="curso">📖 Curso</option>
              <option value="personal">🧠 Pessoal</option>
            </select>
            <input value={workload} onChange={e => setWorkload(e.target.value)} type="number" placeholder="Carga h"
              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer" />
            <button type="submit" className="px-4 py-2 btn-primary rounded-lg text-sm">Adicionar</button>
          </div>
        </form>
      )}

      {/* View toggle + Log form */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button onClick={() => setViewMode('week')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'week' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Semana</button>
          <button onClick={() => setViewMode('month')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'month' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Mês</button>
        </div>
      </div>

      {loading && subjects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Adicione matérias para começar</p>
        </div>
      ) : viewMode === 'week' ? (
        /* === WEEKLY TABLE === */
        <>
          {/* Quick log form */}
          <form onSubmit={handleLogSession} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex gap-3 flex-wrap items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Matéria</label>
              <select value={logSubject} onChange={e => setLogSubject(e.target.value)} required
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm min-w-[160px]">
                <option value="">Selecionar...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Minutos</label>
              <input value={logDuration} onChange={e => setLogDuration(e.target.value)} type="number" placeholder="25" required min={1}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Técnica</label>
              <select value={logTechnique} onChange={e => setLogTechnique(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                {TECHNIQUES.map(t => <option key={t} value={t}>{TECHNIQUE_LABELS[t]}</option>)}
              </select>
            </div>
            <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            <button type="submit" className="px-4 py-2 btn-primary rounded-lg text-sm">Registrar</button>
          </form>

          {/* Weekly table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-1/4">Matéria</th>
                  {weekDays.map((d, i) => (
                    <th key={i} className={`text-center px-2 py-3 text-xs font-semibold ${d.getTime() === today.getTime() ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                      <div>{WEEKDAYS[d.getDay()]}</div>
                      <div className="text-lg font-bold">{d.getDate()}</div>
                    </th>
                  ))}
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-400 uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subject => {
                  const weekTotal = weekDays.reduce((acc, d) => acc + getSubjectDayMinutes(subject.id, d), 0)
                  return (
                    <tr key={subject.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: subject.color + '20', color: subject.color }}>
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{subject.name}</span>
                            {subject.workload > 0 && <span className="text-xs text-gray-400 ml-2">{subject.workload}h</span>}
                          </div>
                        </div>
                      </td>
                      {weekDays.map((d, i) => {
                        const mins = getSubjectDayMinutes(subject.id, d)
                        const isToday = d.getTime() === today.getTime()
                        return (
                          <td key={i} className={`text-center px-2 py-3 ${isToday ? 'bg-primary/5' : ''}`}>
                            {mins > 0 ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                                style={{ backgroundColor: subject.color + '20', color: subject.color }}>
                                <Clock className="w-3 h-3" />
                                {mins}m
                              </div>
                            ) : (
                              <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="text-center px-3 py-3">
                        <span className="text-sm font-bold text-primary">{Math.round(weekTotal / 60 * 10) / 10}h</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Recent sessions list */}
          {sessions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Sessões desta semana</h3>
              <div className="space-y-2">
                {sessions.slice(0, 10).map(s => {
                  const sub = subjects.find(x => x.id === s.subjectId)
                  return (
                    <div key={s.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sub?.color || '#3b82f6' }} />
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-32 truncate">{sub?.name || '?'}</span>
                      <span className="text-gray-500">{TECHNIQUE_LABELS[s.technique] || s.technique}</span>
                      <span className="text-gray-400">{s.duration}m</span>
                      <span className="text-gray-400 text-xs">{new Date(s.date).toLocaleDateString('pt-BR')}</span>
                      <button onClick={() => handleDeleteSession(s.id)} className="ml-auto p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* === MONTHLY CALENDAR === */
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{MONTHS[calDate.getMonth()]} {calDate.getFullYear()}</h2>
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
              const hours = Math.round(d.minutes / 6) / 10
              return (
                <div key={i} className={`relative p-2 rounded-lg text-center min-h-[50px] ${isToday ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-gray-800' : ''}`}
                  style={{ backgroundColor: d.minutes > 0 ? `rgba(16, 185, 129, ${Math.min(0.4, 0.08 + d.minutes / 500)})` : undefined }}>
                  <div className={`text-sm ${isToday ? 'font-bold text-primary' : 'text-gray-700 dark:text-gray-300'}`}>{d.date.getDate()}</div>
                  {d.minutes > 0 && <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">{hours}h</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Subjects list */}
      {subjects.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Matérias</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {subjects.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.color + '20', color: s.color }}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.name}</div>
                  {s.workload > 0 && <div className="text-xs text-gray-400">{s.workload}h</div>}
                </div>
                <button onClick={() => { if (window.confirm('Remover?')) dispatch(deleteSubject(s.id)).then(() => toast.success('Removida!')) }}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Studies
