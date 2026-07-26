import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const sizeMap = {
  sm: 20,
  md: 32,
  lg: 48,
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  const px = sizeMap[size] || sizeMap.md
  const strokeWidth = size === 'sm' ? 3 : 2.5

  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-8 ${className}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 50 50"
        className="animate-orbit"
      >
        {/* Outer ring */}
        <circle
          cx="25" cy="25" r="20"
          fill="none"
          stroke="var(--border-gold)"
          strokeWidth={strokeWidth}
          opacity="0.3"
        />
        {/* Active arc */}
        <circle
          cx="25" cy="25" r="20"
          fill="none"
          stroke="var(--gold)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="90 210"
          strokeDashoffset="-15"
        />
        {/* Center dot */}
        <circle cx="25" cy="25" r="3" fill="var(--gold)" opacity="0.6" />
      </svg>
      {text && (
        <span className="label-retro text-xs animate-fade-in">{text}</span>
      )}
    </div>
  )
}

export default LoadingSpinner
