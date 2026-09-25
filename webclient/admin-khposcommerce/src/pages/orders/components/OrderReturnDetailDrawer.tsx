import React, { useState } from 'react'
import {
  RotateCcw,
  Package,
  ShieldCheck,
  DollarSign,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Truck,
  User,
  Calendar,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  Barcode,
  CheckCircle,
  Clock,
  Building,
  Printer,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { GlobalFormat } from '@/utils/formatters'
import {
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerTabNav,
  DetailDrawerBody,
  DetailDrawerFooter,
  DetailDrawerCard,
  DetailDrawerRow,
  CancelButton,
  ActionButton,
} from '@/components/common'
import type { DetailDrawerTabItem } from '@/components/common'
import type {
  OrderReturn,
  ReturnStatus,
  ReturnFault,
  ConditionGrade,
  InventoryAction,
} from '@/types/orderReturn.types'

const KHR_RATE = 4100

export interface OrderReturnDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  orderReturn: OrderReturn | null
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
  onReceive?: (id: number) => void
  onQC?: (orderReturn: OrderReturn) => void
  onRefund?: (orderReturn: OrderReturn) => void
  onExchange?: (orderReturn: OrderReturn) => void
  onPrint?: (orderReturn: OrderReturn) => void
  isActionLoading?: boolean
}

