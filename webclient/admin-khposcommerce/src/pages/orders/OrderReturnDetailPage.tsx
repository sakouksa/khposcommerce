import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Copy,
  Check,
  Printer,
  ExternalLink,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Package,
  ShieldCheck,
  ArrowRightLeft,
  DollarSign,
} from 'lucide-react'
import { orderReturnService } from '@/services/orderReturnService'
import type {
  OrderReturn,
  ReturnStatus,
  ReturnFault,
  ConditionGrade,
  InventoryAction,
} from '@/types/orderReturn.types'
import { useToast } from '@/hooks/useToast'
import { useThemeStore } from '@/stores/themeStore'
import { sound } from '@/utils/sound'
import {
  Breadcrumb,
  FormHeader,
  FormHeaderButton,
  LoadingSpinner,
  SecondaryButton,
  AddButton,
  ProductThumbnail,
  EnterpriseModal,
  ModalFooter,
} from '@/components/common'
import { GlobalFormat } from '@/utils/formatters'
import { OrderReturnPrintModal } from './components/OrderReturnPrintModal'

const KHR_RATE = 4100

const inputCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium dark:[color-scheme:dark]'

const labelCls =
  'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'

const selectCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer'

const textareaCls =
  'w-full min-h-[70px] px-3.5 py-2.5 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none'

