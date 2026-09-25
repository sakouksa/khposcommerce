import React from 'react'
import { Package, Warehouse, ArrowRight, CheckCircle2, Truck, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const formatPrintDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  const day = String(date.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

const formatPrintDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  const day = String(date.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day} ${month} ${year} ${hours}:${minutes}`
}

interface StockTransferPrintVoucherProps {
  detail: any
}

export const StockTransferPrintVoucher: React.FC<StockTransferPrintVoucherProps> = ({ detail }) => {
  const { t } = useTranslation(['inventory', 'common'])

  if (!detail) return null

  const items = detail.items ?? []
  const totalItemsCount = items.length
  const totalSentQty = items.reduce((acc: number, it: any) => acc + Number(it.quantity_sent || it.quantity_requested || it.quantity || 0), 0)
  const totalReceivedQty = items.reduce((acc: number, it: any) => acc + Number(it.quantity_received || 0), 0)

  const rawStatus = (detail.status || 'draft').toLowerCase()
  const statusLabel = rawStatus === 'in_transit' || rawStatus === 'shipped' 
    ? 'IN TRANSIT' 
    : rawStatus === 'received' || rawStatus === 'completed' 
    ? 'COMPLETED' 
    : rawStatus === 'cancelled' 
    ? 'CANCELLED' 
    : 'DRAFT'

  const refNumber = detail.reference_number || `TRF-${detail.id || '20260808-0001'}`

  return (
    <div className="hidden print:block print:w-full print:bg-white print:text-black font-sans text-xs p-1 leading-normal select-none print:m-0">
      
      {/* ─── Top Header Section ─────────────────────────────────────────── */}
      <div className="flex justify-between items-start pb-3 border-b-2 border-gray-900 gap-4">
        
        {/* Left: Company Identity */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg border-2 border-gray-900 flex items-center justify-center text-gray-900 shrink-0">
            <Package size={22} className="stroke-[2.5]" />
          </div>
          <div className="space-y-0.5 text-xs text-gray-800">
            <h1 className="font-black text-sm tracking-tight text-gray-900 uppercase leading-none">NEXTECH CAMBODIA POS</h1>
            <p className="font-bold text-[10px] text-gray-600 uppercase tracking-wider">Multi-Branch Retail & POS System</p>
            <div className="pt-0.5 text-[9.5px] space-y-0.5 text-gray-600">
              <p>📍 Phnom Penh, Cambodia • 📞 +855 12 345 678</p>
              <p>✉️ support@nextech.com.kh • 🌐 www.nextech.com.kh</p>
            </div>
          </div>
        </div>

        {/* Center: Official Title */}
        <div className="text-center space-y-1 self-center">
          <span className="inline-block px-3 py-0.5 rounded-full border border-gray-800 text-[10px] font-black tracking-widest uppercase">
            Official Document
          </span>
          <h2 className="font-black text-base text-gray-900 tracking-tight leading-none uppercase">
            {t('stock_transfer_voucher', 'Stock Transfer Voucher')}
          </h2>
        </div>

        {/* Right: Reference & Verification Code */}
        <div className="text-right space-y-1 min-w-[180px]">
          <div className="inline-block bg-gray-50 border border-gray-400 rounded-lg px-2.5 py-1 text-right">
            <p className="text-[10px] font-bold text-gray-500 uppercase">{t('transfer_number', 'Transfer Number')}</p>
            <p className="font-mono font-black text-xs text-gray-900">{refNumber}</p>
          </div>
          <div className="text-[9.5px] space-y-0.5 text-gray-700 font-medium pt-0.5">
            <p><span className="font-bold">{t('date', 'Date')} :</span> {formatPrintDate(detail.created_at || detail.date)}</p>
            <p><span className="font-bold">{t('status', 'Status')} :</span> <span className="font-black uppercase">{statusLabel}</span></p>
          </div>
        </div>

      </div>

      {/* ─── Route: From Warehouse ➔ To Warehouse ───────────────────────── */}
      <div className="mt-3 border border-gray-400 rounded-xl p-3 bg-gray-50/50 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs">
        {/* Source Warehouse */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Warehouse size={13} />
            <span className="font-bold text-[10px] uppercase tracking-wider">{t('source_warehouse', 'Source Warehouse')}</span>
          </div>
          <p className="font-black text-sm text-gray-900">{detail.from_warehouse?.name || detail.fromWarehouse?.name || 'Main Warehouse 1'}</p>
          <p className="text-[10px] text-gray-600">Location: {detail.from_warehouse?.address || detail.from_warehouse?.location || 'Phnom Penh'}</p>
          <p className="text-[10px] text-gray-600">Contact: {detail.from_warehouse?.phone || '+855 12 222 333'}</p>
        </div>

        {/* Transfer Indicator */}
        <div className="flex flex-col items-center justify-center px-2">
          <div className="w-8 h-8 rounded-full border border-gray-400 bg-white flex items-center justify-center text-gray-900 font-bold">
            ➔
          </div>
        </div>

        {/* Destination Warehouse */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Warehouse size={13} />
            <span className="font-bold text-[10px] uppercase tracking-wider">{t('destination_warehouse', 'Destination Warehouse')}</span>
          </div>
          <p className="font-black text-sm text-gray-900">{detail.to_warehouse?.name || detail.toWarehouse?.name || 'Branch Warehouse 2'}</p>
          <p className="text-[10px] text-gray-600">Location: {detail.to_warehouse?.address || detail.to_warehouse?.location || 'Phnom Penh'}</p>
          <p className="text-[10px] text-gray-600">Contact: {detail.to_warehouse?.phone || '+855 12 111 222'}</p>
        </div>
      </div>

      {/* ─── Metadata Info Summary ──────────────────────────────────────── */}
      <div className="mt-2.5 border border-gray-300 rounded-xl p-2.5 bg-white grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
        <div className="space-y-1">
          <div className="grid grid-cols-[120px_1fr] items-center">
            <span className="font-bold text-gray-700">{t('transfer_date', 'Transfer Date')} :</span>
            <span className="font-medium">{formatPrintDate(detail.created_at || detail.date)}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center">
            <span className="font-bold text-gray-700">{t('expected_arrival', 'Expected Arrival')} :</span>
            <span className="font-medium">{formatPrintDate(detail.expected_arrival_date || detail.estimated_date)}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="grid grid-cols-[120px_1fr] items-center">
            <span className="font-bold text-gray-700">{t('shipping_carrier', 'Shipping Carrier')} :</span>
            <span className="font-medium font-mono">{detail.tracking_carrier || detail.carrier || 'Internal Logistics'}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center">
            <span className="font-bold text-gray-700">{t('tracking_number', 'Tracking #')} :</span>
            <span className="font-medium font-mono">{detail.tracking_number || detail.trackingNumber || 'TRK-INT-8839'}</span>
          </div>
        </div>
      </div>

      {/* ─── Items Detail Table ─────────────────────────────────────────── */}
      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-xs uppercase tracking-wider text-gray-900">
            {t('transferred_items', 'Transferred Items')}
          </h3>
          <span className="text-[10px] font-bold text-gray-600">{t('total_items', 'Total Items')}: {totalItemsCount}</span>
        </div>
        <div className="border border-gray-400 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400 font-bold text-gray-900 text-center">
                <th className="p-1.5 border-r border-gray-300 w-8">#</th>
                <th className="p-1.5 border-r border-gray-300 text-left">{t('product_item', 'Product Item & Variant')}</th>
                <th className="p-1.5 border-r border-gray-300 w-28">{t('sku_code', 'SKU / Code')}</th>
                <th className="p-1.5 border-r border-gray-300 w-24">{t('sent_qty', 'Sent Qty')}</th>
                <th className="p-1.5 border-r border-gray-300 w-24">{t('recv_qty', 'Recv Qty')}</th>
                <th className="p-1.5 border-r border-gray-300 w-16">{t('unit', 'Unit')}</th>
                <th className="p-1.5 text-left">{t('remarks', 'Remarks')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 font-medium text-gray-800">
              {items.map((item: any, idx: number) => (
                <tr key={item.id || idx}>
                  <td className="p-1.5 text-center border-r border-gray-300 font-bold">{idx + 1}</td>
                  <td className="p-1.5 border-r border-gray-300 font-bold text-gray-900">
                    {item.product?.name || `Product #${item.product_id}`}
                    {item.variant?.name && (
                      <span className="block text-[9.5px] font-normal text-gray-600">Variant: {item.variant.name}</span>
                    )}
                  </td>
                  <td className="p-1.5 text-center border-r border-gray-300 font-mono text-[10px]">
                    {item.product?.sku || item.sku || '—'}
                  </td>
                  <td className="p-1.5 text-center border-r border-gray-300 font-black text-gray-900">
                    {item.quantity_sent || item.quantity_requested || item.quantity || 0}
                  </td>
                  <td className="p-1.5 text-center border-r border-gray-300 font-black text-gray-900">
                    {item.quantity_received || 0}
                  </td>
                  <td className="p-1.5 text-center border-r border-gray-300 uppercase text-[10px]">
                    {item.product?.unit?.code || item.product?.unit || 'PCS'}
                  </td>
                  <td className="p-1.5 text-[10px] text-gray-600">
                    {item.notes || '—'}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500 italic">
                    {t('no_items_listed', 'No items listed in this transfer document.')}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-100 border-t-2 border-gray-400 font-black text-xs text-gray-900">
              <tr>
                <td colSpan={3} className="p-2 border-r border-gray-300 text-left">
                  {t('summary_totals', 'SUMMARY TOTALS')}:
                </td>
                <td className="p-2 text-center border-r border-gray-300">
                  {totalSentQty}
                </td>
                <td className="p-2 text-center border-r border-gray-300">
                  {totalReceivedQty}
                </td>
                <td colSpan={2} className="p-2 text-right text-[10px] text-gray-700 font-bold">
                  {t('skus_count', 'SKUs Count')}: {totalItemsCount}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ─── Workflow Audit Trail ───────────────────────────────────────── */}
      <div className="mt-3 space-y-1">
        <h3 className="font-black text-xs uppercase tracking-wider text-gray-900">
          {t('transfer_lifecycle', 'Transfer Lifecycle & Audit Trail')}
        </h3>
        <div className="border border-gray-400 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 font-bold text-gray-900">
                <th className="p-1.5 border-r border-gray-300 text-center w-8">#</th>
                <th className="p-1.5 border-r border-gray-300 w-36">{t('date_time', 'Date & Time')}</th>
                <th className="p-1.5 border-r border-gray-300 w-36">{t('performed_by', 'Performed By')}</th>
                <th className="p-1.5 border-r border-gray-300 w-28">{t('status_action', 'Status Action')}</th>
                <th className="p-1.5">{t('action_notes', 'Action Notes / Remarks')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 font-medium text-gray-800">
              <tr>
                <td className="p-1.5 text-center border-r border-gray-300 font-bold">1</td>
                <td className="p-1.5 border-r border-gray-300 font-mono">{formatPrintDateTime(detail.created_at)}</td>
                <td className="p-1.5 border-r border-gray-300 font-bold">{detail.user?.name || 'Super Admin'}</td>
                <td className="p-1.5 border-r border-gray-300 font-bold uppercase text-blue-700">{t('created', 'Created')}</td>
                <td className="p-1.5">{t('transfer_created_desc', 'Stock transfer draft created and submitted for verification')}</td>
              </tr>
              {detail.approved_at && (
                <tr>
                  <td className="p-1.5 text-center border-r border-gray-300 font-bold">2</td>
                  <td className="p-1.5 border-r border-gray-300 font-mono">{formatPrintDateTime(detail.approved_at)}</td>
                  <td className="p-1.5 border-r border-gray-300 font-bold">{detail.approved_by || 'Manager'}</td>
                  <td className="p-1.5 border-r border-gray-300 font-bold uppercase text-emerald-700">{t('approved', 'Approved')}</td>
                  <td className="p-1.5">{t('transfer_approved_desc', 'Transfer request verified and approved for shipment')}</td>
                </tr>
              )}
              {detail.shipped_at && (
                <tr>
                  <td className="p-1.5 text-center border-r border-gray-300 font-bold">3</td>
                  <td className="p-1.5 border-r border-gray-300 font-mono">{formatPrintDateTime(detail.shipped_at)}</td>
                  <td className="p-1.5 border-r border-gray-300 font-bold">{detail.shipped_by || detail.user?.name || 'Super Admin'}</td>
                  <td className="p-1.5 border-r border-gray-300 font-bold uppercase text-amber-700">{t('dispatched', 'Dispatched')}</td>
                  <td className="p-1.5">{t('transfer_dispatched_desc', 'Items dispatched from source warehouse and in-transit')}</td>
                </tr>
              )}
              <tr>
                <td className="p-1.5 text-center border-r border-gray-300 font-bold">4</td>
                <td className="p-1.5 border-r border-gray-300 font-mono">{detail.received_at ? formatPrintDateTime(detail.received_at) : '—'}</td>
                <td className="p-1.5 border-r border-gray-300 font-bold">{detail.received_by || '—'}</td>
                <td className="p-1.5 border-r border-gray-300 font-bold uppercase">
                  {detail.received_at ? <span className="text-emerald-700">{t('received', 'Received')}</span> : <span className="text-gray-500">{t('pending', 'Pending')}</span>}
                </td>
                <td className="p-1.5">{detail.received_at ? t('transfer_received_desc', 'All stock items checked and received into destination warehouse') : t('transfer_pending_desc', 'Awaiting physical delivery and recipient confirmation')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Signatures Block ────────────────────────────────────────────── */}
      <div className="mt-4 border border-gray-400 rounded-xl p-3 bg-white grid grid-cols-3 divide-x divide-gray-300 text-xs">
        {/* Sender / Prepared By */}
        <div className="px-3 text-center space-y-7">
          <h4 className="font-bold text-gray-900 text-[10.5px] uppercase tracking-wider">
            {t('prepared_by', 'Prepared By')}
          </h4>
          <div className="space-y-1">
            <div className="w-4/5 border-b border-gray-400 mx-auto mb-1" />
            <p className="font-bold text-gray-900 text-xs">{detail.user?.name || 'Super Admin'}</p>
            <p className="text-[9.5px] text-gray-600 font-mono">{formatPrintDateTime(detail.created_at)}</p>
          </div>
        </div>

        {/* Approved By */}
        <div className="px-3 text-center space-y-7">
          <h4 className="font-bold text-gray-900 text-[10.5px] uppercase tracking-wider">
            {t('authorized_by', 'Authorized By')}
          </h4>
          <div className="space-y-1">
            <div className="w-4/5 border-b border-gray-400 mx-auto mb-1" />
            <p className="font-bold text-gray-900 text-xs">{detail.approved_by || 'Warehouse Manager'}</p>
            <p className="text-[9.5px] text-gray-600 font-mono">{detail.approved_at ? formatPrintDateTime(detail.approved_at) : 'Date: _______________'}</p>
          </div>
        </div>

        {/* Received By */}
        <div className="px-3 text-center space-y-7">
          <h4 className="font-bold text-gray-900 text-[10.5px] uppercase tracking-wider">
            {t('received_by', 'Received By')}
          </h4>
          <div className="space-y-1">
            <div className="w-4/5 border-b border-gray-400 mx-auto mb-1" />
            <p className="font-bold text-gray-900 text-xs">{detail.received_by || '(Signature & Full Name)'}</p>
            <p className="text-[9.5px] text-gray-600 font-mono">{detail.received_at ? formatPrintDateTime(detail.received_at) : 'Date: _______________'}</p>
          </div>
        </div>
      </div>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <div className="mt-3 flex justify-between items-center text-[9px] text-gray-500 border-t border-gray-300 pt-1.5 font-medium">
        <span>System Generated Stock Transfer Voucher • NexTech POS System</span>
        <span>Printed on: {formatPrintDateTime(new Date().toISOString())}</span>
        <span>Page 1 / 1</span>
      </div>

    </div>
  )
}

export default StockTransferPrintVoucher
