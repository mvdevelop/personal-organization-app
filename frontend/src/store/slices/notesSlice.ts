import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Note {
  id: string
  title: string
  content: string
  color: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateNoteInput {
  title: string
  content?: string
  color?: string
}

export interface UpdateNoteInput {
  title?: string
  content?: string
  color?: string
}

interface NotesState {
  notes: Note[]
  loading: boolean
  error: string | null
}

const initialState: NotesState = {
  notes: [],
  loading: false,
  error: null,
}

export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async () => {
    return api.get<Note[]>('/api/notes')
  },
)

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (data: CreateNoteInput) => {
    return api.post<Note>('/api/notes', data)
  },
)

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, data }: { id: string; data: UpdateNoteInput }) => {
    return api.put<Note>(`/api/notes/${id}`, data)
  },
)

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id: string) => {
    await api.delete(`/api/notes/${id}`)
    return id
  },
)

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotes.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchNotes.fulfilled, (state, action) => {
      state.loading = false
      state.notes = action.payload
    })
    builder.addCase(fetchNotes.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Erro ao carregar notas'
    })

    builder.addCase(createNote.fulfilled, (state, action) => {
      state.notes.unshift(action.payload)
    })
    builder.addCase(createNote.rejected, (state, action) => {
      state.error = action.error.message || 'Erro ao criar nota'
    })

    builder.addCase(updateNote.fulfilled, (state, action) => {
      const index = state.notes.findIndex((n) => n.id === action.payload.id)
      if (index !== -1) {
        state.notes[index] = action.payload
      }
    })
    builder.addCase(updateNote.rejected, (state, action) => {
      state.error = action.error.message || 'Erro ao atualizar nota'
    })

    builder.addCase(deleteNote.fulfilled, (state, action) => {
      state.notes = state.notes.filter((n) => n.id !== action.payload)
    })
    builder.addCase(deleteNote.rejected, (state, action) => {
      state.error = action.error.message || 'Erro ao deletar nota'
    })
  },
})

export const { clearError } = notesSlice.actions
export default notesSlice.reducer
