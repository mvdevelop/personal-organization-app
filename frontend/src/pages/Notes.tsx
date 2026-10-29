import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchNotes, createNote, deleteNote, type Note, type CreateNoteInput } from '../store/slices/notesSlice';
import NoteCard from '../components/NoteCard';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { StickyNote, Plus, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Notes: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notes, loading, error } = useAppSelector(state => state.notes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSaveNote = async (noteData: CreateNoteInput) => {
    setSaving(true);
    try {
      if (editingNote) {
        // update note
        setIsModalOpen(false);
        setEditingNote(null);
      } else {
        await dispatch(createNote(noteData)).unwrap();
        toast.success('Nota criada!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível criar a nota');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    toast
      .fire({
        title: 'Excluir nota?',
        text: 'Essa ação não pode ser desfeita.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#e53e3e',
        cancelButtonColor: '#363636',
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          dispatch(deleteNote(id)).unwrap();
          toast.success('Nota removida!');
        }
      });
  };

  if (loading && notes.length === 0) {
    return <LoadingSpinner size="lg" text="Carregando notas..." />;
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10 10.586l2.293-2.293a1 1 0 11.414 1.414L11.414 12l2.293 2.293a1 1 0 11-1.414 1.414L10 13.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 12 6.293 9.707a1 1 0 01 1.414-1.414L9.414 10l2.293-2.293z" clipRule="evenodd" />
        </svg>
        <span>{error}</span>
      </div>
    </div>;
  }

  const emptyNote = {
    title: '',
    content: '',
    category: '',
    updatedAt: new Date().toISOString(),
  };

  const notePreview = notes.length > 0 ? notes[0] : emptyNote;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Minhas Notas"
        description="Ideias, referências e pensamentos soltos — guardados para depois."
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
            Nova Nota
          </Button>

          <SearchInput
            placeholder="Buscar notas..."
            onChangeValue={undefined}
            // search logic handled inline
          />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={handleEdit}
            onDelete={() => handleDelete(note.id)}
          />
        ))}
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="Nenhuma nota ainda"
          description="Capture ideias importantes e encontre tudo em um só lugar."
          action={
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              disabled={saving}
            >
              Nova Nota
            </Button>
          }
        />
      ) : null}

      <ConfirmDialog
        isOpen={false}
        title="Excluir Nota"
        message="Tem certeza que deseja excluir esta nota?"
        onConfirm={() => toast.success('Nota removida!')}
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Notes