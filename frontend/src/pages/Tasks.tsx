import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { ApiClientError } from '../services/api';
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
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, ClipboardList, ListTodo } from 'lucide-react';
import toast from 'react-hot-toast';

const Tasks: React.FC = () => {
  const dispatch = useAppDispatch()
  const { tasks, filter, searchQuery, loading, error } = useAppSelector(state => state.tasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; taskId: string | null }>({ isOpen: false, taskId: null })

  useEffect(() => {
    dispatch(fetchTasks({ filter, search: searchQuery || undefined }))
  }, [dispatch, filter, searchQuery])

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
    } catch (err: unknown) {
      toast.error(err instanceof ApiClientError ? err.message : 'Erro ao salvar tarefa')
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
    setDeletingId(id)
    try {
      await dispatch(deleteTask(id)).unwrap()
      toast.success('Tarefa removida!')
    } catch {
      toast.error('Erro ao remover tarefa')
    } finally {
      setDeletingId(null)
      setDeleteConfirm({ isOpen: false, taskId: null })
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader icon={ClipboardList} title="Minhas Tarefas">
        <Button
          variant="gold"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingTask(null)
            setIsModalOpen(true)
          }}
        >
          Nova Tarefa
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={searchQuery}
          onChange={(v) => dispatch(setSearchQuery(v))}
          placeholder="Buscar tarefas..."
          className="flex-1"
        />
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => dispatch(setFilter(f))}
              className={`cursor-pointer px-4 py-2 rounded font-ui text-sm font-medium transition-colors ${
                filter === f
                  ? 'btn-gold'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'active' ? 'Ativas' : 'Concluídas'}
            </button>
          ))}
        </div>
      </div>

      {loading && tasks.length === 0 ? (
        <LoadingSpinner text="Carregando tarefas..." />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title={searchQuery ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa ainda'}
          description={searchQuery ? 'Tente buscar por outro termo' : filter !== 'all' ? `Nenhuma tarefa ${filter === 'active' ? 'ativa' : 'concluída'}` : 'Crie sua primeira tarefa!'}
          action={
            !searchQuery && filter === 'all' ? (
              <Button variant="gold" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
                Criar Tarefa
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={(id) => setDeleteConfirm({ isOpen: true, taskId: id })}
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

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, taskId: null })}
        onConfirm={() => deleteConfirm.taskId && handleDelete(deleteConfirm.taskId)}
        title="Remover Tarefa"
        message="Tem certeza que deseja deletar esta tarefa? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        variant="danger"
      />
    </div>
  )
}

export default Tasks
