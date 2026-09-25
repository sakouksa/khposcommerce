import React from 'react'
import { Link } from 'react-router-dom'
import { PackageCheck, Truck, ExternalLink, Calendar, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface StructuredOrder {
  id: number
  order_number: string
  status: string
  payment_status: string
  fulfillment_status?: string
  grand_total: number
  currency?: string
  created_at?: string
  shipping_method?: string
  shipping_carrier?: string
  tracking_number?: string
  estimated_delivery?: string
  items_count?: number
  items?: Array<{ name: string; quantity: number; price: number; total: number }>
}

interface OrderCardProps {
  order: StructuredOrder
  onOrderClick?: () => void
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onOrderClick }) => {
  const { t } = useTranslation()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      case 'shipped':
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'processing':
      case 'confirmed':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      case 'cancelled':
      case 'refunded':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 shadow-xs my-2 text-left w-full max-w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
          <PackageCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>#{order.order_number}</span>
        </div>

        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Details */}
      <div className="py-2.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">{t('chatbot.order.total', 'Total Amount:')}</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            ${Number(order.grand_total).toFixed(2)} {order.currency || 'USD'}
          </span>
        </div>

        {order.created_at && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {t('chatbot.order.date', 'Date:')}
            </span>
            <span>{order.created_at}</span>
          </div>
        )}

        {order.shipping_carrier && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Truck className="w-3 h-3" /> {t('chatbot.order.carrier', 'Carrier:')}
            </span>
            <span>{order.shipping_carrier}</span>
          </div>
        )}

        {order.tracking_number && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{t('chatbot.order.tracking_no', 'Tracking #:')}</span>
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px] text-blue-600 dark:text-blue-400">
              {order.tracking_number}
            </code>
          </div>
        )}

        {order.payment_status && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> {t('chatbot.order.payment', 'Payment:')}
            </span>
            <span className="font-medium capitalize">{order.payment_status}</span>
          </div>
        )}
      </div>

      {/* Track link */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <Link
          to={`/orders/${order.order_number}`}
          onClick={onOrderClick}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg transition-colors"
        >
          <span>{t('chatbot.order.view_tracking', 'View Full Tracking Details')}</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}

export default OrderCard
