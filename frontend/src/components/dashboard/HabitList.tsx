import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Check, ArrowUpRight, CircleDashed } from 'lucide-react';

export interface HabitRow {
  id: string
  title: string
  description: string
  color: string
  streak: number
  checkedToday: boolean
  isDemo?: boolean
}

interface HabitListProps {
  habits: HabitRow[]
  bestStreak: number
  onToggle: (habit: HabitRow) => void
  isDemo?: boolean
}

const HabitList: React.FC<HabitListProps> = ({ habits, bestStreak, onToggle, isDemo }) => {
  const checkIns = habits.filter(h => h.checkedToday).length

  return (
    <section className="sa-card" aria-labelledby="dash-habits-title">
      <div className="sa-card-head">
        <div>
          <h2 className="sa-card-title" id="dash-habits-title">
            <span className="sa-glyph is-warning" aria-hidden="true"><Flame /></span>
            Hábitos
          </h2>
          <p className="sa-card-sub">Pequenas ações, grandes mudanças</p>
        </div>
        <Link to="/habits" className="sa-link-btn">
          Abrir hábitos
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>

      <div className="habit-stats">
        <div className="habit-stat">
          <div className="habit-stat-value">
            {checkIns} <small>/ {habits.length} hábitos</small>
          </div>
          <div className="habit-stat-label">Check-ins hoje</div>
        </div>
        <div className="habit-stat">
          <div className="habit-stat-value">
            {bestStreak} <small>dias</small>
          </div>
          <div className="habit-stat-label">Maior sequência</div>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="empty-note">
          <CircleDashed aria-hidden="true" />
          Nenhum hábito ainda. Crie um pequeno hábito para começar.
        </div>
      ) : (
        habits.map(habit => (
          <div key={habit.id} className="habit-row">
            <button
              type="button"
              className={`sa-check is-habit ${habit.checkedToday ? 'is-done' : ''}`}
              aria-pressed={habit.checkedToday}
              aria-label={`Check-in de ${habit.title} hoje`}
              onClick={() => onToggle(habit)}
            >
              <Check aria-hidden="true" />
            </button>

            <span className="habit-dot" style={{ background: habit.color }} aria-hidden="true" />

            <div className="habit-row-main">
              <span className="habit-row-title">{habit.title}</span>
              <span className="habit-row-sub">{habit.description}</span>
            </div>

            <span className="habit-streak">
              <Flame aria-hidden="true" />
              {habit.streak} d
            </span>
          </div>
        ))
      )}

      {isDemo && (
        <p className="demo-note">
          Exemplos ilustrativos — crie seu primeiro hábito para ver seus dados reais.
        </p>
      )}
    </section>
  )
}

export default HabitList
