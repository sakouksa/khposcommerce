import React from 'react'
import { cn, calculateDiscountPercent } from '@/lib/utils'
import { useSettingsStore } from '@/stores'

export interface ProductPriceProps {
  price: number
  comparePrice?: number
  discountPct?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showDiscountBadge?: boolean
  className?: string
}

const sizeStyles: Record<string, { current: string; compare: string; badge: string }> = {
  xs: {
    current: 'text-xs font-bold text-blue-600 dark:text-blue-400',
    compare: 'text-[10px] text-slate-400 line-through',
    badge: 'text-[9px] px-1.5 py-0.2',
  },
  sm: {
    current: 'text-sm font-black text-blue-600 dark:text-blue-400 font-display',
    compare: 'text-xs text-slate-400 line-through',
    badge: 'text-[10px] px-1.5 py-0.5',
  },
  md: {
    current: 'text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 font-display',
    compare: 'text-xs sm:text-sm text-slate-400 line-through',
    badge: 'text-[10px] sm:text-xs px-2 py-0.5',
  },
  lg: {
    current: 'text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-display',
    compare: 'text-sm sm:text-base text-slate-400 line-through',
    badge: 'text-xs px-2.5 py-1',
  },
  xl: {
    current: 'text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-display',
    compare: 'text-base sm:text-lg text-slate-400 line-through',
    badge: 'text-xs sm:text-sm px-3 py-1',
  },
}

export const ProductPrice: React.FC<ProductPriceProps> = ({
  price,
  comparePrice,
  discountPct,
  size = 'md',
  showDiscountBadge = false,
  className,
}) => {
  const { formatPrice, convertPrice } = useSettingsStore()

  const activeConverted = convertPrice(price || 0)
  const compareConverted = comparePrice ? convertPrice(comparePrice) : undefined

  const calculatedDiscount =
    discountPct ||
    (comparePrice && comparePrice > price
      ? calculateDiscountPercent(price, comparePrice)
      : 0)

  const styles = sizeStyles[size] || sizeStyles.md

  return (
    <div className={cn('flex flex-wrap items-baseline gap-2', className)}>
      <span className={styles.current}>{formatPrice(activeConverted)}</span>

      {compareConverted && compareConverted > activeConverted && (
        <span className={styles.compare}>{formatPrice(compareConverted)}</span>
      )}

      {showDiscountBadge && calculatedDiscount > 0 && (
        <span
          className={cn(
            'rounded-md font-black bg-rose-500 text-white shadow-2xs leading-none tracking-tight',
            styles.badge
          )}
        >
          -{calculatedDiscount}%
        </span>
      )}
    </div>
  )
}

export default ProductPrice
