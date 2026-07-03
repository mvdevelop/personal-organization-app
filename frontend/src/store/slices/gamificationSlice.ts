import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface AchievementItem {
  slug: string
  title: string
  description: string
  icon: string
  category: string
  xpReward: number
  unlocked: boolean
  unlockedAt: string | null
}

interface GamificationState {
  level: number
  currentXp: number
  nextLevelXp: number
  progress: number
  totalXp: number
  achievements: AchievementItem[]
  counters: {
    tasksCreated: number
    tasksCompleted: number
    habitsCreated: number
    goalsCreated: number
    goalsCompleted: number
    studySessions: number
    studyMinutes: number
    notesCreated: number
  }
  loading: boolean
  error: string | null
}

const initialState: GamificationState = {
  level: 1,
  currentXp: 0,
  nextLevelXp: 100,
  progress: 0,
  totalXp: 0,
  achievements: [],
  counters: {
    tasksCreated: 0,
    tasksCompleted: 0,
    habitsCreated: 0,
    goalsCreated: 0,
    goalsCompleted: 0,
    studySessions: 0,
    studyMinutes: 0,
    notesCreated: 0,
  },
  loading: false,
  error: null,
}

export const fetchGamificationStats = createAsyncThunk(
  'gamification/fetchStats',
  async () => {
    return api.get<{
      level: number
      currentXp: number
      nextLevelXp: number
      progress: number
      totalXp: number
      unlockedAchievements: AchievementItem[]
      counters: GamificationState['counters']
    }>('/api/gamification/stats')
  },
)

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchGamificationStats.pending, (s) => { s.loading = true; s.error = null })
    builder.addCase(fetchGamificationStats.fulfilled, (s, a) => {
      s.loading = false
      s.level = a.payload.level
      s.currentXp = a.payload.currentXp
      s.nextLevelXp = a.payload.nextLevelXp
      s.progress = a.payload.progress
      s.totalXp = a.payload.totalXp
      s.achievements = a.payload.unlockedAchievements
      s.counters = a.payload.counters
    })
    builder.addCase(fetchGamificationStats.rejected, (s, a) => {
      s.loading = false
      s.error = a.error.message || 'Erro ao carregar progresso'
    })
  },
})

export default gamificationSlice.reducer
