import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type {
  AnalyticsPeriod,
  TrendsResponse,
  HabitAnalyticsResponse,
  StudyAnalyticsResponse,
  ProductivityMetrics,
} from '../../types/analytics';

interface AnalyticsState {
  trends: TrendsResponse | null;
  habits: HabitAnalyticsResponse | null;
  studies: StudyAnalyticsResponse | null;
  metrics: ProductivityMetrics | null;
  selectedPeriod: AnalyticsPeriod;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  trends: null,
  habits: null,
  studies: null,
  metrics: null,
  selectedPeriod: '30d',
  loading: false,
  error: null,
};

export const fetchTrends = createAsyncThunk('analytics/fetchTrends', async (period: AnalyticsPeriod) =>
  api.get<TrendsResponse>(`/api/analytics/trends?period=${period}`)
);

export const fetchHabitAnalytics = createAsyncThunk(
  'analytics/fetchHabits',
  async (period: AnalyticsPeriod) =>
    api.get<HabitAnalyticsResponse>(`/api/analytics/habits?period=${period}`)
);

export const fetchStudyAnalytics = createAsyncThunk(
  'analytics/fetchStudies',
  async (period: AnalyticsPeriod) =>
    api.get<StudyAnalyticsResponse>(`/api/analytics/studies?period=${period}`)
);

export const fetchMetrics = createAsyncThunk('analytics/fetchMetrics', async (period: AnalyticsPeriod) =>
  api.get<ProductivityMetrics>(`/api/analytics/metrics?period=${period}`)
);

export const fetchAllAnalytics = createAsyncThunk(
  'analytics/fetchAll',
  async (period: AnalyticsPeriod, { dispatch }) => {
    await Promise.all([
      dispatch(fetchTrends(period)),
      dispatch(fetchHabitAnalytics(period)),
      dispatch(fetchStudyAnalytics(period)),
      dispatch(fetchMetrics(period)),
    ]);
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setPeriod: (state, action) => {
      state.selectedPeriod = action.payload;
    },
    clearAnalytics: () => initialState,
  },
  extraReducers: (builder) => {
    // Trends
    builder.addCase(fetchTrends.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTrends.fulfilled, (state, action) => {
      state.loading = false;
      state.trends = action.payload;
    });
    builder.addCase(fetchTrends.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Erro ao carregar tendências';
    });

    // Habits
    builder.addCase(fetchHabitAnalytics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchHabitAnalytics.fulfilled, (state, action) => {
      state.loading = false;
      state.habits = action.payload;
    });
    builder.addCase(fetchHabitAnalytics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Erro ao carregar análise de hábitos';
    });

    // Studies
    builder.addCase(fetchStudyAnalytics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStudyAnalytics.fulfilled, (state, action) => {
      state.loading = false;
      state.studies = action.payload;
    });
    builder.addCase(fetchStudyAnalytics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Erro ao carregar análise de estudos';
    });

    // Metrics
    builder.addCase(fetchMetrics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMetrics.fulfilled, (state, action) => {
      state.loading = false;
      state.metrics = action.payload;
    });
    builder.addCase(fetchMetrics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Erro ao carregar métricas';
    });

    // fetchAll
    builder.addCase(fetchAllAnalytics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllAnalytics.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(fetchAllAnalytics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Erro ao carregar dados de analytics';
    });
  },
});

export const { setPeriod, clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
