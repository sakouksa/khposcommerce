import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RatingStarsProps {
  rating?: number
  count?: number
  maxRating?: number
  size?: 'xs' | 'sm' | 'md'
  showCount?: boolean
  showScore?: boolean
  className?: string
}

const starSizes: Record<string, string> = {
  xs: 'w-2.5 h-2.5',
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
}

const textSizes: Record<string, string> = {
  xs: 'text-[10px]',
  sm: 'text-[11px]',
  md: 'text-xs',
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating = 4.8,
  count,
  maxRating = 5,
  size = 'sm',
  showCount = true,
  showScore = false,
  className,
}) => {
  const roundedRating = Math.min(Math.max(rating, 0), maxRating)
  const fullStars = Math.floor(roundedRating)
  const starClass = starSizes[size] || starSizes.sm
  const textClass = textSizes[size] || textSizes.sm

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex text-amber-400">
        {[...Array(maxRating)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              starClass,
              i < fullStars ? 'fill-current' : 'text-slate-200 dark:text-slate-700'
            )}
          />
        ))}
      </div>

      {showScore && (
        <span className={cn('font-bold text-slate-700 dark:text-slate-200', textClass)}>
          {roundedRating.toFixed(1)}
        </span>
      )}

      {showCount && count !== undefined && (
        <span className={cn('text-slate-400 font-medium ml-0.5', textClass)}>
          ({count})
        </span>
      )}
    </div>
  )
}

export default RatingStars
