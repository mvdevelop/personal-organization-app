import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export type AIActionType = 'create_task' | 'create_habit' | 'create_note' | 'create_goal' | 'update_task' | 'generic'

export interface AIAction {
  type: AIActionType
  data?: Record<string, unknown>
  description: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface AIChatResponse {
  response: string
  tokensUsed: number
  provider: string
  actions: AIAction[]
}

interface AIChatState {
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  tokensUsed: number
  lastProvider: string | null
  pendingActions: AIAction[] | null
}

const initialState: AIChatState = {
  messages: [],
  loading: false,
  error: null,
  tokensUsed: 0,
  lastProvider: null,
  pendingActions: null,
}

export const sendMessage = createAsyncThunk(
  'ai/sendMessage',
  async (message: string) => api.post<AIChatResponse>('/api/ai/chat', { message }),
)

export const fetchHistory = createAsyncThunk(
  'ai/fetchHistory',
  async () => api.get<{ messages: ChatMessage[] }>('/api/ai/history'),
)

export const clearHistory = createAsyncThunk(
  'ai/clearHistory',
  async () => {
    await api.delete('/api/ai/history')
  },
)

export const fetchDailyBriefing = createAsyncThunk(
  'ai/fetchDailyBriefing',
  async () => api.get<{ briefing: string }>('/api/ai/daily-briefing'),
)

export const fetchSuggestions = createAsyncThunk(
  'ai/fetchSuggestions',
  async () => api.get<{ suggestions: string }>('/api/ai/suggest-tasks'),
)

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sendMessage.pending, (state) => { state.loading = true; state.error = null })
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.loading = false
      state.tokensUsed += action.payload.tokensUsed
      state.lastProvider = action.payload.provider || null
      state.pendingActions = action.payload.actions?.length ? action.payload.actions : null
    })
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Erro ao enviar mensagem'
    })

    builder.addCase(fetchHistory.fulfilled, (state, action) => {
      state.messages = action.payload.messages
    })

    builder.addCase(clearHistory.fulfilled, (state) => {
      state.messages = []
      state.tokensUsed = 0
    })
  },
})

export const { addMessage } = aiSlice.actions
export default aiSlice.reducer
