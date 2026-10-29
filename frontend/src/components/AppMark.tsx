import React from 'react';

interface AppMarkProps {
  size?: number
  className?: string
}

/**
 * Smart Agenda geometric mark: a rotated square with an inner ring,
 * echoing a day/clock abstraction without literal imagery.
 */
const AppMark: React.FC<AppMarkProps> = ({ size = 32, className }) => {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      role="presentation"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`mark-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9293FF" />
          <stop offset="1" stopColor="#6667E0" />
        </linearGradient>
      </defs>
      <rect
        x="7"
        y="7"
        width="18"
        height="18"
        rx="5"
        transform="rotate(45 16 16)"
        fill={`url(#mark-${id})`}
      />
      <circle cx="16" cy="16" r="4.6" fill="none" stroke="#0E1015" strokeOpacity="0.45" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="1.6" fill="#0E1015" fillOpacity="0.55" />
    </svg>
  )
}

export default AppMark
