import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { useAppSelector } from '../../hooks/redux';

interface ResponsivePieChartProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  height?: number;
  title?: string;
}

const COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
];

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
      <p className="text-sm font-semibold">{payload[0]?.name}</p>
      <p className="text-sm">{payload[0]?.value}</p>
    </div>
  );
};

export const ResponsivePieChart: React.FC<ResponsivePieChartProps> = ({
  data,
  colors = COLORS,
  height = 300,
  title,
}) => {
  const { theme } = useAppSelector((s) => s.userPreferences);
  const isDark = theme === 'dark';

  const textColor = useMemo(() => (isDark ? '#e5e7eb' : '#374151'), [isDark]);

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
