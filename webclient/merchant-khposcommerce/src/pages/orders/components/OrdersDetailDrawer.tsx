import React, { useState } from 'react'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Loader2,
  CheckCircle2,
  Truck,
  Clock,
  DollarSign,
  Printer,
  QrCode,
  Building,
  CreditCard,
  Copy,
  Check,
  Calendar,
  ShieldCheck,
  AlertCircle,
  FileText,
  Boxes,
  ArrowRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { useToast } from '@/hooks/useToast'
import {
  StatusBadge,
  ProductThumbnail,
  AvatarImage,
  CloseButton,
  ActionButton,
} from '@/components/common'
import { formatCurrency, GlobalFormat } from '@/utils/formatters'

const KHR_RATE = 4100

export interface OrderItem {
  id: number
  product_id?: number
  product_name?: string
  name?: string
  sku?: string
  barcode?: string
  quantity: number
  unit_price: number
  price?: number
  discount_amount?: number
  tax_amount?: number
  total?: number
  subtotal?: number
  product_image?: string
  image?: string
  variant?: {
    id: number
    name?: string
    sku?: string
    color?: string
    size?: string
    price?: number
  }
  product?: {
    id?: number
    name?: string
    image?: string
    primary_image?: string
    category?: { name?: string }
  }
}

export interface Order {
  id: number
  order_number: string
  customer?: {
    id?: number
    name?: string
    phone?: string
    email?: string
    avatar?: string
    photo?: string
    group?: { name?: string; discount_percent?: number }
  }
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  shipping_name?: string
  shipping_phone?: string
  shipping_address?: string
  shipping_city?: string
  shipping_province?: string
  shipping_postal_code?: string
  carrier?: string
  courier?: string
  tracking_number?: string
  tracking_code?: string
  shipping_method?: any
  shippingMethod?: any
  shipment?: any
  payments?: any[]
  payment_method?: string
  payment_status?: 'unpaid' | 'partial' | 'paid' | 'refunded' | string
  fulfillment_status?: 'unfulfilled' | 'partial' | 'fulfilled' | string
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded' | string
  subtotal?: number
  grand_total?: number
  total_amount?: number
  discount_amount?: number
  tax_amount?: number
  shipping_cost?: number
  shipping_fee?: number
  notes?: string
  created_at: string
  updated_at?: string
  items?: OrderItem[]
  order_items?: OrderItem[]
  details?: OrderItem[]
  [key: string]: any
}

interface OrdersDetailDrawerProps {
  order: Order | undefined
  isLoading: boolean
  onClose: () => void
  onPrintReceipt?: (order: Order) => void
  onPrintWaybill?: (order: Order) => void
}

