import React from 'react';
import { ListChecks, Flame, Notebook, Flag } from 'lucide-react';
import type { ProductivityMetrics as ProductivityMetricsData } from '../../types/analytics';

interface ProductivityMetricsProps {
  data: ProductivityMetricsData | null;
  loading: boolean;
}

const ProductivityMetricsCard: React.FC<ProductivityMetricsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow animate-pulse"
          >
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const metrics = [
    {
      icon: ListChecks,
      label: 'Taxa de Conclusão',
      value: `${data.tasks.completionRate}%`,
      detail: `${data.tasks.completed} de ${data.tasks.created} tarefas`,
      color: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600',
    },
    {
      icon: Flame,
      label: 'Consistência de Hábitos',
      value: `${data.habits.consistency}%`,
      detail: `${data.habits.checkIns} check-ins`,
      color: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600',
    },
    {
      icon: Notebook,
      label: 'Horas de Estudo',
      value: `${data.studies.totalHours}h`,
      detail: `${data.studies.avgHoursPerDay}h por dia`,
      color: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600',
    },
    {
      icon: Flag,
      label: 'Metas Ativas',
      value: data.goals.active,
      detail: `${data.goals.active} objetivo${data.goals.active !== 1 ? 's' : ''} em progresso`,
      color: 'bg-pink-50 dark:bg-pink-900/20',
      iconColor: 'text-pink-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.label}
            className={`${metric.color} rounded-lg p-4 shadow transition-transform hover:scale-105`}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {metric.label}
              </h3>
              <Icon className={`w-5 h-5 ${metric.iconColor}`} />
            </div>
            <p className="text-2xl font-bold mb-1">{metric.value}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{metric.detail}</p>
          </div>
        );
      })}
    </div>
  );
};

export { ProductivityMetricsCard as ProductivityMetrics };
