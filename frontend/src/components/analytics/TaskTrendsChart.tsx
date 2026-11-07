import React from 'react';
import { ResponsiveLineChart } from '../charts/ResponsiveLineChart';
import type { TrendsResponse } from '../../types/analytics';

interface TaskTrendsChartProps {
  data: TrendsResponse | null;
  loading: boolean;
}

export const TaskTrendsChart: React.FC<TaskTrendsChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow h-80 animate-pulse">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow h-80 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Sem dados disponíveis</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Tendências de Tarefas</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Taxa de conclusão: {data.summary.avgCompletionRate}% | Total concluídas: {data.summary.completed}
        </p>
      </div>
      <ResponsiveLineChart
        data={data.data.map((point) => ({ ...point }))}
        lines={[
          { key: 'rate', name: 'Taxa de Conclusão (%)', color: '#10b981' },
          { key: 'completed', name: 'Concluídas', color: '#3b82f6', strokeWidth: 2 },
        ]}
        height={300}
      />
    </div>
  );
};
