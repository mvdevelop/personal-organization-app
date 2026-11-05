import React, { useMemo } from 'react';
import type { HabitAnalyticsResponse } from '../../types/analytics';

interface HabitConsistencyChartProps {
  data: HabitAnalyticsResponse | null;
  loading: boolean;
}

export const HabitConsistencyChart: React.FC<HabitConsistencyChartProps> = ({ data, loading }) => {
  const heatmapData = useMemo(() => {
    if (!data) return [];

    const dates = new Set<string>();
    data.habits.forEach((h) => {
      Object.keys(h.dates).forEach((d) => dates.add(d));
    });

    return Array.from(dates).sort();
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow animate-pulse">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.habits.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow flex items-center justify-center min-h-64">
        <p className="text-gray-500 dark:text-gray-400">Sem hábitos cadastrados</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Consistência de Hábitos</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Consistência geral: {data.summary.overallConsistency}%
        </p>
      </div>

      <div className="space-y-4 overflow-x-auto">
        {data.habits.map((habit) => {
          const completed = Object.values(habit.dates).filter((d) => d).length;
          const total = Object.keys(habit.dates).length;
          const consistency = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <div key={habit.habitId} className="border-b dark:border-gray-700 pb-3 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: habit.color }}
                  ></div>
                  <span className="font-medium text-sm">{habit.habitTitle}</span>
                </div>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {consistency}%
                </span>
              </div>

              <div className="flex gap-px flex-wrap">
                {heatmapData.map((date) => {
                  const completed = habit.dates[date] || false;
                  return (
                    <div
                      key={`${habit.habitId}-${date}`}
                      className={`w-3 h-3 rounded-sm transition-colors ${
                        completed
                          ? 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      title={`${date}: ${completed ? 'Concluído' : 'Não concluído'}`}
                    ></div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
