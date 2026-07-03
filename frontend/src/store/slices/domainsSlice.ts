import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Domain {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  predefined: boolean
  order: number
}

interface DomainsState {
  domains: Domain[]
  loading: boolean
  error: string | null
}

const initialState: DomainsState = {
  domains: [],
  loading: false,
  error: null,
}

export const fetchDomains = createAsyncThunk('domains/fetchDomains', async () => {
  return api.get<Domain[]>('/api/domains')
})

export const seedDomains = createAsyncThunk('domains/seedDomains', async () => {
  return api.post<Domain[]>('/api/domains/seed')
})

const domainsSlice = createSlice({
  name: 'domains',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDomains.pending, (s) => { s.loading = true; s.error = null })
    builder.addCase(fetchDomains.fulfilled, (s, a) => { s.loading = false; s.domains = a.payload })
    builder.addCase(fetchDomains.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Erro ao carregar domínios' })
    builder.addCase(seedDomains.fulfilled, (s, a) => { s.domains = a.payload })
  },
})

export default domainsSlice.reducer
