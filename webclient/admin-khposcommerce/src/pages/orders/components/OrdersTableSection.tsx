import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Eye,
  Printer,
  CheckCircle2,
  Truck,
  Package,
  FileText,
} from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import {
  DataTable,
  type Column,
  StatusBadge,
  ProductThumbnail,
  AvatarImage,
  TableActionMenu,
} from '@/components/common'
import { formatCurrency, GlobalFormat } from '@/utils/formatters'

const KHR_RATE = 4100

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_image?: string
  quantity: number
  unit_price: number
  subtotal: number
  product?: {
    name?: string
    image?: string
    primary_image?: string
    category?: { name?: string }
  }
}

export interface Order {
  id: number
  order_number: string
  customer_name?: string
  customer?: any
  shipping_name?: string
  customer_phone?: string
  customer_email?: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | string
  payment_status: 'paid' | 'unpaid' | 'refunded' | string
  payment_method?: string
  fulfillment_status?: 'unfulfilled' | 'fulfilled' | 'partial' | string
  shipping_address?: string
  shipping_city?: string
  shipping_province?: string
  shipping_method?: any
  shippingMethod?: any
  payments?: any[]
  shipment?: any
  total_amount?: number
  grand_total?: number
  subtotal?: number
  tax_amount?: number
  discount_amount?: number
  shipping_fee?: number
  shipping_cost?: number
  notes?: string
  created_at: string
  items?: OrderItem[]
  [key: string]: any
}

