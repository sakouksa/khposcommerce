import React from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, Phone, Mail, MapPin, FileText, Warehouse } from 'lucide-react'
import { formatCurrency, getDetailDualValues } from '../utils/purchaseCurrency'
import { getDeliveryStatusLabel, getPaymentStatusLabel, type Purchase } from '../types/purchase.types'
import {
  GlobalPrintContainer,
  GlobalPrintHeader,
  GlobalPrintFooter,
} from '@/components/shared/GlobalPrint'
import { ProductThumbnail } from '@/components/common'

export interface PurchasePrintVoucherProps {
  purchase: Purchase | null
  isOpen?: boolean
  onClose?: () => void
}

export const PurchasePrintVoucher: React.FC<PurchasePrintVoucherProps> = ({
  purchase,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation(['purchases', 'common'])

  if (!purchase) return null

  const items = purchase.items ?? []
  const totalItemsCount = items.length
  const totalOrderedUnits = items.reduce((sum, item) => sum + (parseFloat(String(item.quantity)) || 0), 0)
  const totalReceivedUnits = items.reduce((sum, item) => sum + (parseFloat(String(item.quantity_received)) || 0), 0)

  const dualSubtotal = getDetailDualValues(purchase.subtotal, purchase)
  const dualDiscount = getDetailDualValues(purchase.discount_amount, purchase)
  const dualTax = getDetailDualValues(purchase.tax_amount, purchase)
  const dualShipping = getDetailDualValues(purchase.shipping_cost, purchase)
  const dualGrandTotal = getDetailDualValues(purchase.grand_total, purchase)
  const dualPaid = getDetailDualValues(purchase.paid_amount, purchase)
  const dualDue = getDetailDualValues(purchase.due_amount, purchase)

  const deliveryStatusText = getDeliveryStatusLabel(purchase.status, t)
  const paymentStatusText = getPaymentStatusLabel(purchase.payment_status, t)
  const combinedStatus = `${deliveryStatusText} • ${paymentStatusText}`

  const extraMeta = [
    ...(purchase.due_date ? [{
      label: t('purchases.expectedDueDate', 'Expected Due Date'),
      value: purchase.due_date,
    }] : []),
    {
      label: t('purchases.paymentStatusTag', 'Payment Status'),
      value: paymentStatusText,
    }
  ]

  const voucherDocument = (
    <div className="w-full bg-white text-slate-900 font-sans text-xs p-1 sm:p-2 leading-normal select-none [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
      
      {/* ─── Clean Monochrome Header ─────────────────────────────────────── */}
      <GlobalPrintHeader
        title={t('purchases.purchaseOrderTitle', 'OFFICIAL PURCHASE ORDER VOUCHER')}
        subtitleEnglish="OFFICIAL PURCHASE ORDER VOUCHER"
        documentTypeLabel={t('purchases.officialPurchaseOrder', 'Official Purchase Order')}
        referenceNumber={`#${purchase.reference_number}`}
        referenceLabel={t('purchases.poReference', 'PO Reference #')}
        date={purchase.date || purchase.created_at}
        dateLabel={t('purchases.poDate', 'Order Date')}
        status={combinedStatus}
        branchName={purchase.branch?.name}
        extraMeta={extraMeta}
      />

      {/* ─── Metadata 2-Column Section (Clean Minimal) ────────────────────── */}
      <div className="grid grid-cols-2 gap-3 my-2.5">
        {/* Vendor / Supplier Info */}
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
          <p className="font-bold text-xs text-slate-900 pt-0.5">{purchase.supplier?.name || '—'}</p>
          <div className="text-[10px] text-slate-600 space-y-0.5">
            {purchase.supplier?.phone && (
              <p className="flex items-center gap-1.5">
                <Phone size={9} className="text-slate-400 shrink-0" />
                <span>{purchase.supplier.phone}</span>
              </p>
            )}
            {purchase.supplier?.email && (
              <p className="flex items-center gap-1.5">
                <Mail size={9} className="text-slate-400 shrink-0" />
                <span>{purchase.supplier.email}</span>
              </p>
            )}
            {purchase.supplier?.address && (
              <p className="flex items-center gap-1.5">
                <MapPin size={9} className="text-slate-400 shrink-0" />
                <span>{purchase.supplier.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* Destination & Warehouse Details */}
        <div className="border border-slate-300 rounded-lg p-2.5 space-y-1 bg-slate-50/40">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <p className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Warehouse size={11} className="text-slate-500 shrink-0" />
              <span>{t('purchases.destinationWarehouse', 'Destination & Receiving Details')}</span>
            </p>
            <span className="text-[8.5px] px-1 py-0.2 rounded bg-slate-200/80 text-slate-700 font-semibold">
              {t('purchases.destinationTag', 'Destination')}
            </span>
          </div>
          <div className="space-y-0.5 text-[10px] text-slate-600 pt-0.5">
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('purchases.warehouse', 'Warehouse')}:</span>
              <span className="font-semibold text-slate-900">{purchase.warehouse?.name || t('purchases.mainHubWarehouse', 'Warehouse 1 (Main Hub)')}</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('purchases.branch', 'Branch')}:</span>
              <span className="font-semibold text-slate-900">{purchase.branch?.name || 'Head Office 1'}</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('purchases.createdBy', 'Created By')}:</span>
              <span className="font-semibold text-slate-900">{purchase.creator?.name || 'Super Admin'}</span>
            </p>
            {purchase.due_date && (
              <p className="flex items-center justify-between">
                <span className="font-medium text-slate-700">{t('purchases.dueDate', 'Due Date')}:</span>
                <span className="font-mono font-medium text-slate-900">{purchase.due_date}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Ordered Items Table (Classic Invoice Style) ────────────────── */}
      <div className="my-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-300">
          <h3 className="font-bold text-[10.5px] uppercase tracking-wider text-slate-800">
            {t('purchases.orderedItemsBreakdown', 'Ordered Items Breakdown')}
          </h3>
          <span className="text-[10px] font-mono text-slate-600">
            {totalItemsCount} {t('purchases.itemsAvailable', 'items')} ({totalOrderedUnits} {t('purchases.unitsSelected', 'units')})
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse mt-1 border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-800 text-[9.5px] font-bold uppercase tracking-wider border-b border-slate-300">
              <th className="py-1.5 px-2 text-center w-7 border-r border-slate-200">#</th>
              <th className="py-1.5 px-2.5 border-r border-slate-200">{t('purchases.product', 'Product Description & SKU')}</th>
              <th className="py-1.5 px-2 text-center w-16 border-r border-slate-200">{t('purchases.orderedQty', 'Ordered')}</th>
              <th className="py-1.5 px-2 text-center w-16 border-r border-slate-200">{t('purchases.receivedQty', 'Received')}</th>
              <th className="py-1.5 px-2.5 text-right w-24 border-r border-slate-200">{t('purchases.unitCost', 'Unit Cost')}</th>
              <th className="py-1.5 px-2 text-right w-20 border-r border-slate-200">{t('purchases.discount', 'Discount')}</th>
              <th className="py-1.5 px-2.5 text-right w-24">{t('purchases.total', 'Line Total')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, idx) => {
              const unitCostUSD = Number(item.unit_cost || 0)
              const unitCostKHR = unitCostUSD * 4100
              const discountUSD = Number(item.discount_amount || 0)
              const lineTotalUSD = Number(item.total || 0)
              const lineTotalKHR = lineTotalUSD * 4100
              const itemName = item.product_name || item.variant?.name || item.product?.name || `Product #${item.product_id}`
              const itemSku = item.sku || item.product?.sku
              const itemImg = item.image_url || (item as any).image || item.product?.image_url || (item.product?.images && item.product.images[0]?.url)

              return (
                <tr key={item.id || idx} className="even:bg-slate-50/50">
                  <td className="py-1.5 px-2 text-center text-slate-500 font-mono text-[9.5px] border-r border-slate-200">{idx + 1}</td>
                  <td className="py-1.5 px-2.5 border-r border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <ProductThumbnail
                        name={itemName}
                        primaryImage={item.primary_image || item.product?.primary_image}
                        image={itemImg}
                        categoryName={item.product?.category?.name}
                        size="xs"
                        rounded="rounded-lg"
                        preview={false}
                        className="border border-slate-200 shrink-0 print:border-slate-300"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-900 block text-[11px] leading-tight">
                          {itemName}
                        </span>
                        {itemSku && (
                          <span className="text-[9px] font-mono text-slate-500 block">
                            SKU: {itemSku}
                          </span>
                        )}
                        {item.notes && (
                          <p className="text-[9px] text-slate-500 italic mt-0.5">{t('purchases.itemNote', 'Note')}: {item.notes}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono font-semibold text-slate-900 border-r border-slate-200 text-[11px]">
                    {item.quantity}
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono font-medium text-slate-700 border-r border-slate-200 text-[11px]">
                    {item.quantity_received || 0}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono text-[10.5px] text-slate-800 border-r border-slate-200">
                    <div className="font-medium">{formatCurrency(unitCostUSD, 'USD')}</div>
                    <div className="text-[8.5px] text-slate-500">{formatCurrency(unitCostKHR, 'KHR')}</div>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-[10.5px] text-slate-700 border-r border-slate-200">
                    {discountUSD > 0 ? (
                      <div>-{formatCurrency(discountUSD, 'USD')}</div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
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

      {/* ─── Totals & Notes Block (Clean Minimalist Financial Grid) ─────── */}
      <div className="grid grid-cols-12 gap-3 my-2.5 pt-1">
        {/* Left: Notes & Operational Summary */}
        <div className="col-span-6 space-y-2">
          {purchase.notes && (
            <div className="border border-slate-300 rounded-lg p-2 bg-slate-50/40 space-y-0.5">
              <p className="font-bold text-[9px] uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <FileText size={10} className="text-slate-500 shrink-0" />
                <span>{t('purchases.notesTerms', 'Notes / Purchase Terms')}:</span>
              </p>
              <p className="text-[10px] text-slate-600 leading-relaxed pl-3.5">{purchase.notes}</p>
            </div>
          )}

          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50/30 text-slate-700 text-[10px] space-y-0.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">{t('purchases.totalUnitsOrdered', 'Total Units Ordered')}:</span>
              <span className="font-mono font-bold text-slate-900">{totalOrderedUnits}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">{t('purchases.totalUnitsReceived', 'Total Units Received')}:</span>
              <span className="font-mono font-bold text-slate-900">{totalReceivedUnits}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">{t('purchases.totalLineItems', 'Total Line Items')}:</span>
              <span className="font-mono font-bold text-slate-900">{totalItemsCount}</span>
            </div>
          </div>
        </div>

        {/* Right: Clean Financial Breakdown Card */}
        <div className="col-span-6 border border-slate-300 rounded-lg p-2.5 bg-slate-50/40 text-slate-800 space-y-1">
          <div className="flex justify-between items-center text-[10.5px]">
            <span className="text-slate-600">{t('purchases.subtotal', 'Subtotal')}:</span>
            <span className="font-mono font-medium text-slate-900">{formatCurrency(dualSubtotal.usd, 'USD')}</span>
          </div>

          {Number(dualDiscount.usd) > 0 && (
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-600">{t('purchases.discount', 'Discount')}:</span>
              <span className="font-mono font-medium text-slate-900">-{formatCurrency(dualDiscount.usd, 'USD')}</span>
            </div>
          )}

          {Number(dualTax.usd) > 0 && (
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-600">{t('purchases.tax', 'Tax')}:</span>
              <span className="font-mono font-medium text-slate-900">+{formatCurrency(dualTax.usd, 'USD')}</span>
            </div>
          )}

          {Number(dualShipping.usd) > 0 && (
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-600">{t('purchases.shippingCost', 'Shipping Cost')}:</span>
              <span className="font-mono font-medium text-slate-900">+{formatCurrency(dualShipping.usd, 'USD')}</span>
            </div>
          )}

          <div className="pt-1.5 border-t border-slate-300 flex justify-between items-center">
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-900 tracking-wider block">
                {t('purchases.grandTotal', 'Grand Total')}:
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-slate-950">
                {formatCurrency(dualGrandTotal.usd, 'USD')}
              </div>
              <div className="text-[9px] font-mono text-slate-600">
                {formatCurrency(dualGrandTotal.khr, 'KHR')}
              </div>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white p-1 rounded border border-slate-200">
              <span className="text-[8.5px] uppercase font-semibold text-slate-600 block">{t('purchases.alreadyPaid', 'Paid Amount')}</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(dualPaid.usd, 'USD')}</span>
            </div>
            <div className="bg-white p-1 rounded border border-slate-200">
              <span className="text-[8.5px] uppercase font-semibold text-slate-600 block">{t('purchases.outstandingDue', 'Balance Due')}</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(dualDue.usd, 'USD')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Global Enterprise Footer & 3-Party Signatures ───────────────── */}
      <GlobalPrintFooter
        noticeText={`* ${t('purchases.impactPurchaseOrderNotice', 'This purchase order confirms the procurement of goods listed above. Please inspect goods and verify all terms upon delivery before final settlement.')}`}
        signatures={[
          {
            titleLocalized: t('purchases.purchasingOfficer', 'Procurement Officer'),
            name: purchase.creator?.name || 'Super Admin',
          },
          {
            titleLocalized: t('purchases.authorizedManager', 'Inventory Controller'),
            name: t('purchases.authorizedManager', 'Inventory Controller'),
          },
          {
            titleLocalized: t('purchases.vendorReceiver', 'Vendor Receiver'),
            name: purchase.supplier?.name || t('purchases.vendorReceiver', 'Supplier Agent'),
          },
        ]}
      />

    </div>
  )

  if (isOpen !== undefined) {
    return (
      <GlobalPrintContainer
        isOpen={isOpen}
        onClose={onClose || (() => {})}
        modalTitle={t('purchases.printPreviewTitle', 'Purchase Order Voucher Preview')}
        documentSubtitle={`#${purchase.reference_number} • ${purchase.supplier?.name || ''}`}
        layout="modal"
        width="max-w-4xl"
      >
        {voucherDocument}
      </GlobalPrintContainer>
    )
  }

  return (
    <div className="hidden print:block print:w-full print:bg-white print:text-black font-sans text-xs p-2 leading-normal select-none print:m-0 [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
      {voucherDocument}
    </div>
  )
}
