import React, { useState, useEffect } from 'react';
import { isLightColor } from '../utils/color';
import type { Note } from '../store/slices/notesSlice';
import Modal from './ui/Modal';
import Button from './ui/Button';

const NOTE_COLORS = [
  '#ffffff',
  '#fef3c7',
  '#dbeafe',
  '#fce7f3',
  '#d1fae5',
  '#ede9fe',
  '#ffedd5',
  '#ccfbf1',
  '#e0e7ff',
  '#fae8ff',
]

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { title: string; content: string; color: string }) => void
  editingNote?: Note | null
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, onSave, editingNote }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [color, setColor] = useState('#ffffff')

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title)
      setContent(editingNote.content)
      setColor(editingNote.color || '#ffffff')
    } else {
      setTitle('')
      setContent('')
      setColor('#ffffff')
    }
  }, [editingNote, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ title, content, color })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingNote ? 'Editar Nota' : 'Nova Nota'}>
      <form onSubmit={handleSubmit}>
        <div className="p-5 space-y-4" style={{ backgroundColor: color }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da nota"
            required
            className={`font-display text-xl font-bold bg-transparent border-none outline-none w-full placeholder:text-gray-400 ${
              isLightColor(color) ? 'text-gray-900' : 'text-white'
            }`}
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva sua nota aqui..."
            rows={8}
            className={`w-full bg-transparent border-none outline-none resize-none font-body text-sm placeholder:text-gray-400 ${
              isLightColor(color) ? 'text-gray-700' : 'text-gray-200'
            }`}
          />

          <div>
            <label className={`label-retro block mb-2 ${isLightColor(color) ? 'text-gray-500' : 'text-gray-300'}`}>
              Cor da nota
            </label>
            <div className="flex gap-2 flex-wrap">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`cursor-pointer w-7 h-7 rounded-full border-2 transition-all ${
                    color === c
                      ? 'border-primary scale-110 shadow-warm-sm'
                      : 'border-gray-300/50 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={`flex justify-end gap-3 px-5 py-3 ${isLightColor(color) ? 'bg-black/5' : 'bg-white/10'}`}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="gold" type="submit">{editingNote ? 'Atualizar' : 'Criar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default NoteModal
