import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Task } from './tasksSlice';
import type { Goal } from './goalsSlice';

interface DashboardData {
  tasks: {
    total: number
    pending: number
    completed: number
    today: number
    overdue: number
    recent: Pick<Task, 'id' | 'title' | 'completed' | 'priority'> & { dueDate: string | null }[]
  }
  habits: {
    total: number
    todayCheckIns: number
    bestStreak: number
    streaks: { title: string; streak: number; color: string }[]
  }
  goals: {
    active: number
    completed: number
    recent: Pick<Goal, 'id' | 'title' | 'type' | 'targetValue' | 'currentValue'> & { deadline: string | null }[]
  }
  studies: {
    subjects: number
    weekSessions: number
    weekStudyHours: number
  }
  notes: {
    total: number
    recent: { id: string; title: string; updatedAt: string }[]
  }
}

interface DashboardState {
  data: DashboardData | null
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
}

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetch',
  async () => api.get<DashboardData>('/api/dashboard'),
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDashboard.pending, (s) => { s.loading = true; s.error = null })
    builder.addCase(fetchDashboard.fulfilled, (s, a) => { s.loading = false; s.data = a.payload })
    builder.addCase(fetchDashboard.rejected, (s, a) => {
      s.loading = false
      s.error = a.error.message || 'Erro ao carregar dashboard'
    })
  },
})

export default dashboardSlice.reducer
