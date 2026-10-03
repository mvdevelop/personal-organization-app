import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={props.id || label.toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="label-retro text-[var(--text-secondary)]">{label}</label>
      )}
      <input
        id={props.id || label?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
        className={`input-retro w-full px-3 py-2 rounded-[var(--radius-retro-sm)] ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs font-ui" style={{ color: 'var(--danger)' }}>{error}</span>
      )}
    </div>
  )
}

export default Input
