import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  color?: string
  subtitle?: string
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  color,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`bg-surface border border-[var(--border)] shadow-warm p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="icon-medal !w-11 !h-11" style={color ? { borderColor: color } : undefined}>
          <Icon className="w-5 h-5" style={color ? { color } : undefined} />
        </div>
        <div className="min-w-0">
          <div className="font-mono text-xl font-bold tracking-tight" style={{ color: color || 'var(--gold)' }}>
            {value}
          </div>
          <div className="label-retro mt-0.5">{label}</div>
          {subtitle && (
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatCard
