import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export type AIProviderType = 'openrouter' | 'openai' | 'anthropic' | 'google'

export interface AIProviderConfig {
  type: AIProviderType
  model: string
  isEnabled: boolean
  isDefault: boolean
  apiKey: string // masked for display
}

export interface AISettingsState {
  providers: AIProviderConfig[]
  maxTokens: number
  temperature: number
  systemPrompt?: string
  loading: boolean
  error: string | null
  testConnectionResult: { success: boolean; error?: string; model?: string } | null
}

const initialState: AISettingsState = {
  providers: [],
  maxTokens: 1024,
  temperature: 0.7,
  loading: false,
  error: null,
  testConnectionResult: null,
}

export const fetchAISettings = createAsyncThunk(
  'aiSettings/fetch',
  async () => {
    return api.get<{
      providers: AIProviderConfig[]
      maxTokens: number
      temperature: number
      systemPrompt?: string
    }>('/api/ai/settings')
  },
)

export const saveProviderConfig = createAsyncThunk(
  'aiSettings/saveProvider',
  async (data: {
    type: AIProviderType
    apiKey: string
    model: string
    isDefault: boolean
  }) => {
    return api.post<{ message: string; provider: AIProviderConfig }>(
      '/api/ai/settings/provider',
      data,
    )
  },
)

export const deleteProvider = createAsyncThunk(
  'aiSettings/deleteProvider',
  async (type: AIProviderType) => {
    await api.delete(`/api/ai/settings/provider/${type}`)
    return type
  },
)

export const testProviderConnection = createAsyncThunk(
  'aiSettings/testConnection',
  async (data: { type: AIProviderType; apiKey: string; model?: string }) => {
    return api.post<{ success: boolean; error?: string; model?: string }>(
      '/api/ai/settings/test-connection',
      data,
    )
  },
)

const aiSettingsSlice = createSlice({
  name: 'aiSettings',
  initialState,
  reducers: {
    clearTestConnection(state) {
      state.testConnectionResult = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAISettings.pending, (s) => { s.loading = true; s.error = null })
    builder.addCase(fetchAISettings.fulfilled, (s, a) => {
      s.loading = false
      s.providers = a.payload.providers
      s.maxTokens = a.payload.maxTokens
      s.temperature = a.payload.temperature
      s.systemPrompt = a.payload.systemPrompt
    })
    builder.addCase(fetchAISettings.rejected, (s, a) => {
      s.loading = false
      s.error = a.error.message || 'Erro ao carregar configurações'
    })

    builder.addCase(saveProviderConfig.fulfilled, (s, a) => {
      const idx = s.providers.findIndex(p => p.type === a.payload.provider.type)
      if (idx >= 0) {
        s.providers[idx] = a.payload.provider
      } else {
        s.providers.push(a.payload.provider)
      }
    })

    builder.addCase(deleteProvider.fulfilled, (s, a) => {
      s.providers = s.providers.filter(p => p.type !== a.payload)
    })

    builder.addCase(testProviderConnection.fulfilled, (s, a) => {
      s.testConnectionResult = {
        success: a.payload.success,
        error: a.payload.error,
        model: a.payload.model,
      }
    })
  },
})

export const { clearTestConnection } = aiSettingsSlice.actions
export default aiSettingsSlice.reducer
