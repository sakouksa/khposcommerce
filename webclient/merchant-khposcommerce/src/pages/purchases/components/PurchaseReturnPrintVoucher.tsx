import React from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, Phone, Mail, MapPin, AlertTriangle, FileText, Warehouse, User, Truck, CreditCard } from 'lucide-react'
import { formatCurrency } from '../utils/purchaseCurrency'
import type { PurchaseReturn } from '../types/purchaseReturn.types'
import { GlobalPrintHeader, GlobalPrintFooter } from '@/components/shared/GlobalPrint'

interface PurchaseReturnPrintVoucherProps {
  returnData: PurchaseReturn | null
}

export const PurchaseReturnPrintVoucher: React.FC<PurchaseReturnPrintVoucherProps> = ({ returnData }) => {
  const { t } = useTranslation(['purchases', 'common'])

  if (!returnData) return null

  const items = returnData.items ?? []
  const totalItemsCount = items.length
  const totalUnits = items.reduce((sum, item) => sum + (parseFloat(String(item.quantity)) || 0), 0)
  const totalAmountUSD = Number(returnData.total_amount || 0)
  const totalAmountKHR = returnData.total_amount_base
    ? Number(returnData.total_amount_base)
    : totalAmountUSD * 4100

  const isCompleted = returnData.status === 'completed'
  const isShipped = returnData.status === 'shipped'
  const isApproved = returnData.status === 'approved'
  const isCancelled = returnData.status === 'cancelled'
  const statusLabel = isCompleted
    ? t('purchases.statusCompleted', 'COMPLETED / SETTLED')
    : isShipped
    ? t('purchases.statusShipped', 'SHIPPED IN-TRANSIT')
    : isApproved
    ? t('purchases.statusApproved', 'APPROVED & DEBITED')
    : isCancelled
    ? t('purchases.statusCancelled', 'CANCELLED')
    : t('purchases.statusDraft', 'DRAFT')

  return (
    <div className="hidden print:block print:w-full print:bg-white print:text-black font-sans text-xs p-2 leading-normal select-none print:m-0 [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
      
      {/* ─── Global Enterprise Header ─────────────────────────────────────── */}
      <GlobalPrintHeader
        title={t('purchases.purchaseReturnDebitNoteTitle', 'PURCHASE RETURN / DEBIT NOTE')}
        documentTypeLabel={t('purchases.officialDebitNote', 'Official Debit Note')}
        referenceNumber={`#${returnData.reference_number}`}
        referenceLabel={t('purchases.returnReference', 'Return Reference #')}
        date={returnData.date || returnData.created_at}
        dateLabel={t('purchases.returnDate', 'Return Date')}
        status={statusLabel}
      />

      {/* ─── Metadata 2-Column Section ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 my-2.5">
        {/* Returned To (Supplier) */}
        <div className="border border-slate-300 rounded-lg p-2.5 space-y-1 bg-slate-50/40">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <p className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Building2 size={11} className="text-slate-500 shrink-0" />
              <span>{t('purchases.supplierDetails', 'Vendor / Supplier Information')}</span>
            </p>
            <span className="text-[8.5px] px-1 py-0.2 rounded bg-slate-200/80 text-slate-700 font-semibold">
              {t('purchases.vendorTag', 'Vendor')}
            </span>
          </div>
          <p className="font-bold text-xs text-slate-900 pt-0.5">{returnData.supplier?.name || '—'}</p>
          <div className="text-[10px] text-slate-600 space-y-0.5">
            {returnData.supplier?.phone && (
              <p className="flex items-center gap-1.5">
                <Phone size={9} className="text-slate-400 shrink-0" />
                <span>{returnData.supplier.phone}</span>
              </p>
            )}
            {returnData.supplier?.email && (
              <p className="flex items-center gap-1.5">
                <Mail size={9} className="text-slate-400 shrink-0" />
                <span>{returnData.supplier.email}</span>
              </p>
            )}
            {returnData.supplier?.address && (
              <p className="flex items-center gap-1.5">
                <MapPin size={9} className="text-slate-400 shrink-0" />
                <span>{returnData.supplier.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* Origin & Metadata */}
        <div className="border border-slate-300 rounded-lg p-2.5 space-y-1 bg-slate-50/40">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <p className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <FileText size={11} className="text-slate-500 shrink-0" />
              <span>{t('purchases.originalPO', 'Debit Note & Origin Details')}</span>
            </p>
            <span className="text-[8.5px] px-1 py-0.2 rounded bg-slate-200/80 text-slate-700 font-semibold">
              {t('purchases.originTag', 'Origin')}
            </span>
          </div>
          <div className="space-y-0.5 text-[10px] text-slate-600 pt-0.5">
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('purchases.purchaseReference', 'Original PO Ref')}:</span>
              <span className="font-mono font-semibold text-slate-900">
                #{returnData.purchase?.reference_number || returnData.purchase_id || '—'}
              </span>
            </p>
            {returnData.rma_number && (
              <p className="flex items-center justify-between">
                <span className="font-medium text-slate-700">{t('purchases.rmaNumber', 'Supplier RMA #')}:</span>
                <span className="font-mono font-bold text-indigo-700">{returnData.rma_number}</span>
              </p>
            )}
            {(returnData.shipping_carrier || returnData.tracking_number) && (
              <p className="flex items-center justify-between">
                <span className="font-medium text-slate-700">{t('purchases.trackingNumber', 'Carrier / Tracking')}:</span>
                <span className="font-mono text-slate-900">
                  {returnData.shipping_carrier ? `${returnData.shipping_carrier}: ` : ''}{returnData.tracking_number || '—'}
                </span>
              </p>
            )}
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700 flex items-center gap-1">
                <User size={10} className="text-slate-500 shrink-0" />
                <span>{t('purchases.createdBy', 'Issued By')}:</span>
              </span>
              <span className="font-semibold text-slate-900">{returnData.user?.name || 'Super Admin'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ─── Returned Items Table ────────────────────────────────────────── */}
      <div className="my-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-300">
          <h3 className="font-bold text-[10.5px] uppercase tracking-wider text-slate-800">
            {t('purchases.returnedItems', 'Returned Items Breakdown')}
          </h3>
          <span className="text-[10px] font-mono text-slate-600">
            {totalItemsCount} {t('purchases.itemsAvailable', 'items')} ({totalUnits} {t('purchases.unitsSelected', 'units')})
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse mt-1 border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-800 text-[9.5px] font-bold uppercase tracking-wider border-b border-slate-300">
              <th className="py-1.5 px-2 text-center w-7 border-r border-slate-200">#</th>
              <th className="py-1.5 px-2.5 border-r border-slate-200">{t('purchases.product', 'Product Description, Batch & SKU')}</th>
              <th className="py-1.5 px-2 text-center w-20 border-r border-slate-200">{t('purchases.returnQty', 'Return Qty')}</th>
              <th className="py-1.5 px-2.5 text-right w-24 border-r border-slate-200">{t('purchases.unitCost', 'Unit Cost')}</th>
              <th className="py-1.5 px-2.5 text-right w-28">{t('purchases.total', 'Total Amount')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, idx) => {
              const unitCostUSD = item.unit_cost || 0
              const unitCostKHR = unitCostUSD * 4100
              const lineTotalUSD = item.total || 0
              const lineTotalKHR = lineTotalUSD * 4100

              return (
                <tr key={item.id || idx} className="even:bg-slate-50/50">
                  <td className="py-1.5 px-2 text-center text-slate-500 font-mono text-[9.5px] border-r border-slate-200">{idx + 1}</td>
                  <td className="py-1.5 px-2.5 border-r border-slate-200">
                    <span className="font-bold text-slate-900 block text-[11px]">
                      {item.product_name || item.variant?.name || (item as any).product?.name || 'Returned Product'}
                    </span>
                    <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                      {item.sku && <span>SKU: {item.sku}</span>}
                      {item.batch_number && <span>Batch: {item.batch_number}</span>}
                      {item.serial_number && <span>SN: {item.serial_number}</span>}
                    </div>
                    {item.notes && (
                      <p className="text-[9px] text-slate-500 italic">{t('purchases.itemNote', 'Note')}: {item.notes}</p>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono font-semibold text-slate-900 border-r border-slate-200 text-[11px]">
                    {item.quantity}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono text-[10.5px] text-slate-800 border-r border-slate-200">
                    <div className="font-medium">{formatCurrency(unitCostUSD, 'USD')}</div>
                    <div className="text-[8.5px] text-slate-500">{formatCurrency(unitCostKHR, 'KHR')}</div>
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono text-[11px] font-bold text-slate-950">
                    <div>{formatCurrency(lineTotalUSD, 'USD')}</div>
                    <div className="text-[8.5px] text-slate-500 font-normal">{formatCurrency(lineTotalKHR, 'KHR')}</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ─── Totals & Reason Block ───────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-3 my-2.5 pt-1">
        {/* Left: Reason & Settlement Note */}
        <div className="col-span-7 space-y-2">
          {returnData.reason && (
            <div className="border border-slate-300 rounded-lg p-2 bg-slate-50/40 space-y-0.5">
              <p className="font-bold text-[9px] uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <AlertTriangle size={10} className="text-slate-500 shrink-0" />
                <span>{t('purchases.reasonForReturn', 'Reason for Return')}:</span>
              </p>
              <p className="text-[10px] text-slate-700 leading-relaxed font-normal pl-3.5">{returnData.reason}</p>
            </div>
          )}

          {returnData.settlement_notes && (
            <div className="border border-slate-300 rounded-lg p-2 bg-slate-50/40 space-y-0.5">
              <p className="font-bold text-[9px] uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <CreditCard size={10} className="text-slate-500 shrink-0" />
                <span>{t('purchases.financialSettlement', 'Settlement Notice')}:</span>
              </p>
              <p className="text-[10px] text-slate-700 leading-relaxed font-normal pl-3.5">{returnData.settlement_notes}</p>
            </div>
          )}
        </div>

        {/* Right: Grand Financial Totals Card */}
        <div className="col-span-5 border border-slate-300 bg-slate-50/40 text-slate-900 rounded-lg p-2.5 space-y-1">
          <div className="flex justify-between items-center text-[10.5px] text-slate-600">
            <span>{t('purchases.totalUnitsReturned', 'Total Units Returned')}:</span>
            <span className="font-mono font-semibold text-slate-900">{totalUnits}</span>
          </div>
          <div className="flex justify-between items-center text-[10.5px] text-slate-600">
            <span>{t('purchases.totalLineItems', 'Total Line Items')}:</span>
            <span className="font-mono font-semibold text-slate-900">{totalItemsCount}</span>
          </div>
          <div className="pt-1.5 border-t border-slate-300 flex justify-between items-center">
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-900 tracking-wider block">
                {t('purchases.totalReturnedValue', 'Total Debit Note')}:
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-slate-950">
                {formatCurrency(totalAmountUSD, 'USD')}
              </div>
              <div className="text-[9px] font-mono text-slate-600">
                {formatCurrency(totalAmountKHR, 'KHR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Global Enterprise Footer & 3-Party Signatures ───────────────── */}
      <GlobalPrintFooter
        noticeText={`* ${t('purchases.impactDebitNote', 'This debit note confirms the return of the above listed goods. The total amount shall be credited against outstanding supplier payables or refunded by the vendor.')}`}
        signatures={[
          {
            titleLocalized: t('purchases.preparedBy', 'Prepared By'),
            name: returnData.user?.name || 'Super Admin',
          },
          {
            titleLocalized: t('purchases.warehouseOfficer', 'Warehouse Officer'),
            name: t('purchases.authorizedManager', 'Inventory Controller'),
          },
          {
            titleLocalized: t('purchases.vendorReceiver', 'Vendor Receiver'),
            name: returnData.supplier?.name || t('purchases.authorizedRepresentative', 'Supplier Agent'),
          },
        ]}
      />

    </div>
  )
}
