import React from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, Edit2 } from 'lucide-react';
import type { Task } from '../store/slices/tasksSlice';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  deleting?: boolean
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit, deleting }) => {
  const priorityBadge = {
    low: 'border-green-300 text-green-600 dark:border-green-700 dark:text-green-400',
    medium: 'border-yellow-300 text-yellow-600 dark:border-yellow-700 dark:text-yellow-400',
    high: 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white dark:bg-gray-800 rounded shadow-warm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-warm-md transition-all"
    >
      {/* Priority side bar */}
      <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-colors ${
        task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
      }`} />

      <div className="flex items-start gap-3 pl-3">
        {/* Custom checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer ${
            task.completed
              ? 'bg-primary border-primary'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary'
          }`}
        >
          {task.completed && (
            <Check className="w-3 h-3 text-white animate-bounce-in" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-gray-900 dark:text-white ${
            task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
          }`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="font-body text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className={`font-ui text-[11px] px-2 py-0.5 border rounded ${priorityBadge[task.priority]}`}>
              {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}
            </span>
            {task.dueDate && (
              <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
                {format(new Date(task.dueDate), "dd 'de' MMM", { locale: ptBR })}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
          <button
            onClick={() => onEdit(task)}
            className="cursor-pointer p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            disabled={deleting}
            className={`cursor-pointer p-1.5 rounded transition-colors ${deleting ? 'opacity-50' : 'hover:bg-red-50 dark:hover:bg-red-900/20'}`}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default TaskCard
