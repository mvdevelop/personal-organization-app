import React from 'react';
import toast from 'react-hot-toast';
import {
  Trophy, Award, ListChecks, Repeat2, BookOpen, NotebookPen, Lock,
} from 'lucide-react';

const TIER_LABELS = [
  '', 'Iniciante', 'Aprendiz', 'Dedicado', 'Focado', 'Persistente',
  'Determinado', 'Disciplinado', 'Mestre', 'Lendário', 'Supremo',
]

interface AchievementView {
  key: string
  label: string
  description: string
  icon: React.ElementType
  unlocked: boolean
}

interface GamificationCardProps {
  level: number
  currentXp: number
  nextLevelXp: number
  progress: number
  tasksCompleted: number
  habitsCreated: number
  studySessions: number
  notesCreated: number
  unlockedAchievements: string[]
  totalAchievements: number
}

const GamificationCard: React.FC<GamificationCardProps> = ({
  level, currentXp, nextLevelXp, progress,
  tasksCompleted, habitsCreated, studySessions, notesCreated,
  unlockedAchievements, totalAchievements,
}) => {
  const tier = TIER_LABELS[level] ?? 'Lendário'
  const xpPercent = Math.max(0, Math.min(100, Math.round(progress)))

  const catalog: AchievementView[] = [
    {
      key: 'first-task',
      label: 'Primeira tarefa',
      description: 'Conclua sua primeira tarefa',
      icon: ListChecks,
      unlocked: tasksCompleted > 0,
    },
    {
      key: 'focus',
      label: 'Foco',
      description: 'Conclua 10 tarefas',
      icon: Award,
      unlocked: tasksCompleted >= 10,
    },
    {
      key: 'consistency',
      label: 'Consistência',
      description: 'Crie e mantenha um hábito',
      icon: Repeat2,
      unlocked: habitsCreated > 0,
    },
    {
      key: 'learning',
      label: 'Aprendizado',
      description: 'Registre uma sessão de estudo',
      icon: BookOpen,
      unlocked: studySessions > 0,
    },
    {
      key: 'organization',
      label: 'Organização',
      description: 'Crie uma nota',
      icon: NotebookPen,
      unlocked: notesCreated > 0,
    },
  ]

  // Unlock when either the API reports it or the counters prove it.
  const achievements = catalog.map(a => ({
    ...a,
    unlocked: a.unlocked || unlockedAchievements.includes(a.key),
  }))

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <section className="sa-card" aria-labelledby="dash-gamification-title">
      <div className="sa-card-head">
        <div>
          <h2 className="sa-card-title" id="dash-gamification-title">
            <span className="sa-glyph is-warning" aria-hidden="true"><Trophy /></span>
            Nível — {tier}
          </h2>
          <p className="sa-card-sub">Continue construindo sua consistência</p>
        </div>
        <button
          type="button"
          className="sa-link-btn"
          onClick={() => toast('As conquistas completas ganham uma página dedicada em breve.', { icon: '🏆' })}
        >
          Ver todas
        </button>
      </div>

      <div className="gam-xp">
        <span><strong>{currentXp}</strong> XP de {nextLevelXp} XP</span>
        <span>{xpPercent}%</span>
      </div>

      <div
        className="sa-progress is-warning"
        role="progressbar"
        aria-label="Progresso de XP"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={xpPercent}
      >
        <span style={{ width: `${xpPercent}%` }} />
      </div>

      <div className="gam-achievements-head">
        <span>Conquistas</span>
      </div>

      <div className="achievements">
        {achievements.map(({ key, label, description, icon: Icon, unlocked }) => (
          <div
            key={key}
            className={`achievement ${unlocked ? 'is-unlocked' : 'is-locked'}`}
            title={`${label} — ${description}`}
          >
            {unlocked ? <Icon aria-hidden="true" /> : <Lock aria-hidden="true" />}
            <span className="achievement-label">{label}</span>
          </div>
        ))}
      </div>

      <p className="gam-foot">
        {unlockedCount}/{totalAchievements || achievements.length} conquistas · {tasksCompleted} tarefas concluídas
      </p>
    </section>
  )
}

export default GamificationCard
