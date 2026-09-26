import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Leading icon or element */
  icon?: React.ReactNode
  /** Trailing icon or element */
  iconRight?: React.ReactNode
  /** Prefix text or element (e.g. currency symbol, country code) */
  prefix?: React.ReactNode
  /** Suffix text or element (e.g. %, kg, pcs) */
  suffix?: React.ReactNode
  /** Error message or boolean flag indicating error state */
  error?: string | boolean | null
  /** Size variant (default: 'md' => h-10) */
  size?: 'sm' | 'md' | 'lg'
  /** Extra container className */
  containerClassName?: string
  /** Clearable input handler */
  onClear?: () => void
  /** Show clear button if value is non-empty */
  clearable?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      containerClassName = '',
      type = 'text',
      icon,
      iconRight,
      prefix,
      suffix,
      error,
      size = 'md',
      disabled = false,
      clearable = false,
      onClear,
      value,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-8 min-h-[32px] text-xs px-2.5 rounded-lg',
      md: 'h-10 min-h-[40px] text-xs sm:text-[13px] px-3.5 rounded-xl',
      lg: 'h-11 min-h-[44px] text-sm px-4 rounded-xl',
    }

    const hasError = Boolean(error)

    const baseInputStyles = `
      w-full border font-medium transition-all outline-none
      bg-background dark:bg-slate-900/90
      text-foreground dark:text-slate-100
      placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400
      disabled:opacity-50 disabled:cursor-not-allowed
      dark:[color-scheme:dark]
    `

    const stateStyles = hasError
      ? 'border-rose-500 dark:border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
      : 'border-border/80 dark:border-slate-700/80 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:hover:border-slate-600'

    const paddingStyles = `
      ${icon || prefix ? (size === 'sm' ? 'pl-8' : 'pl-10') : ''}
      ${iconRight || suffix || (clearable && value) ? (size === 'sm' ? 'pr-8' : 'pr-10') : ''}
    `

    return (
      <div className={`relative w-full ${containerClassName}`}>
        {/* Leading Icon or Prefix */}
        {(icon || prefix) && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground dark:text-slate-400 text-xs shrink-0 z-1">
            {icon}
            {prefix && <span className="font-semibold text-foreground/80 dark:text-slate-200">{prefix}</span>}
          </div>
        )}

        {/* Core Input Element */}
        <input
          ref={ref}
          type={type}
          value={value}
          disabled={disabled}
          className={`${baseInputStyles} ${sizeClasses[size]} ${stateStyles} ${paddingStyles} ${className}`.trim()}
          {...props}
        />

        {/* Trailing Icon, Suffix, or Clear Button */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5 z-1">
          {clearable && value && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              onClick={onClear}
              className="text-muted-foreground/60 hover:text-foreground p-0.5 rounded-md transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          {suffix && (
            <span className="text-xs text-muted-foreground font-semibold pointer-events-none">{suffix}</span>
          )}
          {iconRight && (
            <div className="text-muted-foreground dark:text-slate-400 pointer-events-none flex items-center">
              {iconRight}
            </div>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = 'Input'

export const EnterpriseInput = Input
export default Input
