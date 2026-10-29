import React from 'react';
import { Link } from 'react-router-dom';
import { Flag, ArrowUpRight, Laptop, Music, Monitor, Sparkles, CircleDashed } from 'lucide-react';

export interface GoalRow {
  title: string
  icon: 'laptop' | 'music' | 'monitor' | 'sparkles'
  percent: number
}

const ICONS = {
  laptop: Laptop,
  music: Music,
  monitor: Monitor,
  sparkles: Sparkles,
} as const

interface GoalsCardProps {
  goals: GoalRow[]
  active: number
  completed: number
  isDemo?: boolean
}

const GoalsCard: React.FC<GoalsCardProps> = ({ goals, active, completed, isDemo }) => (
  <section className="sa-card" aria-labelledby="dash-goals-title">
    <div className="sa-card-head">
      <div>
        <h2 className="sa-card-title" id="dash-goals-title">
          <span className="sa-glyph is-pink" aria-hidden="true"><Flag /></span>
          Metas
        </h2>
        <p className="sa-card-sub">{active} ativas · {completed} concluídas</p>
      </div>
      <Link to="/goals" className="sa-link-btn">
        Ver todas
        <ArrowUpRight aria-hidden="true" />
      </Link>
    </div>

    {goals.length === 0 ? (
      <div className="empty-note">
        <CircleDashed aria-hidden="true" />
        Nenhuma meta ativa. Defina um destino para começar.
      </div>
    ) : (
      goals.map(goal => {
        const Icon = ICONS[goal.icon] ?? Sparkles
        const percent = Math.round(Math.max(0, Math.min(100, goal.percent)))
        return (
          <div className="goal-row" key={goal.title}>
            <div className="goal-head">
              <span className="goal-emoji" aria-hidden="true"><Icon /></span>
              <span className="goal-title">{goal.title}</span>
              <span className="goal-pct">{percent}%</span>
            </div>
            <div
              className="sa-progress is-pink"
              role="progressbar"
              aria-label={`Progresso da meta ${goal.title}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <span style={{ width: `${percent}%` }} />
            </div>
          </div>
        )
      })
    )}

    {isDemo && (
      <p className="demo-note">Exemplos ilustrativos — suas metas aparecem aqui.</p>
    )}
  </section>
)

export default GoalsCard
