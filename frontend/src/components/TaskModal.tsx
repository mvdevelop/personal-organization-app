import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Task } from '../store/slices/tasksSlice';
import Modal from './ui/Modal';
import Button from './ui/Button';

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: { title: string; description?: string; priority?: 'low' | 'medium' | 'high'; dueDate?: string | null }) => void
  editingTask?: Task | null
  saving?: boolean
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, editingTask, saving }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description)
      setPriority(editingTask.priority)
      setDueDate(editingTask.dueDate || '')
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
    }
  }, [editingTask, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      description,
      priority,
      dueDate: dueDate || null,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="label-retro mb-1.5 block">Título *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input-retro w-full px-3 py-2"
            placeholder="O que precisa ser feito?"
          />
        </div>

        <div>
          <label className="label-retro mb-1.5 block">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input-retro w-full px-3 py-2 resize-none"
            placeholder="Detalhes opcionais..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-retro mb-1.5 block">Prioridade</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="select-retro w-full px-3 py-2"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <div>
            <label className="label-retro mb-1.5 block">Data de Vencimento</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-retro w-full px-3 py-2"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button variant="gold" type="submit" disabled={saving} className="flex-1">
            {saving ? 'Salvando...' : editingTask ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default TaskModal
