
import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { addTask, toggleTask, deleteTask, setFilter, setSearchQuery, type Task } from '../store/slices/tasksSlice';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Plus, Search, Filter } from 'lucide-react';

const Tasks: React.FC = () => {
  const { userId } = useAuth()
  const dispatch = useAppDispatch()
  const { tasks, filter, searchQuery } = useAppSelector(state => state.tasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const filteredTasks = tasks
    .filter(task => task.userId === userId)
    .filter(task => {
      if (filter === 'active') return !task.completed
      if (filter === 'completed') return task.completed
      return true
    })
    .filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>) => {
    if (editingTask) {
      // Update task logic here
      setEditingTask(null)
    } else {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        userId: userId!,
      }
      dispatch(addTask(newTask))
    }
    setIsModalOpen(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minhas Tarefas</h1>
        <button
          onClick={() => {
            setEditingTask(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => dispatch(setFilter(f))}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'active' ? 'Ativas' : 'Concluídas'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={(id) => dispatch(toggleTask(id))}
            onDelete={(id) => dispatch(deleteTask(id))}
            onEdit={(task) => {
              setEditingTask(task)
              setIsModalOpen(true)
            }}
          />
        ))}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Nenhuma tarefa encontrada
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />
    </div>
  )
}

export default Tasks;
