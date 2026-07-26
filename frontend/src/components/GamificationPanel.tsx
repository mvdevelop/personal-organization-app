import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchGamificationStats } from '../store/slices/gamificationSlice';
import { Trophy, Award, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const LEVEL_TITLES = [
  '', 'Iniciante', 'Aprendiz', 'Dedicado', 'Focado', 'Persistente',
  'Determinado', 'Disciplinado', 'Mestre', 'Lendário', 'Supremo',
]

const GamificationPanel: React.FC = () => {
  const dispatch = useAppDispatch()
  const { level, currentXp, nextLevelXp, progress, achievements, counters } = useAppSelector(s => s.gamification)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showCounters, setShowCounters] = useState(false)

  useEffect(() => {
    dispatch(fetchGamificationStats())
  }, [dispatch])

  const unlocked = achievements.filter(a => a.unlocked)
  const locked = achievements.filter(a => !a.unlocked)
  const title = LEVEL_TITLES[level] || 'Lendário'

  return (
    <div className="arch-decoration bg-white dark:bg-gray-800 rounded-xl shadow-warm border border-gray-200 dark:border-gray-700 p-5">
      {/* Level + XP */}
      <div className="flex items-center gap-4 mb-4">
        <div className="medal-ring !w-14 !h-14 !border-yellow-400 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
          <span className="font-display text-xl font-bold text-white">{level}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <h3 className="font-display font-semibold text-sm text-gray-900 dark:text-white">Nível {level} — {title}</h3>
          </div>
          <div className="mt-2">
            <div className="flex justify-between font-mono text-xs text-gray-500 dark:text-gray-400">
              <span>{currentXp} XP</span>
              <span>{nextLevelXp} XP</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
              <div className="h-full rounded-full animate-xp-fill transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                  boxShadow: '0 0 8px rgba(251, 191, 36, 0.4)',
                }} />
            </div>
          </div>
        </div>
      </div>

      {/* Total stats */}
      <div className="flex items-center gap-3 font-body text-sm text-gray-500 dark:text-gray-400 mb-3">
        <Award className="w-4 h-4 text-yellow-500" />
        <span>{unlocked.length}/{achievements.length} conquistas · {counters.tasksCompleted} tarefas concluídas</span>
      </div>

      {/* Quick achievements preview */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {unlocked.slice(0, 8).map(ach => (
          <div
            key={ach.slug}
            className="medal-ring !w-7 !h-7 !border-yellow-400 animate-fade-in"
            title={`${ach.title} — ${ach.description}`}
          >
            <Award className="w-3.5 h-3.5 text-yellow-500" />
          </div>
        ))}
      </div>

      {/* Toggle buttons */}
      <div className="flex gap-3">
        <button onClick={() => setShowAchievements(!showAchievements)}
          className="flex items-center gap-1 font-ui text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer">
          {showAchievements ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          Conquistas
        </button>
        <button onClick={() => setShowCounters(!showCounters)}
          className="flex items-center gap-1 font-ui text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer">
          {showCounters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          Estatísticas
        </button>
      </div>

      {/* Achievements */}
      {showAchievements && (
        <div className="mt-3 space-y-1 max-h-60 overflow-y-auto border-t border-gray-100 dark:border-gray-700 pt-3 animate-slide-up">
          {unlocked.map(ach => (
            <div key={ach.slug} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 font-body text-sm">
              <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <span className="flex-1 text-gray-700 dark:text-gray-300">{ach.title}</span>
              <span className="font-ui text-xs text-yellow-600 dark:text-yellow-400">+{ach.xpReward} XP</span>
            </div>
          ))}
          {locked.slice(0, 5).map(ach => (
            <div key={ach.slug} className="flex items-center gap-2 px-2 py-1.5 rounded-lg font-body text-sm opacity-50">
              <Award className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              <span className="flex-1 text-gray-500 dark:text-gray-400">{ach.title}</span>
            </div>
          ))}
          {locked.length > 5 && (
            <p className="font-ui text-xs text-center text-gray-400 py-1">+{locked.length - 5} bloqueadas</p>
          )}
        </div>
      )}

      {/* Counters */}
      {showCounters && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 dark:border-gray-700 pt-3 animate-slide-up">
          <CounterRow label="Tarefas criadas" value={counters.tasksCreated} />
          <CounterRow label="Tarefas concluídas" value={counters.tasksCompleted} />
          <CounterRow label="Hábitos criados" value={counters.habitsCreated} />
          <CounterRow label="Metas criadas" value={counters.goalsCreated} />
          <CounterRow label="Metas concluídas" value={counters.goalsCompleted} />
          <CounterRow label="Sessões de estudo" value={counters.studySessions} />
          <CounterRow label="Minutos estudados" value={counters.studyMinutes} />
          <CounterRow label="Notas criadas" value={counters.notesCreated} />
        </div>
      )}

      <div className="mt-3 flex justify-center">
        <Sparkles className="w-4 h-4 text-yellow-400 opacity-40" />
      </div>
    </div>
  )
}

function CounterRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center font-body text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{value}</span>
    </div>
  )
}

export default GamificationPanel
