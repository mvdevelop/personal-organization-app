import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface AIChatState {
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  tokensUsed: number
}

const initialState: AIChatState = {
  messages: [],
  loading: false,
  error: null,
  tokensUsed: 0,
}

export const sendMessage = createAsyncThunk(
  'ai/sendMessage',
  async (message: string) => {
    return api.post<{ response: string; tokensUsed: number }>('/api/ai/chat', { message })
  },
)

export const fetchHistory = createAsyncThunk(
  'ai/fetchHistory',
  async () => {
    return api.get<{ messages: ChatMessage[] }>('/api/ai/history')
  },
)

export const clearHistory = createAsyncThunk(
  'ai/clearHistory',
  async () => {
    await api.delete('/api/ai/history')
  },
)

export const fetchDailyBriefing = createAsyncThunk(
  'ai/fetchDailyBriefing',
  async () => {
    return api.get<{ briefing: string }>('/api/ai/daily-briefing')
  },
)

export const fetchSuggestions = createAsyncThunk(
  'ai/fetchSuggestions',
  async () => {
    return api.get<{ suggestions: string }>('/api/ai/suggest-tasks')
  },
)

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sendMessage.pending, (state) => { state.loading = true; state.error = null })
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.loading = false
      state.tokensUsed += action.payload.tokensUsed
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
