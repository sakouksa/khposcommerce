import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Copy, Check, AlertCircle, ArrowLeft, Printer,
  PackageCheck, DollarSign, RotateCcw, Ban
} from 'lucide-react'

import { purchaseService } from '@/services/purchaseService'
import { useThemeStore } from '@/stores/themeStore'
import { useToast } from '@/hooks/useToast'
import Breadcrumb from '@/components/common/Breadcrumb'
import FormHeader, { FormHeaderButton } from '@/components/common/FormHeader'
import StatusBadge from '@/components/common/StatusBadge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { ProductThumbnail, SupplierLogo } from '@/components/common'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
  STATUS_BADGE,
  PAYMENT_BADGE,
  getDeliveryStatusLabel,
  getPaymentStatusLabel,
  type Purchase
} from './types/purchase.types'
import { getDetailDualValues } from './utils/purchaseCurrency'
import { ReceiveShipmentModal } from './components/ReceiveShipmentModal'
import { RecordPaymentModal } from './components/RecordPaymentModal'
import { PurchasePrintVoucher } from './components/PurchasePrintVoucher'

export const PurchaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['purchases', 'sales', 'common'])
  const { language } = useThemeStore()
  const toast = useToast()
  const qc = useQueryClient()

  const [copiedRef, setCopiedRef] = useState(false)

  // Action Modals State
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [recvQuantities, setRecvQuantities] = useState<Record<number, number>>({})
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false)

  // 1. Fetch Purchase Order Detail
  const {
    data: purchase,
    isLoading,
    isError,
  } = useQuery<Purchase | null>({
    queryKey: ['purchase-detail', id],
    queryFn: async () => {
      if (!id) return null
      return await purchaseService.show(id)
    },
    enabled: !!id,
  })

  // 2. Mutations
  const receiveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (!purchase) throw new Error('No purchase selected')
      return purchaseService.receiveShipment(purchase.id, payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-detail', id] })
      qc.invalidateQueries({ queryKey: ['purchases'] })
      toast.success(t('purchases.shipmentReceivedSuccess', 'Shipment items received successfully into inventory'))
      setReceiveModalOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('purchases.shipmentReceiveFailed', 'Failed to receive shipment'))
    }
  })

  const paymentMutation = useMutation({
    mutationFn: (payload: { amount: number; notes?: string }) => {
      if (!purchase) throw new Error('No purchase selected')
      return purchaseService.recordPayment(purchase.id, payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-detail', id] })
      qc.invalidateQueries({ queryKey: ['purchases'] })
      toast.success(t('purchases.paymentRecordedSuccess', 'Payment recorded successfully'))
      setPaymentModalOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('purchases.paymentRecordFailed', 'Failed to record payment'))
    }
  })

  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!purchase) throw new Error('No purchase selected')
      return purchaseService.cancel(purchase.id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-detail', id] })
      qc.invalidateQueries({ queryKey: ['purchases'] })
      toast.success(t('purchases.poCancelledSuccess', 'Purchase order cancelled successfully'))
      setCancelDialogOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('purchases.poCancelFailed', 'Failed to cancel purchase order'))
    }
  })

  const handleCopyRef = () => {
    if (!purchase?.reference_number) return
    navigator.clipboard.writeText(purchase.reference_number)
    setCopiedRef(true)
    setTimeout(() => setCopiedRef(false), 1500)
    toast.success(t('purchases.copied', 'Copied to clipboard'))
  }

  // Localized date & time formatting matching Sales / Order Detail Page
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

  const openReceiveModal = () => {
    if (!purchase) return
    const initQty: Record<number, number> = {}
    ;(purchase.items || []).forEach((item) => {
      const remaining = Math.max(0, Number(item.quantity || 0) - Number(item.quantity_received || 0))
      initQty[item.id] = remaining
    })
    setRecvQuantities(initQty)
    setReceiveModalOpen(true)
  }

  const handleReceiveSubmit = () => {
    if (!purchase) return
    const itemsPayload = Object.entries(recvQuantities)
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([itemId, qty]) => ({
        item_id: Number(itemId),
        quantity_received: Number(qty)
      }))

    if (itemsPayload.length === 0) {
      toast.error(t('purchases.enterReceiveQtyAlert', 'Please enter at least one item quantity to receive'))
      return
    }

    receiveMutation.mutate({ items: itemsPayload })
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-muted-foreground font-medium animate-pulse">
          {t('purchases.loadingDetails', 'Loading purchase order details...')}
        </p>
      </div>
    )
  }

  // Error State
  if (isError || !purchase) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center p-6">
        <div className="p-3 rounded-full bg-rose-500/10 text-rose-500">
          <AlertCircle size={32} />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">
            {t('purchases.poNotFound', 'Purchase Order Not Found')}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            {t('purchases.poNotFoundDesc', 'The requested purchase order ID does not exist or has been removed.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/purchases')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>{t('purchases.backToPurchases', 'Back to Purchases')}</span>
        </button>
      </div>
    )
  }

  // Normalization
  const items = purchase.items || []
  const totalOrderedQty = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const totalReceivedQty = items.reduce((sum, item) => sum + Number(item.quantity_received || 0), 0)
  const receivingPercent = totalOrderedQty > 0 ? Math.min(100, Math.round((totalReceivedQty / totalOrderedQty) * 100)) : 0

  const dualSubtotal = getDetailDualValues(purchase.subtotal, purchase)
  const dualDiscount = getDetailDualValues(purchase.discount_amount, purchase)
  const dualTax = getDetailDualValues(purchase.tax_amount, purchase)
  const dualShipping = getDetailDualValues(purchase.shipping_cost, purchase)
  const dualGrandTotal = getDetailDualValues(purchase.grand_total, purchase)
  const dualPaid = getDetailDualValues(purchase.paid_amount, purchase)
  const dualDue = getDetailDualValues(purchase.due_amount, purchase)

  const isCancelled = purchase.status === 'cancelled'
  const isReceived = purchase.status === 'received' || purchase.status === 'completed'
  const isPartial = purchase.status === 'partial'
  const isPaid = purchase.payment_status === 'paid'

  const orderDate = purchase.created_at || purchase.date

  return (
    <div className="space-y-6 pb-14 print:p-0">
      {/* ── 0. BREADCRUMBS ────────────────────────────────────────── */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            {
              label: t('purchases.title', 'Purchases'),
              path: '/purchases',
            },
            {
              label: `PO #${purchase.reference_number}`,
            },
          ]}
        />
      </div>

      {/* ── 1. FORM HEADER ─────────────────────────────────────────── */}
      <div className="print:hidden">
        <FormHeader
          frameless
          title={
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="font-mono text-lg sm:text-xl font-bold tracking-tight text-foreground">
                PO #{purchase.reference_number}
              </span>
              <button
                type="button"
                onClick={handleCopyRef}
                className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md border border-primary/20 transition-all cursor-pointer"
                title={t('purchases.copyReference', 'Copy PO Reference')}
              >
                <span>{copiedRef ? t('purchases.copied', 'Copied') : t('purchases.copyReference', 'Copy')}</span>
                {copiedRef ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
              </button>
              {purchase.warehouse?.name && (
                <span className="font-mono text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-md border border-border">
                  {purchase.warehouse.name}
                </span>
              )}
            </div>
          }
          subtitle={
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground mt-0.5 flex-wrap">
              <span>{t('purchases.date', 'Date')}: <strong className="font-mono text-foreground font-semibold">{purchase.date || '—'}</strong></span>
              {purchase.due_date && (
                <>
                  <span className="text-muted-foreground/30">•</span>
                  <span>{t('purchases.dueDate', 'Due Date')}: <strong className="font-mono text-foreground font-semibold">{purchase.due_date}</strong></span>
                </>
              )}
              {purchase.creator?.name && (
                <>
                  <span className="text-muted-foreground/30">•</span>
                  <span>{purchase.creator.name}</span>
                </>
              )}
            </div>
          }
          showBack={true}
          backPath="/purchases"
          backLabel={t('purchases.backToPurchases', 'Back to Purchases')}
          statusBadge={
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className={STATUS_BADGE[purchase.status] ?? 'px-2.5 py-0.5 rounded-md text-xs font-semibold bg-muted'}>
                {getDeliveryStatusLabel(purchase.status, t)}
              </span>
              <span className={PAYMENT_BADGE[purchase.payment_status] ?? 'px-2.5 py-0.5 rounded-md text-xs font-semibold bg-muted'}>
                {getPaymentStatusLabel(purchase.payment_status, t)}
              </span>
            </div>
          }
          extraActions={
            <>
              {/* Print PO Voucher */}
              <FormHeaderButton
                onClick={() => setPrintModalOpen(true)}
                icon={<Printer size={14} />}
                variant="outline"
              >
                {t('purchases.printPurchaseOrder', 'Print PO Voucher')}
              </FormHeaderButton>

              {/* Receive Shipment (GRN) */}
              {!isCancelled && !isReceived && (
                <FormHeaderButton
                  onClick={openReceiveModal}
                  icon={<PackageCheck size={14} />}
                  variant="primary"
                >
                  {t('purchases.receiveShipment', 'Receive Shipment (GRN)')}
                </FormHeaderButton>
              )}

              {/* Record Payment */}
              {!isCancelled && !isPaid && (
                <FormHeaderButton
                  onClick={() => setPaymentModalOpen(true)}
                  icon={<DollarSign size={14} />}
                  variant="outline"
                >
                  {t('purchases.recordPayment', 'Record Payment')}
                </FormHeaderButton>
              )}

              {/* Return to Supplier */}
              {(isReceived || isPartial) && (
                <FormHeaderButton
                  onClick={() => navigate(`/purchases/returns/create?purchase_id=${purchase.id}`)}
                  icon={<RotateCcw size={14} />}
                  variant="outline"
                >
                  {t('purchases.returnToSupplier', 'Return to Supplier')}
                </FormHeaderButton>
              )}

              {/* Cancel PO */}
              {!isCancelled && !isReceived && !isPartial && (
                <FormHeaderButton
                  onClick={() => setCancelDialogOpen(true)}
                  icon={<Ban size={14} />}
                  variant="danger"
                >
                  {t('purchases.cancelPO', 'Cancel PO')}
                </FormHeaderButton>
              )}
            </>
          }
        />
      </div>

      {/* ── 2. MAIN 2-COLUMN LAYOUT ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">

        {/* ─── LEFT COLUMN (2 COLS) ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card 1: Order Summary & Activity Timeline (Matching SalesDetailPage) */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 overflow-hidden">
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-border/80">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {t('purchases.orderSummary', 'Order summary')}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('purchases.placedTo', 'Placed to')}{' '}
                  <span className="font-semibold text-foreground">
                    {purchase.supplier?.name || t('purchases.unknownSupplier', 'General Supplier')}
                  </span>{' '}
                  · {formatFullDateTime(orderDate)}
                </p>
              </div>
              <StatusBadge status={purchase.status} rounded="full" />
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
                        {t('purchases.orderPlaced', 'Order placed')}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {purchase.creator?.name
                        ? `${t('purchases.orderCreatedBy', 'Order created by')} ${purchase.creator.name}`
                        : t('purchases.orderCreatedBy', 'Purchase order created via POS')}
                    </p>
                  </div>
                </div>

                {/* Step 2: Payment Confirmed */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isCancelled && Number(dualPaid.usd) === 0
                          ? 'bg-rose-500/15 border-2 border-rose-500'
                          : isPaid
                          ? 'bg-emerald-500/15 border-2 border-emerald-500'
                          : Number(dualPaid.usd) > 0
                          ? 'bg-amber-500/15 border-2 border-amber-500'
                          : 'bg-muted border-2 border-border'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isCancelled && Number(dualPaid.usd) === 0
                            ? 'bg-rose-500'
                            : isPaid
                            ? 'bg-emerald-500'
                            : Number(dualPaid.usd) > 0
                            ? 'bg-amber-500'
                            : 'bg-muted-foreground/40'
                        }`}
                      />
                    </div>
                    <div
                      className={`w-0.5 grow my-1 ${
                        isPaid ? 'bg-emerald-500/40' : 'bg-border'
                      }`}
                    />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                        {formatShortTime(orderDate, 1)}
                      </span>
                      <h3 className="text-xs font-bold text-foreground">
                        {isPaid
                          ? t('purchases.paymentConfirmed', 'Payment confirmed')
                          : Number(dualPaid.usd) > 0
                          ? t('purchases.partiallyPaid', 'Partially paid')
                          : t('purchases.pendingPayment', 'Pending payment')}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isPaid
                        ? `$${Number(dualPaid.usd).toFixed(2)} ${t('purchases.fullySettled', 'fully settled')} via ${purchase.currency_code || 'USD'} - ${purchase.reference_number}`
                        : Number(dualPaid.usd) > 0
                        ? `$${Number(dualPaid.usd).toFixed(2)} ${t('purchases.partiallySettled', 'partially settled')} (Due $${Number(dualDue.usd).toFixed(2)})`
                        : `$0.00 ${t('purchases.awaitingPayment', 'awaiting payment')} ($${Number(dualGrandTotal.usd).toFixed(2)})`}
                    </p>
                  </div>
                </div>

                {/* Step 3: Order Accepted / Confirmed by Supplier */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        purchase.status !== 'draft' && !isCancelled
                          ? 'bg-emerald-500/15 border-2 border-emerald-500'
                          : 'bg-muted border-2 border-border'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          purchase.status !== 'draft' && !isCancelled ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                        }`}
                      />
                    </div>
                    <div
                      className={`w-0.5 grow my-1 ${
                        purchase.status !== 'draft' && !isCancelled ? 'bg-emerald-500/40' : 'bg-border'
                      }`}
                    />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                        {formatShortTime(orderDate, 2)}
                      </span>
                      <h3 className="text-xs font-bold text-foreground">
                        {t('purchases.orderAcceptedConfirmed', 'Order accepted & confirmed')}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {purchase.supplier?.name
                        ? `${t('purchases.supplierAccepted', 'Supplier accepted the purchase order')}: ${purchase.supplier.name}`
                        : t('purchases.awaitingSupplier', 'Awaiting supplier confirmation')}
                    </p>
                  </div>
                </div>

                {/* Step 4: Item Preparation & Verification */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isReceived
                          ? 'bg-emerald-500/15 border-2 border-emerald-500'
                          : isPartial
                          ? 'bg-amber-500/15 border-2 border-amber-500 animate-pulse'
                          : 'bg-muted border-2 border-border'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isReceived
                            ? 'bg-emerald-500'
                            : isPartial
                            ? 'bg-amber-500'
                            : 'bg-muted-foreground/40'
                        }`}
                      />
                    </div>
                    <div
                      className={`w-0.5 grow my-1 ${
                        isReceived ? 'bg-emerald-500/40' : 'bg-border'
                      }`}
                    />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isReceived
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : isPartial
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isReceived
                          ? t('purchases.statusDone', 'Done')
                          : isPartial
                          ? t('purchases.statusInProgress', 'In progress')
                          : t('purchases.statusPending', 'Pending')}
                      </span>
                      <h3 className="text-xs font-bold text-foreground">
                        {t('purchases.itemPreparation', 'Item preparation & verification')}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('purchases.itemsCheckedSummary', {
                        count: items.length,
                        defaultValue: `${items.length} items checked and verified in purchase list`
                      })}
                    </p>
                  </div>
                </div>

                {/* Step 5: Warehouse Receiving (GRN) */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isReceived
                          ? 'bg-emerald-500/15 border-2 border-emerald-500'
                          : isPartial
                          ? 'bg-amber-500/15 border-2 border-amber-500'
                          : 'bg-muted border-2 border-border'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isReceived ? 'bg-emerald-500' : isPartial ? 'bg-amber-500' : 'bg-muted-foreground/40'
                        }`}
                      />
                    </div>
                    <div
                      className={`w-0.5 grow my-1 ${
                        isReceived ? 'bg-emerald-500/40' : 'bg-border'
                      }`}
                    />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isReceived
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isReceived
                          ? t('purchases.statusReceived', 'Received')
                          : t('purchases.statusInTransit', 'In transit')}
                      </span>
                      <h3 className="text-xs font-bold text-foreground">
                        {t('purchases.warehouseReceivingGRN', 'Warehouse receiving (GRN)')}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('purchases.receivedUnitsSummary', {
                        received: totalReceivedQty,
                        total: totalOrderedQty,
                        warehouse: purchase.warehouse?.name || t('purchases.defaultCentralWarehouse', 'Central Warehouse'),
                        defaultValue: `Received ${totalReceivedQty}/${totalOrderedQty} units into ${purchase.warehouse?.name || 'Warehouse'}`
                      })}
                    </p>
                  </div>
                </div>

                {/* Step 6: Delivered & Completed */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isReceived && isPaid
                          ? 'bg-emerald-500/15 border-2 border-emerald-500'
                          : isCancelled
                          ? 'bg-rose-500/15 border-2 border-rose-500'
                          : 'bg-muted border-2 border-border'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isReceived && isPaid
                            ? 'bg-emerald-500'
                            : isCancelled
                            ? 'bg-rose-500'
                            : 'bg-muted-foreground/40'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isReceived && isPaid
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : isCancelled
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isReceived && isPaid
                          ? 'DELIVERED & COMPLETED'
                          : isCancelled
                          ? 'CANCELLED'
                          : 'IN PROGRESS'}
                      </span>
                      <h3 className="text-xs font-bold text-foreground">
                        {isCancelled
                          ? t('purchases.orderCancelled', 'Order cancelled')
                          : t('purchases.orderCompleted', 'Order completed')}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isReceived && isPaid
                        ? t('purchases.goodsFullyReceived', 'Goods fully received into inventory - transaction completed')
                        : isCancelled
                        ? t('purchases.orderCancelledLocked', 'Purchase order cancelled and locked')
                        : t('purchases.awaitingReceivePayment', 'Awaiting full receiving or payment settlement')}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Card 2: Clean Ordered Items Table */}
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            <div className="p-5 border-b border-border/80 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {t('purchases.orderedItems', 'Ordered Items')}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {items.length} {t('purchases.items', 'items')} • {totalOrderedQty} {t('purchases.units', 'units')}
                </p>
              </div>

              {/* Compact Receiving Progress Pill */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                  {t('purchases.receivingProgress', 'Receiving')}:
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                  receivingPercent === 100
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : receivingPercent > 0
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-muted text-muted-foreground border-border'
                }`}>
                  {totalReceivedQty} / {totalOrderedQty} ({receivingPercent}%)
                </span>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                {t('purchases.noItems', 'No items found in this purchase order.')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-4 min-w-[200px]">{t('purchases.product', 'Product')}</th>
                      <th className="py-3 px-3 text-center">{t('purchases.ordered', 'Ordered')}</th>
                      <th className="py-3 px-3 text-center">{t('purchases.received', 'Received')}</th>
                      <th className="py-3 px-3 text-right">{t('purchases.unitCost', 'Unit Cost')}</th>
                      <th className="py-3 px-3 text-right">{t('purchases.discount', 'Discount')}</th>
                      <th className="py-3 px-4 text-right">{t('purchases.total', 'Line Total')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {items.map((item) => {
                      const itemTotal = Number(item.total || 0)
                      const itemCost = Number(item.unit_cost || 0)
                      const itemDisc = Number(item.discount_amount || 0)
                      const isItemFullyReceived = Number(item.quantity_received || 0) >= Number(item.quantity || 0)
                      const itemName = item.product_name ?? item.product?.name ?? `Product #${item.product_id}`
                      const itemImg =
                        item.primary_image ||
                        item.image ||
                        item.product_image ||
                        item.product?.primary_image ||
                        item.product?.image ||
                        item.variant?.image
                      const itemSku = item.sku ?? item.product?.sku ?? item.variant?.sku

                      return (
                        <tr key={item.id} className="hover:bg-muted/15 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <ProductThumbnail
                                name={itemName}
                                primaryImage={item.primary_image || item.product?.primary_image}
                                image={itemImg}
                                categoryName={item.product?.category?.name}
                                size="sm"
                                className="rounded-xl shadow-2xs shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="font-semibold text-foreground text-xs block leading-snug truncate max-w-[240px]" title={itemName}>
                                  {itemName}
                                </span>
                                {itemSku && (
                                  <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
                                    SKU: {itemSku}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center font-semibold text-foreground font-mono">
                            {item.quantity}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                              isItemFullyReceived
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : Number(item.quantity_received) > 0
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {item.quantity_received} / {item.quantity}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                            ${itemCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          <td className="py-3 px-3 text-right font-mono text-rose-500 font-medium">
                            {itemDisc > 0 ? `-$${itemDisc.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                            ${itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  {/* Table Footer Totals */}
                  <tfoot>
                    <tr className="bg-muted/20 border-t border-border font-semibold text-xs">
                      <td className="py-3 px-4 text-muted-foreground uppercase text-[11px]">
                        {t('purchases.totalQuantities', 'Total Quantities')}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-foreground">
                        {totalOrderedQty}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-emerald-600 dark:text-emerald-400">
                        {totalReceivedQty}
                      </td>
                      <td colSpan={2} className="py-3 px-3 text-right text-muted-foreground text-[11px]">
                        {t('purchases.subtotal', 'Subtotal')}:
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-foreground font-bold">
                        ${Number(dualSubtotal.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Card 3: Notes & Terms */}
          {purchase.notes && (
            <div className="bg-card rounded-2xl border border-border shadow-xs p-5 text-xs">
              <h4 className="font-bold text-foreground mb-1.5 uppercase tracking-wider text-[11px]">
                {t('purchases.notesTerms', 'Notes & Terms')}
              </h4>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {purchase.notes}
              </p>
            </div>
          )}

        </div>

        {/* ─── RIGHT COLUMN (1 COL) ─────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6">

          {/* 1. Supplier Profile Card */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-3.5 border-b border-border/80">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('purchases.supplierInfo', 'Supplier Info')}
              </h4>
              {purchase.supplier?.id && (
                <button
                  type="button"
                  onClick={() => navigate('/suppliers')}
                  className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                >
                  {t('common.view', 'View')}
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <SupplierLogo
                  logo={purchase.supplier?.logo}
                  name={purchase.supplier?.name}
                  size="md"
                  className="rounded-xl shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-muted-foreground block">{t('purchases.supplier', 'Supplier Name')}</span>
                  <span className="font-bold text-foreground text-sm truncate block leading-tight">
                    {purchase.supplier?.name || t('purchases.unknownSupplier', 'General Supplier')}
                  </span>
                  {purchase.supplier?.code && (
                    <span className="font-mono text-[10px] text-muted-foreground block mt-0.5">
                      {purchase.supplier.code}
                    </span>
                  )}
                </div>
              </div>

              {purchase.supplier?.address && (
                <div className="pt-1.5 border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground block">{t('purchases.address', 'Address')}</span>
                  <span className="text-foreground text-xs leading-relaxed">{purchase.supplier.address}</span>
                </div>
              )}

              {purchase.supplier?.phone && (
                <div className="flex items-center justify-between pt-1.5 border-t border-border/60">
                  <span className="text-muted-foreground">{t('purchases.phone', 'Phone')}:</span>
                  <span className="font-mono font-semibold text-foreground">{purchase.supplier.phone}</span>
                </div>
              )}

              {purchase.supplier?.email && (
                <div className="flex items-center justify-between pt-1.5 border-t border-border/60">
                  <span className="text-muted-foreground">{t('purchases.email', 'Email')}:</span>
                  <span className="font-mono text-foreground truncate max-w-[170px]">{purchase.supplier.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Delivery Destination Card */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-3">
            <h4 className="text-xs font-bold text-foreground pb-3.5 border-b border-border/80 uppercase tracking-wider">
              {t('purchases.deliveryDestination', 'Delivery Destination')}
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('purchases.warehouse', 'Warehouse')}:</span>
                <span className="font-semibold text-foreground">{purchase.warehouse?.name || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('purchases.branch', 'Branch')}:</span>
                <span className="font-medium text-foreground">{purchase.branch?.name || 'Main Branch'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('purchases.date', 'PO Date')}:</span>
                <span className="font-mono text-foreground">{purchase.date || '—'}</span>
              </div>
              {purchase.due_date && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('purchases.dueDate', 'Due Date')}:</span>
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{purchase.due_date}</span>
                </div>
              )}
              {purchase.creator?.name && (
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="text-muted-foreground">{t('purchases.createdBy', 'Created By')}:</span>
                  <span className="font-medium text-foreground">{purchase.creator.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Financial Summary Card */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-4">
            <h4 className="text-xs font-bold text-foreground pb-3.5 border-b border-border/80 uppercase tracking-wider">
              {t('purchases.financialSummary', 'Financial Overview')}
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('purchases.subtotal', 'Subtotal')}</span>
                <span className="font-mono font-semibold text-foreground">
                  ${Number(dualSubtotal.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('purchases.discount', 'Discount')}</span>
                <span className="font-mono font-semibold text-rose-500">
                  -${Number(dualDiscount.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('purchases.tax', 'Tax')}</span>
                <span className="font-mono font-semibold text-foreground">
                  +${Number(dualTax.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('purchases.shippingCost', 'Shipping Cost')}</span>
                <span className="font-mono font-semibold text-foreground">
                  +${Number(dualShipping.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Grand Total */}
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 my-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-primary block font-bold uppercase tracking-wider">
                    {t('purchases.grandTotal', 'Grand Total')}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {t('purchases.totalPayable', 'Total Payable')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-primary text-xl block">
                    ${Number(dualGrandTotal.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {purchase.exchange_rate && purchase.exchange_rate > 1 && dualGrandTotal.khr > 0 && (
                    <span className="text-xs font-mono text-muted-foreground block">
                      ៛{Number(dualGrandTotal.khr).toLocaleString('en-US')}
                    </span>
                  )}
                </div>
              </div>

              {/* Paid vs Due Amount */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold uppercase">
                    {t('purchases.alreadyPaid', 'Paid')}
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ${Number(dualPaid.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-semibold uppercase">
                    {t('purchases.outstandingDue', 'Due')}
                  </span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                    ${Number(dualDue.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 3. INTEGRATED ACTION MODALS ────────────────────────────── */}
      <ReceiveShipmentModal
        receiveTarget={receiveModalOpen ? purchase : null}
        onClose={() => setReceiveModalOpen(false)}
        recvQuantities={recvQuantities}
        setRecvQuantities={setRecvQuantities}
        onSubmit={handleReceiveSubmit}
        isSubmitting={receiveMutation.isPending}
      />

      <RecordPaymentModal
        isOpen={paymentModalOpen}
        purchase={purchase}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={(amount, notes) => {
          paymentMutation.mutate({ amount, notes })
        }}
        isSubmitting={paymentMutation.isPending}
      />

      <ConfirmDialog
        open={cancelDialogOpen}
        title={t('purchases.cancelPOTitle', 'Cancel Purchase Order')}
        message={t('purchases.cancelPOConfirm', 'Are you sure you want to cancel purchase order {{ref}}? This action cannot be undone.', { ref: `#${purchase.reference_number}` })}
        warningText={t('purchases.cancelPOWarning', 'This action will lock the purchase order and prevent inventory receiving.')}
        confirmText={t('common.confirm', 'Confirm Cancel')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={cancelMutation.isPending}
        variant="danger"
        onConfirm={() => cancelMutation.mutate()}
        onCancel={() => setCancelDialogOpen(false)}
      />

      <PurchasePrintVoucher
        purchase={purchase}
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
      />
    </div>
  )
}

export default PurchaseDetailPage
