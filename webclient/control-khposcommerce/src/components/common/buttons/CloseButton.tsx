import React from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export type CloseButtonColor = 'rose' | 'primary' | 'amber' | 'emerald' | 'slate' | 'default'
export type CloseButtonVariant = 'default' | 'subtle' | 'ghost' | 'filled'
export type CloseButtonSize = 'sm' | 'md' | 'lg'
export type CloseButtonShape = 'circle' | 'rounded'

export interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClose?: () => void
  color?: CloseButtonColor
  variant?: CloseButtonVariant
  size?: CloseButtonSize
  shape?: CloseButtonShape
  showShortcutHint?: boolean
  tooltip?: string
  className?: string
}

const sizeStyles: Record<CloseButtonSize, { button: string; icon: number }> = {
  sm: {
    button: 'w-7 h-7 min-w-[28px] min-h-[28px]',
    icon: 14,
  },
  md: {
    button: 'w-8 h-8 min-w-[32px] min-h-[32px]',
    icon: 15,
  },
  lg: {
    button: 'w-9.5 h-9.5 min-w-[38px] min-h-[38px]',
    icon: 17,
  },
}

const shapeStyles: Record<CloseButtonShape, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-xl',
}

// Clean, high-end enterprise color schemes (crisp resting state + rich hover highlight)
const colorStyles: Record<CloseButtonColor, { base: string; hover: string; active: string; ring: string }> = {
  // 1. Apple/macOS Style Subtle Rose Accent (Default Dismiss Button)
  rose: {
    base: 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 border-slate-200/90 dark:border-slate-700/90',
    hover: 'hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800/80 hover:shadow-xs hover:shadow-rose-500/10',
    active: 'active:bg-rose-100 dark:active:bg-rose-900/60 active:border-rose-300 active:scale-92',
    ring: 'focus-visible:ring-rose-500/30',
  },
  default: {
    base: 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 border-slate-200/90 dark:border-slate-700/90',
    hover: 'hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800/80 hover:shadow-xs hover:shadow-rose-500/10',
    active: 'active:bg-rose-100 dark:active:bg-rose-900/60 active:border-rose-300 active:scale-92',
    ring: 'focus-visible:ring-rose-500/30',
  },
  // 2. Corporate Primary Indigo/Blue Accent
  primary: {
    base: 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 border-slate-200/90 dark:border-slate-700/90',
    hover: 'hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary hover:border-primary/30 dark:hover:border-primary/40 hover:shadow-xs hover:shadow-primary/10',
    active: 'active:bg-primary/20 active:border-primary/50 active:scale-92',
    ring: 'focus-visible:ring-primary/30',
  },
  // 3. Warm Amber Accent
  amber: {
    base: 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 border-slate-200/90 dark:border-slate-700/90',
    hover: 'hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-800/80 hover:shadow-xs hover:shadow-amber-500/10',
    active: 'active:bg-amber-100 dark:active:bg-amber-900/60 active:border-amber-300 active:scale-92',
    ring: 'focus-visible:ring-amber-500/30',
  },
  // 4. Emerald Accent
  emerald: {
    base: 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 border-slate-200/90 dark:border-slate-700/90',
    hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800/80 hover:shadow-xs hover:shadow-emerald-500/10',
    active: 'active:bg-emerald-100 dark:active:bg-emerald-900/60 active:border-emerald-300 active:scale-92',
    ring: 'focus-visible:ring-emerald-500/30',
  },
  // 5. Neutral Slate
  slate: {
    base: 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 border-slate-200/90 dark:border-slate-700/90',
    hover: 'hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs',
    active: 'active:bg-slate-300 dark:active:bg-slate-600 active:scale-92',
    ring: 'focus-visible:ring-slate-400/30',
  },
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  onClose,
  onClick,
  color = 'rose',
  variant = 'default',
  size = 'md',
  shape = 'circle',
  showShortcutHint = false,
  tooltip,
  className = '',
  ...rest
}) => {
  const { t } = useTranslation(['common'])
  const currentSize = sizeStyles[size] || sizeStyles.md
  const currentShape = shapeStyles[shape] || shapeStyles.circle
  const currentScheme = colorStyles[color] || colorStyles.rose
  const closeTitle = tooltip || t('common.close', 'Close (ESC)')

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClose) {
      onClose()
    }
    if (onClick) {
      onClick(e)
    }
  }

  // Variant overrides (ghost / subtle / filled)
  let variantClasses = `${currentScheme.base} ${currentScheme.hover} ${currentScheme.active}`
  if (variant === 'ghost') {
    variantClasses = `bg-transparent border border-transparent ${currentScheme.hover} ${currentScheme.active}`
  } else if (variant === 'subtle') {
    variantClasses = `bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 ${currentScheme.hover} ${currentScheme.active}`
  } else if (variant === 'filled') {
    variantClasses = `bg-slate-200/90 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 ${currentScheme.hover} ${currentScheme.active}`
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={closeTitle}
      title={closeTitle}
      className={`group relative inline-flex items-center justify-center shrink-0 border transition-all duration-150 cursor-pointer select-none focus:outline-hidden focus-visible:ring-2 ${currentScheme.ring} focus-visible:ring-offset-1 shadow-2xs ${currentSize.button} ${currentShape} ${variantClasses} ${className}`}
      {...rest}
    >
      <X
        size={currentSize.icon}
        strokeWidth={2.25}
        className="transition-colors duration-150 shrink-0"
      />
      {showShortcutHint && (
        <span className="sr-only">ESC</span>
      )}
    </button>
  )
}

export default CloseButton
