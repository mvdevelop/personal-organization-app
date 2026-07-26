import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="label-retro">{label}</label>
      )}
      <input
        className={`input-retro w-full px-3 py-2 ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs font-ui" style={{ color: 'var(--danger)' }}>{error}</span>
      )}
    </div>
  )
}

export default Input
