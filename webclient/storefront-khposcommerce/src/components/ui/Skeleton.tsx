import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text' | 'card'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rect',
  ...props
}) => {
  const variantClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded-md h-4 w-full'
      : variant === 'card'
      ? 'rounded-3xl'
      : 'rounded-xl'

  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200/80 dark:bg-slate-800/80',
        variantClass,
        className
      )}
      {...props}
    />
  )
}

export default Skeleton
