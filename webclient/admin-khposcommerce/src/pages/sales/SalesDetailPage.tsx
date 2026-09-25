import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Receipt,
  ArrowLeft,
  Printer,
  Mail,
  Phone,
  MessageSquare,
  User as UserIcon,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Copy,
  ExternalLink,
  Sparkles,
  Building2,
  CreditCard,
  Package,
  Truck,
  FileText,
  BadgeCheck,
} from 'lucide-react'
import { salesService } from '@/services/salesService'
import { orderService } from '@/services/orderService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import { useThemeStore } from '@/stores/themeStore'
import {
  Breadcrumb,
  StatusBadge,
  ProductThumbnail,
  AvatarImage,
  LoadingSpinner,
  FormHeader,
  FormHeaderButton,
} from '@/components/common'
import { SalesReceiptModal, type Sale } from './components/SalesReceiptModal'
import { ProcessRefundModal } from './components/ProcessRefundModal'
import { formatCurrency, GlobalFormat } from '@/utils/formatters'

const KHR_RATE = 4100

export const SalesDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { language } = useThemeStore()
  const { t } = useTranslation(['sales', 'orders', 'common'])
  const toast = useToast()
  const qc = useQueryClient()

  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Fetch sale or fallback to order
  const {
    data: sale,
    isLoading,
    isError,
  } = useQuery<Sale | null>({
    queryKey: ['sales-detail', id],
    queryFn: async () => {
      if (!id) return null
      try {
        const salesDetailResponse = await salesService.show(id)
        return salesDetailResponse
      } catch (error) {
        // Fallback check order service if it's an online order ID
        try {
          const orderResponse = await orderService.show(id)
          if (orderResponse) {
            return {
              ...orderResponse,
              invoice_number: orderResponse.order_number || `ORD-${orderResponse.id}`,
              date: orderResponse.created_at,
            } as any
          }
        } catch {
          // Both failed
        }
        throw error
      }
    },
    enabled: !!id,
  })

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldKey)
    sound.playSuccess()
    toast.success(t('copiedToClipboard', 'Copied to clipboard!'))
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Format localized date
  const formatFullDateTime = (dateStr?: string) => {
    if (!dateStr) return '—'
    const parsedDate = new Date(dateStr)
    if (isNaN(parsedDate.getTime())) return dateStr
    return parsedDate.toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatShortTime = (dateStr?: string, addMinutes: number = 0) => {
    if (!dateStr) return '12:00'
    const parsedDate = new Date(dateStr)
    if (isNaN(parsedDate.getTime())) return '12:00'
    if (addMinutes > 0) {
      parsedDate.setMinutes(parsedDate.getMinutes() + addMinutes)
    }
    return parsedDate.toLocaleTimeString(language === 'km' ? 'km-KH' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          {t('loadingOrderDetails', 'Loading order details...')}
        </p>
      </div>
    )
  }

  if (isError || !sale) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-500">
          <AlertCircle size={36} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {t('orderNotFound', 'Order Not Found')}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            {t(
              'orderNotFoundDesc',
              'The requested sale transaction or order ID does not exist or has been removed.'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/sales')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>{t('backToOrders', 'Back to Sales Orders')}</span>
        </button>
      </div>
    )
  }

  // Raw data mapping
  const items = sale.items || (sale as any)?.sale_items || (sale as any)?.details || []
  const customer = sale.customer
  const cashier = sale.cashier
  const grandTotal = Number(sale.grand_total || 0)
  const subtotal = Number(sale.subtotal || grandTotal * 0.9)
  const taxAmount = Number(sale.tax_amount || 0)
  const discountAmount = Number(sale.discount_amount || 0)
  const status = String(sale.status || 'completed').toLowerCase()
  const isRefunded = status === 'refunded'
  const isCancelled = status === 'cancelled'
  const paidAmount =
    sale.paid_amount !== undefined && sale.paid_amount !== null
      ? Number(sale.paid_amount)
      : isCancelled
      ? 0
      : grandTotal
  const changeAmount = Number(sale.change_amount || 0)
  const invoiceNumber = sale.invoice_number || (sale as any).order_number || `ORD-${sale.id}`
  const orderDate = sale.date || sale.created_at

  // Safely extract payment channel
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

  const channel = extractChannelName(sale).toLowerCase()

  const formatPaymentMethod = (method: string): string => {
    const m = (method || '').toLowerCase()
    if (m.includes('card') || m.includes('visa') || m.includes('master')) {
      return t('creditDebitCardFull', 'Credit / Debit Card (VISA/MC)')
    }
    if (m.includes('truemoney')) {
      return t('truemoneyWallet', 'TrueMoney Wallet')
    }
    if (m.includes('cash')) {
      return t('cash', 'Cash')
    }
    if (m.includes('khqr') || m.includes('bakong')) {
      return t('khqr', 'KHQR (Bakong)')
    }
    if (m.includes('aba')) {
      return 'ABA PAY'
    }
    if (m.includes('bank')) {
      return t('bankTransfer', 'Bank Transfer')
    }
    return (method || 'CASH').toUpperCase()
  }

  const customerName = customer?.name || t('walkInCustomer', 'Walk-in Customer')
  const rawPhone = customer?.phone || (sale as any).shipping_phone
  const customerPhone = rawPhone ? GlobalFormat.phone(rawPhone) : '—'
  const customerEmail = customer?.email ? GlobalFormat.email(customer?.email) : '—'
  const customerAddress =
    customer?.address ||
    (sale as any).shipping_address ||
    t('inStorePickup', 'In-Store POS / Store Counter Pickup')
  const orderNotes = sale.notes || (sale as any).customer_notes || null

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* ── 0. BREADCRUMBS (STANDALONE OUTSIDE ABOVE HEADER) ─────────────────── */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: t('nav.salesManagement', 'Sales Management'), path: '/sales' },
            { label: t('salesOrders', 'Orders'), path: '/sales' },
            { label: `${t('order', 'Order')} #${invoiceNumber}` },
          ]}
        />
      </div>

      {/* ── 1. GLOBAL FORM HEADER ── */}
      <div className="print:hidden">
        <FormHeader
          frameless
          title={
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <span className="font-mono text-base sm:text-lg md:text-xl font-bold tracking-tight">
                {t('order', 'Order')} #{invoiceNumber}
              </span>
              {(sale.store?.name || sale.company?.name) && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] sm:text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 shrink-0">
                  <Building2 size={12} className="shrink-0" />
                  {sale.store?.name || sale.company?.name}
                </span>
              )}
            </div>
          }
          subtitle={
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-muted-foreground/70 shrink-0" />
              <span>{formatFullDateTime(orderDate)}</span>
            </span>
          }
          showBack={true}
          backPath="/sales"
          backLabel={t('common.back', 'Back')}
          statusBadge={<StatusBadge status={sale.status} rounded="full" />}
          extraActions={
            <>
              {/* Print Receipt Button */}
              <FormHeaderButton
                onClick={() => setReceiptModalOpen(true)}
                icon={<Printer size={14} />}
                variant="outline"
              >
                {t('printReceipt', 'Print Receipt')}
              </FormHeaderButton>

              {/* Email Customer Button */}
              <FormHeaderButton
                onClick={() => {
                  if (customerEmail && customerEmail !== '—') {
                    window.location.href = `mailto:${customerEmail}?subject=Receipt for Order #${invoiceNumber}`
                  } else {
                    toast.error(t('noCustomerEmail', 'No customer email address on file'))
                  }
                }}
                icon={<Mail size={14} />}
                variant="outline"
              >
                {t('emailCustomer', 'Email Customer')}
              </FormHeaderButton>

              {/* Refund / Main Action */}
              {!isRefunded && !isCancelled && (
                <FormHeaderButton
                  onClick={() => setRefundModalOpen(true)}
                  icon={<RotateCcw size={14} />}
                  variant="danger"
                >
                  {t('refundOrder', 'Refund Order')}
                </FormHeaderButton>
              )}
            </>
          }
        />
      </div>

      {/* ── 3. MAIN 2-COLUMN LAYOUT MATCHING REFERENCE DESIGN ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN: ORDER SUMMARY, TIMELINE, ITEMS (2 COLS) ────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Order Summary & Activity Timeline */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 overflow-hidden">
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-border/80">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {t('orderSummary', 'Order summary')}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('placedVia', 'Placed via')} {sale.store?.name || sale.company?.name || 'POS Terminal'} · {formatFullDateTime(orderDate)}
                </p>
              </div>
              <StatusBadge status={sale.status} rounded="full" />
            </div>

            {/* Vertical Activity Timeline */}
            <div className="pt-6 relative">
              <div className="space-y-6">
                {/* Step 1: Order Placed */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center shrink-0 z-10">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="w-0.5 grow bg-emerald-500/40 my-1" />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                        {formatShortTime(orderDate)}
                      </span>
                      <h3 className="text-xs font-bold text-foreground">
                        {t('orderPlaced', 'Order placed')}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {customer?.name
                        ? t('customerPlacedOrder', 'Customer {{name}} placed order via POS Counter', { name: customer.name })
                        : t('posTerminalCheckout', 'Processed through POS checkout terminal')}
                    </p>
                  </div>
                </div>

                {/* Step 2: Payment Confirmed / Voided */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isCancelled && paidAmount === 0
                          ? 'bg-rose-500/15 border-2 border-rose-500'
                          : isRefunded
                          ? 'bg-purple-500/15 border-2 border-purple-500'
                          : 'bg-emerald-500/15 border-2 border-emerald-500'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isCancelled && paidAmount === 0
                            ? 'bg-rose-500'
                            : isRefunded
                            ? 'bg-purple-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                    <div className="w-0.5 grow bg-emerald-500/40 my-1" />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                        {formatShortTime(orderDate, 1)}
                      </span>
                      <h3 className="text-xs font-bold text-foreground">
                        {isCancelled && paidAmount === 0
                          ? t('paymentVoided', 'Payment Voided / Unpaid')
                          : isRefunded
                          ? t('paymentRefunded', 'Payment Refunded')
                          : t('paymentConfirmed', 'Payment confirmed')}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isCancelled && paidAmount === 0
                        ? t('cancelledNoPayment', '$0.00 (Transaction cancelled without payment)')
                        : isRefunded
                        ? `${formatCurrency(grandTotal, 'USD')} ${t('refunded', 'Refunded')} via ${formatPaymentMethod(channel)}${sale.invoice_number ? ` · ${t('reference', 'Ref')}: ${sale.invoice_number}` : ''}`
                        : `${formatCurrency(paidAmount, 'USD')} ${t('paid', 'paid')} via ${formatPaymentMethod(channel)}${sale.invoice_number ? ` · ${t('reference', 'Ref')}: ${sale.invoice_number}` : ''}`}
                    </p>
                  </div>
                </div>

                {/* Step 3: Restaurant / Store Accepted */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center shrink-0 z-10">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="w-0.5 grow bg-emerald-500/40 my-1" />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                        {formatShortTime(orderDate, 2)}
                      </span>
                      <h3 className="text-xs font-bold text-foreground">
                        {t('orderAccepted', 'Order confirmed & accepted')}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cashier?.name
                        ? t('orderProcessedBy', 'Processed by {{name}}', { name: cashier.name.replace(/\s*\(system\)/i, '') })
                        : t('posTerminalCheckout', 'Dispatched to fulfillment desk')}
                    </p>
                  </div>
                </div>

                {/* Step 4: Cooking / Fulfilling */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isRefunded || isCancelled
                          ? 'bg-rose-500/15 border-2 border-rose-500'
                          : status === 'completed'
                          ? 'bg-emerald-500/15 border-2 border-emerald-500'
                          : 'bg-amber-500/15 border-2 border-amber-500 animate-pulse'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isRefunded || isCancelled
                            ? 'bg-rose-500'
                            : status === 'completed'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>
                    <div
                      className={`w-0.5 grow my-1 ${
                        status === 'completed' ? 'bg-emerald-500/40' : 'bg-border'
                      }`}
                    />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {status === 'completed'
                          ? t('completed', 'Done')
                          : t('inProgress', 'In progress')}
                      </span>
                      <h3 className="text-xs font-bold text-foreground">
                        {t('fulfillment', 'Packing & Item Preparation')}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('itemsChecked', '{{count}} items checked and verified in inventory', { count: items.length })}
                    </p>
                  </div>
                </div>

                {/* Step 5: Ready for Pickup / Handover */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        status === 'completed'
                          ? 'bg-emerald-500/15 border-2 border-emerald-500'
                          : 'bg-muted border-2 border-border'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          status === 'completed' ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                        }`}
                      />
                    </div>
                    <div
                      className={`w-0.5 grow my-1 ${
                        status === 'completed' ? 'bg-emerald-500/40' : 'bg-border'
                      }`}
                    />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {status === 'completed'
                          ? t('ready', 'Ready')
                          : t('pending', 'Pending')}
                      </span>
                      <h3 className="text-xs font-bold text-foreground">
                        {t('readyForPickup', 'Ready for pickup & Handover')}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('availableAtCounter', 'Available at POS Store Counter')}
                    </p>
                  </div>
                </div>

                {/* Step 6: Delivered / Completed */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isRefunded
                          ? 'bg-purple-500/15 border-2 border-purple-500'
                          : isCancelled
                          ? 'bg-rose-500/15 border-2 border-rose-500'
                          : status === 'completed'
                          ? 'bg-emerald-500/15 border-2 border-emerald-500'
                          : 'bg-muted border-2 border-border'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isRefunded
                            ? 'bg-purple-500'
                            : isCancelled
                            ? 'bg-rose-500'
                            : status === 'completed'
                            ? 'bg-emerald-500'
                            : 'bg-muted-foreground/40'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isRefunded
                            ? 'bg-purple-500/10 text-purple-600'
                            : isCancelled
                            ? 'bg-rose-500/10 text-rose-600'
                            : status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isRefunded
                          ? t('refunded', 'Refunded')
                          : isCancelled
                          ? t('cancelled', 'Cancelled')
                          : status === 'completed'
                          ? t('delivered', 'Delivered & Completed')
                          : t('pending', 'Pending')}
                      </span>
                      <h3 className="text-xs font-bold text-foreground">
                        {isRefunded
                          ? t('orderRefunded', 'Order Refunded')
                          : isCancelled
                          ? t('orderCancelled', 'Order Cancelled')
                          : t('orderFinalized', 'Order Complete')}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isCancelled
                        ? t('receiptCancelled', 'Receipt voided · Transaction closed')
                        : isRefunded
                        ? t('receiptRefunded', 'Receipt refunded · Transaction reversed')
                        : t('receiptFinalized', 'Receipt finalized · Transaction closed')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Items Ordered Table */}
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>{t('itemsOrdered', 'Items ordered')}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {items.length} {t('items', 'items')}
                </span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full data-table border-collapse">
                <thead className="bg-muted/40 border-b border-border select-none text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-3 px-6 text-left">{t('colItem', 'Item')}</th>
                    <th className="py-3 px-4 text-left">
                      {t('colModifiers', 'Modifiers / SKU')}
                    </th>
                    <th className="py-3 px-4 text-center">{t('colQty', 'Qty')}</th>
                    <th className="py-3 px-4 text-right">{t('colUnit', 'Unit')}</th>
                    <th className="py-3 px-6 text-right">{t('colTotal', 'Total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {items.map((item: any, index: number) => {
                    const itemName =
                      item.product_name ||
                      item.product?.name ||
                      item.name ||
                      `Item #${index + 1}`
                    const itemImg =
                      item.product?.primary_image ||
                      item.product?.image ||
                      item.variant?.image ||
                      item.image ||
                      item.product_image
                    const itemSku =
                      item.sku ||
                      item.product_sku ||
                      item.product?.sku ||
                      item.variant?.sku ||
                      '—'
                    const qty = Number(item.quantity || item.qty || 1)
                    const unitPrice = Number(item.unit_price || item.price || 0)
                    const lineTotal = Number(item.total || item.subtotal || unitPrice * qty)
                    const variantName =
                      item.variant?.name ||
                      item.variant_name ||
                      (item.product?.category?.name ? `${item.product.category.name}` : null)

                    return (
                      <tr
                        key={item.id || index}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {/* ITEM Column */}
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <ProductThumbnail
                              name={itemName}
                              primaryImage={item.product?.primary_image}
                              image={itemImg}
                              categoryName={item.product?.category?.name}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <p
                                className="font-bold text-foreground text-xs sm:text-sm truncate max-w-[220px]"
                                title={itemName}
                              >
                                {itemName}
                              </p>
                              {variantName && (
                                <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                                  {variantName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* MODIFIERS / SKU */}
                        <td className="py-3 px-4">
                          {itemSku !== '—' ? (
                            <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                              {itemSku}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* QTY */}
                        <td className="py-3 px-4 text-center font-mono text-xs font-bold text-foreground">
                          {GlobalFormat.number(qty, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </td>

                        {/* UNIT */}
                        <td className="py-3 px-4 text-right font-mono text-xs font-medium text-muted-foreground">
                          {formatCurrency(unitPrice, 'USD')}
                        </td>

                        {/* TOTAL */}
                        <td className="py-3 px-6 text-right font-mono text-xs font-bold text-foreground">
                          {formatCurrency(lineTotal, 'USD')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Breakdown */}
            <div className="p-6 bg-muted/20 border-t border-border/80">
              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('subtotal', 'Subtotal')}</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatCurrency(subtotal, 'USD')}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-medium">
                    <span>{t('discount', 'Discount')}</span>
                    <span className="font-mono">-{formatCurrency(discountAmount, 'USD')}</span>
                  </div>
                )}

                {taxAmount > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('taxVat', 'Tax / VAT (10%)')}</span>
                    <span className="font-mono font-medium text-foreground">
                      +{formatCurrency(taxAmount, 'USD')}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-border flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-foreground block">
                      {t('grandTotal', 'Grand Total')}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formatCurrency(grandTotal * KHR_RATE, 'KHR')}
                    </span>
                  </div>
                  <span className="font-mono text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(grandTotal, 'USD')}
                  </span>
                </div>

                {paidAmount > 0 && (
                  <div className="pt-2 border-t border-dashed border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('paidAmount', 'Amount Paid')}</span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatCurrency(paidAmount, 'USD')}
                    </span>
                  </div>
                )}

                {changeAmount > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('change', 'Change')}</span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatCurrency(changeAmount, 'USD')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: CUSTOMER, CASHIER/RIDER, PAYMENT (1 COL) ──────────── */}
        <div className="space-y-6">
          {/* Customer Card matching screenshot */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6">
            <h2 className="text-base font-bold text-foreground mb-4">
              {t('customer', 'Customer')}
            </h2>

            <div className="flex flex-col items-center text-center pb-5 border-b border-border/80">
              {/* Customer Avatar - Static visual, no link */}
              <div className="relative mb-3">
                <AvatarImage
                  src={customer?.photo || customer?.avatar}
                  id={customer?.id}
                  name={customerName}
                  fallbackAvatar={true}
                  size="xl"
                  shape="circle"
                  className="w-20 h-20 text-2xl shadow-sm border-2 border-background"
                  preview={true}
                />
              </div>

              <h3 className="text-base font-bold text-foreground">{customerName}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {customer?.order_count
                  ? `${customer.order_count} ${t('orders', 'orders')}`
                  : `1 ${t('order', 'order')}`}{' '}
                ·{' '}
                <span className="font-semibold text-primary">
                  {customer?.group?.name || t('standardMember', 'Gold member')}
                </span>
              </p>

              {/* Quick Action Buttons: Profile, Call, Chat */}
              <div className="flex items-center gap-2 mt-4">
                {customer?.id && (
                  <Link
                    to={`/customers/${customer.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all active:scale-95 shadow-2xs"
                  >
                    <UserIcon size={12} />
                    <span>{t('profile', 'Profile')}</span>
                  </Link>
                )}

                {customerPhone !== '—' && (
                  <a
                    href={`tel:${customerPhone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all active:scale-95 shadow-2xs"
                  >
                    <Phone size={12} />
                    <span>{t('call', 'Call')}</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (customerEmail !== '—') {
                      window.location.href = `mailto:${customerEmail}`
                    } else if (customerPhone !== '—') {
                      window.open(
                        `https://t.me/${customerPhone.replace(/[^0-9]/g, '')}`,
                        '_blank'
                      )
                    } else {
                      toast.info(t('noContactAvailable', 'No contact method configured'))
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all active:scale-95 shadow-2xs cursor-pointer"
                >
                  <MessageSquare size={12} />
                  <span>{t('chat', 'Chat')}</span>
                </button>
              </div>
            </div>

            {/* Customer Details List */}
            <div className="pt-4 space-y-3.5 text-xs">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
                  {t('phone', 'Phone')}
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-foreground font-semibold">
                    {customerPhone}
                  </span>
                  {customerPhone !== '—' && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(customerPhone, 'phone')}
                      className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5"
                      title={t('copy', 'Copy phone')}
                    >
                      <Copy size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
                  {t('email', 'Email')}
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground truncate max-w-[210px]" title={customerEmail}>
                    {customerEmail}
                  </span>
                  {customerEmail !== '—' && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(customerEmail, 'email')}
                      className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5"
                      title={t('copy', 'Copy email')}
                    >
                      <Copy size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
                  {t('deliveryAddress', 'Delivery address')}
                </span>
                <p className="font-medium text-foreground leading-relaxed">
                  {customerAddress}
                </p>
              </div>

              {orderNotes && (
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
                    {t('notes', 'Notes')}
                  </span>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 text-foreground font-medium leading-relaxed">
                    {typeof orderNotes === 'string' && orderNotes.startsWith('Store POS transaction')
                      ? t('storePosTransaction', 'Store POS transaction {{id}}', { id: sale.id })
                      : orderNotes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Rider / Staff Card */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6">
            <h2 className="text-base font-bold text-foreground mb-4">
              {t('assignedStaff', 'Assigned cashier / staff')}
            </h2>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <AvatarImage
                  src={
                    cashier?.avatar ||
                    cashier?.photo ||
                    cashier?.employee?.photo ||
                    (cashier as any)?.profile_photo_url ||
                    (cashier as any)?.image
                  }
                  name={
                    cashier?.name
                      ? cashier.name.replace(/\s*\(system\)/i, '')
                      : 'Store Cashier'
                  }
                  id={cashier?.id}
                  fallbackAvatar={true}
                  size="lg"
                  shape="circle"
                  preview={true}
                  className="w-11 h-11 border border-border/80 shadow-2xs shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {cashier?.name
                      ? cashier.name.replace(/\s*\(system\)/i, '')
                      : 'Store Cashier'}
                  </h3>
                  <p className="text-[11px] text-muted-foreground truncate">
                    ★ 5.0 · {cashier?.role || (cashier?.employee as any)?.position?.name || 'Cashier (HQ Store)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {cashier?.employee?.id ? (
                  <Link
                    to={`/employees/${cashier.employee.id}`}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-2xs"
                  >
                    {t('profile', 'Profile')}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => toast.info(t('cashierDetails', 'Cashier on active duty'))}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-2xs"
                  >
                    {t('profile', 'Profile')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Payment & Channel Card */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground">
              {t('paymentInformation', 'Payment Information')}
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">
                  {t('paymentMethod', 'Payment Method')}
                </span>
                <span className="font-bold text-foreground px-2 py-0.5 rounded-md bg-muted border border-border text-[11px]">
                  {formatPaymentMethod(channel)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">
                  {t('paymentStatus', 'Payment Status')}
                </span>
                {isCancelled ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                    <AlertCircle size={13} />
                    <span>{t('cancelled', 'Cancelled')}</span>
                  </span>
                ) : isRefunded ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    <RotateCcw size={13} />
                    <span>{t('refunded', 'Refunded')}</span>
                  </span>
                ) : paidAmount === 0 || (sale as any).payment_status === 'unpaid' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    <Clock size={13} />
                    <span>{t('unpaid', 'Unpaid')}</span>
                  </span>
                ) : paidAmount < grandTotal || (sale as any).payment_status === 'partial' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    <Clock size={13} />
                    <span>{t('partial', 'Partially Paid')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <BadgeCheck size={13} />
                    <span>{t('paid', 'Paid')}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">
                  {t('reference', 'Reference')}
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-semibold text-foreground">
                    {invoiceNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(invoiceNumber, 'invoice')}
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5"
                    title={t('copy', 'Copy reference')}
                  >
                    <Copy size={11} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('date', 'Date')}</span>
                <span className="font-medium text-foreground">
                  {formatFullDateTime(orderDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. RECEIPT PRINT MODAL ────────────────────────────────────────────── */}
      {receiptModalOpen && sale && (
        <SalesReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          sale={sale}
        />
      )}

      {/* ── 5. REFUND MODAL ───────────────────────────────────────────────────── */}
      {refundModalOpen && (
        <ProcessRefundModal
          isOpen={refundModalOpen}
          onClose={() => setRefundModalOpen(false)}
          sale={sale}
          onRefundSuccess={() => {
            qc.invalidateQueries({ queryKey: ['sales-detail', id] })
            qc.invalidateQueries({ queryKey: ['sales'] })
          }}
        />
      )}
    </div>
  )
}

export default SalesDetailPage
