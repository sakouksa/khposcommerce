import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Printer, X, Truck, QrCode, Phone, MapPin, Package, CheckCircle2, AlertCircle } from 'lucide-react'
import { EnterpriseModal, ModalFooter } from '@/components/common'
import { useThemeStore } from '@/stores/themeStore'
import { formatCurrency, GlobalFormat } from '@/utils/formatters'
import type { Order } from './OrdersTableSection'

const KHR_RATE = 4100

interface ShippingWaybillModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
}

export const ShippingWaybillModal: React.FC<ShippingWaybillModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['orders', 'sales', 'common'])
  const printableRef = useRef<HTMLDivElement>(null)

  if (!order) return null

  const items = order.items || (order as any)?.details || (order as any)?.order_items || []
  const totalUSD = Number(order.grand_total ?? order.total_amount ?? 0)
  const totalKHR = Math.round(totalUSD * KHR_RATE)
  const isPaid = order.payment_status === 'paid'
  const courierName =
    order.shipping_method?.name ||
    order.shippingMethod?.name ||
    order.shipment?.carrier ||
    (language === 'km' ? 'ក្រុមហ៊ុនដឹកជញ្ជូនក្នុងស្រុក' : 'Standard Express Delivery')

  const recipientName =
    order.shipping_name || order.customer?.name || (language === 'km' ? 'អតិថិជន' : 'Customer')
  const rawRecipientPhone =
    order.shipping_phone || order.customer?.phone || order.customer_phone
  const recipientPhone = rawRecipientPhone ? GlobalFormat.phone(rawRecipientPhone) : '—'
  const recipientAddress =
    order.shipping_address ||
    order.customer?.addresses?.[0]?.address ||
    (language === 'km' ? 'អាសយដ្ឋានដឹកជញ្ជូនមិនបានបញ្ជាក់' : 'Address not specified')
  const recipientCity =
    order.shipping_city ||
    order.shipping_province ||
    order.customer?.addresses?.[0]?.city ||
    'Phnom Penh'

  const handlePrint = () => {
    const printContent = printableRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank', 'width=450,height=700')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Waybill - ${order.order_number || `ORD-${order.id}`}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 3mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Kantumruy Pro", sans-serif;
              margin: 0;
              padding: 6px;
              color: #000;
              background: #fff;
              font-size: 11px;
              line-height: 1.35;
            }
            .border-box {
              border: 1.5px solid #000;
              border-radius: 6px;
              padding: 8px;
              margin-bottom: 8px;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .title {
              font-size: 15px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .order-num {
              font-family: monospace;
              font-size: 13px;
              font-weight: bold;
              margin-top: 3px;
            }
            .section-title {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              color: #444;
              border-bottom: 1px solid #ddd;
              padding-bottom: 2px;
              margin-bottom: 4px;
            }
            .cod-banner {
              border: 2px solid #000;
              background: #f0f0f0;
              text-align: center;
              padding: 8px 4px;
              margin: 8px 0;
              border-radius: 4px;
            }
            .cod-title {
              font-size: 12px;
              font-weight: 800;
            }
            .cod-amount {
              font-size: 18px;
              font-weight: 900;
              font-family: monospace;
              margin-top: 2px;
            }
            .paid-banner {
              border: 1.5px solid #000;
              text-align: center;
              padding: 6px 4px;
              margin: 8px 0;
              border-radius: 4px;
              font-weight: 800;
              font-size: 13px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 4px;
              font-size: 10px;
            }
            .items-table th, .items-table td {
              padding: 3px 2px;
              border-bottom: 1px dotted #ccc;
              text-align: left;
            }
            .text-right { text-align: right; }
            .barcode {
              text-align: center;
              font-family: monospace;
              font-size: 10px;
              letter-spacing: 3px;
              margin-top: 10px;
              padding-top: 6px;
              border-top: 1px dashed #000;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('orders.shippingWaybill', language === 'km' ? 'ស្លាកបញ្ញើដឹកជញ្ជូន' : 'Shipping Waybill Label')}
      subtitle={`#${order.order_number || `ORD-${order.id}`} • ${courierName}`}
      size="md"
      footer={
        <ModalFooter
          onCancel={onClose}
          cancelText={t('common.close', language === 'km' ? 'បិទ' : 'Close')}
          confirmText={t('orders.printWaybill', language === 'km' ? 'បោះពុម្ពស្លាកដឹក' : 'Print Waybill')}
          confirmIcon={Printer}
          onConfirm={handlePrint}
        />
      }
    >
      <div className="space-y-4">
        {/* Printable Paper Preview Container */}
        <div className="bg-muted/30 p-4 rounded-xl border border-border flex justify-center">
          <div
            ref={printableRef}
            className="w-full max-w-[360px] bg-card text-card-foreground p-5 rounded-lg border-2 border-foreground/20 shadow-md font-sans text-xs select-none"
          >
            {/* Header */}
            <div className="header text-center border-b-2 border-dashed border-border pb-3 mb-3">
              <div className="flex items-center justify-center gap-1.5 text-primary font-bold text-sm tracking-wide uppercase">
                <Truck size={16} />
                <span>{courierName}</span>
              </div>
              <div className="order-num text-base font-black font-mono mt-1 text-foreground">
                #{order.order_number || `ORD-${order.id}`}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {order.created_at ? new Date(order.created_at).toLocaleString() : new Date().toLocaleString()}
              </div>
            </div>

            {/* Recipient Box (To) */}
            <div className="border-box border border-border rounded-lg p-3 mb-3 bg-muted/20">
              <div className="section-title text-[10px] font-bold uppercase text-muted-foreground border-b border-border/60 pb-1 mb-2 flex items-center justify-between">
                <span>{language === 'km' ? 'អ្នកទទួល' : 'SHIP TO RECIPIENT'}</span>
                <span className="font-mono text-primary font-bold">{recipientCity}</span>
              </div>
              <div className="font-bold text-sm text-foreground flex items-center gap-1">
                <span>{recipientName}</span>
              </div>
              <div className="font-mono font-semibold text-xs text-foreground mt-1 flex items-center gap-1">
                <Phone size={11} className="text-primary shrink-0" />
                <span>{recipientPhone}</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 flex items-start gap-1 leading-snug">
                <MapPin size={11} className="text-muted-foreground shrink-0 mt-0.5" />
                <span>{recipientAddress}</span>
              </div>
            </div>

            {/* Sender Box (From) */}
            <div className="border-box border border-border rounded-lg p-2.5 mb-3 text-[11px] bg-muted/10">
              <div className="section-title text-[10px] font-bold uppercase text-muted-foreground border-b border-border/60 pb-0.5 mb-1.5">
                {language === 'km' ? 'អ្នកផ្ញើ' : 'FROM / SENDER'}
              </div>
              <div className="font-semibold text-foreground">KHPosCommerce Express Store</div>
              <div className="text-muted-foreground text-[10px]">Phnom Penh Main Hub • Tel: 012 888 999</div>
            </div>

            {/* COD or Paid Banner */}
            {!isPaid ? (
              <div className="cod-banner border-2 border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 rounded-lg p-3 text-center mb-3">
                <div className="cod-title text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400">
                  <AlertCircle size={14} />
                  <span>{language === 'km' ? 'ប្រមូលប្រាក់ពេលដឹកដល់ (COD)' : 'CASH ON DELIVERY (COD)'}</span>
                </div>
                <div className="cod-amount text-xl font-black font-mono mt-1 text-foreground">
                  {formatCurrency(totalUSD, 'USD')}
                </div>
                <div className="text-xs font-mono font-bold text-muted-foreground">
                  {formatCurrency(totalKHR, 'KHR')}
                </div>
              </div>
            ) : (
              <div className="paid-banner border-2 border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-lg p-2.5 text-center mb-3">
                <div className="flex items-center justify-center gap-1.5 font-black text-xs uppercase tracking-wide">
                  <CheckCircle2 size={15} />
                  <span>{language === 'km' ? 'បានបង់ប្រាក់រួច' : 'PAID - DO NOT COLLECT CASH'}</span>
                </div>
              </div>
            )}

            {/* Package Items Manifest */}
            <div className="border-box border border-border rounded-lg p-2.5 mb-2">
              <div className="section-title text-[10px] font-bold uppercase text-muted-foreground border-b border-border/60 pb-1 mb-1.5 flex items-center justify-between">
                <span>{language === 'km' ? 'មុខទំនិញក្នុងកញ្ចប់' : 'PACKAGE CONTENTS'}</span>
                <span className="font-mono text-muted-foreground">{items.length} {language === 'km' ? 'មុខ' : 'items'}</span>
              </div>
              <div className="space-y-1">
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] py-0.5 border-b border-border/40 last:border-0">
                    <span className="truncate max-w-[210px] font-medium text-foreground">
                      {item.product_name || item.product?.name || `Item #${item.id}`}
                    </span>
                    <span className="font-mono font-bold text-foreground shrink-0">
                      x{Number(item.quantity || 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Barcode Mockup */}
            <div className="barcode text-center pt-2 border-t border-dashed border-border font-mono text-[10px] text-muted-foreground">
              <div className="tracking-[6px] font-black text-xs text-foreground">
                ||||| | |||| || ||| ||||||| | ||
              </div>
              <div className="mt-0.5">{order.order_number || `ORD-${order.id}`}</div>
            </div>
          </div>
        </div>
      </div>
    </EnterpriseModal>
  )
}

export default ShippingWaybillModal
