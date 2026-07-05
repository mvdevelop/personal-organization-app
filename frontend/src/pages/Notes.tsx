import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  clearError,
  type Note,
} from '../store/slices/notesSlice';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import { Plus, Search, FileText, Loader2 } from 'lucide-react';
import { ApiClientError } from '../services/api';
import toast from 'react-hot-toast';

const Notes: React.FC = () => {
  const dispatch = useAppDispatch()
  const { notes, loading, error } = useAppSelector(state => state.notes)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(fetchNotes())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const filteredNotes = searchQuery
    ? notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes

  const handleSave = async (data: { title: string; content: string; color: string }) => {
    try {
      if (editingNote) {
        await dispatch(updateNote({ id: editingNote.id, data })).unwrap()
        toast.success('Nota atualizada!')
      } else {
        await dispatch(createNote(data)).unwrap()
        toast.success('Nota criada!')
      }
      setIsModalOpen(false)
      setEditingNote(null)
    } catch (err: unknown) {
      toast.error(err instanceof ApiClientError ? err.message : 'Erro ao salvar nota')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta nota?')) return
    try {
      await dispatch(deleteNote(id)).unwrap()
      toast.success('Nota removida!')
    } catch {
      toast.error('Erro ao remover nota')
    }
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minhas Notas</h1>
        <button
          onClick={() => {
            setEditingNote(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Nota
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar notas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {loading && notes.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-500 dark:text-gray-400">Carregando notas...</span>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-lg text-gray-500 dark:text-gray-400">
            {searchQuery
              ? 'Nenhuma nota encontrada para essa busca'
              : 'Nenhuma nota ainda. Crie uma!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
          {filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
          </AnimatePresence>
        </div>
      )}

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingNote(null)
        }}
        onSave={handleSave}
        editingNote={editingNote}
      />
    </div>
  )
}

export default Notes
