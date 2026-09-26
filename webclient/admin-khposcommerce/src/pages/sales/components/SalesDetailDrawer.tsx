import React, { useState } from 'react'
import {
  User,
  ShieldCheck,
  CornerUpLeft,
  Loader2,
  CheckCircle2,
  Tag,
  DollarSign,
  CreditCard,
  FileText,
  Printer,
  Boxes,
  Store,
  Building2,
  Calendar,
  Clock,
  Copy,
  Check,
  Phone,
  Mail,
  QrCode,
  Building,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { useToast } from '@/hooks/useToast'
import {
  StatusBadge,
  CloseButton,
  AvatarImage,
  ProductThumbnail,
  ActionButton,
} from '@/components/common'
import { formatCurrency, GlobalFormat } from '@/utils/formatters'

const KHR_RATE = 4100

export interface SaleItem {
  id: number
  product_id: number
  product_name?: string
  name?: string
  sku?: string
  quantity: number
  qty?: number
  unit_price: number
  price?: number
  discount_amount?: number
  tax_amount?: number
  subtotal?: number
  total?: number
  image?: string
  product_image?: string
  product?: {
    name?: string
    image?: string
    primary_image?: string
    category?: { name?: string }
  }
}

export interface Sale {
  id: number
  invoice_number: string
  reference_no?: string
  customer?: {
    id?: number
    name?: string
    phone?: string
    email?: string
    photo?: string
    avatar?: string
    group?: { name?: string; discount_percent?: number }
  }
  cashier?: {
    id?: number
    name?: string
    avatar?: string
    photo?: string
  }
  company?: { name?: string }
  branch?: { name?: string }
  store?: { name?: string }
  warehouse?: { name?: string }
  date?: string
  created_at: string
  status: 'pending' | 'completed' | 'cancelled' | 'refunded' | string
  payment_status?: string
  payment_method?: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  grand_total: number
  total_amount?: number
  paid_amount?: number
  change_amount?: number
  currency_code?: string
  notes?: string
  items?: SaleItem[]
  sale_items?: SaleItem[]
  details?: SaleItem[]
  [key: string]: any
}

interface SalesDetailDrawerProps {
  sale: Sale | undefined
  isLoading: boolean
  onClose: () => void
  onRefund: () => void
  onPrintReceipt?: (sale: Sale) => void
  isRefunding: boolean
}

export const SalesDetailDrawer: React.FC<SalesDetailDrawerProps> = ({
  sale,
  isLoading,
  onClose,
  onRefund,
  onPrintReceipt,
  isRefunding,
}) => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['sales', 'common'])
  const toast = useToast()
  const [copiedInvoice, setCopiedInvoice] = useState(false)

  // Robust items fallback for different API response keys
  const itemsList: SaleItem[] =
    sale?.items ||
    sale?.sale_items ||
    sale?.details ||
    (sale as any)?.saleDetails ||
    []

  // Handle invoice copy
  const handleCopyInvoice = () => {
    if (!sale?.invoice_number) return
    navigator.clipboard.writeText(sale.invoice_number)
    setCopiedInvoice(true)
    setTimeout(() => setCopiedInvoice(false), 2000)
    toast.success(t('copied', language === 'km' ? 'បានចម្លងជោគជ័យ' : 'Copied to clipboard'))
  }

  // Format quantity
  const formatQuantity = (qty: any) => {
    const num = Number(qty || 1)
    return Number.isInteger(num) ? String(num) : num.toFixed(2)
  }

  // Payment method resolver
  const rawMethod = (sale?.payment_method || 'cash').toLowerCase()
  let methodLabel = sale?.payment_method || 'Cash'
  let methodIcon = <DollarSign size={13} className="text-emerald-500 shrink-0" />

  if (
    rawMethod.includes('aba') ||
    rawMethod.includes('khqr') ||
    rawMethod.includes('bakong') ||
    rawMethod.includes('qr')
  ) {
    methodIcon = <QrCode size={13} className="text-blue-500 shrink-0" />
    methodLabel = 'Bakong KHQR'
  } else if (rawMethod.includes('wing')) {
    methodIcon = <Building size={13} className="text-emerald-500 shrink-0" />
    methodLabel = 'Wing Bank'
  } else if (rawMethod.includes('acleda')) {
    methodIcon = <Building size={13} className="text-blue-600 shrink-0" />
    methodLabel = 'ACLEDA Mobile'
  } else if (
    rawMethod.includes('card') ||
    rawMethod.includes('credit') ||
    rawMethod.includes('visa') ||
    rawMethod.includes('master')
  ) {
    methodIcon = <CreditCard size={13} className="text-purple-500 shrink-0" />
    methodLabel = language === 'km' ? 'កាតធនាគារ (Card)' : 'Credit Card'
  } else if (rawMethod.includes('cash')) {
    methodIcon = <DollarSign size={13} className="text-emerald-500 shrink-0" />
    methodLabel = language === 'km' ? 'សាច់ប្រាក់សុទ្ធ (Cash)' : 'Cash'
  }

  // Financial amounts
  const subtotal = Number(sale?.subtotal || 0)
  const discountAmount = Number(sale?.discount_amount || 0)
  const taxAmount = Number(sale?.tax_amount || 0)
  const grandTotal = Number(sale?.grand_total ?? sale?.total_amount ?? (subtotal - discountAmount + taxAmount))
  const grandTotalRiel = Math.round(grandTotal * KHR_RATE)
  const paidAmount = Number(sale?.paid_amount ?? grandTotal)
  const changeAmount = Number(sale?.change_amount ?? 0)

  const isCompleted = sale?.status === 'completed'
  const isRefunded = sale?.status === 'refunded'
  const isCancelled = sale?.status === 'cancelled'

  const customerName =
    sale?.customer?.name ||
    t('walkInCustomer', language === 'km' ? 'អតិថិជនដើរចូល' : 'Walk-in Customer')
  const customerPhoto = sale?.customer?.photo || sale?.customer?.avatar

  const cashierName = sale?.cashier?.name
    ? sale.cashier.name.replace(/\s*\(system\)/i, '')
    : t('superAdmin', 'Super Admin')

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
                {t('saleOrderDetail', language === 'km' ? 'ព័ត៌មានលម្អិតការលក់' : 'Sale Order Details')}
              </h2>
              {sale?.invoice_number && (
                <button
                  type="button"
                  onClick={handleCopyInvoice}
                  className="inline-flex items-center gap-1 font-mono text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md border border-primary/20 transition-colors cursor-pointer"
                  title={t('common:copy', 'Copy')}
                >
                  <span>#{sale.invoice_number}</span>
                  {copiedInvoice ? <Check size={12} className="text-emerald-500" /> : <Copy size={11} />}
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium line-clamp-1">
              {sale?.created_at || sale?.date
                ? new Date(sale.created_at || sale.date!).toLocaleString(language === 'km' ? 'km-KH' : 'en-US', {
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

        {/* ── 2. SCROLLABLE BODY ── */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="w-9 h-9 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-medium">
              {t('loadingSaleOrderDetails', language === 'km' ? 'កំពុងទាញយកទិន្នន័យវិក្កយបត្រ...' : 'Loading sale order details...')}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

            {/* ── 2.1 STATUS & STORE HEADER BANNER ── */}
            <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    {t('orderStatus', 'Status')}
                  </span>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {sale?.status && <StatusBadge status={sale.status} />}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{t('paidInFull', language === 'km' ? 'ទូទាត់រួចរាល់' : 'Paid in Full')}</span>
                    </span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[11px] font-bold text-muted-foreground block">
                    {t('branch', language === 'km' ? 'សាខា / ហាង' : 'Store Branch')}
                  </span>
                  <span className="text-xs font-bold text-foreground inline-flex items-center gap-1.5 mt-0.5">
                    <Store size={13} className="text-primary shrink-0" />
                    <span>{sale?.store?.name || sale?.branch?.name || sale?.company?.name || 'Main POS Store'}</span>
                  </span>
                </div>
              </div>

              {/* Cashier & Terminal Meta */}
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground pt-0.5">
                <div className="flex items-center gap-2">
                  <AvatarImage
                    src={sale?.cashier?.avatar || sale?.cashier?.photo}
                    name={cashierName}
                    size="xs"
                    shape="circle"
                  />
                  <span className="font-medium">
                    {t('cashier', 'Cashier')}: <strong className="text-foreground">{cashierName}</strong>
                  </span>
                </div>
                <div className="font-mono text-[11px]">
                  <span>{t('posTerminal', 'POS Terminal')} #1</span>
                </div>
              </div>
            </div>

            {/* ── 2.2 TWO-COLUMN: CUSTOMER & PAYMENT DETAILS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Details */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <User size={15} className="text-primary shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('customerInfo', language === 'km' ? 'ព័ត៌មានអតិថិជន' : 'Customer Information')}
                  </h4>
                </div>
                <div className="flex items-start gap-3">
                  <AvatarImage
                    src={customerPhoto}
                    id={sale?.customer?.id}
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
                    {sale?.customer?.group?.name && (
                      <span className="inline-block font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        {sale.customer.group.name}
                      </span>
                    )}
                    <div className="text-xs text-muted-foreground space-y-0.5 pt-0.5">
                      {sale?.customer?.phone && (
                        <a
                          href={`tel:${sale.customer.phone}`}
                          className="flex items-center gap-1.5 hover:text-primary transition-colors font-mono"
                        >
                          <Phone size={11} className="shrink-0" />
                          <span className="truncate">{GlobalFormat.phone(sale.customer.phone)}</span>
                        </a>
                      )}
                      {sale?.customer?.email && (
                        <a
                          href={`mailto:${sale.customer.email}`}
                          className="flex items-center gap-1.5 hover:text-primary transition-colors truncate"
                        >
                          <Mail size={11} className="shrink-0" />
                          <span className="truncate">{GlobalFormat.email(sale.customer.email)}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Details */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <CreditCard size={15} className="text-primary shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('paymentMethod', language === 'km' ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Method')}
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {t('paymentMethod', 'Method')}:
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                      {methodIcon}
                      <span>{methodLabel}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {t('paidAmount', language === 'km' ? 'ប្រាក់បានបង់' : 'Paid Amount')}:
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(paidAmount, 'USD')}
                    </span>
                  </div>
                  {changeAmount > 0 && (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {t('changeDue', language === 'km' ? 'ប្រាក់អាប់' : 'Change Due')}:
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {formatCurrency(changeAmount, 'USD')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── 2.3 PURCHASED ITEMS TABLE WITH THUMBNAILS ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Boxes size={15} className="text-primary shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('purchasedItems', language === 'km' ? 'ទំនិញដែលបានទិញ' : 'Purchased Items')} ({itemsList.length})
                  </h4>
                </div>
                <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                  {itemsList.reduce((acc, it) => acc + Number(it.quantity || it.qty || 1), 0)} pcs
                </span>
              </div>

              <div className="border border-border/80 rounded-2xl overflow-hidden text-xs bg-card shadow-2xs">
                <table className="w-full text-left">
                  <thead className="bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase border-b border-border/60">
                    <tr>
                      <th className="p-3">{t('item', language === 'km' ? 'មុខទំនិញ' : 'Item')}</th>
                      <th className="p-3 text-center w-16">{t('qty', language === 'km' ? 'ចំនួន' : 'Qty')}</th>
                      <th className="p-3 text-right">{t('price', language === 'km' ? 'តម្លៃ' : 'Price')}</th>
                      <th className="p-3 text-right">{t('total', language === 'km' ? 'សរុប' : 'Total')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {itemsList.map((item, idx) => {
                      const itemName =
                        item.product_name ||
                        item.name ||
                        item.product?.name ||
                        (language === 'km' ? 'មុខទំនិញ' : 'Product Item')
                      const itemPhoto =
                        item.image ||
                        item.product_image ||
                        item.product?.primary_image ||
                        item.product?.image
                      const itemQty = formatQuantity(item.quantity || item.qty)
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
                                {item.sku && (
                                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50 inline-block">
                                    {item.sku}
                                  </span>
                                )}
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
                          {t('noSalesOrdersFound', language === 'km' ? 'គ្មានទំនិញក្នុងវិក្កយបត្រនេះទេ' : 'No items listed in this receipt')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 2.4 FINANCIAL SUMMARY CARD (DUAL CURRENCY USD & KHR) ── */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-1.5 border-b border-border/60">
                {t('financialSummary', language === 'km' ? 'សង្ខេបការទូទាត់ប្រាក់' : 'Payment Summary')}
              </h4>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Subtotal */}
                <div className="p-3 rounded-xl bg-card border border-border/70 shadow-2xs">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                    {t('subtotal', language === 'km' ? 'សរុបរង' : 'Subtotal')}
                  </span>
                  <span className="font-extrabold font-mono text-foreground text-sm">
                    {formatCurrency(subtotal, 'USD')}
                  </span>
                </div>

                {/* Discount */}
                <div className="p-3 rounded-xl bg-card border border-border/70 shadow-2xs">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                    {t('discount', language === 'km' ? 'បញ្ចុះតម្លៃ' : 'Discount')}
                  </span>
                  <span className="font-extrabold font-mono text-rose-500 text-sm">
                    -{formatCurrency(discountAmount, 'USD')}
                  </span>
                </div>

                {/* Tax */}
                <div className="p-3 rounded-xl bg-card border border-border/70 shadow-2xs">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                    {t('tax', language === 'km' ? 'ពន្ធ (VAT)' : 'Tax (VAT)')}
                  </span>
                  <span className="font-extrabold font-mono text-foreground text-sm">
                    {formatCurrency(taxAmount, 'USD')}
                  </span>
                </div>
              </div>

              {/* Grand Total Bar with KHR */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                    {t('grandTotal', language === 'km' ? 'សរុបចុងក្រោយ' : 'Grand Total')}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('equivalentRiel', language === 'km' ? 'គិតជាប្រាក់រៀលកម្ពុជា' : 'Equivalent in Cambodian Riel')}
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

            {/* ── 2.5 SPECIAL NOTES IF PRESENT ── */}
            {sale?.notes && (
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  {t('note', 'Note')}
                </span>
                <p className="text-xs text-foreground italic leading-relaxed">
                  {sale.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── 3. DRAWER FOOTER ACTIONS ── */}
        {(sale && (onPrintReceipt || (sale?.status !== 'refunded' && sale?.status !== 'cancelled'))) && (
          <div className="p-4 border-t border-border/80 bg-card/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
            <div>
              {sale && onPrintReceipt && (
                <ActionButton
                  variant="outline"
                  size="sm"
                  icon={<Printer size={13} />}
                  label={t('printReceipt', language === 'km' ? 'បោះពុម្ព' : 'Print')}
                  onClick={() => onPrintReceipt(sale)}
                />
              )}
            </div>

            {sale?.status !== 'refunded' && sale?.status !== 'cancelled' && (
              <ActionButton
                variant="danger"
                size="sm"
                icon={<CornerUpLeft className="w-4 h-4" />}
                loading={isRefunding}
                disabled={isRefunding}
                label={t('processReturnRefund', language === 'km' ? 'សងប្រាក់វិញ' : 'Return & Refund')}
                onClick={onRefund}
              />
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default SalesDetailDrawer
