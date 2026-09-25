import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import {
  RotateCcw,
  PackageCheck,
  ChevronDown,
  ChevronUp,
  Check,
  Banknote,
  CreditCard,
  Wallet,
  ShoppingBag,
  Info,
} from 'lucide-react'
import { EnterpriseModal, ModalFooter } from '@/components/common'
import { salesService } from '@/services/salesService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import { formatCurrency } from '@/utils/formatters'

interface ProcessRefundModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: (payload: { reason: string; refund_method: string }) => void
  isPending?: boolean
  sale: any
  onRefundSuccess?: () => void
}

const REASON_OPTIONS = [
  { id: 'defective', key: 'reasonDefective', fallback: 'Defective / Damaged Item' },
  { id: 'wrong_item', key: 'reasonWrongItem', fallback: 'Wrong Item / Size' },
  { id: 'changed_mind', key: 'reasonChangedMind', fallback: 'Customer Changed Mind' },
  { id: 'other', key: 'reasonOther', fallback: 'Other Reasons' },
] as const

const REFUND_METHODS = [
  { id: 'cash', key: 'cash', fallback: 'Cash', icon: Banknote },
  { id: 'original_payment', key: 'originalPayment', fallback: 'Original Method', icon: CreditCard },
  { id: 'store_credit', key: 'storeCredit', fallback: 'Store Credit', icon: Wallet },
] as const

const KHR_RATE = 4100

