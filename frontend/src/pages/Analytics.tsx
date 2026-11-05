import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchTrends,
  fetchHabitAnalytics,
  fetchStudyAnalytics,
  fetchMetrics,
  setPeriod,
} from '../store/slices/analyticsSlice';
import type { AnalyticsPeriod } from '../types/analytics';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { PeriodSelector } from '../components/analytics/PeriodSelector';
import { ProductivityMetrics } from '../components/analytics/ProductivityMetrics';
import { TaskTrendsChart } from '../components/analytics/TaskTrendsChart';
import { HabitConsistencyChart } from '../components/analytics/HabitConsistencyChart';
import { StudyDistributionChart } from '../components/analytics/StudyDistributionChart';
import { Download, BarChart3 } from 'lucide-react';

const Analytics: React.FC = () => {
  const dispatch = useAppDispatch();
  const { trends, habits, studies, metrics, selectedPeriod, loading, error } = useAppSelector(
    (s) => s.analytics
  );

  useEffect(() => {
    dispatch(fetchTrends(selectedPeriod));
    dispatch(fetchHabitAnalytics(selectedPeriod));
    dispatch(fetchStudyAnalytics(selectedPeriod));
    dispatch(fetchMetrics(selectedPeriod));
  }, [selectedPeriod, dispatch]);

  const handlePeriodChange = (period: AnalyticsPeriod) => {
    dispatch(setPeriod(period));
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(
        `/api/analytics/export?period=${selectedPeriod}&format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedPeriod}-${Date.now()}.${format === 'csv' ? 'csv' : 'json'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <PageHeader
          title="Analytics"
          description="Análise detalhada de sua produtividade"
          icon={BarChart3}
        />
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          <p className="font-semibold">Erro ao carregar dados</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Visualize tendências de produtividade, hábitos e estudos"
        icon={BarChart3}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-semibold text-lg">Período de Análise</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Selecione o intervalo que deseja analisar
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
          </div>
        </div>

        <PeriodSelector selected={selectedPeriod} onChange={handlePeriodChange} />
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Carregando dados de analytics..." />
      ) : (
        <>
          {/* Productivity Metrics */}
          <ProductivityMetrics data={metrics} loading={loading} />

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaskTrendsChart data={trends} loading={loading} />
            <StudyDistributionChart data={studies} loading={loading} />
          </div>

          {/* Habit Consistency */}
          <HabitConsistencyChart data={habits} loading={loading} />

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 py-6 border-t dark:border-gray-700">
            <p>
              Dados atualizados em {new Date().toLocaleTimeString('pt-BR')} · Atualizar a página
              para novos dados
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
