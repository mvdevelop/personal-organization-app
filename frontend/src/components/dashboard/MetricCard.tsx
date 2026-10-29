import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  pill: string
  tone?: 'neutral' | 'success' | 'warning' | 'pink' | 'accent'
  note: string
  icon: LucideIcon
}

const MetricCard: React.FC<MetricCardProps> = ({
  label, value, unit, pill, tone = 'neutral', note, icon: Icon,
}) => {
  const pillClass = tone === 'neutral' ? '' : `is-${tone}`

  return (
    <div className="sa-metric">
      <div className="sa-metric-top">
        <span className="sa-metric-label">{label}</span>
        <span className={`sa-metric-pill ${pillClass}`}>{pill}</span>
      </div>

      <div className="sa-metric-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>

      <div className="sa-metric-note">
        <Icon aria-hidden="true" />
        <span>{note}</span>
      </div>
    </div>
  )
}

export default MetricCard
