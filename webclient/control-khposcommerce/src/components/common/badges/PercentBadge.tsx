import React from 'react'

export type PercentBadgeVariant = 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'muted' | 'auto'

export interface PercentBadgeProps {
  /** Numeric value or string representation of percent */
  value: number | string | null | undefined
  /** Maximum decimal digits before removing trailing zeroes (default: 2) */
  maxDecimals?: number
  /** Color theme variant (default: 'auto', which selects emerald for > 0, muted for 0) */
  variant?: PercentBadgeVariant
  /** Size variant */
  size?: 'xs' | 'sm' | 'md'
  /** Show + sign for positive values */
  showPlus?: boolean
  /** Custom extra class names */
  className?: string
}

const VARIANT_MAP: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
  muted: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
}

const SIZE_CLASSES = {
  xs: 'px-2 py-0.5 text-[10px] rounded-md',
  sm: 'px-2.5 py-0.5 text-xs rounded-md',
  md: 'px-3 py-1 text-xs rounded-md',
}

export const PercentBadge: React.FC<PercentBadgeProps> = ({
  value,
  maxDecimals = 2,
  variant = 'auto',
  size = 'sm',
  showPlus = false,
  className = '',
}) => {
  const num = Number(value || 0)

  // Clean format: strip excess trailing zeroes (e.g. 13.0000 -> 13%, 8.5000 -> 8.5%)
  const formattedNumber = parseFloat(num.toFixed(maxDecimals)).toString()
  const displayValue = `${showPlus && num > 0 ? '+' : ''}${formattedNumber}%`

  let resolvedVariant = variant
  if (variant === 'auto') {
    resolvedVariant = num > 0 ? 'emerald' : 'muted'
  }

  const colorClass = VARIANT_MAP[resolvedVariant] || VARIANT_MAP.emerald
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold font-mono whitespace-nowrap leading-none transition-colors ${sizeClass} ${colorClass} ${className}`}
    >
      {displayValue}
    </span>
  )
}

export default PercentBadge
