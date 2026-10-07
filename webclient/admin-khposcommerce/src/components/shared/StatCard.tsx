import React from 'react'
import { ArrowUpRight, ArrowDownRight, Minus, type LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: number | string
  prefix?: string
  suffix?: string
  decimals?: number
  useCounter?: boolean
  description?: string
  change?: {
    value: number | string
    trend?: 'up' | 'down' | 'neutral'
    label?: string
  }
  icon?: LucideIcon | React.ComponentType<{ className?: string }> | React.ReactNode
  iconClassName?: string
  iconContainerClassName?: string
  variant?: 'default' | 'primary' | 'emerald' | 'rose' | 'amber' | 'purple' | 'blue'
  className?: string
  valueClassName?: string
  onClick?: () => void
  loading?: boolean
  rightAction?: React.ReactNode
}

const variantStyles: Record<string, { iconBg: string; text: string; ring: string }> = {
  default: {
    iconBg: 'bg-muted text-muted-foreground',
    text: 'text-foreground',
    ring: 'border-border/80',
  },
  primary: {
    iconBg: 'bg-primary/10 text-primary',
    text: 'text-primary',
    ring: 'border-primary/20',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'border-emerald-500/20',
  },
  rose: {
    iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    text: 'text-rose-600 dark:text-rose-400',
    ring: 'border-rose-500/20',
  },
  amber: {
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'border-amber-500/20',
  },
  purple: {
    iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    text: 'text-purple-600 dark:text-purple-400',
    ring: 'border-purple-500/20',
  },
  blue: {
    iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'border-blue-500/20',
  },
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  useCounter = true,
  description,
  change,
  icon: Icon,
  iconClassName = '',
  iconContainerClassName = '',
  variant = 'default',
  className = '',
  valueClassName = '',
  onClick,
  loading = false,
  rightAction,
}) => {
  const isClickable = Boolean(onClick)
  const isNumeric = typeof value === 'number'
  const currentVariant = variantStyles[variant] || variantStyles.default

  const isUp = change?.trend === 'up'
  const isDown = change?.trend === 'down'

  return (
    <Card
      onClick={onClick}
      className={cn(
        'relative overflow-hidden transition-all duration-200 border-border/70 hover:border-border select-none shadow-xs',
        isClickable && 'cursor-pointer hover:shadow-md active:scale-[0.99]',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
          {title}
        </CardTitle>
        <div className="flex items-center gap-1.5 shrink-0">
          {rightAction}
          {Icon && (
            <div
              className={cn(
                'size-9 rounded-xl flex items-center justify-center border',
                currentVariant.iconBg,
                currentVariant.ring,
                iconContainerClassName
              )}
            >
              {React.isValidElement(Icon) ? (
                Icon
              ) : (
                // @ts-expect-error dynamic component
                <Icon className={cn('size-4 shrink-0', iconClassName)} />
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'text-2xl font-black tracking-tight text-foreground font-mono truncate',
            valueClassName
          )}
        >
          {loading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
          ) : isNumeric && useCounter ? (
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

        {(change || description) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground truncate">
            {change && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold font-mono px-1.5 py-0.5 rounded-md text-[11px]',
                  isUp && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                  isDown && 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                  !isUp && !isDown && 'bg-muted text-muted-foreground'
                )}
              >
                {isUp ? (
                  <ArrowUpRight className="size-3" />
                ) : isDown ? (
                  <ArrowDownRight className="size-3" />
                ) : (
                  <Minus className="size-3" />
                )}
                {change.value}
              </span>
            )}
            {change?.label && (
              <span className="text-[11px] text-muted-foreground truncate">
                {change.label}
              </span>
            )}
            {description && !change?.label && (
              <span className="text-[11px] text-muted-foreground truncate">
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StatCard