export const ProcessRefundModal: React.FC<ProcessRefundModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  sale,
  onRefundSuccess,
}) => {
  const { t, i18n } = useTranslation('sales')
  const toast = useToast()

  const [reasonPreset, setReasonPreset] = useState<string>('defective')
  const [customReason, setCustomReason] = useState<string>('')
  const [refundMethod, setRefundMethod] = useState<string>('cash')
  const [showItemsList, setShowItemsList] = useState<boolean>(false)

  useEffect(() => {
    if (isOpen) {
      setReasonPreset('defective')
      setCustomReason('')
      setRefundMethod('cash')
      setShowItemsList(false)
    }
  }, [isOpen])

  // Internal mutation used if onConfirm is not passed
  const internalMutation = useMutation({
    mutationFn: (payload: { reason: string; refund_method: string }) => {
      if (!sale?.id) return Promise.reject(new Error('Missing sale ID'))
      const rawItems = sale?.items || sale?.sale_items || sale?.details || []
      const itemsPayload = rawItems.map((item: any) => ({
        sale_item_id: item.id,
        product_id: item.product_id,
        product_variant_id: item.product_variant_id ?? null,
        quantity: Number(item.quantity || 1),
      }))
      return salesService.returnSale(sale.id, {
        reason: payload.reason,
        refund_method: payload.refund_method,
        items: itemsPayload.length > 0 ? itemsPayload : undefined,
      })
    },
    onSuccess: () => {
      try {
        sound.playSuccess()
      } catch {}
      toast.success(t('refundSuccess', 'Sale order refunded successfully.'))
      onRefundSuccess?.()
      onClose()
    },
    onError: (error: any) => {
      try {
        sound.playError()
      } catch {}
      toast.error(error?.response?.data?.message || t('refundFailed', 'Failed to refund sale order.'))
    },
  })

  if (!isOpen || !sale) return null

  const grandTotal = Number(sale.grand_total || 0)
  const paidAmount = Number(sale.paid_amount ?? sale.grand_total ?? 0)
  const refundPayable = paidAmount > 0 ? paidAmount : grandTotal
  const isSubmitting = isPending ?? internalMutation.isPending

  const rawItems: any[] = sale?.items || sale?.sale_items || sale?.details || []
  const totalItemsCount = rawItems.reduce(
    (totalQuantity, item) => totalQuantity + Number(item.quantity || item.qty || 1),
    0
  )

  const customerName =
    sale?.customer?.name ||
    sale?.customer_name ||
    t('walkInCustomer', 'General Customer')

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    let finalReason = ''
    switch (reasonPreset) {
      case 'defective':
        finalReason = t('reasonDefective', 'Defective / Damaged Item')
        break
      case 'wrong_item':
        finalReason = t('reasonWrongItem', 'Wrong Item / Size')
        break
      case 'changed_mind':
        finalReason = t('reasonChangedMind', 'Customer Changed Mind')
        break
      default:
        finalReason = customReason.trim() || t('reasonOther', 'Other Reasons')
    }

    if (reasonPreset === 'other' && customReason.trim()) {
      finalReason = customReason.trim()
    }

    const payload = {
      reason: finalReason,
      refund_method: refundMethod,
    }

    if (onConfirm) {
      onConfirm(payload)
    } else {
      internalMutation.mutate(payload)
    }
  }

  const getMethodNote = () => {
    switch (refundMethod) {
      case 'cash':
        return t('cashMethodNote', 'Cash will be paid out from the register drawer.')
      case 'original_payment':
        return t('originalMethodNote', 'Refund will be routed back to original payment channel.')
      case 'store_credit':
        return t('storeCreditMethodNote', "Credit will be added to the customer's store account.")
      default:
        return ''
    }
  }

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={t('processReturnRefund', 'Process Return & Refund')}
      subtitle={
        <span className="flex items-center gap-1.5 flex-wrap text-muted-foreground">
          {sale.invoice_number && (
            <span className="font-mono font-bold text-foreground">
              #{sale.invoice_number}
            </span>
          )}
          <span>•</span>
          <span className="font-medium text-foreground/80">{customerName}</span>
        </span>
      }
      icon={<RotateCcw size={18} />}
      iconVariant="rose"
      badge={
        <span className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          {t('fullRefund', 'Full Refund (100%)')}
        </span>
      }
      footer={
        <ModalFooter
          onCancel={onClose}
          cancelLabel={t('cancel', 'Cancel')}
          submitLabel={`${t('confirmRefund', 'Process Refund')} • ${formatCurrency(refundPayable, 'USD')}`}
          submitVariant="danger"
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
          submitIcon={<RotateCcw size={14} className="stroke-[2.5]" />}
        />
      }
    >
      <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
        {/* ── 1. HERO FINANCIAL SUMMARY CARD ── */}
        <div className="rounded-2xl border border-rose-500/20 bg-linear-to-br from-rose-500/5 via-background to-rose-500/10 dark:from-rose-950/20 dark:via-card dark:to-rose-900/10 p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-500/15">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 block mb-0.5">
                {t('refundAmount', 'Refund Amount')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-rose-600 dark:text-rose-400 tracking-tight">
                  {formatCurrency(refundPayable, 'USD')}
                </span>
                <span className="text-xs font-mono font-medium text-rose-600/75 dark:text-rose-300/75">
                  {formatCurrency(refundPayable * KHR_RATE, 'KHR')}
                </span>
              </div>
            </div>

            {/* Micro stats tag */}
            <div className="flex items-center gap-2 sm:self-center">
              <div className="bg-background/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-border/70 text-right">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  {t('paid', 'Paid')}
                </span>
                <span className="font-mono font-bold text-foreground text-xs">
                  {formatCurrency(paidAmount, 'USD')}
                </span>
              </div>
              <div className="bg-background/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-border/70 text-right">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  {t('grandTotal', 'Grand Total')}
                </span>
                <span className="font-mono font-bold text-foreground text-xs">
                  {formatCurrency(grandTotal, 'USD')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Invoice Context */}
          <div className="pt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShoppingBag size={13} className="text-rose-500/80" />
              <span>
                {rawItems.length} {rawItems.length === 1 ? t('item', 'item') : t('items', 'items')} ({totalItemsCount} {totalItemsCount === 1 ? t('unit', 'unit') : t('units', 'units')})
              </span>
            </div>
            {sale?.created_at && (
              <span className="font-mono text-[10.5px]">
                {new Date(sale.created_at).toLocaleDateString(i18n.language === 'km' ? 'km-KH' : 'en-US')}
              </span>
            )}
          </div>
        </div>

        {/* ── 2. RESTOCK TRANSPARENCY & ITEMS PREVIEW ── */}
        <div className="rounded-2xl border border-border/80 bg-muted/30 dark:bg-slate-800/30 overflow-hidden">
          <div className="p-3 sm:px-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <PackageCheck size={13} />
              </div>
              <p className="text-[11.5px] text-foreground font-medium truncate">
                {t('itemsToRestock', 'Items to Restock')} ({totalItemsCount})
              </p>
            </div>

            {rawItems.length > 0 && (
              <button
                type="button"
                onClick={() => setShowItemsList((prev) => !prev)}
                className="text-[11px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 shrink-0 cursor-pointer px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <span>{showItemsList ? t('hideItems', 'Hide Items') : t('viewItems', 'View Items')}</span>
                {showItemsList ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            )}
          </div>

          {/* Collapsible item details */}
          {showItemsList && rawItems.length > 0 && (
            <div className="border-t border-border/60 p-2.5 space-y-1 max-h-40 overflow-y-auto bg-card/60 divide-y divide-border/40">
              {rawItems.map((item, index) => {
                const name =
                  item.product_name ||
                  item.product?.name ||
                  item.name ||
                  `${t('item', 'Item')} #${index + 1}`
                const qty = Number(item.quantity || item.qty || 1)
                const price = Number(item.unit_price || item.price || 0)
                const lineTotal = Number(item.total || item.subtotal || qty * price)

                return (
                  <div
                    key={item.id || index}
                    className="pt-1.5 first:pt-0 flex items-center justify-between gap-3 text-[11px]"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-foreground truncate block">
                        {name}
                      </span>
                      {item.variant?.name && (
                        <span className="text-[10px] text-muted-foreground block">
                          {item.variant.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-bold text-[10px]">
                        x{qty}
                      </span>
                      <span className="font-bold text-foreground">
                        {formatCurrency(qty * price, 'USD')}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── 3. REFUND REASON (1-Click Preset Chips) ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground block">
              {t('refundReason', 'Refund Reason')} <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10.5px] text-muted-foreground font-medium">
              {t('selectStandardReason', 'Select standard reason')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {REASON_OPTIONS.map((opt) => {
              const isSelected = reasonPreset === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setReasonPreset(opt.id)}
                  className={`px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs dark:bg-primary/20 ring-1 ring-primary/30'
                      : 'border-border/80 bg-card hover:bg-muted/40 text-foreground/80 hover:text-foreground font-medium'
                  }`}
                >
                  <span className="text-[11.5px] leading-snug">{t(opt.key, opt.fallback)}</span>
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary text-white shadow-2xs'
                        : 'border-muted-foreground/30 bg-background group-hover:border-muted-foreground/50'
                    }`}
                  >
                    {isSelected && <Check size={10} strokeWidth={3} />}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Conditional Custom Reason Input */}
          {reasonPreset === 'other' && (
            <div className="pt-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <input
                type="text"
                required
                autoFocus
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder={t('enterCustomReason', 'Enter specific refund reason...')}
                className="w-full h-10 px-3.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
              />
            </div>
          )}
        </div>

        {/* ── 4. REFUND PAYMENT METHOD ── */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground block">
            {t('refundMethod', 'Refund Payment Method')}
          </label>

          <div className="grid grid-cols-3 gap-2">
            {REFUND_METHODS.map((method) => {
              const isSelected = refundMethod === method.id
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setRefundMethod(method.id)}
                  className={`py-2.5 px-2.5 rounded-xl border text-center font-medium transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs dark:bg-primary/20 ring-1 ring-primary/30'
                      : 'border-border/80 bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={14} className="shrink-0" />
                  <span className="truncate text-[11px] block">{t(method.key, method.fallback)}</span>
                </button>
              )
            })}
          </div>

          {/* Dynamic contextual helper note */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground">
            <Info size={12} className="text-primary shrink-0" />
            <span className="truncate">{getMethodNote()}</span>
          </div>
        </div>
      </form>
    </EnterpriseModal>
  )
}

export default ProcessRefundModal
