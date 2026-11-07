import React from 'react';
import { ResponsiveBarChart } from '../charts/ResponsiveBarChart';
import { ResponsivePieChart } from '../charts/ResponsivePieChart';
import type { StudyAnalyticsResponse } from '../../types/analytics';

interface StudyDistributionChartProps {
  data: StudyAnalyticsResponse | null;
  loading: boolean;
}

export const StudyDistributionChart: React.FC<StudyDistributionChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow animate-pulse">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!data || data.analytics.bySubject.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow flex items-center justify-center min-h-64">
        <p className="text-gray-500 dark:text-gray-400">Sem sessões de estudo registradas</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Distribuição de Estudos</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total de horas: {data.summary.totalHours}h | Média/dia: {data.summary.avgHoursPerDay}h
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ResponsivePieChart
            data={data.analytics.bySubject.map((s) => ({
              name: s.name,
              value: s.sessions,
            }))}
            height={250}
            title="Sessões por Matéria"
          />
        </div>

        <div>
          <ResponsiveBarChart
            data={data.analytics.bySubject.map((subject) => ({ ...subject }))}
            bars={[
              {
                key: 'hours',
                name: 'Horas',
                fill: '#3b82f6',
              },
            ]}
            height={250}
            layout="vertical"
            title="Horas por Matéria"
          />
        </div>
      </div>

      {data.analytics.byTechnique.length > 0 && (
        <div className="mt-6 pt-6 border-t dark:border-gray-700">
          <h4 className="font-semibold mb-4">Por Técnica</h4>
          <div className="grid grid-cols-2 gap-3">
            {data.analytics.byTechnique.map((t) => (
              <div key={t.name} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t.sessions} sessões · {t.hours}h
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
