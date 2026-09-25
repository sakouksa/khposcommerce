import React from 'react'
import { useTranslation } from 'react-i18next'
import { Printer, ShieldCheck } from 'lucide-react'
import {
  GlobalPrintContainer,
  GlobalPrintHeader,
  GlobalPrintFooter,
} from '@/components/shared/GlobalPrint'
import type { OrderReturn } from '@/types/orderReturn.types'
import { GlobalFormat } from '@/utils/formatters'
import { useAuthStore } from '@/stores/authStore'

const KHR_RATE = 4100

interface OrderReturnPrintModalProps {
  orderReturn: OrderReturn | null
  isOpen: boolean
  onClose: () => void
}

export const OrderReturnPrintModal: React.FC<OrderReturnPrintModalProps> = ({
  orderReturn,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation(['returns', 'orders', 'sales', 'common'])
  const { user: authUser } = useAuthStore()

  if (!isOpen || !orderReturn) return null

  const items = orderReturn.items || []
  const totalRefund = Number(orderReturn.total_refund_amount || 0)
  const totalRefundKhr = Math.round(totalRefund * KHR_RATE)

  const originalSubtotal = Number(
    orderReturn.subtotal_amount ||
      items.reduce(
        (sum, item) => sum + Number(item.unit_price || 0) * Number(item.quantity_requested || 0),
        0
      ) ||
      totalRefund
  )
  const restockingFee = Number(orderReturn.restocking_fee || 0)
  const shippingFee = Number(orderReturn.return_shipping_fee || 0)
  const taxAmount = Number(orderReturn.tax_amount || 0)

  const customerName = orderReturn.customer?.name || t('returns.detail.walkInCustomer', 'Walk-in Customer')
  const customerPhone = orderReturn.customer?.phone || '—'
  const customerEmail = orderReturn.customer?.email || '—'

  const originDoc =
    orderReturn.order?.order_number ||
    orderReturn.sale?.invoice_number ||
    (orderReturn.order_id ? `ORD-${orderReturn.order_id}` : null) ||
    '—'

  const returnTypeLabel =
    orderReturn.type === 'exchange'
      ? t('returns.detail.exchangeType', 'Exchange Item')
      : t('returns.detail.returnType', 'Return & Refund')

  const faultLabel =
    orderReturn.fault === 'store'
      ? t('returns.detail.storeFault', 'Store Fault')
      : orderReturn.fault === 'courier'
      ? t('returns.detail.courierFault', 'Courier Fault')
      : t('returns.detail.customerFault', 'Customer Fault')

  const getConditionGradeText = (grade?: string | null) => {
    if (!grade) return null
    return t(`returns.conditionGrades.${grade}`, grade.replace('_', ' '))
  }

  const inspectorName =
    orderReturn.latestInspection?.inspector?.name ||
    (orderReturn as any)?.inspector?.name ||
    authUser?.name ||
    t('returns.detail.inspectorRole', 'QC Inspector')

  const approverName = orderReturn.approvedBy?.name || t('returns.detail.managerRole', 'Store Manager')

  return (
    <GlobalPrintContainer
      isOpen={isOpen}
      onClose={onClose}
      modalTitle={t('returns.detail.printSlipTitle', 'Print RMA Return Slip')}
      documentSubtitle={`${orderReturn.return_number} • ${customerName}`}
      layout="modal"
      width="max-w-4xl"
      icon={<Printer size={18} />}
      printButtonText={t('returns.detail.printSlipButton', 'Print Slip')}
      closeButtonText={t('returns.detail.cancel', 'Cancel')}
      actionsPosition="both"
    >
      {/* ── 1. GLOBAL STANDARD DYNAMIC HEADER ──────────────────────────────── */}
      <GlobalPrintHeader
        title={t('returns.detail.enterpriseSlipTitle', 'NexTech Cambodia POS')}
        subtitleEnglish={t('returns.detail.enterpriseSlipSubtitle', 'Enterprise RMA & Reverse Logistics Slip')}
        documentTypeLabel={orderReturn.type === 'exchange' ? 'EXCHANGE' : 'RETURN'}
        referenceNumber={orderReturn.return_number}
        referenceLabel={t('returns.detail.rmaNumber', 'RMA #')}
        date={orderReturn.created_at || new Date()}
        dateLabel={t('returns.detail.dateLabel', 'Date')}
        status={orderReturn.status}
        branchName={orderReturn.warehouse?.name || authUser?.branch?.name}
        extraMeta={[
          {
            label: t('returns.detail.channel', 'Channel'),
            value: String(orderReturn.channel || 'WEB').toUpperCase(),
          },
          {
            label: t('returns.detail.faultAllocationLabel', 'Fault Allocation'),
            value: faultLabel,
          },
          {
            label: t('returns.detail.originDoc', 'Origin Doc'),
            value: originDoc,
          },
        ]}
      />

      {/* ── 2. CONTEXT CARDS: CUSTOMER & RMA REASON ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
        {/* Customer Information Card */}
        <div className="p-3.5 rounded-xl border border-slate-300 bg-white text-xs space-y-1.5 shadow-none">
          <h4 className="font-bold text-slate-900 uppercase text-[10.5px] tracking-wider border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <span>{t('returns.detail.customerDetailsTitle', 'Customer Information')}</span>
            <span className="font-mono text-slate-500 text-[10px]">
              {orderReturn.customer?.id ? `CUST-#${orderReturn.customer.id}` : t('returns.detail.walkIn', 'WALK-IN')}
            </span>
          </h4>
          <div className="space-y-1 pt-0.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-500 font-medium">{t('returns.detail.customerName', 'Full Name')}:</span>
              <span className="font-bold text-slate-900">{customerName}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-500 font-medium">{t('returns.detail.phone', 'Phone Number')}:</span>
              <span className="font-mono font-semibold text-slate-800">{customerPhone}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-500 font-medium">{t('returns.detail.email', 'Email')}:</span>
              <span className="font-mono text-slate-700 truncate max-w-[200px]">{customerEmail}</span>
            </div>
          </div>
        </div>

        {/* RMA Reference & Reason Card */}
        <div className="p-3.5 rounded-xl border border-slate-300 bg-white text-xs space-y-1.5 shadow-none">
          <h4 className="font-bold text-slate-900 uppercase text-[10.5px] tracking-wider border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <span>{t('returns.detail.orderRefTitle', 'Reference & Authorization')}</span>
            <span className="font-mono font-bold text-slate-900 text-[10px] uppercase bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {orderReturn.type === 'exchange' ? t('returns.detail.exchangeType', 'Exchange') : t('returns.detail.returnType', 'Return')}
            </span>
          </h4>
          <div className="space-y-1 pt-0.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-500 font-medium">{t('returns.detail.orderInvoiceLabel', 'Order / POS Invoice')}:</span>
              <span className="font-mono font-bold text-slate-900">{originDoc}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-500 font-medium">{t('returns.detail.requestType', 'Request Type')}:</span>
              <span className="font-semibold text-slate-800">{returnTypeLabel}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-500 font-medium">{t('returns.detail.returnReason', 'Return Reason')}:</span>
              <span className="font-medium text-slate-800 truncate max-w-[200px]" title={orderReturn.reason_notes || orderReturn.reason_code}>
                {orderReturn.reason_notes || orderReturn.reason_code || t('returns.detail.defaultReason', 'Customer Request')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. ITEMS IN RETURN TABLE ───────────────────────────────────────── */}
      <div className="space-y-1.5 pt-1">
        <h4 className="font-bold text-slate-900 uppercase text-[10.5px] tracking-wider flex items-center justify-between">
          <span>{t('returns.detail.itemsInReturn', 'Items In Return')}</span>
          <span className="text-[10px] font-mono text-slate-500 font-normal">
            ({t('returns.detail.itemCount', { count: items.length })})
          </span>
        </h4>

        <div className="rounded-xl border border-slate-300 overflow-hidden shadow-none">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-300">#</th>
                <th className="py-2.5 px-4 text-left border-r border-slate-300">
                  {t('returns.detail.itemDescriptionSerial', 'Item Description & Serial')}
                </th>
                <th className="py-2.5 px-3 text-center w-16 border-r border-slate-300">
                  {t('returns.detail.qty', 'Qty')}
                </th>
                <th className="py-2.5 px-4 text-right w-28 border-r border-slate-300">
                  {t('returns.detail.unitPrice', 'Unit Price')}
                </th>
                <th className="py-2.5 px-4 text-right w-32">
                  {t('returns.detail.netRefund', 'Net Refund')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, idx) => {
                const gradeLabel = getConditionGradeText(item.condition_grade)
                return (
                  <tr key={item.id || idx} className="bg-white hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200">
                      <div className="font-bold text-slate-950 text-xs">
                        {item.product?.name || item.product_name || `Item #${item.id}`}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] flex-wrap">
                        {item.product?.sku && (
                          <span className="font-mono text-slate-500">
                            {t('returns.detail.sku', 'SKU')}: {item.product.sku}
                          </span>
                        )}
                        {item.sold_serial_number && (
                          <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            {t('returns.detail.serialNumber', 'SN')}: {item.sold_serial_number}
                          </span>
                        )}
                        {gradeLabel && (
                          <span className="text-slate-600 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200">
                            {gradeLabel}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-800 border-r border-slate-200">
                      {GlobalFormat.number(item.quantity_requested)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700 border-r border-slate-200">
                      {GlobalFormat.currency(item.unit_price)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-950">
                      {GlobalFormat.currency(item.total_refund)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              {/* Original Subtotal */}
              <tr className="bg-slate-50/80 font-bold border-t border-slate-200 text-xs">
                <td colSpan={4} className="py-2 px-4 text-right uppercase text-slate-600 border-r border-slate-200">
                  {t('returns.detail.originalSubtotal', 'Original Items Subtotal')}:
                </td>
                <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">
                  {GlobalFormat.currency(originalSubtotal)}
                </td>
              </tr>

              {/* Deductions if any */}
              {restockingFee > 0 && (
                <tr className="bg-white text-xs border-t border-slate-200">
                  <td colSpan={4} className="py-1.5 px-4 text-right text-rose-600 font-medium border-r border-slate-200">
                    - {t('returns.detail.restockingFee', 'Restocking Fee')}:
                  </td>
                  <td className="py-1.5 px-4 text-right font-mono text-rose-600 font-semibold">
                    - {GlobalFormat.currency(restockingFee)}
                  </td>
                </tr>
              )}

              {shippingFee > 0 && (
                <tr className="bg-white text-xs border-t border-slate-200">
                  <td colSpan={4} className="py-1.5 px-4 text-right text-rose-600 font-medium border-r border-slate-200">
                    - {t('returns.detail.returnShippingFee', 'Return Shipping Fee')}:
                  </td>
                  <td className="py-1.5 px-4 text-right font-mono text-rose-600 font-semibold">
                    - {GlobalFormat.currency(shippingFee)}
                  </td>
                </tr>
              )}

              {taxAmount !== 0 && (
                <tr className="bg-white text-xs border-t border-slate-200">
                  <td colSpan={4} className="py-1.5 px-4 text-right text-slate-600 font-medium border-r border-slate-200">
                    {t('returns.detail.taxAdjustment', 'Tax Adjustment (VAT)')}:
                  </td>
                  <td className="py-1.5 px-4 text-right font-mono text-slate-800 font-semibold">
                    {GlobalFormat.currency(taxAmount)}
                  </td>
                </tr>
              )}

              {/* Total Net Refund Authorized */}
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <td colSpan={4} className="py-2.5 px-4 text-right uppercase text-slate-900 text-xs border-r border-slate-300">
                  {t('returns.detail.authorizedRefundTotal', 'Total Net Refund Authorized')}:
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-base font-black text-slate-950">
                  {GlobalFormat.currency(totalRefund)}
                </td>
              </tr>
              <tr className="bg-white font-bold border-t border-slate-200/80">
                <td colSpan={4} className="py-1.5 px-4 text-right uppercase text-slate-500 text-[10px] border-r border-slate-200">
                  {t('returns.detail.equivalentKhr', 'Equivalent KHR (@ 4,100):')}
                </td>
                <td className="py-1.5 px-4 text-right font-mono text-xs font-bold text-slate-700">
                  ៛ {totalRefundKhr.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── 4. QC INSPECTION / AUDIT NOTICE BOX ─────────────────────────────── */}
      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-700 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
          <ShieldCheck size={13} className="text-primary shrink-0" />
          <span>{t('returns.detail.qcInspectionNoticeTitle', 'Warehouse Quality Inspection & Reverse Logistics Policy')}</span>
        </div>
        <p className="text-[10px] text-slate-600 leading-relaxed pl-4.5">
          {t(
            'returns.detail.qcInspectionNoticeText',
            'This Return Merchandise Authorization (RMA) voucher authorizes warehouse item receiving, technical quality inspection, and authorized financial refund disbursement in accordance with corporate return policies.'
          )}
        </p>
      </div>

      {/* ── 5. GLOBAL STANDARD TRIPLE SIGNATURES FOOTER ─────────────────────── */}
      <GlobalPrintFooter
        signatures={[
          {
            titleLocalized: t('returns.detail.customerSignature', 'Customer Signature'),
            name: customerName,
            role: t('returns.detail.customerRole', 'Customer / Returnee'),
          },
          {
            titleLocalized: t('returns.detail.inspectorSignature', 'Warehouse Inspector Signature'),
            name: inspectorName,
            role: t('returns.detail.inspectorRole', 'Quality Control Inspector'),
          },
          {
            titleLocalized: t('returns.detail.authorizedBy', 'Authorized Manager'),
            name: approverName,
            role: t('returns.detail.managerRole', 'Store Operations Manager'),
          },
        ]}
        noticeText={t(
          'returns.detail.printNotice',
          'Official reverse logistics document for NexTech Cambodia POS inventory and accounting records.'
        )}
        customWatermark={t(
          'returns.detail.printWatermark',
          'Enterprise POS System • Official RMA Voucher & Return Merchandise Document'
        )}
      />
    </GlobalPrintContainer>
  )
}

export default OrderReturnPrintModal
