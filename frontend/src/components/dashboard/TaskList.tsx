import React from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, CalendarDays, Check, ArrowUpRight, CircleCheckBig } from 'lucide-react';

export interface TaskRow {
  id: string
  title: string
  category?: string
  tagClass?: string
  due?: string
  completed: boolean
  isDemo?: boolean
}

interface TaskListProps {
  tasks: TaskRow[]
  onToggle: (task: TaskRow) => void
  isDemo?: boolean
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, isDemo }) => {
  const completed = tasks.filter(t => t.completed).length
  const percent = tasks.length === 0 ? 100 : Math.round((completed / tasks.length) * 100)
  const allDone = tasks.length > 0 && completed === tasks.length

  return (
    <section className="sa-card" aria-labelledby="dash-tasks-title">
      <div className="sa-card-head">
        <div>
          <h2 className="sa-card-title" id="dash-tasks-title">
            <span className="sa-glyph is-accent" aria-hidden="true"><ListChecks /></span>
            Tarefas
          </h2>
          <p className="sa-card-sub">Seu progresso de hoje</p>
        </div>
        <Link to="/tasks" className="sa-link-btn">
          Abrir tarefas
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>

      <div className="progress-head">
        <span>{completed} de {tasks.length} concluídas</span>
        <strong>{percent}%</strong>
      </div>

      <div
        className="sa-progress"
        role="progressbar"
        aria-label="Progresso das tarefas"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <span style={{ width: `${percent}%` }} />
      </div>

      {tasks.length === 0 ? (
        <div className="empty-note">
          <CircleCheckBig aria-hidden="true" />
          Nenhuma tarefa pendente. Aproveite para revisar suas metas.
        </div>
      ) : (
        <div className="task-list">
          {tasks.map(task => (
            <div key={task.id} className={`task-row ${task.completed ? 'is-done' : ''}`}>
              <button
                type="button"
                className={`sa-check ${task.completed ? 'is-done' : ''}`}
                aria-pressed={task.completed}
                aria-label={`${task.completed ? 'Reabrir' : 'Concluir'} tarefa ${task.title}`}
                onClick={() => onToggle(task)}
              >
                <Check aria-hidden="true" />
              </button>

              <div className="task-row-main">
                <span className="task-row-title">{task.title}</span>
                <div className="task-row-meta">
                  {task.due && (
                    <>
                      <CalendarDays aria-hidden="true" />
                      <span>{task.due}</span>
                    </>
                  )}
                  {task.category && <span className={`sa-tag ${task.tagClass ?? ''}`}>{task.category}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {allDone && (
        <div className="empty-note">
          <CircleCheckBig aria-hidden="true" />
          Nenhuma tarefa pendente. Aproveite para revisar suas metas.
        </div>
      )}

      {isDemo && (
        <p className="demo-note">
          Exemplos ilustrativos — crie sua primeira tarefa para ver seus dados reais.
        </p>
      )}
    </section>
  )
}

export default TaskList
