import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={props.id || label.toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="label-retro text-[var(--text-secondary)]">{label}</label>
      )}
      <select
        id={props.id || label?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
        className={`select-retro w-full px-3 py-2 rounded-[var(--radius-retro-sm)] ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

export default Select
