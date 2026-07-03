import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Habit {
  id: string
  title: string
  description: string
  frequency: 'daily' | 'weekly'
  daysOfWeek: number[]
  domainId: string | null
  color: string
  reminderTime: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface HabitLog {
  id: string
  habitId: string
  userId: string
  date: string
  completed: boolean
  note: string
}

export interface HabitStreak {
  habitId: string
  title: string
  streak: number
}

interface HabitsState {
  habits: Habit[]
  logs: HabitLog[]
  streaks: HabitStreak[]
  loading: boolean
  error: string | null
}

const initialState: HabitsState = {
  habits: [],
  logs: [],
  streaks: [],
  loading: false,
  error: null,
}

export const fetchHabits = createAsyncThunk('habits/fetchHabits', async () => {
  return api.get<Habit[]>('/api/habits')
})

export const createHabit = createAsyncThunk('habits/createHabit', async (data: Partial<Habit>) => {
  return api.post<Habit>('/api/habits', data)
})

export const updateHabit = createAsyncThunk('habits/updateHabit', async ({ id, data }: { id: string; data: Partial<Habit> }) => {
  return api.put<Habit>(`/api/habits/${id}`, data)
})

export const deleteHabit = createAsyncThunk('habits/deleteHabit', async (id: string) => {
  await api.delete(`/api/habits/${id}`)
  return id
})

export const fetchLogs = createAsyncThunk('habits/fetchLogs', async (params?: { start?: string; end?: string }) => {
  const query = new URLSearchParams()
  if (params?.start) query.set('start', params.start)
  if (params?.end) query.set('end', params.end)
  const qs = query.toString()
  return api.get<HabitLog[]>(`/api/habits/logs${qs ? `?${qs}` : ''}`)
})

export const createLog = createAsyncThunk('habits/createLog', async (data: { habitId: string; date: string; completed?: boolean }) => {
  return api.post<HabitLog>('/api/habits/logs', data)
})

export const fetchStreaks = createAsyncThunk('habits/fetchStreaks', async () => {
  return api.get<HabitStreak[]>('/api/habits/streaks')
})

const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchHabits.pending, (s) => { s.loading = true; s.error = null })
    builder.addCase(fetchHabits.fulfilled, (s, a) => { s.loading = false; s.habits = a.payload })
    builder.addCase(fetchHabits.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Erro' })

    builder.addCase(createHabit.fulfilled, (s, a) => { s.habits.unshift(a.payload) })
    builder.addCase(updateHabit.fulfilled, (s, a) => {
      const i = s.habits.findIndex(h => h.id === a.payload.id)
      if (i !== -1) s.habits[i] = a.payload
    })
    builder.addCase(deleteHabit.fulfilled, (s, a) => { s.habits = s.habits.filter(h => h.id !== a.payload) })

    builder.addCase(fetchLogs.fulfilled, (s, a) => { s.logs = a.payload })
    builder.addCase(createLog.fulfilled, (s, a) => {
      const i = s.logs.findIndex(l => l.habitId === a.payload.habitId && l.date === a.payload.date)
      if (i !== -1) s.logs[i] = a.payload
      else s.logs.unshift(a.payload)
    })
    builder.addCase(fetchStreaks.fulfilled, (s, a) => { s.streaks = a.payload })
  },
})

export default habitsSlice.reducer
