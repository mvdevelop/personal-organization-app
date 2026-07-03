import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  setFilter,
  setSearchQuery,
  clearError,
  type Task,
  type CreateTaskInput,
} from '../store/slices/tasksSlice';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Plus, Search, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Tasks: React.FC = () => {
  const { userId } = useAuth()
  const dispatch = useAppDispatch()
  const { tasks, filter, searchQuery, loading, error } = useAppSelector(state => state.tasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchTasks({ filter, search: searchQuery || undefined }))
  }, [dispatch, filter])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const filteredTasks = searchQuery
    ? tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks

  const handleSaveTask = async (taskData: CreateTaskInput) => {
    setSaving(true)
    try {
      if (editingTask) {
        await dispatch(updateTask({ id: editingTask.id, data: taskData })).unwrap()
        toast.success('Tarefa atualizada!')
      } else {
        await dispatch(createTask(taskData)).unwrap()
        toast.success('Tarefa criada!')
      }
      setIsModalOpen(false)
      setEditingTask(null)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar tarefa')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await dispatch(toggleTask(id)).unwrap()
    } catch {
      toast.error('Erro ao atualizar tarefa')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta tarefa?')) return
    setDeletingId(id)
    try {
      await dispatch(deleteTask(id)).unwrap()
      toast.success('Tarefa removida!')
    } catch {
      toast.error('Erro ao remover tarefa')
    } finally {
      setDeletingId(null)
    }
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
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
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
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'active' ? 'Ativas' : 'Concluídas'}
            </button>
          ))}
        </div>
      </div>

      {loading && tasks.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-500 dark:text-gray-400">Carregando tarefas...</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery
              ? 'Nenhuma tarefa encontrada para essa busca'
              : filter !== 'all'
                ? `Nenhuma tarefa ${filter === 'active' ? 'ativa' : 'concluída'}`
                : 'Nenhuma tarefa ainda. Crie uma!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={(task) => {
                setEditingTask(task)
                setIsModalOpen(true)
              }}
              deleting={deletingId === task.id}
            />
          ))}
          </AnimatePresence>
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
        saving={saving}
      />
    </div>
  )
}

export default Tasks
