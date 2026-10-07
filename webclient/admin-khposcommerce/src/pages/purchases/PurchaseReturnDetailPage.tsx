import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  RotateCcw, Copy, Check, Building2, Phone, Mail,
  FileText, Ban, AlertCircle, Printer, ArrowLeft,
  Truck, Wallet, Package, CreditCard, ExternalLink,
  CheckCircle, Warehouse, Calendar, Tag, Edit2
} from 'lucide-react'

import { purchaseService } from '@/services/purchaseService'
import { useToast } from '@/hooks/useToast'
import Breadcrumb from '@/components/common/Breadcrumb'
import FormHeader, { FormHeaderButton } from '@/components/common/FormHeader'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { EnterpriseModal, ModalFooter } from '@/components/common'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { RETURN_STATUS_BADGE, REFUND_STATUS_BADGE, type PurchaseReturn } from './types/purchaseReturn.types'
import { formatCurrency } from './utils/purchaseCurrency'
import { PurchaseReturnPrintVoucher } from './components/PurchaseReturnPrintVoucher'
import { ShippingCarrierSelect } from './components/ShippingCarrierSelect'

export const PurchaseReturnDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['purchases', 'common'])
  const toast = useToast()
  const qc = useQueryClient()

  const [copiedRef, setCopiedRef] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  // Enterprise Modals State
  const [shipModalOpen, setShipModalOpen] = useState(false)
  const [shippingCarrier, setShippingCarrier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  const [settleModalOpen, setSettleModalOpen] = useState(false)
  const [refundStatus, setRefundStatus] = useState<'offset' | 'credited' | 'refunded'>('credited')
  const [refundMethod, setRefundMethod] = useState<'credit_note' | 'bank_transfer' | 'cash' | 'offset_invoice' | 'replacement'>('credit_note')
  const [refundAmount, setRefundAmount] = useState<number | string>('')
  const [refundDate, setRefundDate] = useState(new Date().toISOString().split('T')[0])
  const [settlementNotes, setSettlementNotes] = useState('')

  // 1. Fetch Purchase Return Detail
  const {
    data: returnData,
    isLoading,
    isError,
  } = useQuery<PurchaseReturn | null>({
    queryKey: ['purchase-return-detail', id],
    queryFn: async () => {
      if (!id) return null
      return await purchaseService.getReturn(id)
    },
    enabled: !!id,
  })

  // 2. Mutations
  const approveMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('No return ID')
      return purchaseService.approveReturn(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-return-detail', id] })
      qc.invalidateQueries({ queryKey: ['purchase-returns'] })
      qc.invalidateQueries({ queryKey: ['purchases'] })
      toast.success(t('purchases.returnApprovedSuccess', 'Purchase return approved. Inventory and AP updated.'))
      setApproveDialogOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('purchases.approveFailed', 'Failed to approve return'))
    }
  })

  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('No return ID')
      return purchaseService.cancelReturn(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-return-detail', id] })
      qc.invalidateQueries({ queryKey: ['purchase-returns'] })
      qc.invalidateQueries({ queryKey: ['purchases'] })
      toast.success(t('purchases.returnCancelledSuccess', 'Purchase return cancelled successfully.'))
      setCancelDialogOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('purchases.cancelFailed', 'Failed to cancel return'))
    }
  })

  const shipMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('No return ID')
      return purchaseService.shipReturn(id, {
        shipping_carrier: shippingCarrier,
        tracking_number: trackingNumber,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-return-detail', id] })
      qc.invalidateQueries({ queryKey: ['purchase-returns'] })
      toast.success(t('purchases.shipmentRecordedSuccess', 'Shipment dispatched to supplier recorded.'))
      setShipModalOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('purchases.shipRecordFailed', 'Failed to record shipment'))
    }
  })

  const settleMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('No return ID')
      return purchaseService.settleReturn(id, {
        refund_status: refundStatus,
        refund_method: refundMethod,
        refund_amount: parseFloat(String(refundAmount)) || 0,
        refund_date: refundDate,
        notes: settlementNotes,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-return-detail', id] })
      qc.invalidateQueries({ queryKey: ['purchase-returns'] })
      toast.success(t('purchases.settlementRecordedSuccess', 'Settlement and Credit Note processed successfully.'))
      setSettleModalOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('purchases.settleRecordFailed', 'Failed to record settlement'))
    }
  })

  const copyReference = () => {
    if (!returnData?.reference_number) return
    navigator.clipboard.writeText(returnData.reference_number)
    setCopiedRef(true)
    setTimeout(() => setCopiedRef(false), 1500)
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-muted-foreground font-medium">{t('common.loading', 'Loading purchase return details...')}</p>
      </div>
    )
  }

  if (isError || !returnData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center px-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
          <AlertCircle size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-base text-foreground">{t('purchases.returnNotFound', 'Purchase Return Not Found')}</h3>
          <p className="text-xs text-muted-foreground">{t('purchases.returnNotFoundDesc', 'The requested return record could not be found or may have been deleted.')}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/purchases/returns')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>{t('purchases.backToReturns', 'Back to Purchase Returns')}</span>
        </button>
      </div>
    )
  }

  const returnAmountUSD = Number(returnData.total_amount || 0)
  const returnAmountKHR = returnData.total_amount_base
    ? Number(returnData.total_amount_base)
    : returnAmountUSD * 4100
  const items = returnData.items || []
  const totalUnits = items.reduce((sum, item) => sum + (parseFloat(String(item.quantity)) || 0), 0)
  const poDueUSD = Number(returnData.purchase?.due_amount || 0)
  const remainingDueUSD = Math.max(0, poDueUSD - returnAmountUSD)

  const isDraft = returnData.status === 'draft'
  const isApproved = returnData.status === 'approved'
  const isShipped = returnData.status === 'shipped'
  const isCancelled = returnData.status === 'cancelled'

  return (
    <div className="space-y-6 pb-14 w-full print:p-0">
      {/* ─── 0. BREADCRUMBS ────────────────────────────────────────── */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: t('purchases.purchases', t('purchases.title', 'Purchases')), path: '/purchases' },
            { label: t('purchases.purchaseReturns', 'Purchase Returns'), path: '/purchases/returns' },
            { label: `#${returnData.reference_number}` },
          ]}
        />
      </div>

      {/* ─── 1. FORM HEADER ─────────────────────────────────────────── */}
      <div className="print:hidden">
        <FormHeader
          frameless
          title={
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="font-mono text-lg sm:text-xl font-bold tracking-tight text-foreground">
                #{returnData.reference_number}
              </span>
              <button
                type="button"
                onClick={copyReference}
                className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md border border-primary/20 transition-all cursor-pointer"
                title={t('purchases.copyReference', 'Copy Return Reference')}
              >
                <span>{copiedRef ? t('purchases.copied', 'Copied') : t('purchases.copyReference', 'Copy')}</span>
                {copiedRef ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
              </button>
              {returnData.warehouse?.name && (
                <span className="font-mono text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-md border border-border">
                  {returnData.warehouse.name}
                </span>
              )}
            </div>
          }
          subtitle={
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground mt-0.5 flex-wrap">
              <span>{t('purchases.returnDate', 'Return Date')}: <strong className="font-mono text-foreground font-semibold">{returnData.date || '—'}</strong></span>
              {returnData.purchase?.reference_number && (
                <>
                  <span className="text-muted-foreground/30">•</span>
                  <span>
                    {t('purchases.purchaseReference', 'PO')}:{' '}
                    <Link
                      to={`/purchases/${returnData.purchase_id}`}
                      className="font-mono font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>#{returnData.purchase.reference_number}</span>
                      <ExternalLink size={10} />
                    </Link>
                  </span>
                </>
              )}
              {returnData.rma_number && (
                <>
                  <span className="text-muted-foreground/30">•</span>
                  <span>{t('purchases.rma', 'RMA')}: <strong className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{returnData.rma_number}</strong></span>
                </>
              )}
            </div>
          }
          showBack={true}
          backPath="/purchases/returns"
          backLabel={t('purchases.backToReturns', 'Back to Returns')}
          statusBadge={
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className={RETURN_STATUS_BADGE[returnData.status] || 'px-2.5 py-0.5 rounded-md text-xs font-semibold bg-muted'}>
                {returnData.status === 'completed'
                  ? t('purchases.completed', 'Completed')
                  : returnData.status === 'shipped'
                  ? t('purchases.shipped', 'Shipped')
                  : returnData.status === 'approved'
                  ? t('purchases.approved', 'Approved')
                  : returnData.status === 'cancelled'
                  ? t('purchases.cancelled', 'Cancelled')
                  : t('purchases.draft', 'Draft')}
              </span>
              {returnData.refund_status && (
                <span className={REFUND_STATUS_BADGE[returnData.refund_status] || 'px-2.5 py-0.5 rounded-md text-xs font-semibold bg-muted'}>
                  {returnData.refund_status === 'offset'
                    ? t('purchases.statusOffsetAP', 'Offset AP')
                    : returnData.refund_status === 'credited'
                    ? t('purchases.statusCredited', 'Credited')
                    : returnData.refund_status === 'refunded'
                    ? t('purchases.statusRefunded', 'Refunded')
                    : t('purchases.statusPendingRefund', 'Pending')}
                </span>
              )}
            </div>
          }
          extraActions={
            <>
              {/* Print Voucher */}
              <FormHeaderButton
                onClick={handlePrint}
                icon={<Printer size={14} />}
                variant="outline"
              >
                {t('purchases.printVoucher', 'Print Voucher')}
              </FormHeaderButton>

              {/* Edit (Draft only) */}
              {isDraft && (
                <FormHeaderButton
                  onClick={() => navigate(`/purchases/returns/${id}/edit`)}
                  icon={<Edit2 size={14} />}
                  variant="outline"
                >
                  {t('common.edit', 'Edit')}
                </FormHeaderButton>
              )}

              {/* Approve & Offset AP (Draft only) */}
              {isDraft && (
                <FormHeaderButton
                  onClick={() => setApproveDialogOpen(true)}
                  icon={<CheckCircle size={14} />}
                  variant="primary"
                >
                  {t('purchases.approveAndShipReturn', 'Approve & Offset AP')}
                </FormHeaderButton>
              )}

              {/* Ship to Supplier */}
              {(isApproved || isDraft) && (
                <FormHeaderButton
                  onClick={() => {
                    setShippingCarrier(returnData.shipping_carrier || '')
                    setTrackingNumber(returnData.tracking_number || '')
                    setShipModalOpen(true)
                  }}
                  icon={<Truck size={14} />}
                  variant="outline"
                >
                  {t('purchases.markAsShipped', 'Ship to Supplier')}
                </FormHeaderButton>
              )}

              {/* Settle / Credit Note */}
              {(isApproved || isShipped) && (
                <FormHeaderButton
                  onClick={() => {
                    setRefundAmount(returnData.total_amount || '')
                    setSettleModalOpen(true)
                  }}
                  icon={<Wallet size={14} />}
                  variant="outline"
                >
                  {t('purchases.settleRefund', 'Settle / Credit Note')}
                </FormHeaderButton>
              )}

              {/* Cancel Return */}
              {!isCancelled && (
                <FormHeaderButton
                  onClick={() => setCancelDialogOpen(true)}
                  icon={<Ban size={14} />}
                  variant="outline"
                >
                  {t('purchases.cancelReturn', 'Cancel')}
                </FormHeaderButton>
              )}
            </>
          }
        />
      </div>

      {/* ─── 2. MAIN 2-COLUMN GRID (12 Cols: 8 Left, 4 Right) ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:hidden">
        {/* LEFT COLUMN: Return Details & Items (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Related PO & Vendor Information */}
          <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="border-b border-border/60 dark:border-slate-800 pb-3.5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-foreground dark:text-slate-100">
                  {t('purchases.supplierDetails', 'Supplier Details')} & {t('purchases.originalPO', 'Purchase Order')}
                </h3>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                  {t('purchases.returnMetaSubtitle', 'Associated vendor identification and procurement details')}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {t('purchases.verifiedVendor', 'Verified Vendor')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-muted/30 dark:bg-slate-800/40 border border-border/60 dark:border-slate-800 rounded-xl space-y-1">
                <span className="text-muted-foreground block text-[11px] font-medium">{t('purchases.supplier', 'Supplier')}</span>
                <span className="font-bold text-foreground block text-sm">{returnData.supplier?.name || '—'}</span>
                {returnData.supplier?.phone && (
                  <span className="text-muted-foreground block font-mono text-[11px]">{returnData.supplier.phone}</span>
                )}
                {returnData.supplier?.email && (
                  <span className="text-muted-foreground block text-[11px] truncate">{returnData.supplier.email}</span>
                )}
              </div>

              <div className="p-3.5 bg-muted/30 dark:bg-slate-800/40 border border-border/60 dark:border-slate-800 rounded-xl space-y-1">
                <span className="text-muted-foreground block text-[11px] font-medium">{t('purchases.originalPO', 'Original PO')}</span>
                {returnData.purchase ? (
                  <>
                    <Link
                      to={`/purchases/${returnData.purchase_id}`}
                      className="font-mono font-bold text-primary hover:underline text-sm block"
                    >
                      #{returnData.purchase.reference_number}
                    </Link>
                    <span className="text-muted-foreground block text-[11px]">
                      {t('purchases.total', 'Total')}: <strong className="text-foreground font-mono">{formatCurrency(Number(returnData.purchase.grand_total || returnData.purchase.total_amount || 0), 'USD')}</strong>
                    </span>
                    <span className="text-muted-foreground block text-[11px]">
                      {t('purchases.dueAmount', 'Due')}: <strong className="text-amber-600 dark:text-amber-400 font-mono">{formatCurrency(poDueUSD, 'USD')}</strong>
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground block">—</span>
                )}
              </div>

              <div className="p-3.5 bg-muted/30 dark:bg-slate-800/40 border border-border/60 dark:border-slate-800 rounded-xl space-y-1">
                <span className="text-muted-foreground block text-[11px] font-medium">{t('purchases.warehouse', 'Warehouse & RMA')}</span>
                <span className="font-semibold text-foreground block text-sm">{returnData.warehouse?.name || t('purchases.mainWarehouse', 'Main Warehouse')}</span>
                <span className="text-muted-foreground block text-[11px]">
                  {t('purchases.rma', 'RMA')}: <strong className="font-mono text-foreground">{returnData.rma_number || '—'}</strong>
                </span>
                <span className="text-muted-foreground block text-[11px]">
                  {t('purchases.date', 'Date')}: <strong className="font-mono text-foreground">{returnData.date || '—'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Returned Items Table */}
          <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 dark:border-slate-800 pb-3.5">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-foreground dark:text-slate-100">
                  {t('purchases.returnedItems', 'Returned Items & Defect Details')}
                </h3>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                  {t('purchases.returnedItemsSubtitle', 'Products, unit cost prices, and physical condition records')}
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/60">
                {items.length} {t('purchases.items', 'items')} ({totalUnits} {t('purchases.units', 'units')})
              </span>
            </div>

            <div className="border border-border/80 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 dark:bg-slate-800/50 border-b border-border/80 dark:border-slate-800">
                    <th className="py-3 px-4 font-semibold text-muted-foreground dark:text-slate-400">{t('purchases.product', 'Product')}</th>
                    <th className="py-3 px-3 font-semibold text-muted-foreground dark:text-slate-400 text-center">{t('purchases.batchSerialOpt', 'Batch / Serial')}</th>
                    <th className="py-3 px-3 font-semibold text-muted-foreground dark:text-slate-400 text-center">{t('purchases.returnQty', 'Qty Returned')}</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground dark:text-slate-400 text-right">{t('purchases.unitCost', 'Unit Cost')}</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground dark:text-slate-400 text-right">{t('purchases.total', 'Line Total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 dark:divide-slate-800">
                  {items.map((it, idx) => {
                    const qty = parseFloat(String(it.quantity)) || 0
                    const unitCostUSD = parseFloat(String(it.unit_cost)) || 0
                    const unitCostKHR = unitCostUSD * 4100
                    const lineTotalUSD = Number(it.total || it.total_amount || (qty * unitCostUSD))

                    return (
                      <tr key={idx} className="hover:bg-muted/20 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 min-w-[220px]">
                          <span className="font-semibold text-xs sm:text-[13px] text-foreground dark:text-slate-100 block">
                            {it.product_name || it.product?.name || `Product #${it.product_id}`}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground dark:text-slate-400 mt-1">
                            {(it.sku || it.product?.sku) && (
                              <span className="font-mono bg-muted/60 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-border/50 dark:border-slate-700 text-[10px]">
                                SKU: {it.sku || it.product?.sku}
                              </span>
                            )}
                            {it.variant?.name && (
                              <span className="text-primary font-medium bg-primary/5 px-1.5 py-0.5 rounded text-[10px]">
                                {it.variant.name}
                              </span>
                            )}
                          </div>
                          {it.notes && (
                            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 italic">
                              {it.notes}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {it.batch_number || it.serial_number ? (
                            <div className="space-y-0.5 font-mono text-[11px]">
                              {it.batch_number && (
                                <span className="block text-muted-foreground">B: {it.batch_number}</span>
                              )}
                              {it.serial_number && (
                                <span className="block text-indigo-600 dark:text-indigo-400 font-semibold">S: {it.serial_number}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground font-mono">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-xs text-foreground">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            {qty}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <span className="text-xs text-foreground block font-medium">
                            {formatCurrency(unitCostUSD, 'USD')}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            {formatCurrency(unitCostKHR, 'KHR')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                          {formatCurrency(lineTotalUSD, 'USD')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Return Justification & Defect Proof */}
          <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="border-b border-border/60 dark:border-slate-800 pb-3.5">
              <h3 className="font-bold text-sm sm:text-base text-foreground dark:text-slate-100">
                {t('purchases.reasonForReturn', 'Reason for Return')} & {t('purchases.attachmentProof', 'Defect Proof')}
              </h3>
              <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                {t('purchases.reasonSubtitle', 'Official vendor return justification and attached defect verification')}
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-muted/30 dark:bg-slate-800/40 border border-border/60 dark:border-slate-800 rounded-xl">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  {t('purchases.officialJustification', 'Return Justification')}
                </span>
                <p className="text-xs sm:text-[13px] text-foreground font-medium leading-relaxed">
                  {returnData.reason || t('purchases.noReasonProvided', 'No specific return reason was entered.')}
                </p>
              </div>

              {returnData.attachment_url && (
                <div className="flex items-center justify-between p-3.5 bg-muted/20 dark:bg-slate-800/30 border border-border/60 dark:border-slate-800 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-primary" />
                    <div>
                      <span className="font-semibold block">{t('purchases.inspectionAttachment', 'Defect Inspection Attachment')}</span>
                      <span className="text-muted-foreground font-mono text-[11px] block truncate max-w-sm">{returnData.attachment_url}</span>
                    </div>
                  </div>
                  <a
                    href={returnData.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <span>{t('purchases.previewAttachment', 'View')}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Financial Summary & Status Cards (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 sticky top-6">
          {/* Card 1: Grand Debit Note Financial Card */}
          <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">
                {t('purchases.estimatedReturnValue', 'Estimated Return Value')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {t('purchases.debitNote', 'Debit Note')}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-rose-600 dark:text-rose-400">
                {formatCurrency(returnAmountUSD, 'USD')}
              </div>
              <div className="text-xs text-muted-foreground dark:text-slate-400 font-mono">
                ≈ {formatCurrency(returnAmountKHR, 'KHR')}
              </div>
            </div>

            {/* Breakdown metrics */}
            <div className="pt-3 border-t border-border/60 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground dark:text-slate-400">
                <span>{t('purchases.selectedItems', 'Selected Line Items')}:</span>
                <span className="font-bold text-foreground dark:text-slate-100 font-mono">{items.length} {t('purchases.items', 'items')}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground dark:text-slate-400">
                <span>{t('purchases.totalReturnUnits', 'Total Return Units')}:</span>
                <span className="font-bold text-foreground dark:text-slate-100 font-mono">{totalUnits} {t('purchases.units', 'units')}</span>
              </div>

              {/* AP Offset */}
              {returnData.purchase && (
                <div className="pt-2.5 border-t border-border/60 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-muted-foreground dark:text-slate-400">
                    <span>{t('purchases.originalDue', 'PO Unpaid Due')}:</span>
                    <span className="font-mono font-semibold text-foreground dark:text-slate-100">{formatCurrency(poDueUSD, 'USD')}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>{t('purchases.lessDebitNote', 'Less Debit Note')}:</span>
                    <span className="font-mono font-bold">-{formatCurrency(returnAmountUSD, 'USD')}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border/40 dark:border-slate-800 font-bold text-foreground dark:text-slate-100">
                    <span>{t('purchases.newDueBalance', 'Remaining Due')}:</span>
                    <span className="font-mono">{formatCurrency(remainingDueUSD, 'USD')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Logistics & Shipment (If Shipped) */}
          {(returnData.shipping_carrier || returnData.tracking_number) && (
            <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-3.5">
              <div className="text-xs font-bold text-foreground dark:text-slate-100 uppercase tracking-wider border-b border-border/60 dark:border-slate-800 pb-3 flex items-center gap-1.5">
                <Truck size={14} className="text-indigo-500" />
                <span>{t('purchases.shipmentDetails', 'Shipment & Dispatch Details')}</span>
              </div>

              <div className="space-y-2 text-xs">
                {returnData.shipping_carrier && (
                  <div className="flex items-center justify-between text-foreground">
                    <span className="text-muted-foreground">{t('purchases.carrier', 'Carrier')}:</span>
                    <span className="font-semibold">{returnData.shipping_carrier}</span>
                  </div>
                )}
                {returnData.tracking_number && (
                  <div className="flex items-center justify-between text-foreground">
                    <span className="text-muted-foreground">{t('purchases.trackingNumber', 'Tracking #')}:</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{returnData.tracking_number}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card 3: Automated Operations Confirmation */}
          <div className="bg-muted/30 dark:bg-slate-800/30 border border-border/70 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="text-xs font-bold text-foreground dark:text-slate-200 uppercase tracking-wider">
              <span>{t('purchases.impactTitle', 'Automated Operations')}</span>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground dark:text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{t('purchases.impactStock', 'Deduct inventory stock levels immediately')}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{t('purchases.impactDebitNote', 'Issue Debit Note for accounts payable deduction or refund')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. OFFICIAL PRINT VOUCHER ─────────────────────────────── */}
      <PurchaseReturnPrintVoucher returnData={returnData} />

      {/* ─── 4. ENTERPRISE ACTION MODALS ───────────────────────────── */}
      {/* Ship Modal */}
      <EnterpriseModal
        isOpen={shipModalOpen}
        onClose={() => setShipModalOpen(false)}
        title={t('purchases.shipToSupplier', 'Ship Items to Supplier')}
        subtitle={t('purchases.shipToSupplierSubtitle', 'Record shipping carrier and tracking waybill information')}
        icon={<Truck size={20} />}
        iconVariant="indigo"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setShipModalOpen(false)}
            onSubmit={() => shipMutation.mutate()}
            submitLabel={t('purchases.confirmShip', 'Confirm Shipment')}
            submitIcon={<Truck size={15} />}
            isSubmitting={shipMutation.isPending}
            submitButtonType="button"
            submitVariant="primary"
          />
        }
      >
        <div className="p-6 space-y-4">
          <ShippingCarrierSelect
            value={shippingCarrier}
            onChange={setShippingCarrier}
          />

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t('purchases.trackingNumber', 'Tracking / Waybill #')}
            </label>
            <input
              type="text"
              placeholder={t('purchases.trackingNumberPlaceholder', 'e.g. TRK-8828192')}
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full h-10 px-3.5 border border-border rounded-xl bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      </EnterpriseModal>

      {/* Settle Modal */}
      <EnterpriseModal
        isOpen={settleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        title={t('purchases.settleRefund', 'Settle / Issue Credit Note')}
        subtitle={t('purchases.settleRefundSubtitle', 'Record supplier refund, debit note, or accounts payable offset')}
        icon={<Wallet size={20} />}
        iconVariant="purple"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setSettleModalOpen(false)}
            onSubmit={() => settleMutation.mutate()}
            submitLabel={t('purchases.confirmSettlement', 'Confirm Settlement')}
            submitIcon={<Check size={15} />}
            isSubmitting={settleMutation.isPending}
            submitButtonType="button"
            submitVariant="primary"
          />
        }
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t('purchases.refundStatus', 'Settlement Status')}
            </label>
            <select
              value={refundStatus}
              onChange={(e) => setRefundStatus(e.target.value as any)}
              className="w-full h-10 px-3.5 border border-border rounded-xl bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="credited">{t('purchases.statusCreditedOption', 'Supplier Credited (Debit Note Active)')}</option>
              <option value="offset">{t('purchases.statusOffsetAPOption', 'Offset Against AP Balance')}</option>
              <option value="refunded">{t('purchases.statusRefundedOption', 'Cash / Bank Refund Received')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t('purchases.settlementMethod', 'Settlement Method')}
            </label>
            <select
              value={refundMethod}
              onChange={(e) => setRefundMethod(e.target.value as any)}
              className="w-full h-10 px-3.5 border border-border rounded-xl bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="credit_note">{t('purchases.methodCreditNote', 'Credit Note / Debit Note')}</option>
              <option value="offset_invoice">{t('purchases.methodOffsetInvoice', 'Offset Future Invoices')}</option>
              <option value="bank_transfer">{t('purchases.methodBankTransfer', 'Bank Transfer')}</option>
              <option value="cash">{t('purchases.methodCash', 'Cash')}</option>
              <option value="replacement">{t('purchases.methodReplacement', 'Goods Replacement')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t('purchases.settlementAmount', 'Settlement Amount ($)')}
            </label>
            <input
              type="number"
              step="0.01"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="w-full h-10 px-3.5 border border-border rounded-xl bg-background text-foreground font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t('purchases.settlementNotes', 'Settlement Notes')}
            </label>
            <input
              type="text"
              placeholder={t('purchases.settlementNotesPlaceholder', 'Optional audit notes...')}
              value={settlementNotes}
              onChange={(e) => setSettlementNotes(e.target.value)}
              className="w-full h-10 px-3.5 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      </EnterpriseModal>

      {/* Confirm Approve Dialog */}
      <ConfirmDialog
        open={approveDialogOpen}
        onCancel={() => setApproveDialogOpen(false)}
        onConfirm={() => approveMutation.mutate()}
        title={t('purchases.confirmApproveReturnTitle', 'Approve Purchase Return & Debit Note')}
        message={t('purchases.confirmApproveReturnDesc', 'Are you sure you want to approve this purchase return? This will deduct the inventory items from the warehouse and offset the accounts payable balance.')}
        confirmText={t('purchases.approveAndShipReturn', 'Approve & Offset AP')}
        loading={approveMutation.isPending}
        variant="info"
      />

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onCancel={() => setCancelDialogOpen(false)}
        onConfirm={() => cancelMutation.mutate()}
        title={t('purchases.confirmCancelReturnTitle', 'Cancel Purchase Return')}
        message={t('purchases.confirmCancelReturnDesc', 'Are you sure you want to cancel this purchase return? No stock or financial adjustments will take place.')}
        confirmText={t('purchases.cancelReturn', 'Cancel Return')}
        loading={cancelMutation.isPending}
        variant="danger"
      />
    </div>
  )
}

export default PurchaseReturnDetailPage
