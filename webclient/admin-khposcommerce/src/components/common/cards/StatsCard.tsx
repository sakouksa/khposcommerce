import React from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'

// ─── Circular Progress Ring Component ─────────────────────────────────────────
export interface CircularProgressRingProps {
  percentage: number
  colorClass?: string
  size?: number
  strokeWidth?: number
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  percentage,
  colorClass = 'text-primary',
  size = 48,
  strokeWidth = 4.5,
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100)
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={colorClass}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-foreground">
        {Math.round(clampedPercentage)}%
      </span>
    </div>
  )
}

// ─── Variant Styles Map ───────────────────────────────────────────────────────
export type StatsCardVariant =
  | 'blue'
  | 'emerald'
  | 'rose'
  | 'amber'
  | 'purple'
  | 'indigo'
  | 'cyan'
  | 'primary'
  | 'slate'

const VARIANT_ICON_STYLES: Record<StatsCardVariant, string> = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
  primary: 'bg-primary/10 text-primary border border-primary/20',
  slate: 'bg-muted text-muted-foreground border border-border',
}

const MINI_VALUE_COLORS: Record<string, string> = {
  emerald: 'text-emerald-600 dark:text-emerald-400',
  rose: 'text-rose-600 dark:text-rose-400',
  blue: 'text-blue-600 dark:text-blue-400',
  amber: 'text-amber-600 dark:text-amber-400',
  purple: 'text-purple-600 dark:text-purple-400',
  primary: 'text-primary',
  foreground: 'text-foreground',
}

export interface StatsTrend {
  value: string | number
  isPositive?: boolean
  label?: string
}

export const isTrendObject = (val: unknown): val is StatsTrend => {
  return (
    typeof val === 'object' &&
    val !== null &&
    'value' in val &&
    !React.isValidElement(val)
  )
}

// ─── Main KPI Card Props ──────────────────────────────────────────────────────
export interface StatsCardProps {
  title: React.ReactNode
  value: number | string
  prefix?: string
  suffix?: string
  decimals?: number
  useCounter?: boolean
  subtitle?: React.ReactNode
  trend?: StatsTrend | React.ReactNode
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }> | React.ReactNode
  variant?: StatsCardVariant
  progressRing?: {
    percentage: number
    colorClass?: string
  }
  rightElement?: React.ReactNode
  onClick?: () => void
  isActive?: boolean
  activeRingClass?: string
  tooltip?: string
  delay?: number
  className?: string
  valueClassName?: string
}

// ─── Main Stats Card Component ─────────────────────────────────────────────────
export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  useCounter = true,
  subtitle,
  trend,
  icon: Icon,
  variant = 'blue',
  progressRing,
  rightElement,
  onClick,
  isActive = false,
  activeRingClass = 'ring-2 ring-primary/40',
  tooltip,
  delay = 0,
  className = '',
  valueClassName = '',
}) => {
  const isClickable = Boolean(onClick)
  const isNumeric = typeof value === 'number'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      onClick={onClick}
      title={tooltip}
      className={`bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-xs transition-all select-none ${
        isClickable ? 'cursor-pointer hover:shadow-md hover:border-border/80 active:scale-[0.99]' : ''
      } ${isActive ? activeRingClass : ''} ${className}`}
    >
      {/* Left: Metric Data Stack */}
      <div className="space-y-1 min-w-0 pr-3">
        {/* Uppercase Category/Title Label */}
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
          {title}
        </p>

        {/* Primary Value Display */}
        <div
          className={`text-2xl font-extrabold text-foreground tracking-tight truncate font-mono ${valueClassName}`}
        >
          {isNumeric && useCounter ? (
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
            />
          ) : (
            <span>
              {prefix}
              {value}
              {suffix}
            </span>
          )}
        </div>

        {/* Subtitle / Contextual Note */}
        {(subtitle || trend) && (
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate">
            {isTrendObject(trend) ? (
              <span
                className={`font-bold ${
                  trend.isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {trend.value} {trend.label || ''}
              </span>
            ) : (
              trend
            )}
            {subtitle}
          </div>
        )}
      </div>

      {/* Right: Visual Accent (Icon Badge, Progress Ring, or Custom) */}
      <div className="shrink-0 flex items-center justify-center">
        {rightElement ? (
          rightElement
        ) : progressRing ? (
          <CircularProgressRing
            percentage={progressRing.percentage}
            colorClass={progressRing.colorClass || 'text-primary'}
          />
        ) : Icon ? (
          <div className={`p-3.5 rounded-xl ${VARIANT_ICON_STYLES[variant]}`}>
            {React.isValidElement(Icon) ? (
              Icon
            ) : typeof Icon === 'function' || typeof Icon === 'object' ? (
              // @ts-expect-error dynamic component render
              <Icon size={22} />
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}

// ─── Secondary Mini Metric Card Component ─────────────────────────────────────
export interface MiniStatsCardProps {
  label: React.ReactNode
  value: React.ReactNode
  valueColor?: 'emerald' | 'rose' | 'blue' | 'amber' | 'purple' | 'primary' | 'foreground' | string
  icon?: LucideIcon
  onClick?: () => void
  tooltip?: string
  className?: string
}

export const MiniStatsCard: React.FC<MiniStatsCardProps> = ({
  label,
  value,
  valueColor = 'primary',
  icon: Icon,
  onClick,
  tooltip,
  className = '',
}) => {
  const isClickable = Boolean(onClick)
  const colorClass = MINI_VALUE_COLORS[valueColor] || valueColor

  return (
    <div
      onClick={onClick}
      title={tooltip}
      className={`bg-card border border-border p-3.5 rounded-xl flex flex-col justify-between shadow-xs transition-all select-none ${
        isClickable ? 'cursor-pointer hover:shadow-sm hover:border-border/80' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider truncate">
          {label}
        </span>
        {Icon && (
          React.isValidElement(Icon) ? (
            Icon
          ) : typeof Icon === 'function' || typeof Icon === 'object' ? (
            <Icon size={13} className="text-muted-foreground shrink-0" />
          ) : null
        )}
      </div>
      <span className={`text-base sm:text-lg font-extrabold tracking-tight mt-1 truncate ${colorClass}`}>
        {value}
      </span>
    </div>
  )
}

// ─── Responsive Grid Containers ───────────────────────────────────────────────
export interface StatsGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4 | 5
  className?: string
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  children,
  columns = 4,
  className = '',
}) => {
  const colClass =
    columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : columns === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : columns === 5
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

  return <div className={`grid ${colClass} gap-3.5 sm:gap-4 ${className}`}>{children}</div>
}

// ─── Backward Compatibility Aliases ───────────────────────────────────────────
export type EnterpriseStatsCardProps = StatsCardProps
export const EnterpriseStatsCard = StatsCard

export type EnterpriseMiniStatsCardProps = MiniStatsCardProps
export const EnterpriseMiniStatsCard = MiniStatsCard

export type EnterpriseStatsGridProps = StatsGridProps
export const EnterpriseStatsGrid = StatsGrid

export default StatsCard
