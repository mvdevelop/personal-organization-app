export type AnalyticsPeriod = '7d' | '30d' | '90d' | '365d';

export interface TrendDataPoint {
  date: string;
  completed: number;
  total: number;
  rate: number;
}

export interface TrendsResponse {
  period: AnalyticsPeriod;
  data: TrendDataPoint[];
  summary: {
    totalTasks: number;
    completed: number;
    avgCompletionRate: number;
  };
}

export interface HabitConsistencyData {
  habitId: string;
  habitTitle: string;
  color: string;
  dates: Record<string, boolean>;
}

export interface HabitAnalyticsResponse {
  period: AnalyticsPeriod;
  habits: HabitConsistencyData[];
  summary: {
    totalHabits: number;
    overallConsistency: number;
    bestConsistencyHabit: HabitConsistencyData | null;
  };
}

export interface StudySessionData {
  date: string;
  sessions: number;
  hours: number;
}

export interface SubjectStudyData {
  name: string;
  sessions: number;
  hours: number;
}

export interface StudyAnalyticsResponse {
  period: AnalyticsPeriod;
  analytics: {
    bySubject: SubjectStudyData[];
    daily: StudySessionData[];
    byTechnique: Array<{ name: string; sessions: number; hours: number }>;
  };
  summary: {
    totalSessions: number;
    totalHours: number;
    avgHoursPerDay: number;
    favoriteSubject: string;
  };
}

export interface ProductivityMetrics {
  period: AnalyticsPeriod;
  dateRange: { start: string; end: string };
  tasks: {
    created: number;
    completed: number;
    completionRate: number;
  };
  habits: {
    total: number;
    checkIns: number;
    consistency: number;
  };
  studies: {
    sessions: number;
    totalHours: number;
    avgHoursPerDay: number;
  };
  goals: {
    active: number;
  };
}

export interface ExportData {
  exportedAt: string;
  period: AnalyticsPeriod;
  dateRange: { start: string; end: string };
  metrics: ProductivityMetrics;
  data: {
    tasks: Array<{
      title: string;
      completed: boolean;
      priority: string;
      dueDate: string | null;
      createdAt: string;
    }>;
    habits: Array<{
      title: string;
      frequency: string;
      createdAt: string;
    }>;
    goals: Array<{
      title: string;
      type: string;
      status: string;
      progress: number;
    }>;
    notes: number;
    studySessions: number;
  };
}
