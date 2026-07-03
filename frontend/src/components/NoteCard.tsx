import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import type { Note } from '../store/slices/notesSlice';

interface NoteCardProps {
  note: Note
  onDelete: (id: string) => void
  onEdit: (note: Note) => void
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onEdit }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden group hover:shadow-md transition-all duration-200 flex flex-col"
      style={{ backgroundColor: note.color || '#ffffff' }}
    >
      <div className="p-4 flex-1 flex flex-col">
        <h3 className={`font-semibold text-base mb-2 line-clamp-1 ${
          isLightColor(note.color) ? 'text-gray-900' : 'text-white'
        }`}>
          {note.title}
        </h3>
        <p className={`text-sm line-clamp-4 flex-1 ${
          isLightColor(note.color) ? 'text-gray-600' : 'text-gray-200'
        }`}>
          {note.content || 'Sem conteúdo'}
        </p>
        <div className={`text-xs mt-3 pt-3 border-t ${
          isLightColor(note.color) ? 'border-gray-200/50 text-gray-400' : 'border-white/20 text-gray-300'
        }`}>
          {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
        </div>
      </div>
      <div className={`flex justify-end gap-1 px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity ${
        isLightColor(note.color) ? 'bg-black/5' : 'bg-white/10'
      }`}>
        <button
          onClick={() => onEdit(note)}
          className={`p-1.5 rounded-lg transition-colors ${
            isLightColor(note.color)
              ? 'hover:bg-gray-200/70 text-gray-500 hover:text-gray-700'
              : 'hover:bg-white/20 text-gray-300 hover:text-white'
          }`}
          title="Editar"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(note.id)}
          className={`p-1.5 rounded-lg transition-colors ${
            isLightColor(note.color)
              ? 'hover:bg-red-100 text-red-400 hover:text-red-600'
              : 'hover:bg-red-500/20 text-red-300 hover:text-red-200'
          }`}
          title="Deletar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
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

export default NoteCard
