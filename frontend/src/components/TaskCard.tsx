
import React from 'react';
import { Check, Trash2, Edit2 } from 'lucide-react';
import type { Task } from '../store/slices/tasksSlice';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          {task.completed && <Check className="w-3 h-3 text-white" />}
        </button>
        
        <div className="flex-1">
          <h3 className={`font-medium text-gray-900 dark:text-white ${
            task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
          }`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
              {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}
            </span>
            {task.dueDate && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Vence em: {format(new Date(task.dueDate), "dd 'de' MMMM", { locale: ptBR })}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskCard;