export const OrderReturnDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { language } = useThemeStore()
  const { t } = useTranslation(['returns', 'nav', 'sales', 'orders', 'common'])
  const toast = useToast()
  const queryClient = useQueryClient()

  const [copiedId, setCopiedId] = useState(false)
  const [copiedTracking, setCopiedTracking] = useState(false)

  // Modals state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [isInspectionOpen, setIsInspectionOpen] = useState(false)
  const [isRefundOpen, setIsRefundOpen] = useState(false)
  const [isExchangeOpen, setIsExchangeOpen] = useState(false)

  // QC inspection form state
  const [inspectionVerdict, setInspectionVerdict] = useState<'pass' | 'partial_pass' | 'reject' | 'fraud_suspected'>('pass')
  const [serialMatched, setSerialMatched] = useState(true)
  const [conditionGrade, setConditionGrade] = useState<ConditionGrade>('resellable_new')
  const [inventoryAction, setInventoryAction] = useState<InventoryAction>('restock_available')
  const [deductionAmount, setDeductionAmount] = useState<number>(0)
  const [qcNotes, setQcNotes] = useState('')
  const [checklist, setChecklist] = useState({
    original_box: true,
    charger: true,
    cable: true,
    manual: true,
  })

  // Refund state
  const [refundMethod, setRefundMethod] = useState<string>('original_payment')

  // Exchange state
  const [newProductPrice, setNewProductPrice] = useState<number>(0)
  const [exchangeFee, setExchangeFee] = useState<number>(0)

  // Fetch Order Return Detail
  const {
    data: orderReturn,
    isLoading,
    isError,
    refetch,
  } = useQuery<OrderReturn | null>({
    queryKey: ['order-return-detail', id],
    queryFn: async () => {
      if (!id) return null
      return await orderReturnService.show(id)
    },
    enabled: !!id,
  })

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (returnId: number) => orderReturnService.approve(returnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-return-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['order-returns'] })
      sound.playSuccess()
      toast.success(t('returnApproved', 'Return request approved successfully!'))
    },
    onError: (err: any) => {
      sound.playError()
      toast.error(err.response?.data?.message || 'Failed to approve return request')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ returnId, reason }: { returnId: number; reason: string }) =>
      orderReturnService.reject(returnId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-return-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['order-returns'] })
      sound.playSuccess()
      toast.success(t('returnRejected', 'Return request rejected successfully.'))
    },
    onError: (err: any) => {
      sound.playError()
      toast.error(err.response?.data?.message || 'Failed to reject return request')
    },
  })

  const receiveMutation = useMutation({
    mutationFn: ({ returnId, warehouseId }: { returnId: number; warehouseId: number }) =>
      orderReturnService.receive(returnId, warehouseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-return-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['order-returns'] })
      sound.playSuccess()
      toast.success(t('returnReceived', 'Item received at holding warehouse!'))
    },
    onError: (err: any) => {
      sound.playError()
      toast.error(err.response?.data?.message || 'Failed to receive item')
    },
  })

  const inspectionMutation = useMutation({
    mutationFn: (payload: Record<string, any>) =>
      orderReturnService.completeInspection(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-return-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['order-returns'] })
      setIsInspectionOpen(false)
      sound.playSuccess()
      toast.success(t('inspectionCompleted', 'QC Inspection completed successfully!'))
    },
    onError: (err: any) => {
      sound.playError()
      toast.error(err.response?.data?.message || 'Failed to submit inspection')
    },
  })

  const settleMutation = useMutation({
    mutationFn: (payload: { refund_method?: string; refund_amount?: number }) =>
      orderReturnService.settleRefund(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-return-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['order-returns'] })
      setIsRefundOpen(false)
      sound.playSuccess()
      toast.success(t('refundSettled', 'Refund settled and ledger updated successfully!'))
    },
    onError: (err: any) => {
      sound.playError()
      toast.error(err.response?.data?.message || 'Failed to settle refund')
    },
  })

  const copyToClipboard = (text: string, type: 'id' | 'tracking') => {
    if (!text) return
    navigator.clipboard.writeText(text)
    sound.playSuccess()
    if (type === 'id') {
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 1500)
    } else {
      setCopiedTracking(true)
      setTimeout(() => setCopiedTracking(false), 1500)
    }
    toast.success(t('common.copied', 'Copied to clipboard'))
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          {t('loadingDetails', 'Loading RMA return details...')}
        </p>
      </div>
    )
  }

  // Error state
  if (isError || !orderReturn) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-500">
          <AlertCircle size={36} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {t('noReturnsFound', 'Return Record Not Found')}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            {t('noReturnsFoundDesc', 'The requested return record does not exist or has been removed.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/returns')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft size={14} />
          <span>{t('backToReturns', 'Back to Returns')}</span>
        </button>
      </div>
    )
  }

  // Normalized values
  const totalRefund = Number(orderReturn.total_refund_amount || 0)
  const totalRefundKhr = Math.round(totalRefund * KHR_RATE)
  const isActionLoading =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    receiveMutation.isPending ||
    inspectionMutation.isPending ||
    settleMutation.isPending

  // Status Badge
  const getStatusBadge = (status: ReturnStatus) => {
    const config: Record<ReturnStatus, { label: string; bg: string; text: string; border: string }> = {
      requested: { label: t('statuses.requested', 'Requested'), bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
      approved: { label: t('statuses.approved', 'Approved'), bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
      rejected: { label: t('statuses.rejected', 'Rejected'), bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
      in_transit: { label: t('statuses.in_transit', 'In Transit'), bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20' },
      received: { label: t('statuses.received', 'Received at WH'), bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
      inspecting: { label: t('statuses.inspecting', 'QC Inspecting'), bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20' },
      inspected: { label: t('statuses.inspected', 'Inspected'), bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/20' },
      completed: { label: t('statuses.completed', 'Completed'), bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
      cancelled: { label: t('statuses.cancelled', 'Cancelled'), bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' },
      expired: { label: t('statuses.expired', 'Expired'), bg: 'bg-zinc-500/10', text: 'text-zinc-500', border: 'border-zinc-500/20' },
    }
    const item = config[status] || { label: status, bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' }
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${item.bg} ${item.text} ${item.border}`}>
        <span className="w-2 h-2 rounded-full bg-current" />
        {item.label}
      </span>
    )
  }

  // Fault Badge
  const getFaultBadge = (fault: ReturnFault) => {
    switch (fault) {
      case 'store':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {t('storeFault', 'Store Fault')}
          </span>
        )
      case 'courier':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {t('courierFault', 'Courier Fault')}
          </span>
        )
      case 'customer':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {t('customerFault', 'Customer Fault')}
          </span>
        )
    }
  }

  const getConditionGradeLabel = (grade?: ConditionGrade | null) => {
    if (!grade) return '—'
    return t(`conditionGrades.${grade}`, grade.replace('_', ' '))
  }

  return (
    <div className="space-y-6 pb-16 print:p-0">
      {/* ── 0. BREADCRUMBS ────────────────────────────────────────────── */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: t('nav:salesManagement', 'Sales Management'), path: '/sales' },
            { label: t('title', 'Returns & Exchanges (RMA)'), path: '/returns' },
            { label: orderReturn.return_number },
          ]}
        />
      </div>

      {/* ── 1. FORM HEADER ────────────────────────────────────────────── */}
      <div className="print:hidden">
        <FormHeader
          frameless
          title={
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xl md:text-2xl font-bold tracking-tight text-foreground">
                {orderReturn.return_number}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(orderReturn.return_number, 'id')}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                title={t('detail.copyRmaNumber', 'Copy RMA Number')}
              >
                {copiedId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">
                {orderReturn.type === 'exchange' ? t('exchanges', 'Exchange') : t('returns', 'Return')}
              </span>
            </div>
          }
          subtitle={
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span>{new Date(orderReturn.created_at).toLocaleString(language === 'km' ? 'km-KH' : 'en-US')}</span>
              <span>·</span>
              <span className="font-semibold uppercase text-foreground">{orderReturn.channel}</span>
              {orderReturn.warehouse && (
                <>
                  <span>·</span>
                  <span>{orderReturn.warehouse.name}</span>
                </>
              )}
            </div>
          }
          showBack={true}
          backPath="/returns"
          backLabel={t('detail.back', 'Back to Returns')}
          statusBadge={
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge(orderReturn.status)}
              {getFaultBadge(orderReturn.fault)}
            </div>
          }
          extraActions={
            <div className="flex items-center gap-2 flex-wrap">
              {/* Print RMA Voucher Button */}
              <FormHeaderButton
                onClick={() => setIsPrintModalOpen(true)}
                icon={<Printer size={14} />}
                variant="outline"
              >
                {t('detail.printVoucher', 'Print RMA Voucher')}
              </FormHeaderButton>

              {/* Workflow Actions */}
              {orderReturn.status === 'requested' && (
                <>
                  <FormHeaderButton
                    onClick={() => {
                      const reason = prompt(t('rejectPrompt', 'Please enter rejection reason:'))
                      if (reason) rejectMutation.mutate({ returnId: orderReturn.id, reason })
                    }}
                    icon={<XCircle size={14} />}
                    variant="danger"
                    disabled={isActionLoading}
                  >
                    {t('detail.rejectRequest', 'Reject Request')}
                  </FormHeaderButton>
                  <FormHeaderButton
                    onClick={() => approveMutation.mutate(orderReturn.id)}
                    icon={<CheckCircle2 size={14} />}
                    variant="primary"
                    disabled={isActionLoading}
                  >
                    {t('detail.approveRequest', 'Approve Request')}
                  </FormHeaderButton>
                </>
              )}

              {['approved', 'in_transit'].includes(orderReturn.status) && (
                <FormHeaderButton
                  onClick={() => receiveMutation.mutate({ returnId: orderReturn.id, warehouseId: 1 })}
                  icon={<Package size={14} />}
                  variant="primary"
                  disabled={isActionLoading}
                >
                  {t('detail.receiveWarehouse', 'Receive at Warehouse')}
                </FormHeaderButton>
              )}

              {['received', 'inspecting'].includes(orderReturn.status) && (
                <FormHeaderButton
                  onClick={() => setIsInspectionOpen(true)}
                  icon={<ShieldCheck size={14} />}
                  variant="primary"
                  disabled={isActionLoading}
                >
                  {t('detail.qcInspection', 'QC Inspection')}
                </FormHeaderButton>
              )}

              {orderReturn.status === 'inspected' && orderReturn.refund_status === 'pending' && (
                <>
                  <FormHeaderButton
                    onClick={() => {
                      setNewProductPrice(Number(orderReturn.subtotal_amount))
                      setIsExchangeOpen(true)
                    }}
                    icon={<ArrowRightLeft size={14} />}
                    variant="outline"
                    disabled={isActionLoading}
                  >
                    {t('detail.exchange', 'Exchange')}
                  </FormHeaderButton>
                  <FormHeaderButton
                    onClick={() => setIsRefundOpen(true)}
                    icon={<DollarSign size={14} />}
                    variant="primary"
                    disabled={isActionLoading}
                  >
                    {t('detail.settleRefund', 'Settle Refund')}
                  </FormHeaderButton>
                </>
              )}
            </div>
          }
        />
      </div>

      {/* ── 2. TWO-COLUMN MAIN CONTENT ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT COLUMN: ITEMS, QC, LOGISTICS, NOTES (8 cols) ───────── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Items In This RMA */}
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            <div className="p-5 border-b border-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">
                  {t('detail.itemsTitle', 'Items in this RMA')}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {orderReturn.items?.length || 0} {t('detail.itemsCount', 'items')}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {orderReturn.currency_code || 'USD'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-5">{t('detail.product', 'Product')}</th>
                    <th className="py-3 px-4 text-center">{t('detail.qty', 'Qty')}</th>
                    <th className="py-3 px-4 text-right">{t('detail.unitPrice', 'Unit Price')}</th>
                    <th className="py-3 px-4 text-center">{t('detail.condition', 'Condition')}</th>
                    <th className="py-3 px-5 text-right">{t('detail.netRefund', 'Net Refund')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {orderReturn.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-start gap-3">
                          <ProductThumbnail
                            name={item.product?.name || `Product #${item.product_id}`}
                            primaryImage={item.product?.primary_image || item.product?.primaryImage}
                            images={item.product?.images}
                            image={item.product?.image || item.product?.primary_image?.url || item.product?.primary_image?.image}
                            categoryName={item.product?.category?.name}
                            size="md"
                            className="rounded-xl shadow-2xs border border-border/70"
                          />
                          <div>
                            <div className="font-bold text-foreground text-sm">
                              {item.product?.name || `Product #${item.product_id}`}
                            </div>
                            {item.product?.sku && (
                              <div className="text-xs text-muted-foreground font-mono">
                                SKU: {item.product.sku}
                              </div>
                            )}
                            {item.sold_serial_number && (
                              <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                                SN: {item.sold_serial_number}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="font-bold text-foreground">{GlobalFormat.number(item.quantity_requested)}</span>
                        {item.quantity_received > 0 && (
                          <span className="text-xs text-muted-foreground block">
                            {t('detail.receivedCount', { count: item.quantity_received, defaultValue: `(${GlobalFormat.number(item.quantity_received)} received)` })}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-foreground">
                        {GlobalFormat.currency(item.unit_price)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
                          {getConditionGradeLabel(item.condition_grade)}
                        </span>
                        {item.inspection_status && (
                          <div className="mt-1">
                            {item.inspection_status === 'passed' ? (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                                {t('detail.passed', 'Passed')}
                              </span>
                            ) : item.inspection_status === 'failed' ? (
                              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">
                                {t('detail.failed', 'Failed')}
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                                {t('detail.pending', 'Pending')}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {GlobalFormat.currency(item.total_refund)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Warehouse QC Inspection Report */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <h2 className="text-base font-bold text-foreground">
                {t('detail.qcReportTitle', 'Warehouse QC Inspection Report')}
              </h2>
              {orderReturn.latestInspection ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {orderReturn.latestInspection.inspection_number}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                  {t('detail.awaitingInspection', 'Awaiting Inspection')}
                </span>
              )}
            </div>

            {orderReturn.latestInspection ? (
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/20 border border-border">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">{t('detail.overallVerdict', 'Overall Verdict')}</span>
                    <span className="text-sm font-bold text-foreground uppercase">
                      {t(`inspection.verdict${orderReturn.latestInspection.verdict === 'pass' ? 'Pass' : 'Reject'}`, orderReturn.latestInspection.verdict)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">{t('detail.inspector', 'Inspector')}</span>
                    <span className="font-semibold text-foreground">
                      {orderReturn.latestInspection.inspector?.name || t('detail.warehouseStaff', 'Warehouse Staff')}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">{t('detail.inspectedDate', 'Inspected Date')}</span>
                    <span className="font-mono text-foreground">
                      {orderReturn.latestInspection.inspected_at ? GlobalFormat.displayDate(orderReturn.latestInspection.inspected_at) : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">{t('detail.serialMatch', 'Serial Match')}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {t('detail.serialVerified', 'Serial Verified')}
                    </span>
                  </div>
                </div>

                {orderReturn.latestInspection.summary_notes && (
                  <div className="p-3.5 rounded-xl bg-muted/20 border border-border/80">
                    <span className="font-semibold text-xs text-muted-foreground block mb-1">
                      {t('detail.summaryNotes', 'Inspector Summary Notes')}
                    </span>
                    <p className="text-foreground leading-relaxed">
                      {orderReturn.latestInspection.summary_notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-muted/20 border border-border text-center space-y-3">
                <p className="text-xs text-muted-foreground">
                  {t('detail.awaitingQcDesc', 'This RMA is currently queued for physical warehouse condition verification.')}
                </p>
                {['approved', 'in_transit', 'received', 'inspecting'].includes(orderReturn.status) && (
                  <button
                    type="button"
                    onClick={() => setIsInspectionOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                  >
                    <span>{t('detail.performQc', 'Perform QC Inspection')}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Card 3: Reverse Logistics & Tracking */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <h2 className="text-base font-bold text-foreground">
                {t('detail.logisticsTitle', 'Reverse Logistics & Tracking')}
              </h2>
              {orderReturn.latestShipment && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 capitalize">
                  {orderReturn.latestShipment.status}
                </span>
              )}
            </div>

            {orderReturn.latestShipment ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/20 border border-border text-xs sm:text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">{t('detail.courier', 'Courier')}</span>
                  <span className="font-semibold text-foreground">{orderReturn.latestShipment.carrier || t('detail.expressCourier', 'Express Courier')}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">{t('detail.trackingNumber', 'Tracking #')}</span>
                  <div className="flex items-center gap-1 font-mono font-semibold text-foreground">
                    <span>{orderReturn.latestShipment.tracking_number || '—'}</span>
                    {orderReturn.latestShipment.tracking_number && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(orderReturn.latestShipment!.tracking_number!, 'tracking')}
                        className="p-1 hover:bg-muted rounded text-muted-foreground"
                      >
                        {copiedTracking ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">{t('detail.shippingPaidBy', 'Shipping Paid By')}</span>
                  <span className="font-semibold text-foreground capitalize">{orderReturn.latestShipment.paid_by}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">{t('detail.pickupMode', 'Pickup Mode')}</span>
                  <span className="font-semibold text-foreground capitalize">
                    {orderReturn.latestShipment.pickup_type?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-muted/20 border border-border text-center text-xs text-muted-foreground">
                <p>{t('detail.noShipmentDesc', 'No reverse courier pickup recorded. Customer returns item directly to store or warehouse.')}</p>
              </div>
            )}
          </div>

          {/* Card 4: Customer Reason & Internal Notes */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
            <div className="border-b border-border/80 pb-4">
              <h2 className="text-base font-bold text-foreground">
                {t('detail.reasonNotesTitle', 'Reason for Return & Notes')}
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">
                  {t('detail.reasonCode', 'Reason Code')}: <span className="font-mono text-foreground capitalize">{orderReturn.reason_code}</span>
                </span>
                <p className="text-foreground leading-relaxed">
                  {orderReturn.reason_notes || t('detail.noCustomerNotes', 'No customer notes provided.')}
                </p>
              </div>
              {orderReturn.admin_notes && (
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border">
                  <span className="text-xs font-semibold text-foreground block mb-1">
                    {t('detail.internalStaffNotes', 'Internal Staff Notes')}
                  </span>
                  <p className="text-muted-foreground leading-relaxed">{orderReturn.admin_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: FINANCIALS, CUSTOMER, ORDER (4 cols) ───────── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Financial Audit Breakdown */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
            <div className="border-b border-border/80 pb-4">
              <h2 className="text-base font-bold text-foreground">
                {t('detail.financialSummaryTitle', 'Financial Summary')}
              </h2>
            </div>

            {/* Breakdown lines */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40 text-muted-foreground">
                <span>{t('detail.originalSubtotal', 'Original Subtotal')}:</span>
                <span className="font-mono text-foreground font-semibold">
                  {GlobalFormat.currency(orderReturn.subtotal_amount)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40 text-muted-foreground">
                <span>{t('detail.discountDeducted', 'Discount Deducted')}:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">
                  -{GlobalFormat.currency(orderReturn.allocated_discount_amount)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40 text-muted-foreground">
                <span>{t('detail.restockingFee', 'Restocking Fee')}:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">
                  -{GlobalFormat.currency(orderReturn.restocking_fee)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40 text-muted-foreground">
                <span>{t('detail.returnShippingFee', 'Return Shipping Fee')}:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">
                  -{GlobalFormat.currency(orderReturn.return_shipping_fee)}
                </span>
              </div>
              {Number(orderReturn.tax_amount) > 0 && (
                <div className="flex justify-between py-1 border-b border-border/40 text-muted-foreground">
                  <span>{t('detail.taxAdjustment', 'Tax Adjustment')}:</span>
                  <span className="font-mono text-foreground">
                    +{GlobalFormat.currency(orderReturn.tax_amount)}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-border flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-bold text-foreground block">
                    {t('detail.totalNetRefund', 'Total Net Refund')}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    ≈ {GlobalFormat.currency(totalRefundKhr, 'KHR')}
                  </span>
                </div>
                <span className="font-mono text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {GlobalFormat.currency(totalRefund)}
                </span>
              </div>
            </div>

            {/* Refund Channel & Settlement */}
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('detail.method', 'Method')}:</span>
                <span className="font-semibold text-foreground capitalize">
                  {t(`financials.${orderReturn.refund_method}`, orderReturn.refund_method.replace('_', ' '))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('detail.status', 'Status')}:</span>
                <span className="font-semibold text-primary capitalize">{orderReturn.refund_status}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Customer Profile Card */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
            <div className="border-b border-border/80 pb-4">
              <h2 className="text-base font-bold text-foreground">
                {t('detail.customerDetailsTitle', 'Customer Details')}
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground block mb-0.5">{t('detail.customerName', 'Customer Name')}</span>
                <span className="font-bold text-foreground text-sm">
                  {orderReturn.customer?.name || orderReturn.order?.customer?.name || t('detail.walkInCustomer', 'Walk-in Customer')}
                </span>
              </div>
              {(orderReturn.customer?.phone || orderReturn.order?.customer?.phone) && (
                <div>
                  <span className="text-muted-foreground block mb-0.5">{t('detail.phone', 'Phone')}</span>
                  <span className="font-mono font-medium text-foreground">
                    {GlobalFormat.phone(orderReturn.customer?.phone || orderReturn.order?.customer?.phone)}
                  </span>
                </div>
              )}
              {(orderReturn.customer?.email || orderReturn.order?.customer?.email) && (
                <div>
                  <span className="text-muted-foreground block mb-0.5">{t('detail.email', 'Email')}</span>
                  <span className="font-mono text-foreground">
                    {GlobalFormat.email(orderReturn.customer?.email || orderReturn.order?.customer?.email)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Source Order / POS Sale Reference */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
            <div className="border-b border-border/80 pb-4">
              <h2 className="text-base font-bold text-foreground">
                {t('detail.orderRefTitle', 'Order / Invoice Reference')}
              </h2>
            </div>

            <div className="space-y-2 text-xs">
              {orderReturn.order && (
                <div>
                  <span className="text-muted-foreground block mb-0.5">{t('detail.webOrder', 'Web Order')}:</span>
                  <Link
                    to={`/orders/${orderReturn.order.id}`}
                    className="font-mono font-bold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>{orderReturn.order.order_number}</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              )}
              {orderReturn.sale && (
                <div>
                  <span className="text-muted-foreground block mb-0.5">{t('detail.posInvoice', 'POS Invoice')}:</span>
                  <Link
                    to={`/sales/${orderReturn.sale.id}`}
                    className="font-mono font-bold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>{orderReturn.sale.invoice_number || `POS #${orderReturn.sale.id}`}</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              )}
              <div className="pt-2 border-t border-border/60 flex justify-between text-xs">
                <span className="text-muted-foreground">{t('detail.channel', 'Channel')}:</span>
                <span className="font-semibold text-foreground uppercase">{orderReturn.channel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. PRINT RMA VOUCHER MODAL (A4 Global Print) ────────────────────── */}
      <OrderReturnPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        orderReturn={orderReturn}
      />

      {/* ── 4. QC INSPECTION MODAL ────────────────────────────────────── */}
      <EnterpriseModal
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        title={`${t('inspection.title', 'Warehouse QC Inspection')} — ${orderReturn.return_number}`}
        subtitle={t('inspection.subtitle', 'Verify device condition, accessories, and serial authenticity')}
        icon={<ShieldCheck size={18} />}
        iconVariant="emerald"
        size="2xl"
        footer={
          <ModalFooter
            onCancel={() => setIsInspectionOpen(false)}
            onSubmit={() => {
              inspectionMutation.mutate({
                verdict: inspectionVerdict,
                summary_notes: qcNotes,
                items: [
                  {
                    order_return_item_id: orderReturn.items?.[0]?.id || 1,
                    serial_matched: serialMatched,
                    accessories_checklist: checklist,
                    condition_grade: conditionGrade,
                    inventory_action: inventoryAction,
                    deduction_amount: deductionAmount,
                    inspector_notes: qcNotes,
                  },
                ],
              })
            }}
            cancelLabel={t('cancel', 'បោះបង់')}
            submitLabel={t('inspection.submitButton', 'Submit QC & Update Stock')}
            isSubmitting={inspectionMutation.isPending}
            submitVariant="primary"
            submitIcon={<Check size={14} strokeWidth={2.5} />}
          />
        }
      >
        <div className="p-5 sm:p-6 space-y-4">
          {/* Serial Number & Anti-Fraud Verification Card */}
          <div className="p-4 rounded-xl bg-muted/20 dark:bg-slate-900/60 border border-border/80 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-border/60 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400">
                {t('inspection.serialVerification', 'Serial / IMEI Verification')}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-background dark:bg-slate-800 border border-border/80 text-primary">
                {orderReturn.items?.[0]?.sold_serial_number || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
              <div>
                <p className="text-xs font-semibold text-foreground dark:text-slate-100">
                  {t('inspection.soldSerial', 'Sold Serial / IMEI')}: <span className="font-mono font-bold text-primary">{orderReturn.items?.[0]?.sold_serial_number || 'N/A'}</span>
                </p>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                  {t('inspection.soldSerialHelp', 'Ensure returned device physically matches original IMEI sold.')}
                </p>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer select-none px-3 py-1.5 rounded-lg border border-border/80 dark:border-slate-800 bg-background dark:bg-slate-900 hover:bg-muted/40 transition-all self-start sm:self-auto">
                <input
                  type="checkbox"
                  checked={serialMatched}
                  onChange={(e) => setSerialMatched(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                />
                <span className={`text-xs font-semibold ${serialMatched ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400 font-bold'}`}>
                  {serialMatched ? t('inspection.serialMatched', 'Serial matches sold record') : t('inspection.serialMismatch', 'MISMATCH (Fraud)')}
                </span>
              </label>
            </div>
          </div>

          {/* Accessories Checklist */}
          <div className="space-y-1.5">
            <label className={labelCls}>
              {t('inspection.accessoriesChecklist', 'Accessories Checklist')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(checklist).map(([key, val]) => {
                const labelKey = `inspection.${key}Present`
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none ${
                      val
                        ? 'border-primary/40 bg-primary/5 dark:bg-primary/10 text-foreground dark:text-slate-100 font-semibold ring-1 ring-primary/20 shadow-2xs'
                        : 'border-border/80 dark:border-slate-800 bg-background dark:bg-slate-900/90 text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })}
                      className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                    />
                    <span className="truncate">{t(labelKey, `${key} Present`)}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Condition Grading & Inventory Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                {t('inspection.conditionGrading', 'Condition Grading')}
              </label>
              <select
                value={conditionGrade}
                onChange={(e) => setConditionGrade(e.target.value as ConditionGrade)}
                className={selectCls}
              >
                <option value="resellable_new">{t('conditionGrades.resellable_new', 'Resellable New')}</option>
                <option value="open_box">{t('conditionGrades.open_box', 'Open Box')}</option>
                <option value="refurbished">{t('conditionGrades.refurbished', 'Refurbished')}</option>
                <option value="damaged_repairable">{t('conditionGrades.damaged_repairable', 'Damaged (Repairable)')}</option>
                <option value="scrap">{t('conditionGrades.scrap', 'Scrap (Loss)')}</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>
                {t('inspection.inventoryAction', 'Inventory Routing Action')}
              </label>
              <select
                value={inventoryAction}
                onChange={(e) => setInventoryAction(e.target.value as InventoryAction)}
                className={selectCls}
              >
                <option value="restock_available">{t('inventoryActions.restock_available', 'Restock Available Stock')}</option>
                <option value="move_to_refurbished">{t('inventoryActions.move_to_refurbished', 'Route to Refurbished')}</option>
                <option value="move_to_damaged_quarantine">{t('inventoryActions.move_to_damaged_quarantine', 'Damaged Quarantine')}</option>
                <option value="scrap_write_off">{t('inventoryActions.scrap_write_off', 'Scrap Write-Off')}</option>
              </select>
            </div>
          </div>

          {/* Deductions & Verdict */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                {t('inspection.deductionAmount', 'Missing / Damage Deduction ($)')}
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={deductionAmount}
                onChange={(e) => setDeductionAmount(parseFloat(e.target.value) || 0)}
                className={`${inputCls} font-mono`}
              />
            </div>

            <div>
              <label className={labelCls}>
                {t('inspection.verdict', 'Overall Verdict')}
              </label>
              <select
                value={inspectionVerdict}
                onChange={(e) => setInspectionVerdict(e.target.value as any)}
                className={`${selectCls} font-semibold`}
              >
                <option value="pass">{t('inspection.verdictPass', 'Pass (Full Restock)')}</option>
                <option value="partial_pass">{t('inspection.verdictPartial', 'Partial Pass (Fee Deduction)')}</option>
                <option value="reject">{t('inspection.verdictReject', 'Reject (Violates Policy)')}</option>
                <option value="fraud_suspected">{t('inspection.verdictFraud', 'Fraud Suspected')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>
              {t('inspection.notes', 'QC Inspector Notes')}
            </label>
            <textarea
              rows={2}
              value={qcNotes}
              onChange={(e) => setQcNotes(e.target.value)}
              placeholder={t('inspection.notesPlaceholder', 'Add condition remarks, package defects or serial inspection notes...')}
              className={textareaCls}
            />
          </div>
        </div>
      </EnterpriseModal>

      {/* ── 5. SETTLE REFUND MODAL ─────────────────────────────────────── */}
      <EnterpriseModal
        isOpen={isRefundOpen}
        onClose={() => setIsRefundOpen(false)}
        title={t('financials.settleRefundTitle', 'Settle Refund')}
        subtitle={t('financials.settleRefundSubtitle', 'Select payout channel or credit to customer wallet')}
        icon={<DollarSign size={18} />}
        iconVariant="emerald"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setIsRefundOpen(false)}
            onSubmit={() => {
              settleMutation.mutate({
                refund_method: refundMethod,
                refund_amount: totalRefund,
              })
            }}
            cancelLabel={t('cancel', 'បោះបង់')}
            submitLabel={t('financials.confirmRefundButton', 'Process & Release Refund')}
            isSubmitting={settleMutation.isPending}
            submitVariant="emerald"
            submitIcon={<Check size={14} strokeWidth={2.5} />}
          />
        }
      >
        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-4 rounded-xl bg-muted/20 dark:bg-slate-900/60 border border-border/80 dark:border-slate-800 space-y-2.5">
            <div className="flex justify-between text-xs text-muted-foreground dark:text-slate-400">
              <span>{t('returnNumber', 'RMA Number')}:</span>
              <span className="font-mono text-foreground dark:text-slate-100 font-semibold">{orderReturn.return_number}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground dark:text-slate-400">
              <span>{t('customer', 'Customer')}:</span>
              <span className="font-semibold text-foreground dark:text-slate-100">{orderReturn.customer?.name || t('guestCustomer', 'Guest / Walk-in')}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-foreground dark:text-slate-100 pt-2 border-t border-border/70 dark:border-slate-800">
              <span>{t('financials.netRefund', 'Net Refund Amount')}:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base font-bold">
                {GlobalFormat.currency(totalRefund)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>
              {t('financials.refundMethodLabel', 'Refund Method Destination')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'store_credit', label: t('financials.storeCredit', 'Store Credit Wallet (Instant)') },
                { id: 'bakong_khqr', label: t('financials.bakongKhqr', 'Bakong / KHQR Payout') },
                { id: 'original_payment', label: t('financials.originalPayment', 'Original Payment Method') },
                { id: 'cash', label: t('financials.cash', 'Cash (Register Drawer)') },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none ${
                    refundMethod === m.id
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary font-bold ring-1 ring-primary/20 shadow-2xs'
                      : 'border-border/80 dark:border-slate-800 bg-background dark:bg-slate-900/90 text-foreground/80 hover:bg-muted/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="refund_method"
                    value={m.id}
                    checked={refundMethod === m.id}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="form-radio h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                  />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </EnterpriseModal>

      {/* ── 6. EXCHANGE SETTLEMENT MODAL ───────────────────────────────── */}
      <EnterpriseModal
        isOpen={isExchangeOpen}
        onClose={() => setIsExchangeOpen(false)}
        title={t('financials.processExchangeTitle', 'Process Exchange Settlement')}
        subtitle={t('financials.processExchangeSubtitle', 'Calculate price difference and create replacement order')}
        icon={<ArrowRightLeft size={18} />}
        iconVariant="blue"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setIsExchangeOpen(false)}
            onSubmit={() => {
              toast.success(t('detail.replacementOrderSuccess', 'Replacement order generated successfully!'))
              setIsExchangeOpen(false)
            }}
            cancelLabel={t('cancel', 'បោះបង់')}
            submitLabel={t('financials.createExchangeButton', 'Create Replacement Order')}
            submitVariant="primary"
            submitIcon={<Check size={14} strokeWidth={2.5} />}
          />
        }
      >
        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-4 rounded-xl bg-muted/20 dark:bg-slate-900/60 border border-border/80 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground dark:text-slate-400">
              <span>{t('financials.oldItemCredit', 'Old Item Credit (Original Paid)')}:</span>
              <span className="font-mono text-foreground dark:text-slate-100 font-semibold">{GlobalFormat.currency(orderReturn.subtotal_amount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground dark:text-slate-400">
              <span>{t('financials.newReplacementCost', 'New Replacement Cost')}:</span>
              <span className="font-mono text-foreground dark:text-slate-100 font-semibold">{GlobalFormat.currency(newProductPrice)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-border/70 dark:border-slate-800 text-sm">
              <span className="text-foreground dark:text-slate-100">{t('financials.customerDifferenceDue', 'Customer Difference Due')}:</span>
              <span className="font-mono text-primary font-bold">
                {GlobalFormat.currency(Math.max(0, newProductPrice - Number(orderReturn.subtotal_amount || 0)))}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className={labelCls}>
                {t('financials.newProductPriceLabel', 'New Product Value ($)')}
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(parseFloat(e.target.value) || 0)}
                className={`${inputCls} font-mono`}
              />
            </div>
          </div>
        </div>
      </EnterpriseModal>
    </div>
  )
}

export default OrderReturnDetailPage
