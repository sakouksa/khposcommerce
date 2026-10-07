import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RotateCcw, Copy, Check, Building2, Phone,
  FileText, Ban, AlertCircle, Printer,
  Truck, Wallet, Package, CreditCard, ExternalLink,
  CheckCircle
} from 'lucide-react'
import {
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerBody,
  DetailDrawerFooter,
  DetailDrawerCard,
  DetailDrawerRow,
  ActionButton,
} from '@/components/common'
import { RETURN_STATUS_BADGE, REFUND_STATUS_BADGE, type PurchaseReturn } from '../types/purchaseReturn.types'
import { formatCurrency } from '../utils/purchaseCurrency'
import { PurchaseReturnPrintVoucher } from './PurchaseReturnPrintVoucher'

interface PurchaseReturnDetailDrawerProps {
  isOpen?: boolean
  selectedReturn: PurchaseReturn | null
  onClose: () => void
  onOpenApprove: (r: PurchaseReturn) => void
  onOpenCancel: (r: PurchaseReturn) => void
  onOpenShip?: (r: PurchaseReturn) => void
  onOpenSettle?: (r: PurchaseReturn) => void
}

export const PurchaseReturnDetailDrawer: React.FC<PurchaseReturnDetailDrawerProps> = ({
  isOpen,
  selectedReturn,
  onClose,
  onOpenApprove,
  onOpenCancel,
  onOpenShip,
  onOpenSettle,
}) => {
  const { t } = useTranslation(['purchases', 'common'])
  const [copiedRef, setCopiedRef] = useState(false)

  const isVisible = Boolean(selectedReturn && (isOpen ?? true))

  const copyReference = () => {
    if (!selectedReturn?.reference_number) return
    navigator.clipboard.writeText(selectedReturn.reference_number)
    setCopiedRef(true)
    setTimeout(() => setCopiedRef(false), 1500)
  }

  if (!selectedReturn) return null

  const returnAmountUSD = Number(selectedReturn.total_amount || 0)
  const returnAmountKHR = selectedReturn.total_amount_base
    ? Number(selectedReturn.total_amount_base)
    : returnAmountUSD * 4100
  const totalUnits = selectedReturn.items?.reduce((sum, item) => sum + (parseFloat(String(item.quantity)) || 0), 0) || 0

  return (
    <DetailDrawer
      isOpen={isVisible}
      onClose={onClose}
      size="2xl"
    >
      {/* ─── 1. GLOBAL STANDARD HEADER ─── */}
      <DetailDrawerHeader
        title={t('purchases.returnDetails', 'Return Details')}
        subtitle={
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <span>
              {t('common.date', 'Date')}:{' '}
              <span className="font-mono text-foreground font-semibold">
                {selectedReturn.date || (selectedReturn.created_at ? new Date(selectedReturn.created_at).toLocaleDateString() : '—')}
              </span>
            </span>
            {selectedReturn.purchase?.reference_number && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span>
                  {t('purchases.purchaseReference', 'PO')}: <span className="font-mono font-bold text-primary">#{selectedReturn.purchase.reference_number}</span>
                </span>
              </>
            )}
          </div>
        }
        badge={
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={copyReference}
              className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 px-2 py-0.5 rounded-lg border border-amber-500/20 transition-all cursor-pointer shadow-2xs"
              title={t('purchases.copyReference', 'Copy Reference')}
            >
              <span>#{selectedReturn.reference_number}</span>
              {copiedRef ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
            </button>
            <span className={RETURN_STATUS_BADGE[selectedReturn.status] || 'inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-muted'}>
              {selectedReturn.status === 'completed'
                ? t('purchases.completed', 'Completed')
                : selectedReturn.status === 'shipped'
                ? t('purchases.shipped', 'Shipped')
                : selectedReturn.status === 'approved'
                ? t('purchases.approved', 'Approved')
                : selectedReturn.status === 'cancelled'
                ? t('purchases.cancelled', 'Cancelled')
                : t('purchases.draft', 'Draft')}
            </span>
            {selectedReturn.refund_status && (
              <span className={REFUND_STATUS_BADGE[selectedReturn.refund_status] || 'px-2 py-0.5 rounded-lg text-[10px] font-bold bg-muted'}>
                {selectedReturn.refund_status === 'offset'
                  ? t('purchases.statusOffsetAP', 'Offset Against AP')
                  : selectedReturn.refund_status === 'credited'
                  ? t('purchases.statusCredited', 'Supplier Credited')
                  : selectedReturn.refund_status === 'refunded'
                  ? t('purchases.statusRefunded', 'Refund Received')
                  : t('purchases.statusPendingRefund', 'Pending Refund')}
              </span>
            )}
          </div>
        }
        onClose={onClose}
      />

      {/* ─── 2. GLOBAL BODY CONTENT ─── */}
      <DetailDrawerBody className="space-y-4">
        {/* Operations & Actions Bar */}
        <div className="bg-muted/40 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-border/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <RotateCcw size={15} className="text-amber-500" />
            <span>{t('purchases.returnActions', 'Return Actions')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedReturn.status === 'draft' && (
              <ActionButton
                size="sm"
                variant="emerald"
                icon={<CheckCircle size={13} />}
                label={t('purchases.approveAndShipReturn', 'Approve & Offset AP')}
                onClick={() => onOpenApprove(selectedReturn)}
              />
            )}

            {(selectedReturn.status === 'approved' || selectedReturn.status === 'draft') && onOpenShip && (
              <ActionButton
                size="sm"
                variant="primary"
                icon={<Truck size={13} />}
                label={t('purchases.markAsShipped', 'Ship to Supplier')}
                onClick={() => onOpenShip(selectedReturn)}
              />
            )}

            {(selectedReturn.status === 'approved' || selectedReturn.status === 'shipped') && onOpenSettle && (
              <ActionButton
                size="sm"
                variant="secondary"
                icon={<Wallet size={13} />}
                label={t('purchases.settleRefund', 'Settle / Credit Note')}
                onClick={() => onOpenSettle(selectedReturn)}
              />
            )}

            {selectedReturn.status !== 'cancelled' && (
              <ActionButton
                size="sm"
                variant="danger"
                icon={<Ban size={13} />}
                label={t('purchases.cancelReturn', 'Cancel Return')}
                onClick={() => onOpenCancel(selectedReturn)}
              />
            )}
          </div>
        </div>

        {/* Summary Info Cards (Supplier & Original PO) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Supplier Card */}
          <DetailDrawerCard
            title={t('purchases.supplierDetails', 'Supplier Details')}
          >
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-foreground">{selectedReturn.supplier?.name || '—'}</h4>
              <div className="pt-1.5 space-y-1 text-xs">
                {selectedReturn.supplier?.phone && (
                  <DetailDrawerRow
                    label={t('purchases.phone', 'Phone')}
                    value={selectedReturn.supplier.phone}
                    copyable
                  />
                )}
                {selectedReturn.supplier?.email && (
                  <DetailDrawerRow
                    label={t('purchases.email', 'Email')}
                    value={selectedReturn.supplier.email}
                    copyable
                  />
                )}
              </div>
            </div>
          </DetailDrawerCard>

          {/* Original PO Card */}
          <DetailDrawerCard
            title={t('purchases.originalPO', 'Original Purchase Order')}
          >
            <div className="space-y-1.5 text-xs">
              <DetailDrawerRow
                label={t('purchases.purchaseReference', 'PO Ref')}
                value={
                  <span className="font-mono text-primary font-bold">
                    #{selectedReturn.purchase?.reference_number || selectedReturn.purchase_id || '—'}
                  </span>
                }
              />
              <DetailDrawerRow
                label={t('purchases.createdBy', 'Created By')}
                value={selectedReturn.user?.name || 'Super Admin'}
              />
            </div>
          </DetailDrawerCard>
        </div>

        {/* Logistics & RMA Banner (if present) */}
        {(selectedReturn.rma_number || selectedReturn.shipping_carrier || selectedReturn.tracking_number) && (
          <DetailDrawerCard
            title={t('purchases.logisticsAndRMA', 'Logistics & RMA Authorization')}
            className="border-indigo-500/25 bg-indigo-500/5 dark:bg-indigo-950/20"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {selectedReturn.rma_number && (
                <DetailDrawerRow
                  label={t('purchases.rmaNumber', 'Supplier RMA #')}
                  value={<span className="font-mono font-bold">{selectedReturn.rma_number}</span>}
                  copyable
                />
              )}
              {selectedReturn.shipping_carrier && (
                <DetailDrawerRow
                  label={t('purchases.shippingCarrier', 'Carrier')}
                  value={selectedReturn.shipping_carrier}
                />
              )}
              {selectedReturn.tracking_number && (
                <div className="sm:col-span-2">
                  <DetailDrawerRow
                    label={t('purchases.trackingNumber', 'Tracking #')}
                    value={<span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{selectedReturn.tracking_number}</span>}
                    copyable
                  />
                </div>
              )}
            </div>
          </DetailDrawerCard>
        )}

        {/* Financial Settlement & AP Accounting */}
        <DetailDrawerCard
          title={t('purchases.financialSettlement', 'Financial & Accounts Payable Status')}
        >
          <div className="space-y-1 text-xs text-muted-foreground">
            <DetailDrawerRow
              label={t('purchases.settlementMethod', 'Method')}
              value={
                <span className="font-semibold text-foreground">
                  {selectedReturn.refund_method === 'offset_invoice'
                    ? t('purchases.methodOffsetInvoice', 'Auto-offset against PO Due Amount')
                    : selectedReturn.refund_method === 'credit_note'
                    ? t('purchases.methodCreditNote', 'Supplier Credit Note')
                    : selectedReturn.refund_method === 'bank_transfer'
                    ? t('purchases.methodBankTransfer', 'Bank Transfer')
                    : selectedReturn.refund_method === 'cash'
                    ? t('purchases.methodCash', 'Cash Refund')
                    : t('purchases.statusPendingRefund', 'Pending Settlement')}
                </span>
              }
            />
            {selectedReturn.refund_amount ? (
              <DetailDrawerRow
                label={t('purchases.refundAmount', 'Settled Amount')}
                value={
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm block">
                      {formatCurrency(selectedReturn.refund_amount, 'USD')}
                    </span>
                    {selectedReturn.refund_date && (
                      <span className="text-[10px] text-muted-foreground font-mono block">
                        ({selectedReturn.refund_date})
                      </span>
                    )}
                  </div>
                }
              />
            ) : null}
            {selectedReturn.settlement_notes && (
              <div className="pt-2">
                <p className="italic text-[11px] bg-background/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-border/60 dark:border-slate-800 text-foreground">
                  {selectedReturn.settlement_notes}
                </p>
              </div>
            )}
          </div>
        </DetailDrawerCard>

        {/* Returned Items Table */}
        <DetailDrawerCard
          title={t('purchases.returnedItems', 'Returned Items')}
          badge={
            <span className="text-[11px] font-mono font-bold text-muted-foreground dark:text-slate-400 bg-muted/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {selectedReturn.items?.length || 0} {t('purchases.itemsAvailable', 'items')} ({totalUnits} {t('purchases.unitsSelected', 'units')})
            </span>
          }
        >
          <div className="border border-border/70 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 dark:bg-slate-800/60 border-b border-border dark:border-slate-800 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">{t('purchases.product', 'Product')}</th>
                  <th className="py-2.5 px-3 text-center">{t('purchases.returnQty', 'Returned Qty')}</th>
                  <th className="py-2.5 px-3 text-right">{t('purchases.unitCost', 'Cost Price')}</th>
                  <th className="py-2.5 px-3.5 text-right">{t('purchases.total', 'Total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 dark:divide-slate-800">
                {selectedReturn.items?.map((item) => {
                  const unitCostUSD = item.unit_cost || 0
                  const unitCostKHR = unitCostUSD * 4100
                  const lineTotalUSD = item.total || 0
                  const lineTotalKHR = lineTotalUSD * 4100

                  return (
                    <tr key={item.id} className="hover:bg-muted/20 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="space-y-1">
                            <span className="font-bold text-foreground text-xs block leading-snug">
                              {item.product_name || item.variant?.name || (item as any).product?.name || 'Returned Product'}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.sku && (
                                <span className="px-1.5 py-0.2 rounded bg-muted dark:bg-slate-800 text-[10px] text-muted-foreground font-mono font-medium border border-border/40 dark:border-slate-700">
                                  SKU: {item.sku}
                                </span>
                              )}
                              {item.batch_number && (
                                <span className="px-1.5 py-0.2 rounded bg-blue-500/10 dark:bg-blue-950/40 text-[10px] text-blue-600 dark:text-blue-400 font-mono font-medium border border-blue-500/20 dark:border-blue-800/40">
                                  Batch: {item.batch_number}
                                </span>
                              )}
                              {item.serial_number && (
                                <span className="px-1.5 py-0.2 rounded bg-purple-500/10 dark:bg-purple-950/40 text-[10px] text-purple-600 dark:text-purple-400 font-mono font-medium border border-purple-500/20 dark:border-purple-800/40">
                                  SN: {item.serial_number}
                                </span>
                              )}
                            </div>
                            {item.notes && (
                              <p className="text-[10px] text-muted-foreground italic mt-0.5 bg-muted/40 dark:bg-slate-800/50 px-1.5 py-0.5 rounded border border-border/30 dark:border-slate-700/50 max-w-xs">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-500/10 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs border border-rose-500/20 dark:border-rose-800/40">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-mono text-xs font-semibold text-foreground block">
                          {formatCurrency(unitCostUSD, 'USD')}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground block">
                          {formatCurrency(unitCostKHR, 'KHR')}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 block">
                          {formatCurrency(lineTotalUSD, 'USD')}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground block">
                          {formatCurrency(lineTotalKHR, 'KHR')}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </DetailDrawerCard>

        {/* Return Totals */}
        <div className="flex justify-end">
          <div className="w-full sm:w-80 bg-gradient-to-br from-card to-rose-500/5 dark:from-slate-900 dark:to-rose-950/20 p-4 rounded-2xl border border-rose-500/20 dark:border-rose-500/30 space-y-1.5 shadow-2xs">
            <div className="flex justify-between items-center text-xs font-bold text-foreground">
              <span>{t('purchases.totalReturnedValue', 'Total Returned Value')}</span>
              <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                {formatCurrency(returnAmountUSD, 'USD')}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground font-mono pt-1 border-t border-border/50 dark:border-slate-800/60">
              <span>{totalUnits} {t('purchases.unitsSelected', 'units')}</span>
              <span>{formatCurrency(returnAmountKHR, 'KHR')}</span>
            </div>
          </div>
        </div>

        {/* Reason & Defect Proof */}
        {selectedReturn.reason && (
          <DetailDrawerCard
            title={t('purchases.reasonForReturn', 'Reason for Return')}
          >
            <p className="text-xs text-foreground/85 dark:text-slate-300 leading-relaxed pl-1">{selectedReturn.reason}</p>
          </DetailDrawerCard>
        )}

        {selectedReturn.attachment_url && (
          <DetailDrawerCard
            title={t('purchases.attachmentProof', 'Defect Proof / Photo Attachment')}
          >
            <div className="pl-1">
              <a
                href={selectedReturn.attachment_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-mono bg-muted/50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-border/80 dark:border-slate-700 shadow-2xs"
              >
                <ExternalLink size={13} />
                <span className="truncate max-w-sm">{selectedReturn.attachment_url}</span>
              </a>
            </div>
          </DetailDrawerCard>
        )}
      </DetailDrawerBody>

      {/* ─── 3. GLOBAL STICKY FOOTER ─── */}
      <DetailDrawerFooter
        rightActions={
          <>
            <ActionButton
              onClick={() => window.print()}
              label={t('purchases.printDebitNote', 'Print Debit Note')}
              icon={<Printer size={15} />}
              variant="outline"
            />
            {selectedReturn.status === 'draft' && (
              <ActionButton
                onClick={() => onOpenApprove(selectedReturn)}
                label={t('purchases.approveAndShipReturn', 'Approve & Offset AP')}
                icon={<CheckCircle size={15} />}
                variant="emerald"
              />
            )}
            {(selectedReturn.status === 'approved' || selectedReturn.status === 'draft') && onOpenShip && (
              <ActionButton
                onClick={() => onOpenShip(selectedReturn)}
                label={t('purchases.markAsShipped', 'Ship to Supplier')}
                icon={<Truck size={15} />}
                variant="primary"
              />
            )}
          </>
        }
      />

      {/* ─── 4. OFFICIAL A4 / THERMAL PRINTABLE VOUCHER (PRINT ONLY) ─── */}
      <PurchaseReturnPrintVoucher returnData={selectedReturn} />
    </DetailDrawer>
  )
}

export default PurchaseReturnDetailDrawer
