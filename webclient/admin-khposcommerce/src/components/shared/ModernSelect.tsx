import React from 'react'
import { ChevronDown } from 'lucide-react'

export interface Option {
  value: string | number
  label: string
  icon?: React.ReactNode
  badge?: string | { name?: string; label?: string }
}

export interface ModernSelectProps {
  label?: string
  value?: any
  onChange?: (value: any) => void
  options?: Option[]
  placeholder?: string
  className?: string
  selectClassName?: string
  buttonClassName?: string
  disabled?: boolean
  required?: boolean
  error?: string | boolean | null
  searchable?: boolean
  multiple?: boolean
  icon?: React.ReactNode
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  align?: 'left' | 'right'
  id?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
}

export const ModernSelect: React.FC<ModernSelectProps> = ({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  className = '',
  selectClassName = '',
  buttonClassName = '',
  disabled = false,
  required = false,
  error,
  icon,
  prefix,
  id,
  name,
  size = 'md',
}) => {
  const currentValue = value !== undefined && value !== null ? String(value) : ''
  const displayIcon = icon || prefix

  // Baseline standard: size 'md' is h-10 (40px) matching form-input / search input standard
  const heightClass =
    size === 'sm'
      ? 'h-8 min-h-[32px] text-xs'
      : size === 'lg'
      ? 'h-12 min-h-[48px] text-sm'
      : 'h-10 min-h-[40px] text-xs sm:text-[13px]'
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative w-full">
        {displayIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10 flex items-center justify-center">
            {displayIcon}
          </div>
        )}
        <select
          id={id}
          name={name}
          value={currentValue}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full ${heightClass} font-medium rounded-lg border text-foreground focus:outline-none transition-all pr-8 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-background dark:bg-slate-900/90 dark:text-slate-100 ${
            error
              ? 'border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/20'
              : 'border-border/80 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary'
          } ${displayIcon ? 'pl-9' : 'pl-3.5'} ${selectClassName} ${buttonClassName}`}
        >
          {placeholder && !options.some((o) => String(o.value) === '') && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt, idx) => (
            <option
              key={`${opt.value}-${idx}`}
              value={String(opt.value)}
              className="bg-card text-foreground dark:bg-slate-900 dark:text-slate-100 py-1"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center justify-center">
          <ChevronDown size={iconSize} />
        </div>
      </div>
    </div>
  )
}

export default ModernSelect
