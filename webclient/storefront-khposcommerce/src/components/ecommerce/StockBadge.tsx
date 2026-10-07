import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { useTranslation } from 'react-i18next'

export interface StockBadgeProps {
  stock?: number
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  stock,
  size = 'xs',
  className,
}) => {
  const { t } = useTranslation()

  if (stock === undefined) return null

  if (stock <= 0) {
    return (
      <Badge
        variant="danger"
        size={size}
        dot
        dotColor="bg-rose-500"
        className={className}
      >
        {t('product.out_of_stock', 'Out of Stock')}
      </Badge>
    )
  }

  if (stock <= 5) {
    return (
      <Badge
        variant="warning"
        size={size}
        dot
        dotColor="bg-amber-500"
        className={className}
      >
        {t('product.low_stock', `Only ${stock} left`)}
      </Badge>
    )
  }

  return (
    <Badge
      variant="success"
      size={size}
      dot
      dotColor="bg-emerald-500"
      className={className}
    >
      {t('product.in_stock', 'In Stock')}
    </Badge>
  )
}

export default StockBadge
