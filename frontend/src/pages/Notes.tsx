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
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, StickyNote, FileText } from 'lucide-react';
import { ApiClientError } from '../services/api';
import toast from 'react-hot-toast';

const Notes: React.FC = () => {
  const dispatch = useAppDispatch()
  const { notes, loading, error } = useAppSelector(state => state.notes)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; noteId: string | null }>({ isOpen: false, noteId: null })

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
    try {
      await dispatch(deleteNote(id)).unwrap()
      toast.success('Nota removida!')
    } catch {
      toast.error('Erro ao remover nota')
    } finally {
      setDeleteConfirm({ isOpen: false, noteId: null })
    }
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader icon={StickyNote} title="Minhas Notas">
        <Button
          variant="gold"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingNote(null)
            setIsModalOpen(true)
          }}
        >
          Nova Nota
        </Button>
      </PageHeader>

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Buscar notas..."
        className="mb-6"
      />

      {loading && notes.length === 0 ? (
        <LoadingSpinner text="Carregando notas..." />
      ) : filteredNotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={searchQuery ? 'Nenhuma nota encontrada' : 'Nenhuma nota ainda'}
          description={searchQuery ? 'Tente buscar por outro termo' : 'Crie sua primeira nota!'}
          action={
            !searchQuery ? (
              <Button variant="gold" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
                Criar Nota
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={(id) => setDeleteConfirm({ isOpen: true, noteId: id })}
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

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, noteId: null })}
        onConfirm={() => deleteConfirm.noteId && handleDelete(deleteConfirm.noteId)}
        title="Remover Nota"
        message="Tem certeza que deseja deletar esta nota? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        variant="danger"
      />
    </div>
  )
}

export default Notes
