import React from 'react'
import { cn } from '../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
}

const variantStyles = {
  default:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-transparent',
  secondary:
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-transparent',
  success:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-transparent',
  warning:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-transparent',
  destructive:
    'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-transparent',
  outline:
    'text-gray-700 border-gray-300 dark:text-gray-300 dark:border-gray-700 bg-transparent',
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors select-none',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
