import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import { isLightColor } from '../utils/color';
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
      className="relative rounded shadow-warm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden group hover:shadow-warm-md transition-all flex flex-col"
      style={{ backgroundColor: note.color || '#ffffff' }}
    >
      {/* Arch decoration */}
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background: isLightColor(note.color)
            ? 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        }}
      />

      <div className="p-4 flex-1 flex flex-col">
        <h3 className={`font-display font-semibold text-base mb-2 line-clamp-1 ${
          isLightColor(note.color) ? 'text-gray-900' : 'text-white'
        }`}>
          {note.title}
        </h3>
        <p className={`font-body text-sm line-clamp-4 flex-1 ${
          isLightColor(note.color) ? 'text-gray-600' : 'text-gray-200'
        }`}>
          {note.content || 'Sem conteúdo'}
        </p>
        <div className={`font-mono text-xs mt-3 pt-3 border-t ${
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
          className={`cursor-pointer p-1.5 rounded transition-colors ${
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
          className={`cursor-pointer p-1.5 rounded transition-colors ${
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

export default NoteCard
