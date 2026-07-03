import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Milestone {
  title: string
  completed: boolean
  date: string | null
}

export interface Goal {
  id: string
  title: string
  description: string
  type: 'purchase' | 'travel' | 'learning' | 'health' | 'career' | 'custom'
  targetValue: number | null
  currentValue: number
  deadline: string | null
  domainId: string | null
  status: 'active' | 'completed' | 'cancelled'
  milestones: Milestone[]
  userId: string
  createdAt: string
  updatedAt: string
}

interface GoalsState {
  goals: Goal[]
  loading: boolean
  error: string | null
}

const initialState: GoalsState = {
  goals: [],
  loading: false,
  error: null,
}

export const fetchGoals = createAsyncThunk('goals/fetchGoals', async (params?: { status?: string; type?: string }) => {
  const query = new URLSearchParams()
  if (params?.status) query.set('status', params.status)
  if (params?.type) query.set('type', params.type)
  const qs = query.toString()
  return api.get<Goal[]>(`/api/goals${qs ? `?${qs}` : ''}`)
})

export const createGoal = createAsyncThunk('goals/createGoal', async (data: Partial<Goal>) => {
  return api.post<Goal>('/api/goals', data)
})

export const updateGoal = createAsyncThunk('goals/updateGoal', async ({ id, data }: { id: string; data: Partial<Goal> }) => {
  return api.put<Goal>(`/api/goals/${id}`, data)
})

export const deleteGoal = createAsyncThunk('goals/deleteGoal', async (id: string) => {
  await api.delete(`/api/goals/${id}`)
  return id
})

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchGoals.pending, (s) => { s.loading = true; s.error = null })
    builder.addCase(fetchGoals.fulfilled, (s, a) => { s.loading = false; s.goals = a.payload })
    builder.addCase(fetchGoals.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Erro' })

    builder.addCase(createGoal.fulfilled, (s, a) => { s.goals.unshift(a.payload) })
    builder.addCase(updateGoal.fulfilled, (s, a) => {
      const i = s.goals.findIndex(g => g.id === a.payload.id)
      if (i !== -1) s.goals[i] = a.payload
    })
    builder.addCase(deleteGoal.fulfilled, (s, a) => { s.goals = s.goals.filter(g => g.id !== a.payload) })
  },
})

export default goalsSlice.reducer