export const OrdersDetailDrawer: React.FC<OrdersDetailDrawerProps> = ({
  order,
  isLoading,
  onClose,
  onPrintReceipt,
  onPrintWaybill,
}) => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['orders', 'sales', 'common'])
  const toast = useToast()
  const [copiedTracking, setCopiedTracking] = useState(false)
  const [copiedOrderNo, setCopiedOrderNo] = useState(false)

  // Normalize items list across different API payload keys
  const itemsList: OrderItem[] =
    order?.items ||
    order?.order_items ||
    order?.details ||
    []

  // Normalize customer info
  const customerName =
    order?.customer?.name ||
    order?.shipping_name ||
    order?.customer_name ||
    t('orders:walkInCustomer', language === 'km' ? 'អតិថិជនទូទៅ' : 'Walk-in Customer')

  const rawCustomerPhone =
    order?.customer?.phone ||
    order?.customer_phone ||
    order?.shipping_phone

  const customerPhone = rawCustomerPhone ? GlobalFormat.phone(rawCustomerPhone) : '—'

  const rawCustomerEmail =
    order?.customer?.email ||
    order?.customer_email

  const customerEmail = rawCustomerEmail ? GlobalFormat.email(rawCustomerEmail) : '—'

  const customerPhoto =
    order?.customer?.photo ||
    order?.customer?.avatar

  // Normalize shipping destination
  const fullAddress = [
    order?.shipping_address,
    order?.shipping_city,
    order?.shipping_province,
    order?.shipping_postal_code,
  ]
    .filter(Boolean)
    .join(', ')

  // Normalize Courier / Carrier
  const courierName =
    order?.shipping_method?.name ||
    order?.shippingMethod?.name ||
    order?.shipment?.carrier ||
    order?.carrier ||
    order?.courier ||
    (language === 'km' ? 'សេវាដឹកជញ្ជូនរហ័ស' : 'Express Courier')

  const trackingNumber =
    order?.tracking_number ||
    order?.tracking_code ||
    order?.shipment?.tracking_number ||
    (order?.id ? `TRK-${String(order.id).padStart(6, '0')}` : null)

  // Normalize payment method and status
  const extractPaymentName = (): string => {
    if (order?.payments && order.payments.length > 0) {
      const p = order.payments[0]
      if (p.payment_method?.name) return p.payment_method.name
      if (p.name) return p.name
      if (p.method) return p.method
    }
    if (order?.payment_method) return order.payment_method
    return 'Bakong KHQR'
  }

  const rawPaymentMethod = extractPaymentName()
  const paymentMethodLower = rawPaymentMethod.toLowerCase()
  const isPaid = (order?.payment_status || '').toLowerCase() === 'paid'

  let paymentMethodLabel = rawPaymentMethod
  let paymentMethodIcon = <QrCode size={13} className="text-blue-500 shrink-0" />

  if (
    paymentMethodLower.includes('aba') ||
    paymentMethodLower.includes('bakong') ||
    paymentMethodLower.includes('khqr') ||
    paymentMethodLower.includes('qr')
  ) {
    paymentMethodIcon = <QrCode size={13} className="text-blue-500 shrink-0" />
    paymentMethodLabel = t('orders.methodBakong', 'Bakong KHQR')
  } else if (paymentMethodLower.includes('wing')) {
    paymentMethodIcon = <Building size={13} className="text-emerald-500 shrink-0" />
    paymentMethodLabel = t('orders.methodWing', 'Wing Bank')
  } else if (paymentMethodLower.includes('acleda')) {
    paymentMethodIcon = <Building size={13} className="text-blue-600 shrink-0" />
    paymentMethodLabel = t('orders.methodAcleda', 'ACLEDA Mobile')
  } else if (
    paymentMethodLower.includes('card') ||
    paymentMethodLower.includes('credit') ||
    paymentMethodLower.includes('visa') ||
    paymentMethodLower.includes('master')
  ) {
    paymentMethodIcon = <CreditCard size={13} className="text-purple-500 shrink-0" />
    paymentMethodLabel = t('orders.methodCard', language === 'km' ? 'កាតធនាគារ' : 'Credit Card')
  } else if (
    paymentMethodLower.includes('cod') ||
    paymentMethodLower.includes('cash')
  ) {
    paymentMethodIcon = <Truck size={13} className="text-amber-500 shrink-0" />
    paymentMethodLabel = t('orders.methodCod', language === 'km' ? 'ទូទាត់ពេលដឹកដល់ (COD)' : 'Cash on Delivery (COD)')
  }

  // Financial calculations
  const subtotal = Number(order?.subtotal || 0)
  const discountAmount = Number(order?.discount_amount || 0)
  const taxAmount = Number(order?.tax_amount || 0)
  const shippingCost = Number(order?.shipping_cost ?? order?.shipping_fee ?? 0)
  const grandTotal = Number(
    order?.grand_total ?? order?.total_amount ?? (subtotal - discountAmount + taxAmount + shippingCost)
  )
  const grandTotalRiel = Math.round(grandTotal * KHR_RATE)

  // Quantity helper
  const formatQuantity = (qty: any) => {
    return GlobalFormat.number(qty, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }

  const handleCopy = (text: string, type: 'order' | 'tracking') => {
    if (!text) return
    navigator.clipboard.writeText(text)
    if (type === 'order') {
      setCopiedOrderNo(true)
      setTimeout(() => setCopiedOrderNo(false), 2000)
    } else {
      setCopiedTracking(true)
      setTimeout(() => setCopiedTracking(false), 2000)
    }
    toast.success(t('orders:copied', language === 'km' ? 'បានចម្លងជោគជ័យ' : 'Copied to clipboard'))
  }

  // Progression steps state
  const orderStatus = (order?.status || 'pending').toLowerCase()
  const isCancelled = orderStatus === 'cancelled' || orderStatus === 'refunded'
  const isFulfilled =
    (order?.fulfillment_status || '').toLowerCase() === 'fulfilled' ||
    orderStatus === 'shipped' ||
    orderStatus === 'delivered' ||
    orderStatus === 'completed'
  const isDelivered = orderStatus === 'delivered' || orderStatus === 'completed'

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
      />

      {/* Slide-over Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="relative w-full max-w-xl sm:max-w-2xl bg-card border-l border-border shadow-2xl flex flex-col h-full overflow-hidden z-10"
      >
        {/* ── 1. DRAWER TOP HEADER (CLEAN MINIMAL TEXT) ── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/80 bg-card/90 backdrop-blur-md shrink-0">
          <div className="min-w-0 flex-1 pr-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate">
                {t('orders:webOrderDetail', 'Web Order Details')}
              </h2>
              {order && (
                <button
                  type="button"
                  onClick={() => handleCopy(order.order_number, 'order')}
                  className="inline-flex items-center gap-1 font-mono text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md border border-primary/20 transition-colors cursor-pointer"
                  title={t('common:copy', 'Copy')}
                >
                  <span>#{order.order_number}</span>
                  {copiedOrderNo ? <Check size={12} className="text-emerald-500" /> : <Copy size={11} />}
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium line-clamp-1">
              {order?.created_at
                ? new Date(order.created_at).toLocaleString(language === 'km' ? 'km-KH' : 'en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : '—'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <CloseButton onClose={onClose} size="md" color="rose" />
          </div>
        </div>

        {/* ── 2. SCROLLABLE BODY CONTENT ── */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="w-9 h-9 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-medium">
              {t('orders:orderDetails', language === 'km' ? 'កំពុងទាញយកទិន្នន័យបញ្ជាទិញ...' : 'Loading order details...')}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

            {/* ── 2.1 STATUS PROGRESSION & BADGES BANNER ── */}
            <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border/60">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    {t('orders:statusLabel', 'Status')}
                  </span>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {order?.status && <StatusBadge status={order.status} />}
                    {order?.payment_status && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>
                          {isPaid
                            ? t('orders:paymentStatusPaid', 'Paid')
                            : t('orders:paymentStatusUnpaid', 'Unpaid / COD')}
                        </span>
                      </span>
                    )}
                    {order?.fulfillment_status && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <Truck size={11} />
                        <span>
                          {order.fulfillment_status === 'fulfilled'
                            ? t('orders:fulfilled', 'Fulfilled')
                            : t('orders:unfulfilled', 'Unfulfilled')}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[11px] font-bold text-muted-foreground block">
                    {t('orders:channel', language === 'km' ? 'បណ្តាញលក់' : 'Channel')}
                  </span>
                  <span className="text-xs font-bold text-foreground inline-flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{t('orders:onlineStore', 'Online Web Store')}</span>
                  </span>
                </div>
              </div>

              {/* Step Progression Timeline */}
              {!isCancelled ? (
                <div className="pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Clock size={12} className="text-primary" />
                    <span>{t('orders:orderTimeline', 'Order Progression')}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center text-xs">
                    {/* Step 1: Placed */}
                    <div className="space-y-1.5">
                      <div className="h-2 rounded-full bg-emerald-500 shadow-2xs" />
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block leading-tight">
                        {t('orders:stepPlaced', 'Placed')}
                      </span>
                    </div>
                    {/* Step 2: Paid */}
                    <div className="space-y-1.5">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isPaid ? 'bg-emerald-500 shadow-2xs' : 'bg-muted border border-border/70'
                        }`}
                      />
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold block leading-tight ${
                          isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                        }`}
                      >
                        {t('orders:stepPaid', 'Paid')}
                      </span>
                    </div>
                    {/* Step 3: Shipped */}
                    <div className="space-y-1.5">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isFulfilled ? 'bg-blue-500 shadow-2xs' : 'bg-muted border border-border/70'
                        }`}
                      />
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold block leading-tight ${
                          isFulfilled ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
                        }`}
                      >
                        {t('orders:stepShipped', 'Shipped')}
                      </span>
                    </div>
                    {/* Step 4: Done */}
                    <div className="space-y-1.5">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isDelivered ? 'bg-emerald-500 shadow-2xs' : 'bg-muted border border-border/70'
                        }`}
                      />
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold block leading-tight ${
                          isDelivered ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                        }`}
                      >
                        {t('orders:stepCompleted', 'Done')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-600 text-xs font-bold">
                  <AlertCircle size={15} />
                  <span>{t('orders:stepCancelled', 'Order has been cancelled / refunded')}</span>
                </div>
              )}
            </div>

            {/* ── 2.2 TWO-COLUMN INFORMATION: CUSTOMER & LOGISTICS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Details Card */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <User size={15} className="text-primary shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('orders:customerInfo', 'Customer Information')}
                  </h4>
                </div>
                <div className="flex items-start gap-3">
                  <AvatarImage
                    src={customerPhoto}
                    id={order?.customer?.id}
                    name={customerName}
                    fallbackAvatar={true}
                    size="md"
                    shape="circle"
                    className="shadow-xs shrink-0"
                  />
                  <div className="min-w-0 space-y-1 flex-1">
                    <p className="font-bold text-foreground text-sm leading-tight truncate" title={customerName}>
                      {customerName}
                    </p>
                    {order?.customer?.group?.name && (
                      <span className="inline-block font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        {order.customer.group.name}
                      </span>
                    )}
                    <div className="text-xs text-muted-foreground space-y-0.5 pt-0.5">
                      <a
                        href={`tel:${customerPhone}`}
                        className="flex items-center gap-1.5 hover:text-primary transition-colors font-mono"
                      >
                        <Phone size={11} className="shrink-0" />
                        <span className="truncate">{customerPhone}</span>
                      </a>
                      {customerEmail !== '—' && (
                        <a
                          href={`mailto:${customerEmail}`}
                          className="flex items-center gap-1.5 hover:text-primary transition-colors truncate"
                          title={customerEmail}
                        >
                          <Mail size={11} className="shrink-0" />
                          <span className="truncate">{customerEmail}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping & Courier Card */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <Truck size={15} className="text-purple-600 dark:text-purple-400 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('orders:shippingInfo', 'Logistics & Courier')}
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  {/* Courier Name */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {t('orders:courier', 'Courier')}:
                    </span>
                    <span className="font-bold text-foreground text-right truncate max-w-[170px]" title={courierName}>
                      {courierName}
                    </span>
                  </div>

                  {/* Tracking Number */}
                  {trackingNumber && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {t('orders:trackingNumber', 'Tracking')}:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(trackingNumber, 'tracking')}
                        className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-purple-600 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/20 cursor-pointer"
                        title={t('orders:copyTracking', 'Copy Tracking')}
                      >
                        <span>{trackingNumber}</span>
                        {copiedTracking ? <Check size={11} className="text-emerald-500" /> : <Copy size={10} />}
                      </button>
                    </div>
                  )}

                  {/* Destination Address */}
                  <div className="pt-1 border-t border-border/50">
                    <div className="flex items-start gap-1.5 text-muted-foreground">
                      <MapPin size={12} className="text-rose-500 shrink-0 mt-0.5" />
                      <p className="line-clamp-2 leading-relaxed text-[11px]">
                        {fullAddress || t('orders:noShippingAddress', language === 'km' ? 'មិនមានអាសយដ្ឋានដឹកជញ្ជូន' : 'No shipping address')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2.3 PAYMENT & SETTLEMENT INFO ── */}
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <CreditCard size={15} className="text-primary shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('orders:paymentInfo', 'Payment Information')}
                  </h4>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isPaid
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{isPaid ? t('orders:paid', 'Paid') : t('orders:unpaid', 'Unpaid')}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground block font-medium mb-0.5">
                    {t('orders:paymentMethod', 'Payment Method')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                    {paymentMethodIcon}
                    <span className="truncate">{paymentMethodLabel}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-medium mb-0.5">
                    {t('orders:transactionRef', 'Transaction Ref')}
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {order?.transaction_id || order?.reference_no || `#TXN-${order?.id || '—'}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-medium mb-0.5">
                    {t('orders:paidAmount', 'Paid Amount')}
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(isPaid ? grandTotal : 0, 'USD')}
                  </span>
                </div>
              </div>
            </div>

            {/* ── 2.4 PURCHASED ITEMS TABLE WITH THUMBNAILS ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Boxes size={15} className="text-primary shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('orders:orderedItems', 'Ordered Items')} ({itemsList.length})
                  </h4>
                </div>
                <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                  {itemsList.reduce((acc, it) => acc + Number(it.quantity || 1), 0)} pcs
                </span>
              </div>

              <div className="border border-border/80 rounded-2xl overflow-hidden text-xs bg-card shadow-2xs">
                <table className="w-full text-left">
                  <thead className="bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase border-b border-border/60">
                    <tr>
                      <th className="p-3">{t('orders:productName', 'Item & Product')}</th>
                      <th className="p-3 text-center w-16">{t('orders:qty', 'Qty')}</th>
                      <th className="p-3 text-right">{t('orders:unitPrice', 'Price')}</th>
                      <th className="p-3 text-right">{t('orders:total', 'Total')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {itemsList.map((item, idx) => {
                      const itemName =
                        item.product_name ||
                        item.name ||
                        item.product?.name ||
                        (language === 'km' ? 'ទំនិញទូទៅ' : 'Standard Product')
                      const itemPhoto =
                        item.product_image ||
                        item.image ||
                        item.product?.primary_image ||
                        item.product?.image
                      const itemQty = formatQuantity(item.quantity)
                      const itemPrice = Number(item.unit_price ?? item.price ?? 0)
                      const itemTotal = Number(
                        item.total ?? item.subtotal ?? (Number(itemQty) * itemPrice)
                      )
                      const itemDiscount = Number(item.discount_amount || 0)

                      return (
                        <tr key={item.id || idx} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <ProductThumbnail
                                name={itemName}
                                primaryImage={item.product?.primary_image}
                                image={itemPhoto}
                                categoryName={item.product?.category?.name}
                                size="sm"
                                className="rounded-xl shadow-2xs shrink-0"
                              />
                              <div className="min-w-0 space-y-0.5">
                                <span className="font-bold text-foreground block truncate max-w-[220px]" title={itemName}>
                                  {itemName}
                                </span>
                                <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                                  {(item.sku || item.variant?.sku) && (
                                    <span className="font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50">
                                      {item.sku || item.variant?.sku}
                                    </span>
                                  )}
                                  {item.variant?.name && (
                                    <span className="font-medium text-primary">
                                      {item.variant.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center font-bold font-mono text-foreground">
                            {itemQty}
                          </td>
                          <td className="p-3 text-right font-mono">
                            <div>{formatCurrency(itemPrice, 'USD')}</div>
                            {itemDiscount > 0 && (
                              <div className="text-[10px] text-rose-500 font-semibold">
                                -{formatCurrency(itemDiscount, 'USD')}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-right font-bold font-mono text-foreground">
                            {formatCurrency(itemTotal, 'USD')}
                          </td>
                        </tr>
                      )
                    })}

                    {itemsList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground text-xs font-medium">
                          {t('orders:noItemsFound', 'No items found in this order')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 2.5 FINANCIAL SUMMARY (DUAL CURRENCY USD & KHR) ── */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-1.5 border-b border-border/60">
                {t('orders:financialSummary', 'Financial Summary')}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Subtotal */}
                <div className="p-3 rounded-xl bg-card border border-border/70 shadow-2xs">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                    {t('orders:subtotal', 'Subtotal')}
                  </span>
                  <span className="font-extrabold font-mono text-foreground text-sm">
                    {formatCurrency(subtotal, 'USD')}
                  </span>
                </div>

                {/* Discount */}
                <div className="p-3 rounded-xl bg-card border border-border/70 shadow-2xs">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                    {t('orders:discount', 'Discount')}
                  </span>
                  <span className="font-extrabold font-mono text-rose-500 text-sm">
                    -{formatCurrency(discountAmount, 'USD')}
                  </span>
                </div>

                {/* Tax */}
                <div className="p-3 rounded-xl bg-card border border-border/70 shadow-2xs">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                    {t('orders:tax', 'Tax (VAT)')}
                  </span>
                  <span className="font-extrabold font-mono text-foreground text-sm">
                    {formatCurrency(taxAmount, 'USD')}
                  </span>
                </div>

                {/* Shipping Fee */}
                <div className="p-3 rounded-xl bg-card border border-border/70 shadow-2xs">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                    {t('orders:shipping', 'Shipping')}
                  </span>
                  <span className="font-extrabold font-mono text-foreground text-sm">
                    {formatCurrency(shippingCost, 'USD')}
                  </span>
                </div>
              </div>

              {/* Grand Total Bar with KHR */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                    {t('orders:grandTotal', 'Grand Total')}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('orders:equivalentRiel', language === 'km' ? 'គិតជាប្រាក់រៀលកម្ពុជា' : 'Equivalent in Cambodian Riel')}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xl font-black text-primary tracking-tight">
                    {formatCurrency(grandTotal, 'USD')}
                  </div>
                  <div className="text-xs font-bold text-muted-foreground">
                    {formatCurrency(grandTotalRiel, 'KHR')}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2.6 SPECIAL NOTES IF PRESENT ── */}
            {order?.notes && (
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  {t('orders:notes', 'Special Notes')}
                </span>
                <p className="text-xs text-foreground italic leading-relaxed">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── 3. DRAWER FOOTER ACTIONS ── */}
        {(order && (onPrintWaybill || onPrintReceipt)) && (
          <div className="p-4 border-t border-border/80 bg-card/90 backdrop-blur-md flex items-center justify-end gap-2.5 shrink-0">
            {onPrintWaybill && (
              <ActionButton
                variant="outline"
                size="sm"
                icon={<Truck size={14} className="text-purple-600 dark:text-purple-400" />}
                label={t('orders:printWaybill', language === 'km' ? 'បោះពុម្ពប័ណ្ណដឹក' : 'Waybill')}
                onClick={() => onPrintWaybill(order)}
              />
            )}
            {onPrintReceipt && (
              <ActionButton
                variant="primary"
                size="sm"
                icon={<Printer size={14} />}
                label={t('orders:printReceipt', language === 'km' ? 'បោះពុម្ពវិក្កយបត្រ' : 'Receipt')}
                onClick={() => onPrintReceipt(order)}
              />
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default OrdersDetailDrawer