interface OrdersTableSectionProps {
  orders: Order[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
  onView: (order: Order) => void
  onPrintReceipt: (order: Order) => void
  onPrintWaybill?: (order: Order) => void
  onUpdateStatus?: (order: Order) => void
  onQuickStatusChange?: (order: Order, newStatus: string) => void
}

export const OrdersTableSection: React.FC<OrdersTableSectionProps> = ({
  orders = [],
  isLoading,
  isFetching,
  visibleColumns,
  sortBy = 'id',
  sortOrder = 'desc',
  onSort,
  onView,
  onPrintReceipt,
  onPrintWaybill,
  onUpdateStatus,
  onQuickStatusChange,
}) => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['orders', 'sales', 'common'])

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '—'
    const parsedDate = new Date(dateString)
    if (isNaN(parsedDate.getTime())) return dateString
    const now = new Date()
    const diffMilliseconds = now.getTime() - parsedDate.getTime()
    const diffHours = Math.floor(diffMilliseconds / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return t('justNow', 'Just now')
    if (diffHours < 24)
      return `${diffHours} ${t('hoursAgo', 'hours ago')}`
    if (diffDays === 1) return t('yesterday', 'Yesterday')
    if (diffDays < 7)
      return `${diffDays} ${t('daysAgo', 'days ago')}`
    return parsedDate.toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const extractPaymentMethodName = (order: Order): string => {
    if (order.payments && order.payments.length > 0) {
      const pm = order.payments[0].paymentMethod || order.payments[0].payment_method
      if (pm?.name) return pm.name
    }
    const methodCandidates = [
      order.payment_method,
      order.paymentMethod,
      order.channel,
      order.payment_type,
    ]
    for (const candidate of methodCandidates) {
      if (!candidate) continue
      if (typeof candidate === 'string') return candidate
      if (typeof candidate === 'object') {
        const name =
          candidate.name ||
          candidate.code ||
          candidate.title ||
          candidate.type ||
          candidate.method
        if (typeof name === 'string') return name
      }
    }
    return 'Bakong KHQR'
  }

  const renderPaymentBadge = (order: Order) => {
    const rawMethod = extractPaymentMethodName(order)
    const method = rawMethod.toLowerCase()
    const isPaid = order.payment_status === 'paid'

    let methodLabel = rawMethod

    if (
      method.includes('aba') ||
      method.includes('khqr') ||
      method.includes('bakong') ||
      method.includes('qr')
    ) {
      methodLabel = 'Bakong KHQR'
    } else if (method.includes('wing')) {
      methodLabel = 'Wing Bank'
    } else if (
      method.includes('card') ||
      method.includes('credit') ||
      method.includes('visa') ||
      method.includes('master')
    ) {
      methodLabel = t('methodCard', 'Credit Card')
    } else if (method.includes('cod') || method.includes('cash')) {
      methodLabel = 'COD'
    }

    return (
      <div className="space-y-1">
        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted text-foreground border border-border/70">
          <span className="truncate max-w-[95px]">{methodLabel}</span>
        </span>
        <div>
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
              isPaid
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>
              {isPaid ? t('paymentStatusPaid', 'Paid') : t('unpaidCod', 'Unpaid COD')}
            </span>
          </span>
        </div>
      </div>
    )
  }

  const renderCourierBadge = (order: Order) => {
    const courierName =
      order.shipping_method?.name ||
      order.shippingMethod?.name ||
      order.shipment?.carrier ||
      t('expressCourier', 'Express Courier')
    const destinationCity =
      order.shipping_city || order.shipping_province || 'Phnom Penh'

    return (
      <div className="space-y-0.5">
        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
          <span className="truncate max-w-[120px]">{courierName}</span>
        </span>
        <div className="text-[11px] text-muted-foreground font-medium truncate max-w-[120px]">
          {destinationCity}
        </div>
      </div>
    )
  }

  const renderFulfillmentBadge = (order: Order) => {
    const status = (order.fulfillment_status || order.status || 'unfulfilled').toLowerCase()
    if (
      status === 'fulfilled' ||
      status === 'completed' ||
      status === 'delivered'
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>{t('delivered', 'Delivered')}</span>
        </span>
      )
    }
    if (status === 'shipped' || status === 'in_transit') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>{t('inTransit', 'In Transit')}</span>
        </span>
      )
    }
    if (status === 'processing' || status === 'packing') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>{t('packing', 'Packing')}</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        <span>{t('unfulfilled', 'Unfulfilled')}</span>
      </span>
    )
  }

  // ─── Columns Definition using Global DataTable standard ────────────────────
  const columns: Column<Order>[] = useMemo(() => {
    const list: (Column<Order> & { visible?: boolean })[] = [
      {
        key: 'image',
        title: t('colPhoto', 'Photo'),
        width: '68px',
        align: 'center',
        visible: visibleColumns.image !== false,
        render: (_value, order) => {
          const items =
            order.items || (order as any)?.details || (order as any)?.order_items || []
          const firstItem = items[0]
          const firstItemImage =
            firstItem?.product?.primary_image ||
            firstItem?.product?.image ||
            firstItem?.product_image ||
            firstItem?.image
          const firstItemName =
            firstItem?.product_name ||
            firstItem?.product?.name ||
            t('items', 'Order Items')
          return (
            <div
              className="flex justify-center"
              onClick={(e) => {
                e.stopPropagation()
                onView(order)
              }}
            >
              <ProductThumbnail
                name={firstItemName}
                primaryImage={firstItem?.product?.primary_image}
                image={firstItemImage}
                categoryName={firstItem?.product?.category?.name}
                size="md"
                className="rounded-xl shadow-2xs border border-border/70 hover:scale-105 transition-transform"
              />
            </div>
          )
        },
      },
      {
        key: 'items',
        title: t('itemsAndSummary', 'Product / Items'),
        visible: visibleColumns.items !== false,
        render: (_value, order) => {
          const items =
            order.items || (order as any)?.details || (order as any)?.order_items || []
          const firstItem = items[0]
          const firstItemName =
            firstItem?.product_name ||
            firstItem?.product?.name ||
            t('items', 'Order Items')
          const totalQuantity = items.reduce(
            (quantitySum: number, item: any) =>
              quantitySum + Number(item.quantity || 1),
            0
          )
          return (
            <div
              className="space-y-0.5"
              onClick={(e) => {
                e.stopPropagation()
                onView(order)
              }}
            >
              <p
                className="font-semibold text-foreground hover:text-primary transition-colors text-sm line-clamp-1 leading-snug"
                title={firstItemName}
              >
                {firstItemName}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <span>{Math.round(firstItem?.quantity || 1)}×</span>
                {items.length > 1 && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground border border-border/50">
                    +{items.length - 1} {t('moreItems', 'items')}
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground/70">• ({Math.round(totalQuantity)} pcs)</span>
              </div>
            </div>
          )
        },
      },
      {
        key: 'order_number',
        title: t('orderNumber', 'Order #'),
        sortable: true,
        visible: visibleColumns.order_number !== false,
        render: (_value, order) => (
          <span
            onClick={(e) => {
              e.stopPropagation()
              onView(order)
            }}
            className="font-mono text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md border border-primary/20 transition-colors cursor-pointer inline-block tracking-tight"
            title={order.order_number}
          >
            #{order.order_number || `ORD-${order.id}`}
          </span>
        ),
      },
      {
        key: 'customer',
        title: t('customer', 'Customer'),
        visible: visibleColumns.customer !== false,
        render: (_value, order) => {
          const customerName =
            order.customer?.name ||
            order.shipping_name ||
            t('walkInCustomer', 'Walk-in Customer')
          return (
            <div className="flex items-center gap-2.5">
              <AvatarImage
                src={order.customer?.photo || order.customer?.avatar}
                id={order.customer?.id}
                name={customerName}
                fallbackAvatar={true}
                size="sm"
                shape="circle"
                preview={false}
              />
              <div className="min-w-0">
                <span
                  className="font-medium text-xs text-foreground block truncate max-w-[150px] leading-tight"
                  title={customerName}
                >
                  {customerName}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono block truncate max-w-[150px] mt-0.5">
                  {order.customer?.phone || order.customer_phone || order.shipping_phone
                    ? GlobalFormat.phone(order.customer?.phone || order.customer_phone || order.shipping_phone)
                    : '—'}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        key: 'courier',
        title: t('courier', 'Courier & Destination'),
        visible: visibleColumns.courier !== false,
        render: (_value, order) => renderCourierBadge(order),
      },
      {
        key: 'payment_method',
        title: t('paymentMethod', 'Payment'),
        visible: visibleColumns.payment_method !== false,
        render: (_value, order) => renderPaymentBadge(order),
      },
      {
        key: 'grand_total',
        title: t('grandTotal', 'Total'),
        sortable: true,
        visible: visibleColumns.grand_total !== false,
        render: (_value, order) => {
          const totalAmount = Number(order.grand_total ?? order.total_amount ?? 0)
          return (
            <div className="space-y-0.5">
              <span className="font-mono text-xs font-bold text-foreground block">
                {formatCurrency(totalAmount, 'USD')}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono block">
                {formatCurrency(totalAmount * KHR_RATE, 'KHR')}
              </span>
            </div>
          )
        },
      },
      {
        key: 'fulfillment',
        title: t('fulfillment', 'Fulfillment'),
        visible: visibleColumns.fulfillment !== false,
        render: (_value, order) => renderFulfillmentBadge(order),
      },
      {
        key: 'status',
        title: t('status', 'Status'),
        sortable: true,
        visible: visibleColumns.status !== false,
        render: (_value, order) => <StatusBadge status={order.status} rounded="full" />,
      },
      {
        key: 'created_at',
        title: t('date', 'Date'),
        sortable: true,
        visible: visibleColumns.created_at !== false,
        render: (_value, order) => {
          const date = order.created_at ? new Date(order.created_at) : null
          const formattedDate =
            date && !isNaN(date.getTime())
              ? date.toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'
          return (
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-foreground block whitespace-nowrap">
                {formattedDate}
              </span>
              <span className="text-[11px] text-muted-foreground block whitespace-nowrap">
                {formatRelativeTime(order.created_at)}
              </span>
            </div>
          )
        },
      },
      {
        key: 'actions',
        title: t('colActions', 'Actions'),
        align: 'right',
        render: (_value, order) => {
          const s = (order.status || 'pending').toLowerCase()
          let nextTransition: { status: string; label: string; icon: any } | null = null
          if (s === 'pending') {
            nextTransition = {
              status: 'processing',
              label: t('pack', 'Pack'),
              icon: Package,
            }
          } else if (s === 'processing' || s === 'confirmed') {
            nextTransition = {
              status: 'shipped',
              label: t('ship', 'Ship'),
              icon: Truck,
            }
          } else if (s === 'shipped') {
            nextTransition = {
              status: 'completed',
              label: t('deliver', 'Deliver'),
              icon: CheckCircle2,
            }
          }

          return (
            <div
              className="flex items-center justify-end"
              onClick={(e) => e.stopPropagation()}
            >
              <TableActionMenu
                variant="hybrid"
                maxInline={2}
                buttonSize="sm"
                align="right"
                onView={() => onView(order)}
                viewLabel={t('common:viewDetails', 'View Details')}
                onPrint={() => onPrintReceipt(order)}
                printLabel={t('printReceipt', 'Print Receipt')}
                items={[
                  ...(onPrintWaybill
                    ? [
                        {
                          label: t('printWaybillLabel', 'Print Waybill Label'),
                          icon: FileText,
                          onClick: () => onPrintWaybill(order),
                        },
                      ]
                    : []),
                  ...(nextTransition && onQuickStatusChange
                    ? [
                        {
                          label: `${t('moveTo', 'Move to:')} ${nextTransition.label}`,
                          icon: nextTransition.icon,
                          onClick: () => onQuickStatusChange(order, nextTransition!.status),
                          variant: 'success' as const,
                        },
                      ]
                    : []),
                  ...(onUpdateStatus &&
                  order.status !== 'completed' &&
                  order.status !== 'cancelled'
                    ? [
                        {
                          label: t('updateStatus', 'Update Status'),
                          icon: CheckCircle2,
                          onClick: () => onUpdateStatus(order),
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          )
        },
      },
    ]

    return list.filter((column) => column.visible !== false)
  }, [visibleColumns, language, t, onView, onPrintReceipt, onPrintWaybill, onUpdateStatus, onQuickStatusChange])

  // ─── Responsive Mobile Card View (< md) ──────────────────────────────────
  const renderMobileCard = (order: Order) => {
    const items =
      order.items || (order as any)?.details || (order as any)?.order_items || []
    const firstItem = items[0]
    const firstItemImage =
      firstItem?.product?.primary_image ||
      firstItem?.product?.image ||
      firstItem?.product_image ||
      firstItem?.image
    const firstItemName =
      firstItem?.product_name ||
      firstItem?.product?.name ||
      t('items', 'Order Items')
    const totalQuantity = items.reduce(
      (quantitySum: number, item: any) => quantitySum + Number(item.quantity || 1),
      0
    )
    const totalAmount = Number(order.grand_total ?? order.total_amount ?? 0)

    return (
      <div
        onClick={() => onView(order)}
        className="p-3.5 space-y-3 cursor-pointer transition-colors hover:bg-muted/30 active:bg-muted/60"
      >
        {/* Header: Order Number + Time + Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 dark:bg-primary/15 px-2 py-0.5 rounded-md truncate">
              #{order.order_number || `ORD-${order.id}`}
            </span>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
              • {formatRelativeTime(order.created_at)}
            </span>
          </div>
          <StatusBadge status={order.status} rounded="full" />
        </div>

        {/* Content: Thumbnail + Products Info + Customer */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <ProductThumbnail
              name={firstItemName}
              primaryImage={firstItem?.product?.primary_image}
              image={firstItemImage}
              categoryName={firstItem?.product?.category?.name}
              size="md"
              className="rounded-xl shadow-2xs"
            />
            {items.length > 1 && (
              <span className="absolute -bottom-1 -right-1 bg-foreground text-background text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-2xs">
                +{items.length - 1}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs font-semibold text-foreground truncate leading-snug">
              {firstItemName}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono">
              {Math.round(firstItem?.quantity || 1)}×
              {items.length > 1 &&
                ` +${items.length - 1} ${t(
                  'moreItems',
                  'more items'
                )}`}
              ({Math.round(totalQuantity)} pcs)
            </p>

            <div className="flex items-center gap-1.5 pt-0.5">
              <AvatarImage
                src={order.customer?.photo || order.customer?.avatar}
                id={order.customer?.id}
                name={
                  order.customer?.name ||
                  order.shipping_name ||
                  t('customer', 'Customer')
                }
                fallbackAvatar={true}
                size="xs"
                shape="circle"
              />
              <span className="text-xs font-medium text-foreground truncate">
                {order.customer?.name ||
                  order.shipping_name ||
                  t('customer', 'Customer')}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom: Payment + Total + Action Buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <div className="flex items-center gap-2">
            {renderPaymentBadge(order)}
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalAmount, 'USD')}
            </span>
          </div>
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onView(order)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={t('common:viewDetails', 'View Details')}
            >
              <Eye size={15} />
            </button>
            <button
              type="button"
              onClick={() => onPrintReceipt(order)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={t('printReceipt', 'Print Receipt')}
            >
              <Printer size={15} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DataTable<Order>
      columns={columns}
      data={orders}
      rowKey="id"
      loading={isLoading}
      isFetching={isFetching}
      sortKey={sortBy}
      sortDir={sortOrder}
      onSort={onSort}
      onRowClick={(order) => onView(order)}
      emptyText={t('noOrdersFound', 'No web orders found matching your criteria.')}
      renderMobileCard={renderMobileCard}
    />
  )
}

export default OrdersTableSection
