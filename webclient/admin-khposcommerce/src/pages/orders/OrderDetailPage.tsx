import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Printer,
  Mail,
  AlertCircle,
  Copy,
  Check,
  FileText,
  CheckCircle2,
  User as UserIcon,
  Phone,
  MessageSquare,
  Calendar,
  Building2,
} from 'lucide-react'
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
  UpdateOrderStatusModal,
} from '@/components/common'
import { SalesReceiptModal } from '@/pages/sales/components/SalesReceiptModal'
import { ShippingWaybillModal } from './components/ShippingWaybillModal'
import { formatCurrency, GlobalFormat } from '@/utils/formatters'
import type { Order, OrderItem } from './components/OrdersTableSection'

const KHR_RATE = 4100

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { language } = useThemeStore()
  const { t } = useTranslation(['orders', 'sales', 'common'])
  const toast = useToast()

  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [waybillModalOpen, setWaybillModalOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Fetch Order Details
  const {
    data: order,
    isLoading,
    isError,
  } = useQuery<Order | null>({
    queryKey: ['order-detail', id],
    queryFn: async () => {
      if (!id) return null
      return await orderService.show(id)
    },
    enabled: !!id,
  })

  const copyToClipboard = (text: string, fieldKey: string) => {
    if (!text || text === '—') return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldKey)
    sound.playSuccess()
    toast.success(t('copied', 'Copied to clipboard'))
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Localized date formatting
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
          {t('loadingDetails', 'Loading web order details...')}
        </p>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-500">
          <AlertCircle size={36} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {t('orderNotFound', 'Web Order Not Found')}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            {t('orderNotFoundDesc', 'The requested web order ID does not exist or has been removed.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>{t('backToOrders', 'Back to Web Orders')}</span>
        </button>
      </div>
    )
  }

  // ── Raw Data Normalization ──────────────────────────────────────────────────
  const orderNumber = order.order_number || `ORD-${order.id}`
  const orderDate = order.created_at
  const items: OrderItem[] =
    order.items || (order as any).order_items || (order as any).details || []

  // Customer info
  const customer = order.customer
  const customerName =
    customer?.name ||
    order.shipping_name ||
    order.customer_name ||
    t('walkInCustomer', 'Walk-in Customer')
  const rawCustomerPhone = customer?.phone || order.customer_phone || order.shipping_phone
  const customerPhone = rawCustomerPhone ? GlobalFormat.phone(rawCustomerPhone) : '—'
  const rawCustomerEmail = customer?.email || order.customer_email
  const customerEmail = rawCustomerEmail ? GlobalFormat.email(rawCustomerEmail) : '—'
  const customerPhoto = customer?.photo || customer?.avatar

  // Destination address
  const fullAddress = [
    order.shipping_address,
    order.shipping_city,
    order.shipping_province,
    order.shipping_postal_code,
  ]
    .filter(Boolean)
    .join(', ') || t('noShippingAddress', 'No shipping address recorded')

  // Courier & Logistics
  const courierName =
    order.shipping_method?.name ||
    order.shippingMethod?.name ||
    order.shipment?.carrier ||
    order.carrier ||
    order.courier ||
    t('expressCourier', 'Express Courier')

  const trackingNumber =
    order.tracking_number ||
    order.tracking_code ||
    order.shipment?.tracking_number ||
    `TRK-${String(order.id).padStart(6, '0')}`

  // Payment info
  const extractPaymentName = (): string => {
    if (order.payments && order.payments.length > 0) {
      const p = order.payments[0]
      if (p.payment_method?.name) return p.payment_method.name
      if (p.name) return p.name
      if (p.method) return p.method
    }
    if (order.payment_method) return order.payment_method
    return 'Bakong KHQR'
  }

  const rawPaymentMethod = extractPaymentName()
  const paymentMethodLower = rawPaymentMethod.toLowerCase()
  const isPaid = (order.payment_status || '').toLowerCase() === 'paid'

  let paymentMethodLabel = rawPaymentMethod

  if (
    paymentMethodLower.includes('aba') ||
    paymentMethodLower.includes('bakong') ||
    paymentMethodLower.includes('khqr') ||
    paymentMethodLower.includes('qr')
  ) {
    paymentMethodLabel = 'Bakong KHQR'
  } else if (paymentMethodLower.includes('wing')) {
    paymentMethodLabel = 'Wing Bank'
  } else if (paymentMethodLower.includes('acleda')) {
    paymentMethodLabel = 'ACLEDA Mobile'
  } else if (
    paymentMethodLower.includes('card') ||
    paymentMethodLower.includes('visa') ||
    paymentMethodLower.includes('master')
  ) {
    paymentMethodLabel = t('methodCard', 'Credit / Debit Card')
  } else if (paymentMethodLower.includes('cod') || paymentMethodLower.includes('cash')) {
    paymentMethodLabel = t('methodCod', 'Cash on Delivery (COD)')
  }

  // Financials
  const subtotal = Number(order.subtotal || 0)
  const discountAmount = Number(order.discount_amount || 0)
  const taxAmount = Number(order.tax_amount || 0)
  const shippingCost = Number(order.shipping_cost ?? order.shipping_fee ?? 0)
  const grandTotal = Number(
    order.grand_total ?? order.total_amount ?? (subtotal - discountAmount + taxAmount + shippingCost)
  )
  const paidAmount = isPaid ? grandTotal : Number(order.paid_amount || 0)
  const balanceDue = Math.max(0, grandTotal - paidAmount)

  // Statuses
  const status = (order.status || 'pending').toLowerCase()
  const isCancelled = status === 'cancelled'
  const isRefunded = status === 'refunded'
  const isProcessing = status === 'processing' || status === 'confirmed'
  const isShipped =
    status === 'shipped' ||
    (order.fulfillment_status || '').toLowerCase() === 'fulfilled'
  const isDelivered = status === 'delivered' || status === 'completed'

  // Receipt modal payload
  const receiptSalePayload = {
    ...order,
    invoice_number: orderNumber,
    date: orderDate,
    items,
  }

  const handleEmailCustomer = () => {
    if (customerEmail && customerEmail !== '—') {
      window.location.href = `mailto:${customerEmail}?subject=Order%20${orderNumber}`
    } else {
      toast.error(t('noCustomerEmail', 'No customer email address on file'))
    }
  }

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* ── 0. BREADCRUMBS (STANDALONE OUTSIDE ABOVE HEADER) ─────────────────── */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            {
              label: t('salesOperations', 'Sales Management'),
              path: '/orders',
            },
            {
              label: t('webOrdersTitle', 'Online Web Orders'),
              path: '/orders',
            },
            {
              label: `${t('order', 'Order')} #${orderNumber}`,
            },
          ]}
        />
      </div>

      {/* ── 1. GLOBAL FORM HEADER (NO ICON PER GLOBAL RULE) ──────────────────── */}
      <div className="print:hidden">
        <FormHeader
          frameless
          title={
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <span className="font-mono text-base sm:text-lg md:text-xl font-bold tracking-tight">
                {t('order', 'Order')} #{orderNumber}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] sm:text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 shrink-0">
                <Building2 size={12} className="shrink-0" />
                {order.store?.name || order.company?.name || t('onlineStore', 'Online Web Store')}
              </span>
            </div>
          }
          subtitle={
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-muted-foreground/70 shrink-0" />
              <span>{formatFullDateTime(orderDate)}</span>
            </span>
          }
          showBack={true}
          backPath="/orders"
          backLabel={t('common:back', 'Back')}
          statusBadge={
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <StatusBadge status={order.status} rounded="full" />
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isPaid
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>
                  {isPaid ? t('paymentStatusPaid', 'Paid') : t('unpaidCod', 'Unpaid / COD')}
                </span>
              </span>
              {order.fulfillment_status && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>
                    {order.fulfillment_status === 'fulfilled'
                      ? t('fulfilled', 'Fulfilled')
                      : t('unfulfilled', 'Unfulfilled')}
                  </span>
                </span>
              )}
            </div>
          }
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

              {/* Print Shipping Waybill */}
              <FormHeaderButton
                onClick={() => setWaybillModalOpen(true)}
                icon={<FileText size={14} />}
                variant="outline"
              >
                {t('printWaybill', 'Print Waybill')}
              </FormHeaderButton>

              {/* Email Customer */}
              <FormHeaderButton
                onClick={handleEmailCustomer}
                icon={<Mail size={14} />}
                variant="outline"
              >
                {language === 'km' ? 'ផ្ញើអ៊ីមែល' : 'Email'}
              </FormHeaderButton>

              {/* Update Status Button */}
              {!isCancelled && (
                <FormHeaderButton
                  onClick={() => setStatusDialogOpen(true)}
                  icon={<CheckCircle2 size={14} />}
                  variant="primary"
                >
                  {t('updateStatus', 'Update Status')}
                </FormHeaderButton>
              )}
            </>
          }
        />
      </div>

      {/* ── 2. MAIN 2-COLUMN LAYOUT MATCHING SALES DETAIL FORM ───────────────── */}
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
                  {t('placedVia', 'Placed via')}{' '}
                  <span className="font-semibold text-foreground">
                    {order.store?.name || t('onlineStore', 'Online Web Store')}
                  </span>{' '}
                  · {formatFullDateTime(orderDate)}
                </p>
              </div>
              <StatusBadge status={order.status} rounded="full" />
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
                        {language === 'km' ? 'បានដាក់បញ្ជាទិញ' : 'Order placed'}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {customerName !== '—'
                        ? language === 'km'
                          ? `អតិថិជន ${customerName} បានដាក់បញ្ជាទិញតាមរយៈវេបសាយ`
                          : `Customer ${customerName} placed order via Online Store`
                        : language === 'km'
                        ? 'បានដាក់បញ្ជាទិញតាមរយៈវេបសាយ'
                        : 'Web order submitted via checkout portal'}
                    </p>
                  </div>
                </div>

                {/* Step 2: Payment Confirmed / COD */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isCancelled
                          ? 'bg-rose-500/15 border-2 border-rose-500'
                          : isRefunded
                          ? 'bg-purple-500/15 border-2 border-purple-500'
                          : isPaid
                          ? 'bg-emerald-500/15 border-2 border-emerald-500'
                          : 'bg-amber-500/15 border-2 border-amber-500'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isCancelled
                            ? 'bg-rose-500'
                            : isRefunded
                            ? 'bg-purple-500'
                            : isPaid
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>
                    <div
                      className={`w-0.5 grow my-1 ${
                        isPaid || isProcessing || isShipped || isDelivered
                          ? 'bg-emerald-500/40'
                          : 'bg-border'
                      }`}
                    />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                        {formatShortTime(orderDate, 1)}
                      </span>
                      <h3 className="text-xs font-bold text-foreground">
                        {isCancelled
                          ? language === 'km'
                            ? 'ការទូទាត់ត្រូវបានលុបចោល'
                            : 'Payment Voided'
                          : isRefunded
                          ? language === 'km'
                            ? 'បានសងប្រាក់បញ្ញើវិញ'
                            : 'Payment Refunded'
                          : isPaid
                          ? language === 'km'
                            ? 'បានបញ្ជាក់ការទូទាត់'
                            : 'Payment confirmed'
                          : language === 'km'
                          ? 'រង់ចាំការទូទាត់ / ប្រមូលប្រាក់ពេលដឹកដល់ (COD)'
                          : 'Pending Payment / Cash on Delivery'}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isCancelled
                        ? language === 'km'
                          ? '$0.00 (ការបញ្ជាទិញត្រូវបានបោះបង់ដោយមិនមានការទូទាត់)'
                          : '$0.00 (Cancelled without settlement)'
                        : isRefunded
                        ? `${formatCurrency(grandTotal, 'USD')} ${language === 'km' ? 'បានសងប្រាក់វិញ' : 'Refunded'} via ${paymentMethodLabel} · ${orderNumber}`
                        : isPaid
                        ? `${formatCurrency(paidAmount, 'USD')} ${language === 'km' ? 'បានទូទាត់តាម' : 'paid via'} ${paymentMethodLabel} · ${orderNumber}`
                        : `${formatCurrency(grandTotal, 'USD')} ${language === 'km' ? 'ត្រូវប្រមូលតាម' : 'to collect via'} ${paymentMethodLabel}`}
                    </p>
                  </div>
                </div>

                {/* Step 3: Packing & Preparation */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isRefunded || isCancelled
                          ? 'bg-rose-500/15 border-2 border-rose-500'
                          : isShipped || isDelivered
                          ? 'bg-emerald-500/15 border-2 border-emerald-500'
                          : isProcessing
                          ? 'bg-blue-500/15 border-2 border-blue-500 animate-pulse'
                          : 'bg-muted border-2 border-border'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isRefunded || isCancelled
                            ? 'bg-rose-500'
                            : isShipped || isDelivered
                            ? 'bg-emerald-500'
                            : isProcessing
                            ? 'bg-blue-500'
                            : 'bg-muted-foreground/40'
                        }`}
                      />
                    </div>
                    <div
                      className={`w-0.5 grow my-1 ${
                        isShipped || isDelivered ? 'bg-emerald-500/40' : 'bg-border'
                      }`}
                    />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isShipped || isDelivered
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : isProcessing
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isShipped || isDelivered
                          ? language === 'km'
                            ? 'បានរៀបចំ'
                            : 'Packed'
                          : isProcessing
                          ? language === 'km'
                            ? 'កំពុងវេចខ្ចប់'
                            : 'In progress'
                          : language === 'km'
                          ? 'រង់ចាំ'
                          : 'Pending'}
                      </span>
                      <h3 className="text-xs font-bold text-foreground">
                        {language === 'km' ? 'បានទទួលយក & កំពុងវេចខ្ចប់' : 'Order Accepted & Packing'}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {language === 'km'
                        ? `${items.length} មុខទំនិញត្រូវបានត្រួតពិនិត្យ និងរៀបចំវេចខ្ចប់ក្នុងឃ្លាំង`
                        : `${items.length} items checked, verified, and packaged in fulfillment center`}
                    </p>
                  </div>
                </div>

                {/* Step 4: In Transit / Courier Handover */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isDelivered
                          ? 'bg-emerald-500/15 border-2 border-emerald-500'
                          : isShipped
                          ? 'bg-purple-500/15 border-2 border-purple-500 animate-pulse'
                          : 'bg-muted border-2 border-border'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isDelivered
                            ? 'bg-emerald-500'
                            : isShipped
                            ? 'bg-purple-500'
                            : 'bg-muted-foreground/40'
                        }`}
                      />
                    </div>
                    <div
                      className={`w-0.5 grow my-1 ${
                        isDelivered ? 'bg-emerald-500/40' : 'bg-border'
                      }`}
                    />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isDelivered
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : isShipped
                            ? 'bg-purple-500/10 text-purple-600'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isDelivered
                          ? language === 'km'
                            ? 'បានដឹកដល់'
                            : 'Delivered'
                          : isShipped
                          ? language === 'km'
                            ? 'កំពុងដឹកជញ្ជូន'
                            : 'In Transit'
                          : language === 'km'
                          ? 'រង់ចាំ'
                          : 'Pending'}
                      </span>
                      <h3 className="text-xs font-bold text-foreground">
                        {language === 'km' ? 'ប្រគល់ជូនក្រុមហ៊ុនដឹកជញ្ជូន' : 'Handed to Logistics & In Transit'}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {language === 'km'
                        ? `ប្រគល់ជូន ${courierName} · លេខតាមដាន: ${trackingNumber}`
                        : `Dispatched to ${courierName} · Tracking: ${trackingNumber}`}
                    </p>
                  </div>
                </div>

                {/* Step 5: Delivered & Completed */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isRefunded
                          ? 'bg-purple-500/15 border-2 border-purple-500'
                          : isCancelled
                          ? 'bg-rose-500/15 border-2 border-rose-500'
                          : isDelivered
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
                            : isDelivered
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
                            : isDelivered
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isRefunded
                          ? language === 'km'
                            ? 'បានសងប្រាក់'
                            : 'Refunded'
                          : isCancelled
                          ? language === 'km'
                            ? 'បានបោះបង់'
                            : 'Cancelled'
                          : isDelivered
                          ? language === 'km'
                            ? 'បានបញ្ចប់'
                            : 'Completed'
                          : language === 'km'
                          ? 'រង់ចាំ'
                          : 'Pending'}
                      </span>
                      <h3 className="text-xs font-bold text-foreground">
                        {isRefunded
                          ? language === 'km'
                            ? 'ការបញ្ជាទិញបានសងប្រាក់'
                            : 'Order Refunded'
                          : isCancelled
                          ? language === 'km'
                            ? 'ការបញ្ជាទិញត្រូវបានបោះបង់'
                            : 'Order Cancelled'
                          : language === 'km'
                          ? 'បានប្រគល់ជោគជ័យ និងបញ្ចប់'
                          : 'Delivered & Completed'}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isCancelled
                        ? language === 'km'
                          ? 'ការបញ្ជាទិញត្រូវបានបោះបង់ · បិទប្រតិបត្តិការ'
                          : 'Order cancelled · Transaction closed'
                        : isRefunded
                        ? language === 'km'
                          ? 'បានសងប្រាក់ជូនអតិថិជនរួចរាល់'
                          : 'Order refunded · Settlement reversed'
                        : isDelivered
                        ? language === 'km'
                          ? 'ទំនិញត្រូវបានប្រគល់ជូនអតិថិជនជោគជ័យ · បិទបញ្ចប់ការបញ្ជាទិញ'
                          : 'Parcel successfully delivered to recipient · Order closed'
                        : language === 'km'
                        ? 'រង់ចាំការដឹកជញ្ជូនដល់ដៃអតិថិជន'
                        : 'Awaiting courier delivery to customer'}
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
                <span>{language === 'km' ? 'មុខទំនិញបានបញ្ជាទិញ' : 'Items ordered'}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {items.length} {language === 'km' ? 'មុខទំនិញ' : 'items'}
                </span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full data-table border-collapse">
                <thead className="bg-muted/40 border-b border-border select-none text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-3 px-6 text-left">
                      {language === 'km' ? 'មុខទំនិញ' : 'Item'}
                    </th>
                    <th className="py-3 px-4 text-left">
                      {language === 'km' ? 'ជម្រើស / SKU' : 'Modifiers / SKU'}
                    </th>
                    <th className="py-3 px-4 text-center">
                      {language === 'km' ? 'ចំនួន' : 'Qty'}
                    </th>
                    <th className="py-3 px-4 text-right">
                      {language === 'km' ? 'តម្លៃរាយ' : 'Unit'}
                    </th>
                    <th className="py-3 px-6 text-right">
                      {language === 'km' ? 'សរុប' : 'Total'}
                    </th>
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
                    const lineTotal = Number(
                      item.total || item.subtotal || unitPrice * qty
                    )
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
                              className="rounded-xl shadow-2xs"
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
                  <span>{language === 'km' ? 'សរុបរង' : 'Subtotal'}</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatCurrency(subtotal, 'USD')}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-medium">
                    <span>{language === 'km' ? 'បញ្ចុះតម្លៃ' : 'Discount'}</span>
                    <span className="font-mono">-{formatCurrency(discountAmount, 'USD')}</span>
                  </div>
                )}

                {shippingCost > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{language === 'km' ? 'ថ្លៃដឹកជញ្ជូន' : 'Shipping Fee'}</span>
                    <span className="font-mono font-medium text-foreground">
                      +{formatCurrency(shippingCost, 'USD')}
                    </span>
                  </div>
                )}

                {taxAmount > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{language === 'km' ? 'ពន្ធ VAT (10%)' : 'Tax / VAT (10%)'}</span>
                    <span className="font-mono font-medium text-foreground">
                      +{formatCurrency(taxAmount, 'USD')}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-border flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-foreground block">
                      {language === 'km' ? 'សរុបចុងក្រោយ' : 'Grand Total'}
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
                    <span>{language === 'km' ? 'ទឹកប្រាក់បានទូទាត់' : 'Amount Paid'}</span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatCurrency(paidAmount, 'USD')}
                    </span>
                  </div>
                )}

                {balanceDue > 0 && (
                  <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-bold">
                    <span>{language === 'km' ? 'ទឹកប្រាក់ត្រូវប្រមូល (COD)' : 'Balance Due (COD)'}</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(balanceDue, 'USD')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Customer Notes if any */}
          {(order.customer_notes || order.notes || order.admin_notes) && (
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6">
              <h2 className="text-base font-bold text-foreground mb-2">
                {language === 'km' ? 'កំណត់សម្គាល់ពីការបញ្ជាទិញ' : 'Order Notes'}
              </h2>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 text-xs text-foreground font-medium leading-relaxed">
                {order.customer_notes || order.notes || order.admin_notes}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: CUSTOMER, LOGISTICS, PAYMENT, CHANNEL (1 COL) ─────── */}
        <div className="space-y-6">
          {/* Card 1: Customer Card matching Sales Detail Page */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6">
            <h2 className="text-base font-bold text-foreground mb-4">
              {language === 'km' ? 'អតិថិជន' : 'Customer'}
            </h2>

            <div className="flex flex-col items-center text-center pb-5 border-b border-border/80">
              {/* Customer Avatar */}
              <div className="relative mb-3">
                <AvatarImage
                  src={customerPhoto}
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
                  ? `${customer.order_count} ${language === 'km' ? 'បញ្ជាទិញ' : 'orders'}`
                  : `1 ${language === 'km' ? 'បញ្ជាទិញ' : 'order'}`}{' '}
                ·{' '}
                <span className="font-semibold text-primary">
                  {customer?.group?.name || (language === 'km' ? 'សមាជិកមាស' : 'Gold Member')}
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
                    <span>{language === 'km' ? 'មើលព័ត៌មាន' : 'View Profile'}</span>
                  </Link>
                )}

                {customerPhone !== '—' && (
                  <a
                    href={`tel:${customerPhone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all active:scale-95 shadow-2xs"
                  >
                    <Phone size={12} />
                    <span>{language === 'km' ? 'ហៅទូរស័ព្ទ' : 'Call'}</span>
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
                      toast.info(
                        language === 'km'
                          ? 'មិនមានព័ត៌មានទំនាក់ទំនងទេ'
                          : 'No contact method configured'
                      )
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all active:scale-95 shadow-2xs cursor-pointer"
                >
                  <MessageSquare size={12} />
                  <span>{language === 'km' ? 'ផ្ញើសារ' : 'Chat'}</span>
                </button>
              </div>
            </div>

            {/* Customer Details List */}
            <div className="pt-4 space-y-3.5 text-xs">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
                  {language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone'}
                </span>
                <span className="font-mono text-foreground font-semibold">
                  {customerPhone}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
                  {language === 'km' ? 'អ៊ីមែល' : 'Email'}
                </span>
                <span
                  className="font-medium text-foreground truncate block max-w-full"
                  title={customerEmail}
                >
                  {customerEmail}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
                  {language === 'km' ? 'អាសយដ្ឋានដឹកជញ្ជូន' : 'Shipping address'}
                </span>
                <p className="font-medium text-foreground leading-relaxed pt-0.5">
                  {fullAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Logistics & Courier Card */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">
                {language === 'km' ? 'ព័ត៌មានដឹកជញ្ជូន & ក្រុមហ៊ុន' : 'Logistics & Courier'}
              </h2>
              <button
                type="button"
                onClick={() => setWaybillModalOpen(true)}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                {language === 'km' ? 'ស្លាកដឹក' : 'Waybill'}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">
                  {language === 'km' ? 'ក្រុមហ៊ុនដឹកជញ្ជូន' : 'Courier Provider'}
                </span>
                <span className="font-bold text-foreground px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[11px]">
                  {courierName}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">
                  {language === 'km' ? 'លេខកូដតាមដាន' : 'Tracking Number'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-300">
                    {trackingNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(trackingNumber, 'tracking')}
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5"
                    title={language === 'km' ? 'ចម្លងលេខតាមដាន' : 'Copy tracking'}
                  >
                    {copiedField === 'tracking' ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">
                  {language === 'km' ? 'ស្ថានភាពដឹកជញ្ជូន' : 'Fulfillment Status'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>
                    {order.fulfillment_status === 'fulfilled'
                      ? language === 'km'
                        ? 'បានរៀបចំដឹក'
                        : 'Fulfilled'
                      : language === 'km'
                      ? 'រង់ចាំរៀបចំ'
                      : 'Unfulfilled'}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {language === 'km' ? 'ថ្លៃសេវាដឹក' : 'Shipping Fee'}
                </span>
                <span className="font-mono font-bold text-foreground">
                  {formatCurrency(shippingCost, 'USD')}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Payment & Settlement Info */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground">
              {language === 'km' ? 'ព័ត៌មាននៃការទូទាត់' : 'Payment Information'}
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">
                  {language === 'km' ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Method'}
                </span>
                <span className="font-bold text-foreground px-2 py-0.5 rounded-md bg-muted border border-border text-[11px]">
                  {paymentMethodLabel}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">
                  {language === 'km' ? 'ស្ថានភាពទូទាត់' : 'Payment Status'}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isCancelled
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : isRefunded
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                      : isPaid
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>
                    {isCancelled
                      ? (language === 'km' ? 'បានបោះបង់' : 'Cancelled')
                      : isRefunded
                      ? (language === 'km' ? 'បានសងប្រាក់' : 'Refunded')
                      : isPaid
                      ? (language === 'km' ? 'បានទូទាត់' : 'Paid')
                      : (language === 'km' ? 'មិនទាន់ទូទាត់ (COD)' : 'Unpaid (COD)')}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">
                  {language === 'km' ? 'លេខយោងប្រតិបត្តិការ' : 'Reference'}
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-semibold text-foreground">
                    {orderNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(orderNumber, 'ref')}
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5"
                    title={language === 'km' ? 'ចម្លងលេខយោង' : 'Copy reference'}
                  >
                    {copiedField === 'ref' ? (
                      <Check size={11} className="text-emerald-500" />
                    ) : (
                      <Copy size={11} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">
                  {language === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}
                </span>
                <span className="font-medium text-foreground">
                  {formatFullDateTime(orderDate)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {language === 'km' ? 'ទឹកប្រាក់បានទូទាត់' : 'Paid Amount'}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(paidAmount, 'USD')}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Store & Sales Channel */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-3">
            <h2 className="text-base font-bold text-foreground">
              {language === 'km' ? 'ប្រភពនៃការលក់' : 'Sales Channel & Store'}
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {language === 'km' ? 'បណ្តាញលក់' : 'Channel'}
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{language === 'km' ? 'ហាងអនឡាញ' : 'Online Web Store'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {language === 'km' ? 'ហាងសាខា' : 'Store Branch'}
                </span>
                <span className="font-semibold text-foreground">
                  {order.store?.name || order.company?.name || 'HQ Central Store'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {language === 'km' ? 'ទីតាំងបំពេញទំនិញ' : 'Fulfillment Hub'}
                </span>
                <span className="font-semibold text-muted-foreground">
                  {order.warehouse?.name || 'Main E-Commerce Hub'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. POS 80MM / 58MM ORDER RECEIPT MODAL ─────────────────────────── */}
      {receiptModalOpen && order && (
        <SalesReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          sale={receiptSalePayload as any}
        />
      )}

      {/* ── 4. COURIER SHIPPING WAYBILL MODAL (ស្លាកបញ្ញើដឹកជញ្ជូន) ─────────── */}
      {waybillModalOpen && order && (
        <ShippingWaybillModal
          isOpen={waybillModalOpen}
          onClose={() => setWaybillModalOpen(false)}
          order={order}
        />
      )}

      {/* ── 5. GLOBAL STATUS UPDATE MODAL ───────────────────────────────────── */}
      <UpdateOrderStatusModal
        isOpen={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        orderId={order?.id}
        orderNumber={orderNumber}
        currentStatus={order?.status}
      />
    </div>
  )
}

export default OrderDetailPage
