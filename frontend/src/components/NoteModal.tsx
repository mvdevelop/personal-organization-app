import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Note } from '../store/slices/notesSlice';

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
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-xl w-full max-w-lg shadow-2xl overflow-hidden"
        style={{ backgroundColor: color }}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da nota"
                required
                className={`text-xl font-bold bg-transparent border-none outline-none w-full placeholder:text-gray-400 ${
                  isLightColor(color) ? 'text-gray-900' : 'text-white placeholder:text-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLightColor(color) ? 'hover:bg-black/10 text-gray-500' : 'hover:bg-white/20 text-gray-300'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva sua nota aqui..."
              rows={8}
              className={`w-full bg-transparent border-none outline-none resize-none text-sm placeholder:text-gray-400 ${
                isLightColor(color) ? 'text-gray-700' : 'text-gray-200 placeholder:text-gray-300'
              }`}
            />

            <div>
              <label className={`text-xs font-medium mb-2 block ${
                isLightColor(color) ? 'text-gray-500' : 'text-gray-300'
              }`}>
                Cor da nota
              </label>
              <div className="flex gap-2 flex-wrap">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      color === c
                        ? 'border-blue-500 scale-110'
                        : 'border-gray-300/50 hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={`flex justify-end gap-3 px-5 py-3 ${
            isLightColor(color) ? 'bg-black/5' : 'bg-white/10'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                isLightColor(color)
                  ? 'text-gray-600 hover:bg-black/10'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
            >
              {editingNote ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function isLightColor(hex: string): boolean {
  if (!hex || hex === '#ffffff') return true
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

export default NoteModal
