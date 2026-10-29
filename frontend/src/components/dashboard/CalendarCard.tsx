import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { WEEKDAY_LABELS } from '../../data/dashboardDemo';

const MONTH_FORMAT = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
const SELECTED_FORMAT = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long', day: '2-digit', month: 'long',
})

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

interface CalendarCardProps {
  today?: Date
}

const CalendarCard: React.FC<CalendarCardProps> = ({ today = new Date() }) => {
  const todayDate = useMemo(() => startOfDay(today), [today])
  const [monthCursor, setMonthCursor] = useState(() => new Date(todayDate.getFullYear(), todayDate.getMonth(), 1))
  const [selected, setSelected] = useState(todayDate)

  const cells = useMemo(() => {
    const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1)
    const offset = first.getDay()
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
    const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7
    const start = new Date(first)
    start.setDate(start.getDate() - offset)

    return Array.from({ length: totalCells }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return {
        date,
        outside: date.getMonth() !== first.getMonth(),
        isToday: date.getTime() === todayDate.getTime(),
        isSelected: date.getTime() === selected.getTime(),
      }
    })
  }, [monthCursor, selected, todayDate])

  const changeMonth = (delta: number) => {
    setMonthCursor(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  const monthLabel = MONTH_FORMAT.format(monthCursor)
  const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  return (
    <section className="sa-card" aria-labelledby="dash-calendar-title">
      <div className="sa-card-head">
        <div>
          <h2 className="sa-card-title" id="dash-calendar-title">
            <span className="sa-glyph is-blue" aria-hidden="true"><CalendarDays /></span>
            Calendário
          </h2>
          <p className="sa-card-sub">Uma visão simples dos seus dias</p>
        </div>
      </div>

      <div className="cal-head">
        <span className="cal-month">{capitalizedMonth}</span>
        <div className="cal-nav">
          <button
            type="button"
            className="sa-icon-btn"
            onClick={() => changeMonth(-1)}
            aria-label="Mês anterior"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className="sa-icon-btn"
            onClick={() => changeMonth(1)}
            aria-label="Próximo mês"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="cal-grid" role="grid" aria-label={`Calendário de ${monthLabel}`}>
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={`${label}-${index}`}
            role="columnheader"
            className="cal-dow"
            aria-label={['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'][index]}
          >
            {label}
          </div>
        ))}

        {cells.map(cell => {
          const classes = [
            'cal-day',
            cell.outside ? 'is-outside' : '',
            cell.isToday ? 'is-today' : '',
            cell.isSelected ? 'is-selected' : '',
          ].filter(Boolean).join(' ')

          return (
            <button
              key={cell.date.toISOString()}
              type="button"
              role="gridcell"
              className={classes}
              aria-current={cell.isToday ? 'date' : undefined}
              aria-selected={cell.isSelected}
              aria-label={cell.date.toLocaleDateString('pt-BR', { dateStyle: 'full' })}
              onClick={() => {
                setSelected(startOfDay(cell.date))
                if (cell.outside) {
                  setMonthCursor(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1))
                }
              }}
            >
              {cell.date.getDate()}
            </button>
          )
        })}
      </div>

      <div className="cal-foot">
        <CalendarDays aria-hidden="true" />
        <span>Selecionado: <strong>{SELECTED_FORMAT.format(selected)}</strong></span>
      </div>
    </section>
  )
}

export default CalendarCard
