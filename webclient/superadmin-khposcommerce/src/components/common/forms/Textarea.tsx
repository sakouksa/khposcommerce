import React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error message or boolean flag indicating error state */
  error?: string | boolean | null
  /** Extra container className */
  containerClassName?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', containerClassName = '', error, disabled = false, rows = 3, ...props }, ref) => {
    const hasError = Boolean(error)

    const baseStyles = `
      w-full min-h-[90px] px-3.5 py-2.5 text-xs sm:text-[13px] rounded-xl border transition-all font-medium leading-relaxed resize-none outline-none
      bg-background dark:bg-slate-900/90
      text-foreground dark:text-slate-100
      placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400
      disabled:opacity-50 disabled:cursor-not-allowed
      dark:[color-scheme:dark]
    `

    const stateStyles = hasError
      ? 'border-rose-500 dark:border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
      : 'border-border/80 dark:border-slate-700/80 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:hover:border-slate-600'

    return (
      <div className={`relative w-full ${containerClassName}`}>
        <textarea
          ref={ref}
          rows={rows}
          disabled={disabled}
          className={`${baseStyles} ${stateStyles} ${className}`.trim()}
          style={{ fontFamily: "'Kantumruy Pro', 'Battambang', 'Inter', system-ui, sans-serif" }}
          {...props}
        />
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export const EnterpriseTextarea = Textarea
export default Textarea
