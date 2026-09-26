import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  Calendar,
  CreditCard,
  Truck,
  MapPin,
  Clock,
  Printer,
  CheckCircle2,
} from 'lucide-react'
import { useSettingsStore } from '@/stores'
import orderService from '@/services/orderService'
import type { Order } from '@/types/store'
import Spinner from '@/components/ui/Spinner'
import OrderStatusBadge from '@/components/ecommerce/OrderStatusBadge'
import { formatDateTime, formatDate } from '@/lib/utils'

export const OrderDetailPage: React.FC = () => {
  const { number } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const { formatPrice } = useSettingsStore()

  useEffect(() => {
    if (!number) return
    orderService
      .getOrderDetail(number)
      .then((data) => setOrder(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [number])

  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-12 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <span className="text-xs text-slate-400">Loading order details...</span>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-12 text-center">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Order Not Found</h3>
        <p className="text-xs text-slate-400 mb-4">The order number does not exist or has been removed.</p>
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f58220] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* ─── Header Card ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#f58220] font-semibold mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders List</span>
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono">
              #{order.order_number}
            </h2>
            <OrderStatusBadge status={order.status} size="md" />
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Placed on {formatDateTime(order.created_at)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* ─── Timeline / Status Tracker ───────────────────────────────────────── */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#f58220]" />
            <span>Order Progress Timeline</span>
          </h3>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {order.timeline.map((step, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#f58220] ring-4 ring-orange-50 dark:ring-orange-950/40 flex items-center justify-center text-white">
                  <CheckCircle2 className="w-3 h-3" />
                </span>
                <div className="text-xs font-bold text-slate-900 dark:text-white capitalize">
                  {step.status}
                </div>
                {step.comment && <div className="text-xs text-slate-400 mt-0.5">{step.comment}</div>}
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {formatDateTime(step.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Items Ordered ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Package className="w-4 h-4 text-[#f58220]" />
          <span>Items in this Order ({order.items?.length || 0})</span>
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {order.items?.map((item, idx) => (
            <div
              key={item.id || item.name || idx}
              className="py-3.5 flex items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {item.name}
                </div>
                <div className="text-slate-400">
                  Qty: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.quantity}</span>
                  {item.unit_price ? ` × ${formatPrice(item.unit_price)}` : ''}
                </div>
              </div>

              <div className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                {formatPrice(item.total || (item.unit_price || 0) * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals Summary */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900 dark:text-white font-mono">
              {formatPrice(order.subtotal || 0)}
            </span>
          </div>

          {order.discount ? (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Discount</span>
              <span className="font-mono">-{formatPrice(order.discount)}</span>
            </div>
          ) : null}

          {order.shipping_fee ? (
            <div className="flex justify-between text-slate-500">
              <span>Delivery Fee</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">
                {formatPrice(order.shipping_fee)}
              </span>
            </div>
          ) : null}

          <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
            <span className="text-base font-display">Grand Total</span>
            <span className="text-lg font-black text-[#f58220] font-mono">
              {formatPrice(order.grand_total ?? order.total ?? 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage
