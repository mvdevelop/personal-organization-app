import React from 'react';
import type { AnalyticsPeriod } from '../../types/analytics';

interface PeriodSelectorProps {
  selected: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
}

const PERIODS: Array<{ value: AnalyticsPeriod; label: string; description: string }> = [
  { value: '7d', label: 'Semana', description: 'Últimos 7 dias' },
  { value: '30d', label: 'Mês', description: 'Últimos 30 dias' },
  { value: '90d', label: 'Trimestre', description: 'Últimos 90 dias' },
  { value: '365d', label: 'Ano', description: 'Últimos 365 dias' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selected, onChange }) => {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {PERIODS.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            selected === period.value
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          title={period.description}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};
