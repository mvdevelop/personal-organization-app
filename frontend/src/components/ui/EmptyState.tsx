import React from 'react';
import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <div className="icon-medal !w-16 !h-16 mb-4 !opacity-60">
        <Icon className="w-8 h-8" />
      </div>
      <p className="font-display text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </p>
      {description && (
        <p className="font-body text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState
