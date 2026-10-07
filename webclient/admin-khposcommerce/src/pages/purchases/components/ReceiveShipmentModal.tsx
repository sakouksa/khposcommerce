import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck,
  PackageCheck,
  Plus,
  Minus,
  CheckCircle2,
  RotateCcw,
  Building2,
  Warehouse as WarehouseIcon,
  Calendar,
  Package
} from 'lucide-react'
import { ModalHeader, ModalFooter, ProductThumbnail } from '@/components/common'
import type { Purchase } from '../types/purchase.types'

interface ReceiveShipmentModalProps {
  receiveTarget: Purchase | null
  onClose: () => void
  recvQuantities: Record<number, string>
  setRecvQuantities: React.Dispatch<React.SetStateAction<Record<number, string>>>
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
}

export const ReceiveShipmentModal: React.FC<ReceiveShipmentModalProps> = ({
  receiveTarget,
  onClose,
  recvQuantities,
  setRecvQuantities,
  onSubmit,
  isSubmitting
}) => {
  const { t } = useTranslation(['purchases', 'common'])

  const items = useMemo(() => receiveTarget?.items ?? [], [receiveTarget])

  // Calculate totals and progress
  const { totalOrdered, totalReceived, totalRemaining, totalToReceiveNow } = useMemo(() => {
    let ordered = 0
    let received = 0
    let remaining = 0
    let receiveNow = 0

    items.forEach((item) => {
      const ord = Number(item.quantity) || 0
      const rec = Number(item.quantity_received) || 0
      const rem = Math.max(0, ord - rec)
      const now = parseFloat(recvQuantities[item.id] || '0') || 0
      const validNow = Math.min(now, rem)

      ordered += ord
      received += rec
      remaining += rem
      receiveNow += validNow
    })

    return {
      totalOrdered: ordered,
      totalReceived: received,
      totalRemaining: remaining,
      totalToReceiveNow: receiveNow
    }
  }, [items, recvQuantities])

  const willBeFullyReceived = totalOrdered > 0 && (totalReceived + totalToReceiveNow) >= totalOrdered

  const handleFillAllRemaining = () => {
    const nextQuantities: Record<number, string> = {}
    items.forEach((item) => {
      const ord = Number(item.quantity) || 0
      const rec = Number(item.quantity_received) || 0
      const rem = Math.max(0, ord - rec)
      if (rem > 0) {
        nextQuantities[item.id] = rem.toString()
      } else {
        nextQuantities[item.id] = '0'
      }
    })
    setRecvQuantities(nextQuantities)
  }

  const handleResetQuantities = () => {
    const nextQuantities: Record<number, string> = {}
    items.forEach((item) => {
      nextQuantities[item.id] = ''
    })
    setRecvQuantities(nextQuantities)
  }

  const handleStepQuantity = (itemId: number, delta: number, maxAllowed: number) => {
    const current = parseFloat(recvQuantities[itemId] || '0') || 0
    const next = Math.max(0, Math.min(maxAllowed, current + delta))
    setRecvQuantities(prev => ({
      ...prev,
      [itemId]: next === 0 ? '' : next.toString()
    }))
  }

  const handleInputChange = (itemId: number, value: string, maxAllowed: number) => {
    if (value === '') {
      setRecvQuantities(prev => ({ ...prev, [itemId]: '' }))
      return
    }
    const num = parseFloat(value) || 0
    const clamped = Math.max(0, Math.min(maxAllowed, num))
    setRecvQuantities(prev => ({ ...prev, [itemId]: clamped.toString() }))
  }

  if (!receiveTarget) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]"
        >
          {/* Global Modal Header */}
          <ModalHeader
            icon={<Truck size={20} />}
            iconVariant="emerald"
            title={t('purchases.receiveShipmentTitle', 'Receive Shipment (GRN)')}
            subtitle={t('purchases.receiveShipmentInstructions', 'Record delivered quantities from supplier. Incremented units will automatically adjust warehouse stock inventory.')}
            badge={
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-300 border border-border/60 dark:border-slate-700">
                PO #{receiveTarget.reference_number}
              </span>
            }
            onClose={onClose}
          />

          {/* Form Container */}
          <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Scrollable Content Area */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* Clean PO Details Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border border-border/70 dark:border-slate-800 bg-muted/20 dark:bg-slate-900/40 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                    <Building2 size={14} />
                  </div>
                  <div className="truncate min-w-0">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block leading-tight">
                      {t('purchases.supplier', 'Supplier')}
                    </span>
                    <span className="font-semibold text-foreground dark:text-slate-100 truncate block text-xs" title={receiveTarget.supplier?.name}>
                      {receiveTarget.supplier?.name || '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <WarehouseIcon size={14} />
                  </div>
                  <div className="truncate min-w-0">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block leading-tight">
                      {t('purchases.warehouse', 'Warehouse')}
                    </span>
                    <span className="font-semibold text-foreground dark:text-slate-100 truncate block text-xs" title={receiveTarget.warehouse?.name}>
                      {receiveTarget.warehouse?.name || '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <Calendar size={14} />
                  </div>
                  <div className="truncate min-w-0">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block leading-tight">
                      {t('purchases.date', 'Order Date')}
                    </span>
                    <span className="font-semibold font-mono text-foreground dark:text-slate-100 truncate block text-xs">
                      {receiveTarget.date || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Section Header & Quick Toolbar */}
              <div className="flex items-center justify-between gap-2 pt-1 pb-0.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground dark:text-slate-200">
                  <Package size={14} className="text-muted-foreground" />
                  <span>
                    {t('purchases.orderedItems', 'Ordered Items')}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    ({items.length} {items.length === 1 ? t('purchases.item', 'item') : t('purchases.items', 'items')} · {totalOrdered} {t('purchases.units', 'units')})
                  </span>
                </div>

                {/* Unified Segmented Quick Actions */}
                <div className="inline-flex items-center rounded-lg border border-border/70 dark:border-slate-800 bg-muted/30 dark:bg-slate-800/40 p-0.5 text-xs shadow-2xs">
                  <button
                    type="button"
                    onClick={handleFillAllRemaining}
                    disabled={totalRemaining === 0}
                    className="h-6.5 inline-flex items-center gap-1.5 px-2.5 rounded-md text-[11px] font-medium text-foreground dark:text-slate-200 hover:bg-background dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-2xs transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <CheckCircle2 size={12} className="text-emerald-500" strokeWidth={2.5} />
                    <span>{t('purchases.receiveAllRemaining', 'Receive All Remaining')}</span>
                  </button>
                  <div className="w-[1px] h-3.5 bg-border/60 dark:bg-slate-700" />
                  <button
                    type="button"
                    onClick={handleResetQuantities}
                    disabled={totalToReceiveNow === 0}
                    className="h-6.5 inline-flex items-center gap-1.5 px-2 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-background dark:hover:bg-slate-800 hover:shadow-2xs transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <RotateCcw size={11} />
                    <span>{t('common.reset', 'Reset')}</span>
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-border/70 dark:border-slate-800 rounded-xl overflow-hidden bg-card dark:bg-slate-900 shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 dark:bg-slate-800/50 border-b border-border/70 dark:border-slate-800 text-[11px] font-semibold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4 min-w-[200px]">{t('purchases.product', 'Product')}</th>
                      <th className="py-3 px-3 text-center w-20">{t('purchases.ordered', 'Ordered')}</th>
                      <th className="py-3 px-3 text-center w-20">{t('purchases.received', 'Received')}</th>
                      <th className="py-3 px-3 text-center w-20">{t('purchases.remaining', 'Remaining')}</th>
                      <th className="py-3 px-4 text-center w-32">{t('purchases.receiveNow', 'Receive Now')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 dark:divide-slate-800">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-muted-foreground dark:text-slate-400">
                          {t('purchases.noMatchingProducts', 'No matching products found.')}
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => {
                        const ord = Number(item.quantity) || 0
                        const rec = Number(item.quantity_received) || 0
                        const maxAllowed = Math.max(0, ord - rec)
                        const isFullyReceived = maxAllowed === 0
                        const currentVal = recvQuantities[item.id] || ''
                        const currentNum = parseFloat(currentVal) || 0
                        const isReceiving = currentNum > 0

                        const itemName = item.product_name ?? item.product?.name ?? `Product #${item.product_id}`
                        const itemImg =
                          item.product?.primary_image ||
                          item.product?.image ||
                          item.variant?.image ||
                          item.image ||
                          item.product_image
                        const itemSku = item.sku || item.product?.sku || item.variant?.sku

                        return (
                          <tr key={item.id} className="hover:bg-muted/20 dark:hover:bg-slate-800/30 transition-colors">
                            {/* Product Info */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <ProductThumbnail
                                  name={itemName}
                                  primaryImage={item.product?.primary_image}
                                  image={itemImg}
                                  categoryName={item.product?.category?.name}
                                  size="xs"
                                  className="rounded-lg shrink-0 shadow-2xs"
                                />
                                <div className="min-w-0">
                                  <span className="font-semibold text-foreground dark:text-slate-100 block text-xs sm:text-[13px] leading-tight truncate max-w-[200px]" title={itemName}>
                                    {itemName}
                                  </span>
                                  {itemSku && (
                                    <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-0.5 inline-block border border-border/40 dark:border-slate-700">
                                      SKU: {itemSku}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Ordered */}
                            <td className="py-3 px-3 text-center font-mono font-medium text-foreground/80 dark:text-slate-300 text-xs">
                              {ord}
                            </td>

                            {/* Received */}
                            <td className="py-3 px-3 text-center">
                              <span className={`font-mono text-xs ${
                                rec > 0
                                  ? 'font-bold text-emerald-600 dark:text-emerald-400'
                                  : 'text-muted-foreground/40 dark:text-slate-500'
                              }`}>
                                {rec}
                              </span>
                            </td>

                            {/* Remaining */}
                            <td className="py-3 px-3 text-center">
                              <span className={`font-mono text-xs ${
                                maxAllowed > 0
                                  ? 'font-bold text-amber-600 dark:text-amber-400'
                                  : 'text-muted-foreground/40 dark:text-slate-500'
                              }`}>
                                {maxAllowed}
                              </span>
                            </td>

                            {/* Receive Now Stepper */}
                            <td className="py-3 px-4 text-center">
                              {isFullyReceived ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                  <CheckCircle2 size={12} strokeWidth={2.5} />
                                  {t('purchases.fullyReceived', 'Fully Received')}
                                </span>
                              ) : (
                                <div className={`inline-flex items-center justify-center rounded-lg overflow-hidden shadow-2xs h-8 border transition-all ${
                                  isReceiving
                                    ? 'border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/30'
                                    : 'border-border/80 dark:border-slate-700 bg-background dark:bg-slate-900'
                                }`}>
                                  <button
                                    type="button"
                                    onClick={() => handleStepQuantity(item.id, -1, maxAllowed)}
                                    className="w-8 h-full flex items-center justify-center hover:bg-muted/80 text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors cursor-pointer border-r border-border/50 dark:border-slate-800 active:scale-95"
                                    title={t('common.decrease', 'Decrease')}
                                  >
                                    <Minus size={13} strokeWidth={2.5} />
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    max={maxAllowed}
                                    value={currentVal}
                                    placeholder="0"
                                    onChange={(e) => handleInputChange(item.id, e.target.value, maxAllowed)}
                                    className={`w-11 h-full text-center text-xs font-mono bg-transparent border-0 focus:outline-none p-0 ${
                                      isReceiving
                                        ? 'text-emerald-700 dark:text-emerald-300 font-bold'
                                        : 'text-foreground dark:text-slate-100 font-semibold'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleStepQuantity(item.id, 1, maxAllowed)}
                                    className="w-8 h-full flex items-center justify-center hover:bg-muted/80 text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors cursor-pointer border-l border-border/50 dark:border-slate-800 active:scale-95"
                                    title={t('common.increase', 'Increase')}
                                  >
                                    <Plus size={13} strokeWidth={2.5} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Global Modal Footer */}
            <ModalFooter
              onCancel={onClose}
              cancelLabel={t('common.cancel', 'Cancel')}
              submitLabel={t('purchases.recordStockIn', 'Record Stock In')}
              submitIcon={<PackageCheck size={14} />}
              submitVariant="emerald"
              isSubmitting={isSubmitting}
              disabled={isSubmitting || totalToReceiveNow === 0}
              submitButtonType="submit"
              infoSummary={
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-[11px] font-medium text-muted-foreground dark:text-slate-400">
                    {t('purchases.totalToReceiveNow', 'Total to Receive Now')}:
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                    {totalToReceiveNow} {t('purchases.units', 'units')}
                  </span>
                  {totalToReceiveNow > 0 && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                      willBeFullyReceived
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    }`}>
                      {willBeFullyReceived
                        ? `✓ ${t('purchases.willBeFullyReceived', 'Will be 100% Received')}`
                        : `⚡ ${t('purchases.willBePartiallyReceived', 'Will be Partially Received')}`}
                    </span>
                  )}
                </div>
              }
            />
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ReceiveShipmentModal
