import React from 'react'
import { Badge, type BadgeProps } from '@/components/ui/Badge'

export interface OrderStatusBadgeProps {
  status: string
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

const statusMap: Record<
  string,
  { label: string; variant: BadgeProps['variant']; dotColor?: string }
> = {
  pending: { label: 'Pending', variant: 'warning', dotColor: 'bg-amber-500' },
  confirmed: { label: 'Confirmed', variant: 'primary', dotColor: 'bg-blue-500' },
  processing: { label: 'Processing', variant: 'primary', dotColor: 'bg-blue-500' },
  shipped: { label: 'Shipped', variant: 'primary', dotColor: 'bg-indigo-500' },
  delivered: { label: 'Delivered', variant: 'success', dotColor: 'bg-emerald-500' },
  completed: { label: 'Completed', variant: 'success', dotColor: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', variant: 'danger', dotColor: 'bg-rose-500' },
  refunded: { label: 'Refunded', variant: 'neutral', dotColor: 'bg-slate-500' },
  failed: { label: 'Failed', variant: 'danger', dotColor: 'bg-rose-500' },
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = 'sm',
  className,
}) => {
  const normalized = (status || 'pending').toLowerCase()
  const config = statusMap[normalized] || {
    label: status || 'Pending',
    variant: 'neutral',
  }

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot
      dotColor={config.dotColor}
      className={className}
    >
      {config.label}
    </Badge>
  )
}

export default OrderStatusBadge
