import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'neutral'
    | 'discount'
    | 'featured'
    | 'outline'
  size?: 'xs' | 'sm' | 'md'
  dot?: boolean
  dotColor?: string
}

const variantStyles: Record<string, string> = {
  primary: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50',
  secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50',
  danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50',
  neutral: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
  discount: 'bg-gradient-to-r from-rose-500 to-red-600 text-white font-black shadow-xs border-0',
  featured: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black shadow-xs border-0',
  outline: 'bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
}

const sizeStyles: Record<string, string> = {
  xs: 'text-[10px] px-2 py-0.5 rounded-md font-bold',
  sm: 'text-xs px-2.5 py-1 rounded-lg font-bold',
  md: 'text-xs sm:text-sm px-3 py-1.5 rounded-xl font-bold',
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'primary',
  size = 'sm',
  dot = false,
  dotColor,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-sans leading-none tracking-tight select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotColor || (variant === 'success' ? 'bg-emerald-500' : 'bg-current')
          )}
        />
      )}
      {children}
    </span>
  )
}

export default Badge