export const OrderReturnDetailDrawer: React.FC<OrderReturnDetailDrawerProps> = ({
  isOpen,
  onClose,
  orderReturn,
  onApprove,
  onReject,
  onReceive,
  onQC,
  onRefund,
  onExchange,
  onPrint,
  isActionLoading = false,
}) => {
  const { t } = useTranslation(['returns', 'sales', 'orders', 'common'])
  const { language } = useThemeStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'inspection'>('overview')
  const [copiedId, setCopiedId] = useState(false)

  if (!isOpen || !orderReturn) return null

  const handleCopyRma = () => {
    navigator.clipboard.writeText(orderReturn.return_number)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 1500)
  }

  // Status Badge Helper
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
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.bg} ${item.text} ${item.border}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {item.label}
      </span>
    )
  }

  // Fault badge helper
  const getFaultBadge = (fault: ReturnFault) => {
    switch (fault) {
      case 'store':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {t('storeFault', 'Store Fault')}
          </span>
        )
      case 'courier':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {t('courierFault', 'Courier Fault')}
          </span>
        )
      case 'customer':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {t('customerFault', 'Customer Fault')}
          </span>
        )
    }
  }

  // Condition grade translation
  const getConditionGradeLabel = (grade?: ConditionGrade | null) => {
    if (!grade) return '—'
    return t(`conditionGrades.${grade}`, grade.replace('_', ' '))
  }

  // Tabs definitions
  const tabs: DetailDrawerTabItem[] = [
    {
      key: 'overview',
      label: t('drawer.tabs.overview', 'Overview & Items'),
      icon: Layers,
      badge: orderReturn.items?.length || undefined,
    },
    {
      key: 'financials',
      label: t('drawer.tabs.financials', 'Financial Audit'),
      icon: DollarSign,
    },
    {
      key: 'inspection',
      label: t('drawer.tabs.inspection', 'QC & Logistics'),
      icon: ShieldCheck,
      badge: orderReturn.latestInspection ? 'QC' : orderReturn.latestShipment ? 'Ship' : undefined,
    },
  ]

  const totalRefund = Number(orderReturn.total_refund_amount || 0)
  const totalRefundKhr = Math.round(totalRefund * KHR_RATE)

  return (
    <DetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
    >
      {/* ── 1. DRAWER HEADER ── */}
      <DetailDrawerHeader
        title={
          <div className="flex items-center gap-2">
            <span className="font-mono text-primary">{orderReturn.return_number}</span>
            <button
              onClick={handleCopyRma}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title="Copy RMA Number"
            >
              {copiedId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>
        }
        subtitle={
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="font-mono">
              {GlobalFormat.displayDate(orderReturn.created_at, { includeTime: true })}
            </span>
            <span>•</span>
            <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-muted font-bold text-muted-foreground border border-border/50">
              {orderReturn.channel}
            </span>
            <span>•</span>
            <span className="text-foreground font-medium">
              {orderReturn.type === 'exchange' ? `🔄 ${t('exchanges', 'Exchange')}` : `↩️ ${t('returns', 'Return')}`}
            </span>
          </div>
        }
        badge={getStatusBadge(orderReturn.status)}
        actions={
          onPrint && (
            <button
              onClick={() => onPrint(orderReturn)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
              title={t('returns:printRmaVoucher', 'Print RMA Voucher')}
            >
              <Printer size={15} />
            </button>
          )
        }
        onClose={onClose}
      />

      {/* ── 2. DRAWER TABS ── */}
      <DetailDrawerTabNav
        tabs={tabs}
        activeTab={activeTab}
        onChange={(key) => setActiveTab(key as any)}
      />

      {/* ── 3. DRAWER BODY ── */}
      <DetailDrawerBody className="space-y-4 p-5 sm:p-6">
        {/* ─── TAB 1: OVERVIEW & ITEMS ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick KPI Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-1">
                <span className="text-[11px] text-muted-foreground block">{t('drawer.returnType', 'Request Type')}</span>
                <span className="text-xs font-bold text-foreground capitalize">
                  {orderReturn.type === 'exchange' ? t('exchanges', 'Exchange') : t('returns', 'Return')}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-1">
                <span className="text-[11px] text-muted-foreground block">{t('drawer.faultResponsibility', 'Fault Responsibility')}</span>
                <div>{getFaultBadge(orderReturn.fault)}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-1">
                <span className="text-[11px] text-muted-foreground block">{t('drawer.channel', 'Channel')}</span>
                <span className="text-xs font-bold text-foreground uppercase font-mono">{orderReturn.channel}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-1">
                <span className="text-[11px] text-muted-foreground block">{t('refundAmount', 'Net Refund')}</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {GlobalFormat.currency(totalRefund)}
                </span>
              </div>
            </div>

            {/* General Info & Customer / Order Source */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailDrawerCard
                title={t('drawer.customerInfo', 'Customer Details')}
                icon={<User size={15} />}
              >
                <div className="space-y-2">
                  <DetailDrawerRow
                    label={t('customer', 'Customer Name')}
                    value={orderReturn.customer?.name || orderReturn.order?.customer?.name || t('common.walkInCustomer', 'Walk-in Customer')}
                  />
                  {(orderReturn.customer?.phone || orderReturn.order?.customer?.phone) && (
                    <DetailDrawerRow
                      label={t('common.phone', 'Phone Number')}
                      value={GlobalFormat.phone(orderReturn.customer?.phone || orderReturn.order?.customer?.phone)}
                      copyable
                    />
                  )}
                  {(orderReturn.customer?.email || orderReturn.order?.customer?.email) && (
                    <DetailDrawerRow
                      label={t('common.email', 'Email Address')}
                      value={GlobalFormat.email(orderReturn.customer?.email || orderReturn.order?.customer?.email)}
                      copyable
                    />
                  )}
                </div>
              </DetailDrawerCard>

              <DetailDrawerCard
                title={t('drawer.referenceInfo', 'Reference & Source')}
                icon={<FileText size={15} />}
              >
                <div className="space-y-2">
                  {orderReturn.order && (
                    <DetailDrawerRow
                      label={t('orderNumber', 'Order Number')}
                      value={orderReturn.order.order_number}
                      copyable
                    />
                  )}
                  {orderReturn.sale && (
                    <DetailDrawerRow
                      label={t('columns.order', 'Invoice / Sale #')}
                      value={orderReturn.sale.invoice_number || `POS #${orderReturn.sale_id}`}
                      copyable
                    />
                  )}
                  {orderReturn.warehouse && (
                    <DetailDrawerRow
                      label={t('drawer.warehouse', 'Warehouse')}
                      value={orderReturn.warehouse.name}
                    />
                  )}
                  <DetailDrawerRow
                    label={t('reason', 'Reason Code')}
                    value={<span className="font-mono font-semibold capitalize">{orderReturn.reason_code || 'customer_return'}</span>}
                  />
                </div>
              </DetailDrawerCard>
            </div>

            {/* Reason Notes */}
            {orderReturn.reason_notes && (
              <DetailDrawerCard
                title={t('drawer.notes', 'Reason Notes & Feedback')}
                icon={<AlertTriangle size={15} />}
              >
                <p className="text-xs text-foreground/90 leading-relaxed bg-muted/20 p-3 rounded-xl border border-border/60">
                  {orderReturn.reason_notes}
                </p>
              </DetailDrawerCard>
            )}

            {/* Items in RMA */}
            <DetailDrawerCard
              title={t('drawer.itemsTitle', 'Items in this RMA')}
              icon={<Package size={15} />}
              badge={
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {orderReturn.items?.length || 0} {t('common.items', 'items')}
                </span>
              }
            >
              <div className="space-y-2.5">
                {orderReturn.items?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-border/80 bg-card hover:bg-muted/30 transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-foreground text-sm">
                          {item.product?.name || `Product #${item.product_id}`}
                        </div>
                        {item.product?.sku && (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            SKU: {item.product.sku}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm text-foreground font-mono">
                          {GlobalFormat.currency(item.total_refund)}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ≈ {GlobalFormat.currency(Number(item.total_refund || 0) * KHR_RATE, 'KHR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60 text-[11px]">
                      <span className="text-muted-foreground">
                        {t('drawer.qtyRequested', 'Qty')}: <strong className="text-foreground font-mono">{GlobalFormat.number(item.quantity_requested)}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-muted-foreground">
                        {t('drawer.unitPrice', 'Unit')}: <strong className="text-foreground font-mono">{GlobalFormat.currency(item.unit_price)}</strong>
                      </span>
                      {item.condition_grade && (
                        <>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 rounded bg-muted font-medium text-foreground">
                            {getConditionGradeLabel(item.condition_grade)}
                          </span>
                        </>
                      )}
                      {item.inspection_status && (
                        <span className="ml-auto">
                          {item.inspection_status === 'passed' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 text-[10px]">
                              ✓ {t('inspection.verdictPass', 'QC Passed')}
                            </span>
                          ) : item.inspection_status === 'failed' ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20 text-[10px]">
                              ✕ {t('inspection.verdictReject', 'QC Failed')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20 text-[10px]">
                              ⏳ {t('statuses.inspecting', 'QC Pending')}
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* IMEI / Serial Badge */}
                    {item.sold_serial_number && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-primary font-mono">
                        <Barcode size={13} className="shrink-0" />
                        <span>{t('drawer.serialNumber', 'IMEI/Serial')}: {item.sold_serial_number}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DetailDrawerCard>
          </div>
        )}

        {/* ─── TAB 2: FINANCIAL AUDIT ─── */}
        {activeTab === 'financials' && (
          <div className="space-y-4">
            {/* Net Refund Hero Card */}
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                {t('financials.netRefund', 'Total Net Refund Payable')}
              </span>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {GlobalFormat.currency(totalRefund)}
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                ≈ {GlobalFormat.currency(totalRefundKhr, 'KHR')} (Rate: 1$ = 4,100 KHR)
              </p>
            </div>

            {/* Breakdown Card */}
            <DetailDrawerCard
              title={t('drawer.financialAuditTitle', 'Pro-Rata Financial Audit Breakdown')}
              icon={<DollarSign size={15} />}
            >
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/40 text-muted-foreground">
                  <span>{t('financials.subtotal', 'Original Subtotal')}:</span>
                  <span className="font-mono text-foreground font-bold">
                    {GlobalFormat.currency(orderReturn.subtotal_amount)}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-border/40 text-emerald-600 dark:text-emerald-400">
                  <span>{t('financials.allocatedDiscount', 'Pro-Rata Discount Reversal')}:</span>
                  <span className="font-mono font-semibold">
                    -{GlobalFormat.currency(orderReturn.allocated_discount_amount)}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-border/40 text-muted-foreground">
                  <span>{t('financials.restockingFee', 'Restocking Fee Deducted')}:</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                    -{GlobalFormat.currency(orderReturn.restocking_fee)}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-border/40 text-muted-foreground">
                  <span>{t('financials.returnShippingFee', 'Return Shipping Fee Deducted')}:</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                    -{GlobalFormat.currency(orderReturn.return_shipping_fee)}
                  </span>
                </div>

                {Number(orderReturn.tax_amount) > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-border/40 text-muted-foreground">
                    <span>{t('financials.allocatedTax', 'Tax Adjustment / Reversal')}:</span>
                    <span className="font-mono text-foreground font-semibold">
                      +{GlobalFormat.currency(orderReturn.tax_amount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-2.5 text-sm font-extrabold text-foreground">
                  <span>{t('financials.netRefund', 'Total Net Refund')}:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {GlobalFormat.currency(totalRefund)}
                  </span>
                </div>
              </div>
            </DetailDrawerCard>

            {/* Settlement Method & Status */}
            <DetailDrawerCard
              title={t('refundMethod', 'Refund Method & Settlement')}
              icon={<Sparkles size={15} />}
            >
              <div className="space-y-2">
                <DetailDrawerRow
                  label={t('refundMethod', 'Refund Channel')}
                  value={
                    <span className="capitalize font-semibold text-foreground">
                      {t(`financials.${orderReturn.refund_method}`, orderReturn.refund_method.replace('_', ' '))}
                    </span>
                  }
                />
                <DetailDrawerRow
                  label={t('status', 'Settlement Status')}
                  value={
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
                      {orderReturn.refund_status}
                    </span>
                  }
                />
              </div>
            </DetailDrawerCard>
          </div>
        )}

        {/* ─── TAB 3: QC & LOGISTICS ─── */}
        {activeTab === 'inspection' && (
          <div className="space-y-4">
            {/* Reverse Logistics Card */}
            <DetailDrawerCard
              title={t('drawer.logisticsTitle', 'Reverse Logistics & Tracking')}
              icon={<Truck size={15} />}
            >
              {orderReturn.latestShipment ? (
                <div className="space-y-2">
                  <DetailDrawerRow
                    label={t('drawer.carrier', 'Courier / Carrier')}
                    value={orderReturn.latestShipment.carrier || 'Standard Courier'}
                  />
                  {orderReturn.latestShipment.tracking_number && (
                    <DetailDrawerRow
                      label={t('drawer.trackingNumber', 'Tracking #')}
                      value={orderReturn.latestShipment.tracking_number}
                      copyable
                    />
                  )}
                  <DetailDrawerRow
                    label={t('drawer.pickupType', 'Pickup Mode')}
                    value={<span className="capitalize">{orderReturn.latestShipment.pickup_type?.replace('_', ' ')}</span>}
                  />
                  <DetailDrawerRow
                    label={t('drawer.shippingPaidBy', 'Shipping Paid By')}
                    value={<span className="capitalize font-bold text-foreground">{orderReturn.latestShipment.paid_by}</span>}
                  />
                  <DetailDrawerRow
                    label={t('drawer.deliveryStatus', 'Delivery Status')}
                    value={
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 capitalize">
                        {orderReturn.latestShipment.status}
                      </span>
                    }
                  />
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-muted/20 border border-border/60 text-center text-xs text-muted-foreground">
                  <Truck size={24} className="mx-auto mb-2 opacity-40" />
                  <p>{t('noShipmentsYet', 'No reverse logistics shipment recorded yet.')}</p>
                </div>
              )}
            </DetailDrawerCard>

            {/* QC Inspection Report */}
            <DetailDrawerCard
              title={t('drawer.qcInspectionTitle', 'Warehouse QC Inspection Report')}
              icon={<ShieldCheck size={15} />}
            >
              {orderReturn.latestInspection ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Inspection #</span>
                      <span className="font-mono font-bold text-foreground">{orderReturn.latestInspection.inspection_number}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">{t('drawer.verdict', 'QC Verdict')}</span>
                      <span className="font-bold text-xs uppercase text-primary">
                        {t(`inspection.verdict${orderReturn.latestInspection.verdict === 'pass' ? 'Pass' : 'Reject'}`, orderReturn.latestInspection.verdict)}
                      </span>
                    </div>
                  </div>

                  {orderReturn.latestInspection.summary_notes && (
                    <div className="text-xs bg-muted/30 p-3 rounded-xl border border-border/60">
                      <span className="font-bold text-[11px] text-muted-foreground block mb-1">
                        {t('drawer.summaryNotes', 'Inspector Summary Notes')}
                      </span>
                      <p className="text-foreground">{orderReturn.latestInspection.summary_notes}</p>
                    </div>
                  )}

                  {/* Inspected items checklist */}
                  {orderReturn.latestInspection.items && orderReturn.latestInspection.items.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <span className="text-xs font-bold text-muted-foreground block">
                        {t('drawer.accessoriesCheck', 'Accessories & Condition Verification')}
                      </span>
                      {orderReturn.latestInspection.items.map((insItem) => (
                        <div key={insItem.id} className="p-3 rounded-xl bg-muted/20 border border-border/60 space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-foreground">
                              {getConditionGradeLabel(insItem.condition_grade)}
                            </span>
                            <span className="font-mono text-xs">
                              {insItem.serial_matched ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Serial Matched</span>
                              ) : (
                                <span className="text-rose-600 dark:text-rose-400 font-semibold">✕ Serial Mismatch</span>
                              )}
                            </span>
                          </div>
                          {insItem.inventory_action && (
                            <div className="text-[11px] text-muted-foreground">
                              {t('drawer.inventoryAction', 'Action')}: <span className="font-semibold text-foreground">{t(`inventoryActions.${insItem.inventory_action}`, insItem.inventory_action)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-muted/20 border border-border/60 text-center text-xs text-muted-foreground">
                  <ShieldCheck size={24} className="mx-auto mb-2 opacity-40" />
                  <p>{t('awaitingQC', 'Awaiting warehouse QC physical inspection.')}</p>
                </div>
              )}
            </DetailDrawerCard>

            {/* Exchange Order Details (if exchange) */}
            {orderReturn.type === 'exchange' && orderReturn.exchangeOrder && (
              <DetailDrawerCard
                title={t('drawer.exchangeOrderTitle', 'Exchange Replacement Details')}
                icon={<ArrowRightLeft size={15} />}
              >
                <div className="space-y-2">
                  <DetailDrawerRow
                    label={t('drawer.exchangeCost', 'Replacement Cost')}
                    value={GlobalFormat.currency(orderReturn.exchangeOrder.new_items_cost)}
                  />
                  <DetailDrawerRow
                    label={t('drawer.exchangeDiff', 'Price Difference')}
                    value={GlobalFormat.currency(orderReturn.exchangeOrder.price_difference)}
                  />
                  {Number(orderReturn.exchangeOrder.customer_balance_due) > 0 && (
                    <DetailDrawerRow
                      label={t('drawer.balanceDue', 'Customer Balance Due')}
                      value={GlobalFormat.currency(orderReturn.exchangeOrder.customer_balance_due)}
                    />
                  )}
                </div>
              </DetailDrawerCard>
            )}
          </div>
        )}
      </DetailDrawerBody>

      {/* ── 4. DRAWER FOOTER (ACTIONS) ── */}
      <DetailDrawerFooter
        onClose={onClose}
        closeLabel={t('common.close', 'Close')}
        rightActions={
          <div className="flex items-center gap-2">
            {/* Step 1: Requested -> Approve / Reject */}
            {orderReturn.status === 'requested' && (
              <>
                {onReject && (
                  <ActionButton
                    variant="danger"
                    size="sm"
                    icon={<XCircle size={14} />}
                    onClick={() => onReject(orderReturn.id)}
                    disabled={isActionLoading}
                  >
                    {t('reject', 'Reject Request')}
                  </ActionButton>
                )}
                {onApprove && (
                  <ActionButton
                    variant="primary"
                    size="sm"
                    icon={<CheckCircle2 size={14} />}
                    onClick={() => onApprove(orderReturn.id)}
                    disabled={isActionLoading}
                  >
                    {t('approve', 'Approve Request')}
                  </ActionButton>
                )}
              </>
            )}

            {/* Step 2: Approved / In-Transit -> Receive at WH */}
            {['approved', 'in_transit'].includes(orderReturn.status) && onReceive && (
              <ActionButton
                variant="primary"
                size="sm"
                icon={<Package size={14} />}
                onClick={() => onReceive(orderReturn.id)}
                disabled={isActionLoading}
              >
                {t('receiveAtWarehouse', 'Receive at Warehouse')}
              </ActionButton>
            )}

            {/* Step 3: Received / Inspecting -> QC Inspection */}
            {['received', 'inspecting'].includes(orderReturn.status) && onQC && (
              <ActionButton
                variant="primary"
                size="sm"
                icon={<ShieldCheck size={14} />}
                onClick={() => onQC(orderReturn)}
                disabled={isActionLoading}
              >
                {t('qcInspection', 'QC Inspection')}
              </ActionButton>
            )}

            {/* Step 4: Inspected -> Settle Refund / Exchange */}
            {orderReturn.status === 'inspected' && orderReturn.refund_status === 'pending' && (
              <>
                {onExchange && (
                  <ActionButton
                    variant="outline"
                    size="sm"
                    icon={<ArrowRightLeft size={14} />}
                    onClick={() => onExchange(orderReturn)}
                    disabled={isActionLoading}
                  >
                    {t('processExchange', 'Process Exchange')}
                  </ActionButton>
                )}
                {onRefund && (
                  <ActionButton
                    variant="primary"
                    size="sm"
                    icon={<DollarSign size={14} />}
                    onClick={() => onRefund(orderReturn)}
                    disabled={isActionLoading}
                  >
                    {t('settleRefund', 'Settle Refund')}
                  </ActionButton>
                )}
              </>
            )}
          </div>
        }
      />
    </DetailDrawer>
  )
}

export default OrderReturnDetailDrawer
