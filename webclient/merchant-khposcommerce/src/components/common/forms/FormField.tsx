import React from 'react'
import { AlertCircle } from 'lucide-react'

export interface FieldErrorProps {
  error?: string | null
  className?: string
}

/**
 * Global Standard Inline Field Error Message
 * Displays a red warning icon and text below an invalid form input
 */
export const FieldError: React.FC<FieldErrorProps> = ({ error, className = '' }) => {
  if (!error) return null
  return (
    <p
      className={`text-[11px] text-rose-500 dark:text-rose-400 font-semibold mt-1.5 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-150 ${className}`}
    >
      <AlertCircle size={12} className="shrink-0 text-rose-500" />
      <span>{error}</span>
    </p>
  )
}

/**
 * Global Standard Form Field Label with Required Asterisk (*)
 */
export interface FieldLabelProps {
  label: React.ReactNode
  required?: boolean
  htmlFor?: string
  className?: string
  action?: React.ReactNode
}

export const FieldLabel: React.FC<FieldLabelProps> = ({
  label,
  required = false,
  htmlFor,
  className = '',
  action,
}) => {
  return (
    <div className={`flex items-center justify-between mb-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold text-foreground/90 dark:text-slate-200"
      >
        {label}
        {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
      </label>
      {action && <div>{action}</div>}
    </div>
  )
}

/**
 * Global helper function to generate standard CSS classes for form inputs
 * Handles dynamic error highlight (red border + ring) and standard states
 */
export const getFieldClass = (
  error?: string | null,
  baseClass = 'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border transition-all font-medium',
  extraClass = ''
): string => {
  const errorStyles = error
    ? 'border-destructive bg-background text-foreground placeholder:text-muted-foreground/70 focus:border-destructive focus:ring-2 focus:ring-destructive/20'
    : 'border-input bg-background text-foreground placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-accent-foreground/30'

  return `${baseClass} ${errorStyles} ${extraClass}`.trim()
}

/**
 * Global FormField Wrapper Component
 */
export interface FormFieldProps {
  label?: React.ReactNode
  required?: boolean
  error?: string | null
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  action,
  children,
  className = '',
}) => {
  return (
    <div className={className}>
      {label && <FieldLabel label={label} required={required} action={action} />}
      {children}
      <FieldError error={error} />
    </div>
  )
}

export default FormField
