import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus, Minus, Loader2, ExternalLink, Check, SlidersHorizontal
} from 'lucide-react'
import { FormHeader, FormFooter, FieldError, getFieldClass, EnterpriseDatePicker } from '@/components/common'
import { formatCurrency } from '../utils/purchaseCurrency'

interface PurchaseReturnFormSectionProps {
  isEdit?: boolean
  returnReference?: string
  purchaseId: string
  setPurchaseId: (val: string) => void
  purchasesData: any[]
  loadingPurchaseDetails: boolean
  returnDate: string
  setReturnDate: (val: string) => void
  status: string
  setStatus: (val: string) => void
  rmaNumber?: string
  setRmaNumber?: (val: string) => void
  attachmentUrl?: string
  setAttachmentUrl?: (val: string) => void
  returnItems: any[]
  handleItemQtyChange: (idx: number, val: string) => void
  handleItemNotesChange: (idx: number, val: string) => void
  handleItemBatchChange?: (idx: number, val: string) => void
  handleItemSerialChange?: (idx: number, val: string) => void
  getReturnTotal: () => number
  reason: string
  setReason: (val: string) => void
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  formErrors?: Record<string, string>
  onClearError?: (field: string) => void
}

export const PurchaseReturnFormSection: React.FC<PurchaseReturnFormSectionProps> = ({
  isEdit = false,
  returnReference,
  purchaseId,
  setPurchaseId,
  purchasesData,
  loadingPurchaseDetails,
  returnDate,
  setReturnDate,
  status,
  setStatus,
  rmaNumber = '',
  setRmaNumber,
  attachmentUrl = '',
  setAttachmentUrl,
  returnItems,
  handleItemQtyChange,
  handleItemNotesChange,
  handleItemBatchChange,
  handleItemSerialChange,
  getReturnTotal,
  reason,
  setReason,
  isSubmitting,
  onSubmit,
  onCancel,
  formErrors = {},
  onClearError,
}) => {
  const { t } = useTranslation(['purchases', 'common', 'nav'])
  const returnTotalUSD = getReturnTotal()
  const returnTotalKHR = returnTotalUSD * 4100

  // Toggle for showing Batch / Serial / Notes across all items
  const [showAllDetails, setShowAllDetails] = useState(false)
  // Individual row expansion map
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})

  const toggleRowDetails = (idx: number) => {
    setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  // Calculate selected units & distinct items
  const activeItemsCount = returnItems.filter(item => (parseFloat(item.quantity) || 0) > 0).length
  const totalUnitsSelected = returnItems.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0)

  // Fast action: Return All Max
  const handleReturnAllMax = () => {
    returnItems.forEach((item, idx) => {
      handleItemQtyChange(idx, String(item.available_to_return || 0))
    })
  }

  // Fast action: Reset All
  const handleResetAll = () => {
    returnItems.forEach((_, idx) => {
      handleItemQtyChange(idx, '0')
    })
  }

  // Quick reason chips
  const quickReasons = [
    {
      label: t('purchases.reasonDamaged', 'Damaged in transit'),
      id: 'damaged',
    },
    {
      label: t('purchases.reasonWrongVariant', 'Wrong variant or product model'),
      id: 'wrong_variant',
    },
    {
      label: t('purchases.reasonExpired', 'Expired or near expiration date'),
      id: 'expired',
    },
    {
      label: t('purchases.reasonExcess', 'Excess delivery / Over-shipped items'),
      id: 'excess',
    },
    {
      label: t('purchases.reasonQuality', 'Quality sub-standard or defective lot'),
      id: 'quality',
    },
  ]

  const handleChipClick = (chipText: string) => {
    if (!reason.trim()) {
      setReason(chipText)
    } else if (!reason.includes(chipText)) {
      setReason(`${reason}; ${chipText}`)
    }
  }

  // Find currently selected Purchase Order record
  const selectedPO = purchasesData?.find((p: any) => String(p.id) === String(purchaseId))
  const poTotalUSD = Number(selectedPO?.grand_total || selectedPO?.total_amount || 0)
  const poDueUSD = Number(selectedPO?.due_amount || 0)
  const estimatedRemainingDue = Math.max(0, poDueUSD - returnTotalUSD)

  const labelCls = 'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6 w-full">
      {/* ─── Fixed Header ─── */}
      <FormHeader
        title={isEdit ? t('purchases.editPurchaseReturn', 'Edit Purchase Return (Debit Note)') : t('purchases.createPurchaseReturn', 'Create Purchase Return (Debit Note)')}
        subtitle={isEdit ? t('purchases.editReturnSubtitle', 'Update return quantities, RMA and defect conditions') : t('purchases.createReturnSubtitle', 'Return damaged or excess goods back to vendor and adjust inventory')}
        breadcrumbs={[
          { label: t('purchases.purchases', t('purchases.title', 'Purchases')), path: '/purchases' },
          { label: t('purchases.purchaseReturns', 'Purchase Returns'), path: '/purchases/returns' },
          { label: isEdit ? (returnReference ? `#${returnReference}` : t('purchases.editReturn', 'Edit Return')) : t('purchases.createReturn', 'Create Return') },
        ]}
        backPath="/purchases/returns"
        backLabel={t('common.back', 'Back')}
        showSubmit={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ─── LEFT COLUMN: Main Form Area (8 Cols) ─── */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Purchase Order Selection & Primary Details */}
          <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="pb-3.5 border-b border-border/60 dark:border-slate-800">
              <h3 className="font-bold text-sm sm:text-base text-foreground dark:text-slate-100">
                {t('purchases.poSelection', 'Purchase Order Selection')}
              </h3>
              <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                {t('purchases.choosePOToReturn', 'Select the original purchase order to load received inventory items')}
              </p>
            </div>

            {/* Field: Purchase Order Select */}
            <div>
              <label className={labelCls}>
                {t('purchases.selectPurchaseOrder', 'Select Purchase Order')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <select
                value={purchaseId}
                onChange={(e) => {
                  setPurchaseId(e.target.value)
                  onClearError?.('purchaseId')
                }}
                className={getFieldClass(
                  formErrors.purchaseId,
                  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 font-medium cursor-pointer transition-all'
                )}
              >
                <option value="" className="text-muted-foreground bg-white dark:bg-slate-900">
                  {t('purchases.choosePOToReturn', 'ជ្រើសរើសការបញ្ជាទិញដែលត្រូវបង្វិលសងទំនិញ...')}
                </option>
                {(purchasesData ?? [])
                  .filter((p: any) => p.status === 'received' || p.status === 'completed' || p.status === 'partial' || p.status === 'ordered')
                  .map((p: any) => {
                    const supplierName = p.supplier?.name ? ` — ${p.supplier.name}` : ''
                    const totalFormatted = Number(p.grand_total || p.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    return (
                      <option
                        key={p.id}
                        value={String(p.id)}
                        className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                      >
                        {p.reference_number}{supplierName} (${totalFormatted})
                      </option>
                    )
                  })}
              </select>
              <FieldError error={formErrors.purchaseId} />
            </div>

            {/* Selected PO Meta Banner */}
            {selectedPO && (
              <div className="bg-muted/30 dark:bg-slate-800/40 border border-border/70 dark:border-slate-800 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground dark:text-slate-400 block text-[11px] mb-0.5">{t('purchases.supplier', 'Supplier')}</span>
                  <span className="font-bold text-foreground dark:text-slate-100 block truncate">{selectedPO.supplier?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground dark:text-slate-400 block text-[11px] mb-0.5">{t('purchases.warehouse', 'Warehouse')}</span>
                  <span className="font-semibold text-foreground dark:text-slate-100 block truncate">{selectedPO.warehouse?.name || 'Main Warehouse'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground dark:text-slate-400 block text-[11px] mb-0.5">{t('purchases.totalAmount', 'Total Amount')}</span>
                  <span className="font-mono font-bold text-foreground dark:text-slate-100 block">{formatCurrency(poTotalUSD, 'USD')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground dark:text-slate-400 block text-[11px] mb-0.5">{t('purchases.dueBalance', 'Current Due Balance')}</span>
                  <span className={`font-mono font-bold block ${poDueUSD > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {formatCurrency(poDueUSD, 'USD')}
                  </span>
                </div>
              </div>
            )}

            {/* Date, RMA, Status Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <EnterpriseDatePicker
                  label={t('purchases.returnDate', 'Return Date')}
                  required
                  value={returnDate}
                  onChange={(val) => {
                    setReturnDate(val)
                    onClearError?.('returnDate')
                  }}
                  error={Boolean(formErrors?.returnDate)}
                />
                <FieldError error={formErrors?.returnDate} />
              </div>

              <div>
                <label className={labelCls}>
                  {t('purchases.rmaNumber', 'Supplier RMA Number')}
                </label>
                <input
                  type="text"
                  value={rmaNumber}
                  onChange={(e) => {
                    setRmaNumber?.(e.target.value)
                    onClearError?.('rmaNumber')
                  }}
                  placeholder={t('purchases.rmaPlaceholder', 'e.g. RMA-2026-9901')}
                  className={getFieldClass(
                    formErrors.rmaNumber,
                    'h-10 min-h-[40px] w-full px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border font-mono bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 transition-all'
                  )}
                />
                <FieldError error={formErrors.rmaNumber} />
              </div>

              <div>
                <label className={labelCls}>
                  {t('purchases.status', 'Status')} <span className="text-rose-500 font-bold">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value)
                    onClearError?.('status')
                  }}
                  className={getFieldClass(
                    formErrors.status,
                    'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 font-medium cursor-pointer transition-all'
                  )}
                >
                  <option value="draft" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">{t('purchases.draft', 'Draft (Pending Review)')}</option>
                  <option value="approved" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">{t('purchases.approved', 'Approved (Deduct Stock & Offset AP)')}</option>
                </select>
                <FieldError error={formErrors.status} />
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {loadingPurchaseDetails && (
            <div className="flex items-center justify-center py-12 bg-card dark:bg-slate-900 rounded-2xl border border-dashed border-border dark:border-slate-800 text-muted-foreground dark:text-slate-400">
              <Loader2 className="animate-spin text-primary mr-2.5" size={20} />
              <span className="font-medium text-xs">{t('purchases.loadingPOItems', 'Loading items from purchase order...')}</span>
            </div>
          )}

          {/* Prompt to select PO if not yet selected */}
          {!purchaseId && !loadingPurchaseDetails && (
            <div className="flex flex-col items-center justify-center py-10 px-4 bg-card/60 dark:bg-slate-900/60 border border-dashed border-border/80 dark:border-slate-800 rounded-2xl text-center space-y-2">
              <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">
                {t('purchases.selectPOFirst', 'សូមជ្រើសរើសប័ណ្ណបញ្ជាទិញទំនិញខាងលើ ដើម្បីផ្ទុកបញ្ជីមុខទំនិញ')}
              </p>
            </div>
          )}

          {/* 2. Items to Return Table */}
          {purchaseId && returnItems.length > 0 && (
            <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 dark:border-slate-800 pb-3.5">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-foreground dark:text-slate-100">
                    {t('purchases.returnItemsQuantities', 'Return Items & Quantities')}
                  </h3>
                  <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                    {t('purchases.specifyUnitsToReturn', 'Specify return quantities and optional batch/serial numbers')}
                  </p>
                </div>

                {/* Batch Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReturnAllMax}
                    className="px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/20 transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    {t('purchases.returnAllMax', 'Return All (Max)')}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="px-2.5 py-1 text-xs font-medium text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white bg-muted/60 dark:bg-slate-800 hover:bg-muted dark:hover:bg-slate-700 rounded-lg border border-border/80 dark:border-slate-700 transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    {t('purchases.resetItems', 'Reset (0)')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAllDetails(prev => !prev)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95 ${
                      showAllDetails
                        ? 'bg-primary/10 text-primary border-primary/30 font-semibold'
                        : 'text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white bg-muted/60 dark:bg-slate-800 hover:bg-muted dark:hover:bg-slate-700 border-border/80 dark:border-slate-700'
                    }`}
                  >
                    <SlidersHorizontal size={11} />
                    <span>{showAllDetails ? t('purchases.hideBatchSerial', 'Hide Details') : t('purchases.showBatchSerial', 'Batch/Serial Details')}</span>
                  </button>
                  <div className="h-4 w-[1px] bg-border/80 dark:border-slate-800 mx-1 hidden sm:block" />
                  <span className="text-xs text-muted-foreground dark:text-slate-400 font-mono">
                    {activeItemsCount}/{returnItems.length} {t('purchases.items', 'items')}
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="border border-border/80 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 dark:bg-slate-800/50 border-b border-border/80 dark:border-slate-800">
                      <th className="py-3 px-4 font-semibold text-muted-foreground dark:text-slate-400">{t('purchases.product', 'Product & Identifier')}</th>
                      <th className="py-3 px-3 font-semibold text-muted-foreground dark:text-slate-400 text-center">{t('purchases.ordered', 'Ordered')}</th>
                      <th className="py-3 px-3 font-semibold text-muted-foreground dark:text-slate-400 text-center">{t('purchases.delivered', 'Delivered')}</th>
                      <th className="py-3 px-3 font-semibold text-muted-foreground dark:text-slate-400 text-center">{t('purchases.available', 'Available')}</th>
                      <th className="py-3 px-4 font-semibold text-muted-foreground dark:text-slate-400 text-center min-w-[150px]">{t('purchases.returnQty', 'Return Qty')}</th>
                      <th className="py-3 px-4 font-semibold text-muted-foreground dark:text-slate-400 text-right">{t('purchases.unitCost', 'Cost Price')}</th>
                      <th className="py-3 px-4 font-semibold text-muted-foreground dark:text-slate-400 text-right">{t('purchases.total', 'Line Total')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 dark:divide-slate-800">
                    {returnItems.map((item, idx) => {
                      const returnQty = parseFloat(item.quantity) || 0
                      const unitCostUSD = parseFloat(item.unit_cost) || 0
                      const unitCostKHR = unitCostUSD * 4100
                      const lineTotalUSD = returnQty * unitCostUSD
                      const maxQty = item.available_to_return || 0
                      const isSelected = returnQty > 0
                      const hasDetails = Boolean(item.batch_number || item.serial_number || item.notes)
                      const isRowExpanded = showAllDetails || expandedRows[idx] || hasDetails

                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-muted/20 dark:hover:bg-slate-800/30 transition-colors ${
                            isSelected ? 'bg-primary/[0.02] dark:bg-primary/[0.04]' : ''
                          }`}
                        >
                          {/* Product Details & Batch/Notes Inputs */}
                          <td className="py-3 px-4 min-w-[240px]">
                            <div>
                              <span className="font-semibold text-xs sm:text-[13px] text-foreground dark:text-slate-100 block">
                                {item.product_name}
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground dark:text-slate-400 mt-1">
                                {item.sku && (
                                  <span className="font-mono bg-muted/60 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-border/50 dark:border-slate-700 text-[10px]">
                                    SKU: {item.sku}
                                  </span>
                                )}
                                {item.variant_name && (
                                  <span className="text-primary font-medium bg-primary/5 px-1.5 py-0.5 rounded text-[10px]">
                                    {item.variant_name}
                                  </span>
                                )}
                                {!isRowExpanded && (
                                  <button
                                    type="button"
                                    onClick={() => toggleRowDetails(idx)}
                                    className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-0.5 font-medium ml-1"
                                  >
                                    <span>+ {t('purchases.batchSerialOpt', 'Batch/Serial')}</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Batch / Serial / Notes - Clean Expandable Section */}
                            {isRowExpanded && (
                              <div className="pt-2 mt-2 border-t border-border/50 dark:border-slate-800/80 space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] text-muted-foreground dark:text-slate-400 pb-0.5">
                                  <span className="font-medium text-[10px] uppercase tracking-wider">{t('purchases.itemDetailInputs', 'Batch & Serial Details')}</span>
                                  <button
                                    type="button"
                                    onClick={() => toggleRowDetails(idx)}
                                    className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer px-1 py-0.5 rounded hover:bg-muted"
                                  >
                                    {t('common.close', 'បិទ')}
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <input
                                    placeholder={t('purchases.batchOptional', 'Batch # (opt)')}
                                    value={item.batch_number || ''}
                                    onChange={(e) => handleItemBatchChange?.(idx, e.target.value)}
                                    className="text-[11px] px-2.5 py-1 bg-background dark:bg-slate-900 border border-border/70 dark:border-slate-700 rounded-md text-foreground dark:text-slate-100 placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                                  />
                                  <input
                                    placeholder={t('purchases.serialOptional', 'Serial # (opt)')}
                                    value={item.serial_number || ''}
                                    onChange={(e) => handleItemSerialChange?.(idx, e.target.value)}
                                    className="text-[11px] px-2.5 py-1 bg-background dark:bg-slate-900 border border-border/70 dark:border-slate-700 rounded-md text-foreground dark:text-slate-100 placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                                  />
                                </div>
                                <input
                                  placeholder={t('purchases.defectNotePlaceholder', 'Defect note or damage condition...')}
                                  value={item.notes || ''}
                                  onChange={(e) => handleItemNotesChange(idx, e.target.value)}
                                  className="w-full text-[11px] px-2.5 py-1 bg-background dark:bg-slate-900 border border-border/70 dark:border-slate-700 rounded-md text-foreground dark:text-slate-100 placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                />
                              </div>
                            )}
                          </td>

                          {/* Ordered */}
                          <td className="py-3.5 px-3 text-center font-mono text-muted-foreground dark:text-slate-400 font-medium">
                            {item.quantity_ordered}
                          </td>

                          {/* Delivered */}
                          <td className="py-3.5 px-3 text-center font-mono text-muted-foreground dark:text-slate-400 font-medium">
                            {item.quantity_received}
                          </td>

                          {/* Available to Return */}
                          <td className="py-3.5 px-3 text-center font-mono font-semibold">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              {maxQty}
                            </span>
                          </td>

                          {/* Return Qty Stepper Controls */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center justify-center p-0.5 bg-background dark:bg-slate-900 border border-border/80 dark:border-slate-700 rounded-lg shadow-2xs gap-1">
                              <button
                                type="button"
                                onClick={() => handleItemQtyChange(idx, String(Math.max(0, returnQty - 1)))}
                                disabled={returnQty <= 0}
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-muted/60 dark:bg-slate-800 hover:bg-muted text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white disabled:opacity-25 cursor-pointer transition-colors active:scale-95"
                              >
                                <Minus size={12} />
                              </button>
                              <input
                                type="number"
                                min="0"
                                max={maxQty}
                                value={item.quantity}
                                onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                                className="w-12 text-center text-xs font-bold font-mono bg-transparent border-0 outline-none p-0 text-foreground dark:text-slate-100"
                              />
                              <button
                                type="button"
                                onClick={() => handleItemQtyChange(idx, String(Math.min(maxQty, returnQty + 1)))}
                                disabled={returnQty >= maxQty}
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-muted/60 dark:bg-slate-800 hover:bg-muted text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white disabled:opacity-25 cursor-pointer transition-colors active:scale-95"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </td>

                          {/* Cost Price */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-mono text-xs font-medium text-foreground dark:text-slate-100 block">
                              {formatCurrency(unitCostUSD, 'USD')}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground dark:text-slate-400 block">
                              {formatCurrency(unitCostKHR, 'KHR')}
                            </span>
                          </td>

                          {/* Line Total */}
                          <td className="py-3.5 px-4 text-right">
                            <span className={`font-mono text-xs font-bold block ${isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-foreground dark:text-slate-100'}`}>
                              {formatCurrency(lineTotalUSD, 'USD')}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Reason for Return & Proof Card */}
          <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="border-b border-border/60 dark:border-slate-800 pb-3.5">
              <h3 className="font-bold text-sm sm:text-base text-foreground dark:text-slate-100">
                {t('purchases.reasonForReturn', 'Reason for Return')} & {t('purchases.attachmentProof', 'Defect Proof')}
              </h3>
              <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                {t('purchases.reasonSubtitle', 'Provide official justification for debit note and audit tracking')}
              </p>
            </div>

            {/* Quick Reason Chips */}
            <div className="space-y-2">
              <label className={labelCls}>
                {t('purchases.suggestedReasons', 'Select or combine reason')}
              </label>
              <div className="flex flex-wrap gap-2">
                {quickReasons.map((chip, i) => {
                  const isSelected = reason.includes(chip.label)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleChipClick(chip.label)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 border ${
                        isSelected
                          ? 'bg-primary/10 text-primary border-primary ring-1 ring-primary/20 font-semibold'
                          : 'bg-muted/40 dark:bg-slate-800/60 hover:bg-muted text-foreground/80 dark:text-slate-200 border-border/80 dark:border-slate-700'
                      }`}
                    >
                      <span>{chip.label}</span>
                      {isSelected && <Check size={12} className="ml-0.5" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className={labelCls}>
                {t('purchases.returnExplanation', 'Detailed Explanation / Vendor Note')}
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value)
                  onClearError?.('reason')
                }}
                placeholder={t('purchases.returnReasonPlaceholder', 'Enter detailed reason for return (e.g. damaged goods, wrong variant, over-shipped)...')}
                rows={3}
                className={getFieldClass(
                  formErrors.reason,
                  'w-full resize-none p-3.5 text-xs sm:text-[13px] bg-background dark:bg-slate-900/90 border border-border/80 dark:border-slate-700/80 rounded-xl text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium leading-relaxed'
                )}
              />
              <FieldError error={formErrors.reason} />
            </div>

            <div>
              <label className={labelCls}>
                {t('purchases.attachmentProof', 'Defect Proof / Photo Attachment URL')}
              </label>
              <input
                type="url"
                value={attachmentUrl}
                onChange={(e) => {
                  setAttachmentUrl?.(e.target.value)
                  onClearError?.('attachmentUrl')
                }}
                placeholder={t('purchases.attachmentUrlPlaceholder', 'https://... image link, drive folder, or inspection report url')}
                className={getFieldClass(
                  formErrors.attachmentUrl,
                  'h-10 min-h-[40px] w-full px-3.5 py-2 text-xs bg-background dark:bg-slate-900/90 border border-border/80 dark:border-slate-700/80 rounded-xl text-foreground dark:text-slate-100 placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono'
                )}
              />
              <FieldError error={formErrors.attachmentUrl} />

              {/* Live Attachment Preview Link if URL provided */}
              {attachmentUrl && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground dark:text-slate-400">{t('purchases.previewAttachment', 'Preview')}:</span>
                  <a
                    href={attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-[11px]"
                  >
                    <span>{attachmentUrl}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 / 12) - Sticky Summary & Metadata Cards */}
        <div className="lg:col-span-4 space-y-6 sticky top-6">
          {/* Grand Estimated Return Value Card */}
          <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">
                {t('purchases.estimatedReturnValue', 'Estimated Return Value')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Debit Note
              </span>
            </div>

            <div className="space-y-1">
              <div className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${
                returnTotalUSD > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground dark:text-slate-100'
              }`}>
                {formatCurrency(returnTotalUSD, 'USD')}
              </div>
              <div className="text-xs text-muted-foreground dark:text-slate-400 font-mono">
                ≈ {formatCurrency(returnTotalKHR, 'KHR')}
              </div>
            </div>

            {/* Breakdown metrics */}
            <div className="pt-3 border-t border-border/60 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground dark:text-slate-400">
                <span>{t('purchases.selectedItems', 'Selected Line Items')}:</span>
                <span className="font-bold text-foreground dark:text-slate-100 font-mono">{activeItemsCount} / {returnItems.length}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground dark:text-slate-400">
                <span>{t('purchases.totalReturnUnits', 'Total Return Units')}:</span>
                <span className="font-bold text-foreground dark:text-slate-100 font-mono">{totalUnitsSelected} {t('purchases.units', 'units')}</span>
              </div>

              {/* Accounts Payable Offset Simulation */}
              {selectedPO && (
                <div className="pt-2.5 border-t border-border/60 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-muted-foreground dark:text-slate-400">
                    <span>{t('purchases.originalDue', 'PO Unpaid Due')}:</span>
                    <span className="font-mono font-semibold text-foreground dark:text-slate-100">{formatCurrency(poDueUSD, 'USD')}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>{t('purchases.lessDebitNote', 'Less Debit Note')}:</span>
                    <span className="font-mono font-bold">-{formatCurrency(returnTotalUSD, 'USD')}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border/40 dark:border-slate-800 font-bold text-foreground dark:text-slate-100">
                    <span>{t('purchases.newDueBalance', 'Remaining Due')}:</span>
                    <span className="font-mono">{formatCurrency(estimatedRemainingDue, 'USD')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Supplier & Warehouse Metadata Card */}
          {selectedPO && (
            <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-3.5">
              <div className="text-xs font-bold text-foreground dark:text-slate-100 uppercase tracking-wider border-b border-border/60 dark:border-slate-800 pb-3">
                <span>{t('purchases.supplierDetails', 'Supplier Details')}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-foreground dark:text-slate-100 font-bold">
                  <span className="text-muted-foreground text-[11px] font-normal">{t('purchases.supplier', 'Supplier')}:</span>
                  <span>{selectedPO.supplier?.name}</span>
                </div>
                {selectedPO.supplier?.phone && (
                  <div className="flex items-center justify-between text-muted-foreground dark:text-slate-400 font-mono text-[11px]">
                    <span className="font-normal">{t('purchases.phone', 'Phone')}:</span>
                    <span>{selectedPO.supplier.phone}</span>
                  </div>
                )}
                {selectedPO.supplier?.email && (
                  <div className="flex items-center justify-between text-muted-foreground dark:text-slate-400 text-[11px]">
                    <span className="font-normal">{t('purchases.email', 'Email')}:</span>
                    <span>{selectedPO.supplier.email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-muted-foreground dark:text-slate-400 pt-1.5 border-t border-border/60 dark:border-slate-800 font-medium">
                  <span className="text-[11px]">{t('purchases.warehouse', 'Warehouse')}:</span>
                  <span>{selectedPO.warehouse?.name || 'Main Warehouse'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Automated System Operations Card */}
          <div className="bg-muted/30 dark:bg-slate-800/30 border border-border/70 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="text-xs font-bold text-foreground dark:text-slate-200 uppercase tracking-wider">
              <span>{t('purchases.impactTitle', 'Automated Operations')}</span>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground dark:text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold leading-none mt-0.5">•</span>
                <span>{t('purchases.impactStock', 'Deduct inventory stock levels immediately')}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold leading-none mt-0.5">•</span>
                <span>{t('purchases.impactDebitNote', 'Issue Debit Note for accounts payable deduction or refund')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Global Form Footer ─── */}
      <FormFooter
        onCancel={onCancel}
        cancelPath="/purchases/returns"
        cancelLabel={t('common.cancel', 'Cancel')}
        isSubmitting={isSubmitting}
        disabled={!!purchaseId && returnItems.length === 0}
        submitLabel={isEdit ? t('common.saveChanges', 'Save Changes') : t('purchases.approveAndSave', 'Approve & Save Return')}
        extraActions={
          <button
            type="submit"
            onClick={() => setStatus('draft')}
            disabled={isSubmitting || (!!purchaseId && returnItems.length === 0)}
            className="h-9 min-h-[36px] px-3.5 sm:px-4 text-xs sm:text-[13px] font-medium border border-border/80 dark:border-slate-700 bg-muted/80 dark:bg-slate-800 hover:bg-muted dark:hover:bg-slate-700 text-foreground dark:text-slate-200 rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-2xs active:scale-95"
          >
            <span>{t('purchases.saveDraftReturn', 'Save as Draft')}</span>
          </button>
        }
      />
    </form>
  )
}

export default PurchaseReturnFormSection
