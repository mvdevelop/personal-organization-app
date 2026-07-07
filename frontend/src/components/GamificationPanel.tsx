import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchGamificationStats } from '../store/slices/gamificationSlice';
import { Trophy, Award, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      {/* Level + XP */}
      <div className="cursor-pointer flex items-center gap-4 mb-4">
        <div className="cursor-pointer w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="cursor-pointer text-xl font-bold text-white">{level}</span>
        </div>
        <div className="cursor-pointer flex-1 min-w-0">
          <div className="cursor-pointer flex items-center gap-2">
            <Trophy className="cursor-pointer w-4 h-4 text-yellow-500" />
            <h3 className="cursor-pointer font-semibold text-gray-900 dark:text-white text-sm">Nível {level} — {title}</h3>
          </div>
          <div className="cursor-pointer mt-2">
            <div className="cursor-pointer flex justify-between text-xs text-gray-500 mb-1">
              <span>{currentXp} XP</span>
              <span>{nextLevelXp} XP</span>
            </div>
            <div className="cursor-pointer w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="cursor-pointer h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="cursor-pointer flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
        <Award className="cursor-pointer w-4 h-4 text-yellow-500" />
        <span>{unlocked.length}/{achievements.length} conquistas · {counters.tasksCompleted} tarefas concluídas</span>
      </div>

      {/* Quick achievements preview */}
      <div className="cursor-pointer flex flex-wrap gap-1 mb-3">
        {unlocked.slice(0, 8).map(ach => (
          <div
            key={ach.slug}
            className="cursor-pointer w-7 h-7 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"
            title={`${ach.title} — ${ach.description}`}
          >
            <Award className="cursor-pointer w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setShowAchievements(!showAchievements)}
          className="cursor-pointer flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          {showAchievements ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          Conquistas
        </button>
        <button onClick={() => setShowCounters(!showCounters)}
          className="cursor-pointer flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          {showCounters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          Estatísticas
        </button>
      </div>

      {/* Achievements list */}
      {showAchievements && (
        <div className="cursor-pointer mt-3 space-y-1 max-h-60 overflow-y-auto border-t border-gray-100 dark:border-gray-700 pt-3">
          {unlocked.map(ach => (
            <div key={ach.slug} className="cursor-pointer flex items-center gap-2 px-2 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 text-sm">
              <Award className="cursor-pointer w-4 h-4 text-yellow-500 flex-shrink-0" />
              <span className="cursor-pointer flex-1 text-gray-700 dark:text-gray-300">{ach.title}</span>
              <span className="cursor-pointer text-xs text-yellow-600">+{ach.xpReward} XP</span>
            </div>
          ))}
          {locked.slice(0, 5).map(ach => (
            <div key={ach.slug} className="cursor-pointer flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm opacity-50">
              <Award className="cursor-pointer w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              <span className="cursor-pointer flex-1 text-gray-500 dark:text-gray-400">{ach.title}</span>
            </div>
          ))}
          {locked.length > 5 && (
            <p className="cursor-pointer text-xs text-center text-gray-400 py-1">+{locked.length - 5} bloqueadas</p>
          )}
        </div>
      )}

      {/* Counters */}
      {showCounters && (
        <div className="cursor-pointer mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
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
    </div>
  )
}

function CounterRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="cursor-pointer flex justify-between items-center text-xs px-2 py-1 bg-gray-50 dark:bg-gray-700/50 rounded">
      <span className="cursor-pointer text-gray-500 dark:text-gray-400">{label}</span>
      <span className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">{value}</span>
    </div>
  )
}

export default GamificationPanel
