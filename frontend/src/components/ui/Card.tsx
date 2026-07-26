import React from 'react';

export interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  elevation?: 'flat' | 'raised' | 'elevated'
  decorated?: boolean
  onClick?: () => void
}

const elevationClasses: Record<string, string> = {
  flat: 'shadow-warm border border-[var(--border)]',
  raised: 'shadow-warm-md border border-[var(--border)]',
  elevated: 'shadow-warm-lg border border-[var(--border)]',
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  elevation = 'raised',
  decorated = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded transition-all duration-250
        ${elevationClasses[elevation] || elevationClasses.raised}
        ${hover ? 'hover:shadow-warm-md hover:-translate-y-0.5 cursor-pointer' : ''}
        ${decorated ? 'section-arch' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
