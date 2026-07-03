import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Subject {
  id: string
  name: string
  category: 'faculdade' | 'concurso' | 'curso' | 'personal'
  color: string
  workload: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface StudySession {
  id: string
  subjectId: string
  userId: string
  duration: number
  content: string
  technique: 'pomodoro' | 'revisao' | 'exercicio' | 'leitura' | 'outro'
  date: string
  createdAt: string
  updatedAt: string
}

interface StudiesState {
  subjects: Subject[]
  sessions: StudySession[]
  loading: boolean
  error: string | null
}

const initialState: StudiesState = {
  subjects: [],
  sessions: [],
  loading: false,
  error: null,
}

export const fetchSubjects = createAsyncThunk('studies/fetchSubjects', async () => {
  return api.get<Subject[]>('/api/subjects')
})

export const createSubject = createAsyncThunk('studies/createSubject', async (data: Partial<Subject>) => {
  return api.post<Subject>('/api/subjects', data)
})

export const updateSubject = createAsyncThunk('studies/updateSubject', async ({ id, data }: { id: string; data: Partial<Subject> }) => {
  return api.put<Subject>(`/api/subjects/${id}`, data)
})

export const deleteSubject = createAsyncThunk('studies/deleteSubject', async (id: string) => {
  await api.delete(`/api/subjects/${id}`)
  return id
})

export const fetchSessions = createAsyncThunk('studies/fetchSessions', async (params?: { start?: string; end?: string }) => {
  const query = new URLSearchParams()
  if (params?.start) query.set('start', params.start)
  if (params?.end) query.set('end', params.end)
  const qs = query.toString()
  return api.get<StudySession[]>(`/api/study-sessions${qs ? `?${qs}` : ''}`)
})

export const createSession = createAsyncThunk('studies/createSession', async (data: Partial<StudySession>) => {
  return api.post<StudySession>('/api/study-sessions', data)
})

export const deleteSession = createAsyncThunk('studies/deleteSession', async (id: string) => {
  await api.delete(`/api/study-sessions/${id}`)
  return id
})

const studiesSlice = createSlice({
  name: 'studies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSubjects.pending, (s) => { s.loading = true; s.error = null })
    builder.addCase(fetchSubjects.fulfilled, (s, a) => { s.loading = false; s.subjects = a.payload })
    builder.addCase(fetchSubjects.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Erro' })

    builder.addCase(createSubject.fulfilled, (s, a) => { s.subjects.push(a.payload) })
    builder.addCase(updateSubject.fulfilled, (s, a) => {
      const i = s.subjects.findIndex(sub => sub.id === a.payload.id)
      if (i !== -1) s.subjects[i] = a.payload
    })
    builder.addCase(deleteSubject.fulfilled, (s, a) => { s.subjects = s.subjects.filter(sub => sub.id !== a.payload) })

    builder.addCase(fetchSessions.fulfilled, (s, a) => { s.sessions = a.payload })
    builder.addCase(createSession.fulfilled, (s, a) => { s.sessions.unshift(a.payload) })
    builder.addCase(deleteSession.fulfilled, (s, a) => { s.sessions = s.sessions.filter(se => se.id !== a.payload) })
  },
})

export default studiesSlice.reducer
