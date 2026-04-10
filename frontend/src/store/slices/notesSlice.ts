
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Note {
  id: string
  title: string
  content: string
  color: string
  createdAt: string
  updatedAt: string
  userId: string
}

interface NotesState {
  notes: Note[]
}

const initialState: NotesState = {
  notes: [],
}

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote: (state, action: PayloadAction<Note>) => {
      state.notes.push(action.payload)
    },
    updateNote: (state, action: PayloadAction<Note>) => {
      const index = state.notes.findIndex(note => note.id === action.payload.id)
      if (index !== -1) {
        state.notes[index] = action.payload
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter(note => note.id !== action.payload)
    },
  },
})

export const { addNote, updateNote, deleteNote } = notesSlice.actions
export default notesSlice.reducer
