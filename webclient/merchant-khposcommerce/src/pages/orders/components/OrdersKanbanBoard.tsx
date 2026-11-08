import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Eye,
  Printer,
  FileText,
  Phone,
  MapPin,
  ArrowRight,
  QrCode,
  CreditCard,
  Building,
} from 'lucide-react'
import { AvatarImage, ProductThumbnail } from '@/components/common'
import { useThemeStore } from '@/stores/themeStore'
import { formatCurrency, GlobalFormat } from '@/utils/formatters'
import type { Order } from './OrdersTableSection'

const KHR_RATE = 4100

interface OrdersKanbanBoardProps {
  orders: Order[]
  isLoading: boolean
  onView: (order: Order) => void
  onPrintReceipt: (order: Order) => void
  onPrintWaybill: (order: Order) => void
  onUpdateStatus: (order: Order, newStatus: string) => void
}

interface ColumnConfig {
  id: string
  titleKh: string
  titleEn: string
  icon: any
  dotColor: string
  columnBg: string
  borderColor: string
  nextStatus?: string
  nextLabelKh?: string
  nextLabelEn?: string
  nextIcon?: any
}

export const OrdersKanbanBoard: React.FC<OrdersKanbanBoardProps> = ({
  orders,
  isLoading,
  onView,
  onPrintReceipt,
  onPrintWaybill,
  onUpdateStatus,
}) => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['orders', 'sales', 'common'])

  const columns: ColumnConfig[] = [
    {
      id: 'pending',
      titleKh: 'Order ថ្មី / រង់ចាំ',
      titleEn: 'New / Pending',
      icon: Clock,
      dotColor: 'bg-amber-500',
      columnBg: 'bg-amber-500/5',
      borderColor: 'border-amber-500/20',
      nextStatus: 'processing',
      nextLabelKh: 'វេចខ្ចប់',
      nextLabelEn: 'Pack',
      nextIcon: Package,
    },
    {
      id: 'processing',
      titleKh: 'កំពុងរៀបចំវេចខ្ចប់',
      titleEn: 'Processing / Packing',
      icon: Package,
      dotColor: 'bg-blue-500',
      columnBg: 'bg-blue-500/5',
      borderColor: 'border-blue-500/20',
      nextStatus: 'shipped',
      nextLabelKh: 'ប្រគល់ឱ្យអ្នកដឹក',
      nextLabelEn: 'Dispatch',
      nextIcon: Truck,
    },
    {
      id: 'shipped',
      titleKh: 'កំពុងដឹកជញ្ជូន',
      titleEn: 'Out for Delivery',
      icon: Truck,
      dotColor: 'bg-purple-500',
      columnBg: 'bg-purple-500/5',
      borderColor: 'border-purple-500/20',
      nextStatus: 'completed',
      nextLabelKh: 'ដឹកដល់',
      nextLabelEn: 'Delivered',
      nextIcon: CheckCircle2,
    },
    {
      id: 'completed',
      titleKh: 'បានដឹកដល់ & បញ្ចប់',
      titleEn: 'Delivered & Completed',
      icon: CheckCircle2,
      dotColor: 'bg-emerald-500',
      columnBg: 'bg-emerald-500/5',
      borderColor: 'border-emerald-500/20',
    },
  ]

  // Group orders into columns
  const groupedOrders = useMemo(() => {
    const groups: Record<string, Order[]> = {
      pending: [],
      processing: [],
      shipped: [],
      completed: [],
    }

    orders.forEach((order) => {
      const s = order.status?.toLowerCase() || 'pending'
      if (groups[s]) {
        groups[s].push(order)
      } else if (s === 'delivered') {
        groups.completed.push(order)
      } else if (s === 'confirmed') {
        groups.processing.push(order)
      } else {
        // Uncategorized or cancelled
        groups.pending.push(order)
      }
    })

    return groups
  }, [orders])

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '—'
    const parsedDate = new Date(dateString)
    if (isNaN(parsedDate.getTime())) return dateString
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60))
    if (diffHours < 1) return language === 'km' ? 'អម្បាញ់មិញ' : 'Just now'
    if (diffHours < 24) return `${diffHours} ${language === 'km' ? 'ម៉ោងមុន' : 'h ago'}`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} ${language === 'km' ? 'ថ្ងៃមុន' : 'd ago'}`
  }

  const renderCourierBadge = (order: Order) => {
    const name =
      order.shipping_method?.name ||
      order.shippingMethod?.name ||
      order.shipment?.carrier ||
      'VET Express'

    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border/80">
        <Truck size={10} className="text-primary shrink-0" />
        <span className="truncate max-w-[110px]">{name}</span>
      </span>
    )
  }

  const renderPaymentBadge = (order: Order) => {
    const isPaid = order.payment_status === 'paid'
    const methodStr = (order.payment_method || 'KHQR').toUpperCase()

    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
          isPaid
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        <span>{isPaid ? 'PAID' : 'COD'}</span>
      </span>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 select-none pb-4 items-start">
      {columns.map((col) => {
        const colOrders = groupedOrders[col.id] || []
        const totalAmount = colOrders.reduce(
          (sum, o) => sum + Number(o.grand_total ?? o.total_amount ?? 0),
          0
        )
        const ColIcon = col.icon

        return (
          <div
            key={col.id}
            className={`flex flex-col rounded-2xl border ${col.borderColor} ${col.columnBg} p-3.5 min-h-[500px] transition-all`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor} shadow-xs`} />
                <span className="font-bold text-sm text-foreground">
                  {language === 'km' ? col.titleKh : col.titleEn}
                </span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-background/80 text-foreground border border-border/60 shadow-2xs">
                  {colOrders.length}
                </span>
              </div>
              <div className="font-mono text-xs font-semibold text-muted-foreground">
                {formatCurrency(totalAmount, 'USD')}
              </div>
            </div>

            {/* Orders Cards List */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-0.5">
              {colOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/60 border border-dashed border-border/60 rounded-xl">
                  <ColIcon size={24} className="mb-2 opacity-40" />
                  <span className="text-xs">
                    {language === 'km' ? 'គ្មានការបញ្ជាទិញទេ' : 'No orders in this stage'}
                  </span>
                </div>
              ) : (
                colOrders.map((order) => {
                  const items =
                    order.items || (order as any)?.details || (order as any)?.order_items || []
                  const firstItem = items[0]
                  const totalUSD = Number(order.grand_total ?? order.total_amount ?? 0)
                  const totalKHR = Math.round(totalUSD * KHR_RATE)
                  const customerName =
                    order.customer?.name || order.shipping_name || 'Customer'
                  const rawCustomerPhone =
                    order.customer?.phone || order.shipping_phone
                  const customerPhone = rawCustomerPhone ? GlobalFormat.phone(rawCustomerPhone) : '—'
                  const destinationCity =
                    order.shipping_city || order.shipping_province || 'Phnom Penh'

                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-card text-card-foreground p-3.5 rounded-xl border border-border/80 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all cursor-pointer space-y-3"
                      onClick={() => onView(order)}
                    >
                      {/* Top Row: Order # & Time */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                          #{order.order_number || `ORD-${order.id}`}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {formatRelativeTime(order.created_at)}
                        </span>
                      </div>

                      {/* Customer Row */}
                      <div className="flex items-center gap-2.5">
                        <AvatarImage
                          src={order.customer?.photo || order.customer?.avatar}
                          name={customerName}
                          size="sm"
                          shape="circle"
                          fallbackAvatar={true}
                          preview={false}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-foreground truncate">
                            {customerName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono mt-0.5">
                            <span className="truncate">{customerPhone}</span>
                            <span>•</span>
                            <span className="truncate text-foreground/80 font-medium">
                              {destinationCity}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Items Preview */}
                      {firstItem && (
                        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/40 border border-border/50 text-[11px]">
                          <ProductThumbnail
                            name={firstItem.product_name || firstItem.product?.name || 'Item'}
                            image={
                              firstItem.product?.primary_image ||
                              firstItem.product_image ||
                              firstItem.product?.primaryImage?.url
                            }
                            size="sm"
                            className="rounded-md shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-foreground">
                              {firstItem.product_name || firstItem.product?.name || 'Item'}
                            </div>
                            <div className="text-muted-foreground font-mono text-[10px]">
                              {items.length > 1
                                ? `+${items.length - 1} ${language === 'km' ? 'មុខទំនិញទៀត' : 'more items'}`
                                : `Qty: ${Number(firstItem.quantity || 1)}`}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Courier & Payment Badges */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {renderCourierBadge(order)}
                          {renderPaymentBadge(order)}
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-xs font-bold text-foreground">
                            {formatCurrency(totalUSD, 'USD')}
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            {formatCurrency(totalKHR, 'KHR')}
                          </div>
                        </div>
                      </div>

                      {/* Actions Footer */}
                      <div
                        className="flex items-center justify-between gap-1 pt-2 border-t border-border/40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Print & View Tools */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onPrintWaybill(order)}
                            title={language === 'km' ? 'បោះពុម្ពស្លាកដឹក' : 'Print Waybill'}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <FileText size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onPrintReceipt(order)}
                            title={language === 'km' ? 'បោះពុម្ពវិក្កយបត្រ' : 'Print Receipt'}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Printer size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onView(order)}
                            title={language === 'km' ? 'មើលលម្អិត' : 'View Detail'}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Eye size={13} />
                          </button>
                        </div>

                        {/* Quick Status Forward Button */}
                        {col.nextStatus && (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(order, col.nextStatus!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs transition-transform active:scale-95"
                          >
                            <span>
                              {language === 'km' ? col.nextLabelKh : col.nextLabelEn}
                            </span>
                            <ArrowRight size={11} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default OrdersKanbanBoard
