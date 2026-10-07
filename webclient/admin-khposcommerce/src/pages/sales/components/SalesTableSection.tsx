import React from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowUp, ArrowDown, ArrowUpDown, RotateCcw } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import {
  TableWrapper,
  LoadingSkeleton,
  EmptyState,
  StatusBadge,
  ProductThumbnail,
  AvatarImage,
  TableActionMenu,
} from '@/components/common'
import type { Sale } from './SalesReceiptModal'
import { formatCurrency } from '@/utils/formatters'

const KHR_RATE = 4100

interface SalesTableSectionProps {
  sales: Sale[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
  onView: (sale: Sale) => void
  onPrintReceipt: (sale: Sale) => void
  onRefund: (sale: Sale) => void
}


export const SalesTableSection: React.FC<SalesTableSectionProps> = ({
  sales = [],
  isLoading,
  isFetching,
  visibleColumns,
  sortBy = 'id',
  sortOrder = 'desc',
  onSort,
  onView,
  onPrintReceipt,
  onRefund,
}) => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['sales', 'common'])

  const renderSortIcon = (columnKey: string) => {
    if (!onSort) return null
    if (sortBy === columnKey) {
      return sortOrder === 'asc' ? (
        <ArrowUp size={13} className="text-primary shrink-0 transition-transform" />
      ) : (
        <ArrowDown size={13} className="text-primary shrink-0 transition-transform" />
      )
    }
    return (
      <ArrowUpDown
        size={13}
        className="opacity-0 group-hover:opacity-60 text-muted-foreground shrink-0 transition-opacity"
      />
    )
  }

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return t('justNow', 'Just now')
    if (diffHours < 24) return `${diffHours} ${t('hoursAgo', 'hours ago')}`
    if (diffDays === 1) return t('yesterday', 'Yesterday')
    if (diffDays < 7) return `${diffDays} ${t('daysAgo', 'days ago')}`

    if (language === 'km') {
      const KHMER_MONTHS = [
        'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
        'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
      ]
      return `${d.getDate()} ${KHMER_MONTHS[d.getMonth()]} ${d.getFullYear()}`
    }

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const extractChannelName = (val: any): string => {
    if (!val) return 'cash'
    const candidates = [
      val.payment_method,
      val.paymentMethod,
      val.payment_type,
      val.channel,
      val.payment_status,
    ]
    for (const c of candidates) {
      if (!c) continue
      if (typeof c === 'string') return c
      if (typeof c === 'object') {
        const name = c.name || c.code || c.title || c.type || c.method
        if (typeof name === 'string') return name
      }
    }
    return 'cash'
  }

  const renderPaymentBadge = (sale: Sale) => {
    const m = extractChannelName(sale).toLowerCase()

    if (m.includes('khqr') || m.includes('bakong')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          {t('khqr')}
        </span>
      )
    }
    if (m.includes('bank') || m.includes('aba') || m.includes('wing') || m.includes('acleda') || m.includes('transfer')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
          {t('bankTransfer', 'Bank Transfer')}
        </span>
      )
    }
    if (m.includes('card') || m.includes('credit')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          {t('card', 'Card')}
        </span>
      )
    }
    if (m.includes('cash')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {t('cash', 'Cash')}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
        {t('pos', 'POS')}
      </span>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        {/* ── 1. RESPONSIVE MOBILE CARD LIST (< md) ────────────────────── */}
        <div className="block md:hidden">


          {/* Loading Skeleton for Mobile Cards */}
          {isLoading ? (
            <div className="p-3.5 space-y-3">
              {[1, 2, 3, 4].map((skeletonIndex) => (
                <div
                  key={skeletonIndex}
                  className="p-3.5 rounded-2xl border border-border/80 bg-card space-y-3 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-28 bg-muted rounded-md" />
                    <div className="h-5 w-16 bg-muted rounded-full" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-muted rounded-xl shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-3 w-1/2 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border/50">
                    <div className="h-5 w-24 bg-muted rounded" />
                    <div className="h-7 w-20 bg-muted rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : sales.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {t('noSalesOrdersFound', 'No orders found matching your criteria.')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {sales.map((sale) => {
                const items =
                  sale.items ||
                  (sale as any)?.sale_items ||
                  (sale as any)?.details ||
                  []
                const firstItem = items[0]
                const firstItemImg =
                  firstItem?.product?.primary_image ||
                  firstItem?.product?.image ||
                  firstItem?.variant?.image ||
                  firstItem?.image ||
                  (firstItem as any)?.product_image
                const firstItemName =
                  firstItem?.product_name ||
                  firstItem?.product?.name ||
                  t('items', 'Sale Items')
                const totalQty = items.reduce(
                  (totalQuantity: number, item: any) => totalQuantity + Number(item.quantity || 1),
                  0
                )
                const total = Number(sale.grand_total || 0)

                return (
                  <div
                    key={sale.id}
                    onClick={() => onView(sale)}
                    className="p-3.5 space-y-3 cursor-pointer transition-colors hover:bg-muted/30 active:bg-muted/60"
                  >
                    {/* Header: Invoice Number + Date + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 dark:bg-primary/15 px-2 py-0.5 rounded-md truncate">
                          {sale.invoice_number || `#${sale.id}`}
                        </span>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          • {formatRelativeTime(sale.created_at || sale.date)}
                        </span>
                      </div>

                      <StatusBadge status={sale.status} rounded="full" />
                    </div>

                    {/* Content: Thumbnail + Products Info + Customer */}
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <ProductThumbnail
                          name={firstItemName}
                          image={firstItemImg}
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
                          {firstItem?.quantity || 1}×
                          {items.length > 1 && ` +${items.length - 1} ${t('moreItems')}`} ({Math.round(totalQty)} {language === 'km' ? 'មុខ' : 'pcs'})
                        </p>

                        {/* Customer Info */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <AvatarImage
                            src={sale.customer?.photo || sale.customer?.avatar}
                            id={sale.customer?.id}
                            name={sale.customer?.name || t('walkInCustomer', 'Walk-in Customer')}
                            fallbackAvatar={true}
                            alt={sale.customer?.name || 'Customer'}
                            fallbackText={sale.customer?.name || 'Walk-in'}
                            size="xs"
                            shape="circle"
                            className="w-[20px] h-[20px]"
                            preview={true}
                          />
                          <span className="text-xs text-foreground font-medium truncate">
                            {sale.customer?.name || t('walkInCustomer', 'Walk-in Customer')}
                          </span>
                          {sale.customer?.phone && (
                            <span className="text-[11px] text-muted-foreground font-mono">
                              • {sale.customer.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer: Amount & Payment on Left, Quick Action Buttons on Right */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        {renderPaymentBadge(sale)}
                        <div>
                          <span className="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(total)}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono ml-1.5">
                            {formatCurrency(total * KHR_RATE, 'KHR')}
                          </span>
                        </div>
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu
                          variant="inline"
                          buttonSize="sm"
                          onView={() => onView(sale)}
                          viewLabel={t('common.view', 'View Order Details')}
                          onPrint={() => onPrintReceipt(sale)}
                          printLabel={t('printReceipt', 'Print Receipt')}
                          items={
                            sale.status !== 'refunded' && sale.status !== 'cancelled'
                              ? [
                                  {
                                    label: t('refund', 'Refund Order'),
                                    icon: RotateCcw,
                                    onClick: () => onRefund(sale),
                                    variant: 'danger',
                                  },
                                ]
                              : []
                          }
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── 2. DESKTOP DATA TABLE (hidden md:block) ──────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-muted/40 sticky top-0 border-b border-border z-10 select-none">
              <tr>

                {visibleColumns.image !== false && (
                  <th className="w-12 text-center">{t('colPhoto', 'Photo')}</th>
                )}

                {visibleColumns.items !== false && (
                  <th className="min-w-[200px]">
                    <div className="flex items-center gap-1.5">
                      <span>{t('itemsAndSummary', 'Product / Items')}</span>
                    </div>
                  </th>
                )}

                {visibleColumns.invoice_number !== false && (
                  <th
                    onClick={() => onSort?.('invoice_number')}
                    className="cursor-pointer hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('invoiceNumber', 'Invoice #')}</span>
                      {renderSortIcon('invoice_number')}
                    </div>
                  </th>
                )}

                {visibleColumns.customer !== false && (
                  <th className="min-w-[170px]">
                    <div className="flex items-center gap-1.5">
                      <span>{t('customer', 'Customer')}</span>
                    </div>
                  </th>
                )}

                {visibleColumns.payment_method !== false && (
                  <th>
                    <div className="flex items-center gap-1.5">
                      <span>{t('paymentMethod', 'Payment')}</span>
                    </div>
                  </th>
                )}

                {visibleColumns.grand_total !== false && (
                  <th
                    onClick={() => onSort?.('grand_total')}
                    className="cursor-pointer hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('grandTotal', 'Total')}</span>
                      {renderSortIcon('grand_total')}
                    </div>
                  </th>
                )}

                {visibleColumns.status !== false && (
                  <th
                    onClick={() => onSort?.('status')}
                    className="cursor-pointer hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('status', 'Status')}</span>
                      {renderSortIcon('status')}
                    </div>
                  </th>
                )}

                {visibleColumns.created_at !== false && (
                  <th
                    onClick={() => onSort?.('created_at')}
                    className="cursor-pointer hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('date', 'Date')}</span>
                      {renderSortIcon('created_at')}
                    </div>
                  </th>
                )}

                <th className="text-right">{t('colActions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={9} />
              ) : sales.length === 0 ? (
                <EmptyState
                  cols={9}
                  message={t('noSalesOrdersFound', 'No orders found matching your criteria.')}
                />
              ) : (
                sales.map((sale) => {
                  const items =
                    sale.items ||
                    (sale as any)?.sale_items ||
                    (sale as any)?.details ||
                    []
                  const firstItem = items[0]
                  const firstItemImg =
                    firstItem?.product?.primary_image ||
                    firstItem?.product?.image ||
                    firstItem?.variant?.image ||
                    firstItem?.image ||
                    (firstItem as any)?.product_image
                  const firstItemName =
                    firstItem?.product_name ||
                    firstItem?.product?.name ||
                    t('items', 'Sale Items')
                  const totalQty = items.reduce(
                    (totalQuantity: number, item: any) => totalQuantity + Number(item.quantity || 1),
                    0
                  )
                  const total = Number(sale.grand_total || 0)

                  return (
                    <tr
                      key={sale.id}
                      className="hover:bg-muted/40 transition-colors"
                    >

                      {visibleColumns.image !== false && (
                        <td
                          onClick={() => onView(sale)}
                          className="cursor-pointer text-center"
                          title={t('common.view', 'View')}
                        >
                          <div className="flex justify-center">
                            <ProductThumbnail
                              name={firstItemName}
                              primaryImage={firstItem?.product?.primary_image}
                              image={firstItemImg}
                              categoryName={firstItem?.product?.category?.name}
                              size="sm"
                            />
                          </div>
                        </td>
                      )}

                      {visibleColumns.items !== false && (
                        <td onClick={() => onView(sale)} className="cursor-pointer">
                          <p
                            className="font-bold text-foreground hover:text-primary transition-colors text-sm line-clamp-1"
                            title={firstItemName}
                          >
                            {firstItemName}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-medium">
                            {items.length > 1
                              ? `${Math.round(firstItem?.quantity || 1)}× +${
                                  items.length - 1
                                } ${t('moreItems')} (${Math.round(
                                  totalQty
                                )} ${language === 'km' ? 'មុខ' : 'pcs'})`
                              : `${Math.round(firstItem?.quantity || 1)}× (${Math.round(
                                  totalQty
                                )} ${language === 'km' ? 'មុខ' : 'pcs'})`}
                          </p>
                        </td>
                      )}

                      {visibleColumns.invoice_number !== false && (
                        <td>
                          <span
                            onClick={() => onView(sale)}
                            className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer inline-block"
                            title={sale.invoice_number}
                          >
                            #{sale.invoice_number}
                          </span>
                        </td>
                      )}

                      {visibleColumns.customer !== false && (
                        <td>
                          <div className="flex items-center gap-2.5">
                            <AvatarImage
                              src={sale.customer?.photo || sale.customer?.avatar}
                              id={sale.customer?.id}
                              name={
                                sale.customer?.name ||
                                t('walkInCustomer', 'Walk-in Customer')
                              }
                              fallbackAvatar={true}
                              size="sm"
                              shape="circle"
                              preview={true}
                            />
                            <div className="min-w-0">
                              <span
                                className="font-semibold text-xs text-foreground block truncate max-w-[140px]"
                                title={
                                  sale.customer?.name ||
                                  t('walkInCustomer', 'Walk-in Customer')
                                }
                              >
                                {sale.customer?.name ||
                                  t('walkInCustomer', 'Walk-in Customer')}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono block truncate max-w-[140px]">
                                {sale.customer?.phone ||
                                  (sale.cashier?.name
                                    ? `${t('cashier', 'Cashier')}: ${sale.cashier.name.replace(
                                        /\s*\(system\)/i,
                                        ''
                                      )}`
                                    : t('walkInCustomer', 'Walk-in Customer'))}
                              </span>
                            </div>
                          </div>
                        </td>
                      )}

                      {visibleColumns.payment_method !== false && (
                        <td>{renderPaymentBadge(sale)}</td>
                      )}

                      {visibleColumns.grand_total !== false && (
                        <td>
                          <div className="font-medium">
                            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                              {formatCurrency(total)}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono block">
                              {formatCurrency(total * KHR_RATE, 'KHR')}
                            </span>
                          </div>
                        </td>
                      )}

                      {visibleColumns.status !== false && (
                        <td>
                          <StatusBadge status={sale.status} rounded="full" />
                        </td>
                      )}

                      {visibleColumns.created_at !== false && (
                        <td>
                          <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                            {formatRelativeTime(sale.created_at || sale.date)}
                          </span>
                        </td>
                      )}

                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu
                          variant="inline"
                          buttonSize="md"
                          onView={() => onView(sale)}
                          viewLabel={t('common.view', 'View Order Details')}
                          onPrint={() => onPrintReceipt(sale)}
                          printLabel={t('printReceipt', 'Print Receipt')}
                          items={
                            sale.status !== 'refunded' && sale.status !== 'cancelled'
                              ? [
                                  {
                                    label: t('refund', 'Refund Order'),
                                    icon: RotateCcw,
                                    onClick: () => onRefund(sale),
                                    variant: 'danger',
                                  },
                                ]
                              : []
                          }
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  )
}

export default SalesTableSection
