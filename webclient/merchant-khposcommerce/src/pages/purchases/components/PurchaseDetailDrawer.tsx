import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  ShoppingCart, Copy, Check, FileText, Ban, PackageCheck,
  Building2, Mail, Phone, MapPin, Package, CreditCard, RotateCcw,
  Printer, CheckCircle, DollarSign, Warehouse as WarehouseIcon, ExternalLink
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
import { STATUS_BADGE, PAYMENT_BADGE, getDeliveryStatusLabel, getPaymentStatusLabel, type Purchase } from '../types/purchase.types'
import { getDetailDualValues } from '../utils/purchaseCurrency'
import { PurchasePrintVoucher } from './PurchasePrintVoucher'

interface PurchaseDetailDrawerProps {
  isOpen?: boolean
  selectedPurchase: Purchase | null
  onClose: () => void
  onOpenReceive: (po: Purchase) => void
  onOpenPayment: () => void
  onOpenCancel: (po: Purchase) => void
  onDuplicate?: (po: Purchase) => void
}

export const PurchaseDetailDrawer: React.FC<PurchaseDetailDrawerProps> = ({
  isOpen,
  selectedPurchase,
  onClose,
  onOpenReceive,
  onOpenPayment,
  onOpenCancel,
  onDuplicate,
}) => {
  const navigate = useNavigate()
  const { t } = useTranslation(['purchases', 'common'])
  const [copiedRef, setCopiedRef] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  const isVisible = Boolean(selectedPurchase && (isOpen ?? true))

  const copyReference = () => {
    if (!selectedPurchase?.reference_number) return
    navigator.clipboard.writeText(selectedPurchase.reference_number)
    setCopiedRef(true)
    setTimeout(() => setCopiedRef(false), 1500)
  }

  if (!selectedPurchase) return null

  const dualSubtotal = getDetailDualValues(selectedPurchase.subtotal, selectedPurchase)
  const dualDiscount = getDetailDualValues(selectedPurchase.discount_amount, selectedPurchase)
  const dualTax = getDetailDualValues(selectedPurchase.tax_amount, selectedPurchase)
  const dualShipping = getDetailDualValues(selectedPurchase.shipping_cost, selectedPurchase)
  const dualGrandTotal = getDetailDualValues(selectedPurchase.grand_total, selectedPurchase)
  const dualPaid = getDetailDualValues(selectedPurchase.paid_amount, selectedPurchase)
  const dualDue = getDetailDualValues(selectedPurchase.due_amount, selectedPurchase)

  return (
    <DetailDrawer
      isOpen={isVisible}
      onClose={onClose}
      size="2xl"
    >
      {/* ─── 1. GLOBAL STANDARD HEADER ─── */}
      <DetailDrawerHeader
        title={t('purchases.purchaseDetails', 'Purchase Order Details')}
        subtitle={
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <span>
              {t('purchases.date', 'Date')}: <span className="font-mono text-foreground font-semibold">{selectedPurchase.date || '—'}</span>
            </span>
            {selectedPurchase.warehouse?.name && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="truncate">{selectedPurchase.warehouse.name}</span>
              </>
            )}
          </div>
        }
        badge={
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={copyReference}
              className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/15 dark:hover:bg-primary/25 px-2 py-0.5 rounded-lg border border-primary/20 transition-all cursor-pointer shadow-2xs"
              title={t('purchases.copyReference', 'Copy PO Reference')}
            >
              <span>#{selectedPurchase.reference_number}</span>
              {copiedRef ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
            </button>
            <span className={STATUS_BADGE[selectedPurchase.status] ?? 'px-2 py-0.5 rounded-lg text-[10px] font-bold bg-muted'}>
              {getDeliveryStatusLabel(selectedPurchase.status, t)}
            </span>
            <span className={PAYMENT_BADGE[selectedPurchase.payment_status] ?? 'px-2 py-0.5 rounded-lg text-[10px] font-bold bg-muted'}>
              {getPaymentStatusLabel(selectedPurchase.payment_status, t)}
            </span>
            <button
              type="button"
              onClick={() => {
                onClose()
                navigate(`/purchases/${selectedPurchase.id}`)
              }}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/15 dark:hover:bg-primary/25 px-2 py-0.5 rounded-lg border border-primary/20 transition-all cursor-pointer shadow-2xs"
              title={t('purchases.openFullDetail', 'Open Full Page')}
            >
              <span>{t('purchases.openFullDetail', 'Open Full Page')}</span>
              <ExternalLink size={11} />
            </button>
          </div>
        }
        onClose={onClose}
      />

      {/* ─── 2. GLOBAL BODY CONTENT ─── */}
      <DetailDrawerBody className="space-y-4">
        {/* Operations & Actions Bar */}
        <div className="bg-muted/40 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-border/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <PackageCheck size={16} className="text-primary" />
            <span>{t('purchases.purchaseActions', 'Purchase Actions')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ActionButton
              size="sm"
              variant="outline"
              icon={<ExternalLink size={13} />}
              label={t('purchases.openFullDetail', 'Open Full Page')}
              onClick={() => {
                onClose()
                navigate(`/purchases/${selectedPurchase.id}`)
              }}
            />
            {selectedPurchase.status !== 'cancelled' && selectedPurchase.status !== 'received' && (
              <ActionButton
                size="sm"
                variant="emerald"
                icon={<CheckCircle size={13} />}
                label={t('purchases.receiveShipment', 'Receive Shipment (GRN)')}
                onClick={() => onOpenReceive(selectedPurchase)}
              />
            )}
            {selectedPurchase.status !== 'cancelled' && selectedPurchase.payment_status !== 'paid' && (
              <ActionButton
                size="sm"
                variant="primary"
                icon={<DollarSign size={13} />}
                label={t('purchases.recordPayment', 'Record Payment')}
                onClick={onOpenPayment}
              />
            )}
            {onDuplicate && (
              <ActionButton
                size="sm"
                variant="outline"
                icon={<Copy size={13} />}
                label={t('purchases.duplicatePO', 'Re-order')}
                onClick={() => {
                  onClose()
                  onDuplicate(selectedPurchase)
                }}
              />
            )}
            {(selectedPurchase.status === 'received' || selectedPurchase.status === 'partial') && (
              <ActionButton
                size="sm"
                variant="warning"
                icon={<RotateCcw size={13} />}
                label={t('purchases.returnToSupplier', 'Return to Supplier')}
                onClick={() => {
                  onClose()
                  navigate(`/purchases/returns/create?purchase_id=${selectedPurchase.id}`)
                }}
              />
            )}
            {selectedPurchase.status !== 'cancelled' && selectedPurchase.status !== 'received' && selectedPurchase.status !== 'partial' && (
              <ActionButton
                size="sm"
                variant="danger"
                icon={<Ban size={13} />}
                label={t('purchases.cancelPO', 'Cancel PO')}
                onClick={() => onOpenCancel(selectedPurchase)}
              />
            )}
          </div>
        </div>

        {/* Supplier & Delivery Destination Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Supplier Info Card */}
          <DetailDrawerCard
            title={t('purchases.supplierInfo', 'Supplier Info')}
          >
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-foreground">{selectedPurchase.supplier?.name || '—'}</h4>
              {selectedPurchase.supplier?.address && (
                <div className="text-xs text-muted-foreground pt-1">
                  <span>{selectedPurchase.supplier.address}</span>
                </div>
              )}
              <div className="pt-1.5 space-y-1 text-xs">
                {selectedPurchase.supplier?.phone && (
                  <DetailDrawerRow
                    label={t('purchases.phone', 'Phone')}
                    value={selectedPurchase.supplier.phone}
                    copyable
                  />
                )}
                {selectedPurchase.supplier?.email && (
                  <DetailDrawerRow
                    label={t('purchases.email', 'Email')}
                    value={selectedPurchase.supplier.email}
                    copyable
                  />
                )}
              </div>
            </div>
          </DetailDrawerCard>

          {/* Delivery Destination Card */}
          <DetailDrawerCard
            title={t('purchases.deliveryDestination', 'Delivery Destination')}
          >
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-foreground">{selectedPurchase.warehouse?.name || '—'}</h4>
              <div className="pt-1.5 space-y-1 text-xs">
                <DetailDrawerRow
                  label={t('purchases.branch', 'Branch')}
                  value={selectedPurchase.branch?.name || 'Main Branch'}
                />
                <DetailDrawerRow
                  label={t('purchases.date', 'PO Date')}
                  value={selectedPurchase.date || '—'}
                />
                {selectedPurchase.due_date && (
                  <DetailDrawerRow
                    label={t('purchases.dueDate', 'Due Date')}
                    value={selectedPurchase.due_date}
                  />
                )}
                {selectedPurchase.creator?.name && (
                  <DetailDrawerRow
                    label={t('purchases.createdBy', 'Created By')}
                    value={selectedPurchase.creator.name}
                  />
                )}
              </div>
            </div>
          </DetailDrawerCard>
        </div>

        {/* Ordered Items Table Card */}
        <DetailDrawerCard
          title={t('purchases.orderedItems', 'Ordered Items')}
          badge={
            <span className="text-[11px] font-mono font-bold text-muted-foreground dark:text-slate-400 bg-muted/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {(selectedPurchase.items ?? []).length} {t('purchases.items', 'items')}
            </span>
          }
        >
          {(!selectedPurchase.items || selectedPurchase.items.length === 0) ? (
            <div className="py-8 text-center bg-muted/20 rounded-xl border border-border/60">
              <Package size={28} className="mx-auto text-muted-foreground/40 mb-1.5" />
              <p className="text-xs text-muted-foreground">{t('purchases.noItems', 'No items found in this purchase order.')}</p>
            </div>
          ) : (
            <div className="border border-border/70 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 dark:bg-slate-800/60 border-b border-border dark:border-slate-800 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">{t('purchases.product', 'Product')}</th>
                    <th className="py-2.5 px-2 text-center">{t('purchases.ordered', 'Ordered')}</th>
                    <th className="py-2.5 px-2 text-center">{t('purchases.received', 'Received')}</th>
                    <th className="py-2.5 px-3 text-right">{t('purchases.unitCost', 'Unit Cost')}</th>
                    <th className="py-2.5 px-3 text-right">{t('purchases.discount', 'Discount')}</th>
                    <th className="py-2.5 px-3 text-right">{t('purchases.total', 'Total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 dark:divide-slate-800">
                  {selectedPurchase.items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-foreground text-xs block leading-snug">
                          {item.product_name ?? item.product?.name ?? `Product #${item.product_id}`}
                        </span>
                        {(item.sku ?? item.product?.sku) && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            SKU: {item.sku ?? item.product?.sku}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-foreground font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {item.quantity_received}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                        ${Number(item.unit_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-500 font-semibold">
                        {Number(item.discount_amount) > 0 ? `-$${Number(item.discount_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                        ${Number(item.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DetailDrawerCard>

        {/* Financial Summary Card Grid */}
        <DetailDrawerCard
          title={t('purchases.financialSummary', 'Financial Overview')}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Subtotal */}
            <div className="p-3 rounded-xl bg-card dark:bg-slate-900/60 border border-border/70 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-1">
                {t('purchases.subtotal', 'Subtotal')}
              </span>
              <span className="font-extrabold font-mono text-foreground text-sm">
                ${Number(dualSubtotal.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Discount */}
            <div className="p-3 rounded-xl bg-card dark:bg-slate-900/60 border border-border/70 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-1">
                {t('purchases.discount', 'Discount')}
              </span>
              <span className="font-extrabold font-mono text-rose-500 text-sm">
                -${Number(dualDiscount.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Tax */}
            <div className="p-3 rounded-xl bg-card dark:bg-slate-900/60 border border-border/70 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-1">
                {t('purchases.tax', 'Tax')}
              </span>
              <span className="font-extrabold font-mono text-foreground text-sm">
                +${Number(dualTax.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Shipping Cost */}
            <div className="p-3 rounded-xl bg-card dark:bg-slate-900/60 border border-border/70 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-1">
                {t('purchases.shippingCost', 'Shipping Cost')}
              </span>
              <span className="font-extrabold font-mono text-foreground text-sm">
                +${Number(dualShipping.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Grand Total Banner */}
            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 col-span-2 sm:col-span-4 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] text-primary block font-bold uppercase tracking-wider mb-0.5">
                  {t('purchases.grandTotal', 'Grand Total')}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {t('purchases.totalPayable', 'Total Payable Amount')}
                </span>
              </div>
              <div className="text-right">
                <span className="font-black font-mono text-primary text-lg block">
                  ${Number(dualGrandTotal.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {dualGrandTotal.khr > 0 && (
                  <span className="text-[11px] font-mono text-muted-foreground block">
                    ៛{Number(dualGrandTotal.khr).toLocaleString('en-US')}
                  </span>
                )}
              </div>
            </div>

            {/* Paid Amount */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 col-span-1 sm:col-span-2 shadow-2xs">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold uppercase tracking-wider mb-1">
                {t('purchases.alreadyPaid', 'Paid Amount')}
              </span>
              <span className="font-extrabold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                ${Number(dualPaid.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Outstanding Due */}
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 col-span-1 sm:col-span-2 shadow-2xs">
              <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-bold uppercase tracking-wider mb-1">
                {t('purchases.outstandingDue', 'Due Amount')}
              </span>
              <span className="font-extrabold font-mono text-rose-600 dark:text-rose-400 text-sm">
                ${Number(dualDue.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </DetailDrawerCard>

        {/* Notes / Terms Card */}
        {selectedPurchase.notes && (
          <DetailDrawerCard
            title={t('purchases.notesTerms', 'Notes / Terms')}
          >
            <p className="text-xs text-muted-foreground leading-relaxed pl-1">{selectedPurchase.notes}</p>
          </DetailDrawerCard>
        )}
      </DetailDrawerBody>

      {/* ─── 3. GLOBAL STICKY FOOTER ─── */}
      <DetailDrawerFooter
        rightActions={
          <>
            <ActionButton
              onClick={() => {
                onClose()
                navigate(`/purchases/${selectedPurchase.id}`)
              }}
              label={t('purchases.openFullDetail', 'Open Full Page')}
              icon={<ExternalLink size={15} />}
              variant="secondary"
            />
            <ActionButton
              onClick={() => setIsPrintModalOpen(true)}
              label={t('purchases.printPurchaseOrder', 'Print Purchase Order')}
              icon={<Printer size={15} />}
              variant="outline"
            />
            {selectedPurchase.status !== 'cancelled' && selectedPurchase.status !== 'received' && (
              <ActionButton
                onClick={() => onOpenReceive(selectedPurchase)}
                label={t('purchases.receiveShipment', 'Receive Shipment')}
                icon={<CheckCircle size={15} />}
                variant="emerald"
              />
            )}
            {selectedPurchase.status !== 'cancelled' && selectedPurchase.payment_status !== 'paid' && (
              <ActionButton
                onClick={onOpenPayment}
                label={t('purchases.recordPayment', 'Record Payment')}
                icon={<DollarSign size={15} />}
                variant="primary"
              />
            )}
          </>
        }
      />

      {/* ─── 4. OFFICIAL A4 / THERMAL PRINTABLE VOUCHER ─── */}
      <PurchasePrintVoucher
        purchase={selectedPurchase}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </DetailDrawer>
  )
}

export default PurchaseDetailDrawer
