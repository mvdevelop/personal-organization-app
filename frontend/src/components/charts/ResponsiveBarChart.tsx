import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TooltipPayloadEntry } from 'recharts';
import { useAppSelector} from '../../hooks/redux';

interface ResponsiveBarChartProps {
  data: Array<Record<string, string | number> & { name: string }>;
  bars: Array<{
    key: string;
    name: string;
    fill: string;
  }>;
  height?: number;
  title?: string;
  layout?: 'vertical' | 'horizontal';
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string | number }) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
      <p className="text-sm font-semibold">{label}</p>
      {payload.map((entry, idx: number) => (
        <p key={idx} style={{ color: entry.fill }} className="text-sm">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export const ResponsiveBarChart: React.FC<ResponsiveBarChartProps> = ({
  data,
  bars,
  height = 300,
  title,
  layout = 'horizontal',
}) => {
  const { theme } = useAppSelector((s) => s.userPreferences);
  const isDark = theme === 'dark';

  const colors = useMemo(
    () => ({
      text: isDark ? '#e5e7eb' : '#374151',
      grid: isDark ? '#374151' : '#e5e7eb',
    }),
    [isDark]
  );

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout={layout} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis type="category" stroke={colors.text} style={{ fontSize: '12px' }} />
          <YAxis stroke={colors.text} style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {bars.map((bar) => (
            <Bar key={bar.key} dataKey={bar.key} fill={bar.fill} name={bar.name} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
