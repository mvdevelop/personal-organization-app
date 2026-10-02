import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  color?: string
  subtitle?: string
  status?: 'neutral' | 'positive' | 'attention'
  actionLabel?: string
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  color,
  subtitle,
  status = 'neutral',
  actionLabel,
  className = '',
}) => {
  const statusLabel = status === 'attention' ? 'Requer atenção' : status === 'positive' ? 'Em progresso' : undefined

  return (
    <div className={`dashboard-kpi dashboard-kpi--${status} ${className}`}>
      <div className="flex items-center gap-3">
        <div className="icon-medal !w-11 !h-11" style={color ? { borderColor: color } : undefined}>
          <Icon className="w-5 h-5" style={color ? { color } : undefined} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="font-mono text-xl font-bold tracking-tight" style={{ color: color || 'var(--gold)' }}>
            {value}
          </div>
          <div className="label-retro mt-0.5">{label}</div>
          {subtitle && <div className="text-xs mt-0.5 dashboard-kpi__subtitle">{subtitle}</div>}
          {statusLabel && <div className="dashboard-kpi__status" aria-label={`Status: ${statusLabel}`}>{statusLabel}</div>}
          {actionLabel && <div className="dashboard-kpi__action">{actionLabel}</div>}
        </div>
      </div>
    </div>
  )
}

export default StatCard
