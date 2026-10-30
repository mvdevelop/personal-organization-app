import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchTasks, createTask, updateTask, deleteTask, toggleTask, setFilter, clearError, type Task, type CreateTaskInput, type UpdateTaskInput } from '../store/slices/tasksSlice';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

const Tasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, filter, searchQuery, loading, error } = useAppSelector(state => state.tasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; taskId: string | null }>({ isOpen: false, taskId: null });

  useEffect(() => {
    dispatch(fetchTasks({ filter, search: searchQuery || undefined }));
  }, [dispatch, filter, searchQuery]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const searchMatches = searchQuery.toLowerCase().trim();
      if (searchMatches) {
        const titleMatch = task.title.toLowerCase().includes(searchMatches);
        const descriptionMatch = task.description?.toLowerCase().includes(searchMatches) || false;
        if (!titleMatch && !descriptionMatch) return false;
      }

      switch (filter) {
        case 'active':
          return !task.completed;
        case 'completed':
          return task.completed;
        default:
          return true;
      }
    });
  }, [tasks, searchQuery, filter]);

  const handleSaveTask = async (taskData: CreateTaskInput) => {
    setSaving(true);
    try {
      if (editingTask) {
        await dispatch(updateTask({ id: editingTask.id, data: taskData as UpdateTaskInput })).unwrap();
        toast.success('Tarefa atualizada!');
      } else {
        await dispatch(createTask(taskData)).unwrap();
        toast.success('Tarefa criada!');
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível salvar a tarefa');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    setSaving(true);
    try {
      await dispatch(toggleTask(taskId)).unwrap();
      toast.success('Tarefa concluída!');
    } catch {
      toast.error('Não foi possível atualizar a tarefa');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = (taskId: string) => {
    setDeletingId(taskId);
    setDeleteConfirm({ isOpen: true, taskId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.taskId) return;

    setSaving(true);
    try {
      await dispatch(deleteTask(deleteConfirm.taskId)).unwrap();
      toast.success('Tarefa removida!');
    } catch {
      toast.error('Não foi possível remover a tarefa');
    } finally {
      setSaving(false);
      setDeleteConfirm({ isOpen: false, taskId: null });
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, taskId: null });
    setDeletingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Minhas Tarefas"
        subtitle="Organize o que você precisa mover hoje, em um só lugar."
        className="mb-6"
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </Button>

          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => dispatch(setFilter('all'))}
              disabled={saving}
            >
              Todas
            </Button>
            <Button
              variant={filter === 'active' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => dispatch(setFilter('active'))}
              disabled={saving}
            >
              Ativas
            </Button>
            <Button
              variant={filter === 'completed' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => dispatch(setFilter('completed'))}
              disabled={saving}
            >
              Concluídas
            </Button>
          </div>
        </div>
      </PageHeader>

      {loading && tasks.length === 0 ? (
        <LoadingSpinner size="lg" text="Carregando tarefas..." />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10 10.586l2.293-2.293a1 1 0 11.414 1.414L11.414 12l2.293 2.293a1 1 0 01-1.414 1.414L10 13.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 12 6.293 9.707a1 1 0 01 1.414-1.414L9.414 10l2.293-2.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma tarefa encontrada"
          description={
            searchQuery || filter !== 'all'
              ? 'Tente ajustar seus filtros de busca ou filtro.'
              : 'Comece adicionando sua primeira tarefa.'
          }
          action={
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              disabled={saving}
            >
              Nova Tarefa
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggleTask}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deleting={deletingId === task.id}
            />
          ))}
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
        saving={saving}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={cancelDelete}
        title="Excluir Tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Tasks
