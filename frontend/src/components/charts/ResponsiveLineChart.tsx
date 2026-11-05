import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { useAppSelector } from '../../hooks/redux';

interface ResponsiveLineChartProps {
  data: Array<{ date: string; [key: string]: any }>;
  lines: Array<{
    key: string;
    name: string;
    color: string;
    strokeWidth?: number;
  }>;
  height?: number;
  title?: string;
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
      <p className="text-sm font-semibold">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} style={{ color: entry.color }} className="text-sm">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export const ResponsiveLineChart: React.FC<ResponsiveLineChartProps> = ({
  data,
  lines,
  height = 300,
  title,
}) => {
  const { theme } = useAppSelector((s) => s.userPreferences);
  const isDark = theme === 'dark';

  const colors = useMemo(
    () => ({
      text: isDark ? '#e5e7eb' : '#374151',
      grid: isDark ? '#374151' : '#e5e7eb',
      bg: isDark ? '#1f2937' : '#ffffff',
    }),
    [isDark]
  );

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="date" stroke={colors.text} style={{ fontSize: '12px' }} />
          <YAxis stroke={colors.text} style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              name={line.name}
              strokeWidth={line.strokeWidth || 2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
