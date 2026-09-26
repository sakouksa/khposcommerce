import React from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useAddToCart } from '@/hooks/useAddToCart'
import Spinner from '@/components/ui/Spinner'

export interface AddToCartButtonProps {
  productId: number
  variantId?: number | null
  quantity?: number
  variant?: 'icon' | 'button' | 'compact'
  size?: 'sm' | 'md' | 'lg'
  isOutOfStock?: boolean
  className?: string
  openDrawerOnAdd?: boolean
  label?: string
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  variantId,
  quantity = 1,
  variant = 'button',
  size = 'md',
  isOutOfStock = false,
  className,
  openDrawerOnAdd = false,
  label,
}) => {
  const { t } = useTranslation()
  const { addToCart, isAdding, isAdded } = useAddToCart({ openDrawerOnAdd })

  const loading = isAdding(productId)
  const added = isAdded(productId)

  const handleClick = (e: React.MouseEvent) => {
    if (isOutOfStock || loading) return
    addToCart(productId, quantity, variantId, e)
  }

  const defaultLabel = isOutOfStock
    ? t('product.out_of_stock', 'Out of Stock')
    : added
    ? t('product.added', 'Added!')
    : label || t('product.add_to_cart', 'Add to Cart')

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={isOutOfStock || loading}
        aria-label={defaultLabel}
        className={cn(
          'w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-md select-none cursor-pointer',
          isOutOfStock
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
            : added
            ? 'bg-emerald-600 text-white shadow-emerald-600/30'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-600/30 hover:scale-105 active:scale-95',
          className
        )}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : added ? (
          <Check className="w-4.5 h-4.5 animate-scaleIn" />
        ) : (
          <ShoppingCart className="w-4.5 h-4.5" />
        )}
      </button>
    )
  }

  const sizeClasses =
    size === 'sm'
      ? 'py-2 px-3.5 text-xs rounded-xl gap-1.5'
      : size === 'lg'
      ? 'py-3.5 px-6 text-base rounded-2xl gap-2.5'
      : 'py-2.5 px-4 text-xs sm:text-sm rounded-xl sm:rounded-2xl gap-2'

  return (
    <button
      onClick={handleClick}
      disabled={isOutOfStock || loading}
      className={cn(
        'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 select-none cursor-pointer active:scale-95 shadow-md',
        sizeClasses,
        isOutOfStock
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
          : added
          ? 'bg-emerald-600 text-white shadow-emerald-600/30'
          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-600/25',
        className
      )}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : added ? (
        <Check className="w-4 h-4" />
      ) : (
        <ShoppingCart className="w-4 h-4" />
      )}
      <span>{defaultLabel}</span>
    </button>
  )
}

export default AddToCartButton

