import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface PageHeaderProps {
  icon?: LucideIcon
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 ${className}`}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="icon-medal !w-12 !h-12">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div>
          <h1 className="page-header text-2xl sm:text-3xl">{title}</h1>
          {subtitle && (
            <div className="flex items-center gap-2 mt-1">
              <span className="divider-diamond text-xs">
                <span className="text-secondary font-body font-normal">{subtitle}</span>
              </span>
            </div>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}

export default PageHeader
