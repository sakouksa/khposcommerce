import React, { useEffect, useState } from 'react'
import { Printer, CheckCircle2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { settingsService } from '@/services/settingsService'
import { useCompanyStore } from '@/stores/companyStore'
import { useAuthStore } from '@/stores/authStore'
import { getAbsoluteImageUrl } from '@/utils/image'
import { sound } from '@/utils/sound'
import type { ReceiptData } from '../types/pos.types'

interface POSReceiptModalProps {
  receipt: ReceiptData | null
  onClose: () => void
}

interface SettingItem {
  key: string
  value: string
}

export const POSReceiptModal: React.FC<POSReceiptModalProps> = ({
  receipt,
  onClose,
}) => {
  const { t, i18n } = useTranslation(['pos', 'common'])
  const { branding, fetchBranding } = useCompanyStore()
  const { user: authUser } = useAuthStore()
  const [logoLoaded, setLogoLoaded] = useState(true)

  // Fetch global settings to capture live customized POS Receipt header/footer
  const { data: settingsData } = useQuery<SettingItem[]>({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings().then((r: any) => (Array.isArray(r) ? r : r?.data ?? []) as SettingItem[]),
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    fetchBranding()
  }, [fetchBranding])

  if (!receipt) return null

  const getSettingVal = (key: string): string => {
    if (!Array.isArray(settingsData)) return ''
    return settingsData.find(s => s.key === key)?.value ?? ''
  }

  // ── Global Store & Company Information ─────────────────────────────────────
  const companyName = 
    getSettingVal('company_name') || 
    getSettingVal('site_name') || 
    branding.company_name || 
    branding.brand_name || 
    authUser?.company?.name || 
    'OptaPOS Enterprise'

  const rawLogo = getSettingVal('pos_receipt_logo') || getSettingVal('site_logo') || branding.logo || authUser?.company?.logo || '/logo.png'
  const logoUrl = getAbsoluteImageUrl(rawLogo) || '/logo.png'

  const companyAddress = 
    getSettingVal('company_address') || 
    branding.address || 
    authUser?.company?.address || 
    'Phnom Penh, Kingdom of Cambodia'

  const companyPhone = 
    getSettingVal('company_phone') || 
    branding.phone || 
    authUser?.company?.phone || 
    '+855 (0) 23 888 999'

  const vatNumber = 
    getSettingVal('company_vat_number') || 
    getSettingVal('vat_number') || 
    'VAT-88902194'

  // ── Receipt Header & Footer Custom Messages ────────────────────────────────
  const receiptHeaderMsg = 
    getSettingVal('pos_receipt_header') || 
    branding.brand_tagline_km || 
    branding.brand_tagline || 
    ''

  const receiptFooterMsg = 
    getSettingVal('pos_receipt_footer') || 
    t('thankYou', 'Thank you for shopping with us! Please come again.')

  const returnPolicyMsg = 
    getSettingVal('pos_return_policy') || 
    t('returnPolicy', 'Items eligible for exchange within 7 days with valid receipt voucher.')

  // ── Dual Currency calculation (USD & KHR) ──────────────────────────────────
  const exchangeRate = 4100
  const grandTotalKHR = Math.round(receipt.grand_total * exchangeRate)
  const formattedKHR = new Intl.NumberFormat('km-KH').format(grandTotalKHR)

  // ── Standard POS Thermal Paper Roll (80mm / 58mm) Direct Iframe Print Handler ──
  const paperWidth: '80mm' | '58mm' =
    (getSettingVal('pos_receipt_paper_size') as '80mm' | '58mm') ||
    (typeof window !== 'undefined' ? (localStorage.getItem('pos_receipt_paper_size') as '80mm' | '58mm') : null) ||
    '80mm'

  const handlePrint = () => {
    sound.playClick()
    const targetWidth = paperWidth === '58mm' ? '58mm' : '80mm'
    const wrapWidth = paperWidth === '58mm' ? '54mm' : '76mm'
    const printEl = document.getElementById('pos-receipt-printable-area')
    if (!printEl) {
      window.print()
      return
    }

    let iframe = document.getElementById('pos-receipt-print-iframe') as HTMLIFrameElement
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.id = 'pos-receipt-print-iframe'
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0px'
      iframe.style.height = '0px'
      iframe.style.border = 'none'
      iframe.style.visibility = 'hidden'
      document.body.appendChild(iframe)
    }

    const doc = iframe.contentWindow?.document
    if (!doc) {
      window.print()
      return
    }

    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html lang="${i18n.language || 'km'}">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Receipt - ${receipt.order_number}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Kantumruy+Pro:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
          <style>
            @page {
              size: ${targetWidth} auto;
              margin: 0mm !important;
            }
            @media print {
              @page {
                size: ${targetWidth} auto;
                margin: 0mm !important;
              }
              html, body {
                width: ${targetWidth} !important;
                max-width: ${targetWidth} !important;
                margin: 0 auto !important;
                padding: 0 !important;
              }
            }
            *, *::before, *::after {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              width: ${targetWidth} !important;
              max-width: ${targetWidth} !important;
              margin: 0 auto !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              font-family: 'Kantumruy Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
              font-size: ${paperWidth === '58mm' ? '10px' : '11.5px'};
              line-height: 1.35;
            }
            .receipt-wrap {
              width: 100%;
              max-width: ${wrapWidth};
              padding: 3mm 2mm;
              margin: 0 auto;
              background: #ffffff;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .font-bold { font-weight: 700; }
            .font-black { font-weight: 900; }
            .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
            .uppercase { text-transform: uppercase; }
            .italic { font-style: italic; }
            
            .dashed-line {
              border-bottom: 1px dashed #475569;
              margin: 6px 0;
              width: 100%;
            }
            .solid-line {
              border-bottom: 1.5px solid #000000;
              margin: 6px 0;
              width: 100%;
            }
            .double-line {
              border-top: 2px solid #000000;
              margin-top: 6px;
              padding-top: 6px;
            }

            .logo-box {
              text-align: center;
              margin-bottom: 4px;
            }
            .logo-img {
              max-height: 44px;
              max-width: 130px;
              margin: 0 auto;
              display: block;
              object-fit: contain;
            }
            .company-title {
              font-size: 14.5px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: -0.02em;
              line-height: 1.2;
              color: #000000;
            }
            .store-subtitle {
              font-size: 11px;
              font-weight: 700;
              color: #1e293b;
              margin-top: 2px;
            }
            .branch-text {
              font-size: 9.5px;
              color: #475569;
              font-weight: 500;
            }
            .contact-text {
              font-size: 9px;
              color: #64748b;
              margin-top: 2px;
              line-height: 1.3;
            }
            .header-slogan {
              font-size: 9.5px;
              font-weight: 700;
              color: #334155;
              margin-top: 3px;
            }

            .meta-grid {
              display: flex;
              justify-content: space-between;
              font-size: 10.5px;
              line-height: 1.4;
            }
            .meta-col {
              flex: 1;
            }
            .meta-label {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              color: #64748b;
              display: block;
            }
            .meta-val {
              font-weight: 700;
              color: #0f172a;
            }

            .items-header {
              display: flex;
              font-size: 10px;
              font-weight: 900;
              text-transform: uppercase;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 3px;
              margin-bottom: 4px;
              color: #334155;
            }
            .item-row {
              margin-bottom: 5px;
            }
            .item-main {
              font-size: 11px;
              font-weight: 700;
              color: #000000;
              line-height: 1.25;
            }
            .item-sub {
              font-size: 8.5px;
              color: #64748b;
              font-family: ui-monospace, SFMono-Regular, monospace;
            }
            .item-calc {
              display: flex;
              justify-content: space-between;
              font-size: 10.5px;
              margin-top: 1px;
            }

            .calc-row {
              display: flex;
              justify-content: space-between;
              font-size: 10.5px;
              margin-bottom: 2px;
              color: #334155;
            }
            .grand-total-box {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              padding: 4px 0;
            }
            .grand-total-label {
              font-size: 12.5px;
              font-weight: 900;
              text-transform: uppercase;
              color: #000000;
            }
            .grand-total-val {
              font-size: 17px;
              font-weight: 900;
              font-family: ui-monospace, SFMono-Regular, monospace;
              color: #000000;
              line-height: 1;
            }
            .khr-val {
              font-size: 11.5px;
              font-weight: 800;
              font-family: ui-monospace, SFMono-Regular, monospace;
              color: #334155;
            }

            .payment-box {
              background: #f8fafc;
              border: 1px dashed #cbd5e1;
              border-radius: 6px;
              padding: 4px 6px;
              margin: 4px 0;
              font-size: 9.5px;
            }

            .barcode-wrap {
              text-align: center;
              margin: 6px 0 3px 0;
            }
            .barcode-svg {
              width: 170px;
              height: 28px;
              margin: 0 auto;
              display: block;
            }
            .barcode-text {
              font-family: ui-monospace, SFMono-Regular, monospace;
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 0.12em;
              color: #334155;
              margin-top: 1px;
            }
            .footer-msg {
              font-size: 10px;
              font-weight: 700;
              color: #1e293b;
              margin-top: 3px;
              line-height: 1.3;
            }
            .policy-msg {
              font-size: 8.5px;
              color: #64748b;
              margin-top: 2px;
              line-height: 1.25;
            }
            .system-tag {
              font-size: 7.5px;
              color: #94a3b8;
              margin-top: 4px;
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #f1f5f9;
              padding-top: 3px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-wrap">
            
            <!-- 1. Header & Logo -->
            <div class="text-center">
              ${logoLoaded && logoUrl ? `
                <div class="logo-box">
                  <img src="${logoUrl}" alt="${companyName}" class="logo-img" />
                </div>
              ` : ''}
              
              <div class="company-title">${companyName}</div>
              <div class="store-subtitle">${receipt.store_name || companyName}</div>
              <div class="branch-text">${receipt.branch_name || 'Head Office'} • ${receipt.warehouse_name || 'Central Warehouse'}</div>
              
              <div class="contact-text">
                <div>${companyAddress}</div>
                <div class="font-mono">VAT: <strong>${vatNumber}</strong> • Tel: <strong>${companyPhone}</strong></div>
              </div>

              ${receiptHeaderMsg ? `<div class="header-slogan italic">« ${receiptHeaderMsg} »</div>` : ''}
            </div>

            <div class="dashed-line"></div>

            <!-- 2. Transaction Metadata -->
            <div class="meta-grid">
              <div class="meta-col">
                <span class="meta-label">${t('invoiceNo', 'Invoice #:')}</span>
                <span class="meta-val font-mono">${receipt.order_number}</span>
                <div style="margin-top: 3px;">
                  <span class="meta-label">${t('cashier', 'Cashier:')}</span>
                  <span class="meta-val">${receipt.cashier_name || authUser?.name || 'Super Admin'}</span>
                </div>
              </div>
              <div class="meta-col text-right">
                <span class="meta-label">${t('dateTime', 'Date & Time:')}</span>
                <span class="meta-val font-mono" style="font-size: 10px;">${receipt.date}</span>
                <div style="margin-top: 3px;">
                  <span class="meta-label">${t('customer', 'Customer:')}</span>
                  <span class="meta-val">${receipt.customer?.name || t('walkInCustomerShort', 'General Customer')}</span>
                </div>
              </div>
            </div>

            <div class="dashed-line"></div>

            <!-- 3. Items List -->
            <div>
              <div class="items-header">
                <span style="flex: 6;">${t('item', 'Item')}</span>
                <span style="flex: 2; text-align: center;">${t('qty', 'Qty')}</span>
                <span style="flex: 4; text-align: right;">${t('total', 'Total ($)')}</span>
              </div>

              ${receipt.items.map((item) => {
                const lineTotal = item.total ?? ((item.unit_price * item.quantity) - (item.discount_amount || 0))
                const variantText = item.selectedVariant ? (item.selectedVariant.name ? `${item.selectedVariant.name} (${item.selectedVariant.sku})` : item.selectedVariant.sku) : ''
                const imeiText = item.imei ? `S/N: ${item.imei}` : ''
                return `
                  <div class="item-row">
                    <div class="item-main">${item.product.name}</div>
                    ${variantText ? `<div class="item-sub">${variantText}</div>` : ''}
                    ${imeiText ? `<div class="item-sub" style="color: #2563eb;">${imeiText}</div>` : ''}
                    <div class="item-calc">
                      <span class="font-mono" style="color: #64748b;">${item.quantity} x $${Number(item.unit_price).toFixed(2)}</span>
                      <span class="font-mono font-bold" style="color: #0f172a;">$${Number(lineTotal).toFixed(2)}</span>
                    </div>
                  </div>
                `
              }).join('')}
            </div>

            <div class="dashed-line"></div>

            <!-- 4. Calculation Summary -->
            <div>
              <div class="calc-row">
                <span>${t('subtotal', 'Subtotal')}</span>
                <span class="font-mono">$${receipt.subtotal.toFixed(2)}</span>
              </div>
              
              ${receipt.discount_amount > 0 ? `
                <div class="calc-row font-bold" style="color: #16a34a;">
                  <span>${t('discount', 'Discount')}</span>
                  <span class="font-mono">-$${receipt.discount_amount.toFixed(2)}</span>
                </div>
              ` : ''}

              <div class="calc-row">
                <span>${t('vatTax10', 'VAT (10%)')}</span>
                <span class="font-mono">$${receipt.tax_amount.toFixed(2)}</span>
              </div>

              <!-- Grand Total -->
              <div class="double-line">
                <div class="grand-total-box">
                  <div>
                    <div class="grand-total-label">${t('grandTotal', 'Grand Total')}</div>
                    <div style="font-size: 8.5px; color: #64748b; font-family: monospace;">(Rate: 1$ = 4,100 ៛)</div>
                  </div>
                  <div class="text-right">
                    <div class="grand-total-val">$${receipt.grand_total.toFixed(2)}</div>
                    <div class="khr-val">៛ ${formattedKHR}</div>
                  </div>
                </div>
              </div>

              <div class="dashed-line"></div>

              <!-- Payment Method & Tendered -->
              <div class="meta-grid" style="font-size: 10px;">
                <div>
                  <span class="meta-label">${t('paymentMethod', 'Payment Method:')}</span>
                  <span class="font-bold uppercase">${receipt.payment_method}</span>
                </div>
                <div class="text-right">
                  <span class="meta-label">${t('tenderedChange', 'Tendered / Change:')}</span>
                  <span class="font-mono font-bold">$${receipt.cash_tendered.toFixed(2)} / $${receipt.change_due.toFixed(2)}</span>
                </div>
              </div>

              ${receipt.payment_details ? `
                <div class="payment-box">
                  ${receipt.payment_details.txn_reference ? `
                    <div style="display: flex; justify-content: space-between; font-weight: 700;">
                      <span>${t('transfer', 'Transfer')} (${receipt.payment_details.bank_name})</span>
                      ${receipt.payment_details.account_number ? `<span class="font-mono">#${receipt.payment_details.account_number}</span>` : ''}
                    </div>
                    <div style="display: flex; justify-content: space-between; font-family: monospace; color: #475569; margin-top: 1px;">
                      <span>${t('txnReferenceLabel', 'Txn Ref:')}</span>
                      <span style="font-weight: 700; color: #0f172a;">#${receipt.payment_details.txn_reference}</span>
                    </div>
                  ` : `
                    <div style="display: flex; justify-content: space-between; font-weight: 700;">
                      <span>${receipt.payment_details.bank_name || 'Bank'}</span>
                      <span>${receipt.payment_details.card_type || 'Credit Card'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-family: monospace; color: #475569; margin-top: 1px;">
                      <span>${t('approvalCode', 'Approval Code:')}</span>
                      <span style="font-weight: 700; color: #0f172a;">${receipt.payment_details.approval_code}</span>
                    </div>
                  `}
                </div>
              ` : ''}
            </div>

            <div class="dashed-line"></div>

            <!-- 5. Barcode & Thank You Footer -->
            <div class="text-center">
              <div class="barcode-wrap">
                <svg class="barcode-svg" viewBox="0 0 160 30" fill="currentColor">
                  <rect x="2" y="0" width="2" height="25" />
                  <rect x="6" y="0" width="1" height="25" />
                  <rect x="9" y="0" width="3" height="25" />
                  <rect x="14" y="0" width="1" height="25" />
                  <rect x="17" y="0" width="2" height="25" />
                  <rect x="21" y="0" width="4" height="25" />
                  <rect x="27" y="0" width="1" height="25" />
                  <rect x="30" y="0" width="2" height="25" />
                  <rect x="34" y="0" width="3" height="25" />
                  <rect x="39" y="0" width="1" height="25" />
                  <rect x="42" y="0" width="2" height="25" />
                  <rect x="46" y="0" width="3" height="25" />
                  <rect x="51" y="0" width="1" height="25" />
                  <rect x="54" y="0" width="4" height="25" />
                  <rect x="60" y="0" width="2" height="25" />
                  <rect x="64" y="0" width="1" height="25" />
                  <rect x="67" y="0" width="3" height="25" />
                  <rect x="72" y="0" width="2" height="25" />
                  <rect x="76" y="0" width="1" height="25" />
                  <rect x="79" y="0" width="4" height="25" />
                  <rect x="85" y="0" width="2" height="25" />
                  <rect x="89" y="0" width="1" height="25" />
                  <rect x="92" y="0" width="3" height="25" />
                  <rect x="97" y="0" width="2" height="25" />
                  <rect x="101" y="0" width="4" height="25" />
                  <rect x="107" y="0" width="1" height="25" />
                  <rect x="110" y="0" width="3" height="25" />
                  <rect x="115" y="0" width="2" height="25" />
                  <rect x="119" y="0" width="1" height="25" />
                  <rect x="122" y="0" width="4" height="25" />
                  <rect x="128" y="0" width="2" height="25" />
                  <rect x="132" y="0" width="1" height="25" />
                  <rect x="135" y="0" width="3" height="25" />
                  <rect x="140" y="0" width="2" height="25" />
                  <rect x="144" y="0" width="1" height="25" />
                  <rect x="147" y="0" width="3" height="25" />
                  <rect x="152" y="0" width="2" height="25" />
                  <rect x="156" y="0" width="2" height="25" />
                </svg>
                <div class="barcode-text">*${receipt.order_number}*</div>
              </div>

              <div class="footer-msg">${receiptFooterMsg}</div>
              <div class="policy-msg">${returnPolicyMsg}</div>

              <div class="system-tag">
                <span>${companyName} POS</span>
                <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

          </div>
        </body>
      </html>
    `)
    doc.close()

    // Allow iframe document, fonts, and images to complete rendering before opening print dialog
    setTimeout(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    }, 250)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      
      {/* Modal Card Dialog (Screen Layout) */}
      <div className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 my-auto relative print:p-0 print:m-0 print:border-none print:shadow-none print:bg-white print:max-w-none">
        
        {/* Top Header Controls (Screen Only) */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3 print:hidden">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={20} />
            <span className="font-extrabold text-sm text-foreground">
              {t('saleCompleted', 'Sale Completed Successfully')}
            </span>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={t('common.close', 'Close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            SCREEN PREVIEW THERMAL 80MM RECEIPT VOUCHER CONTAINER
        ═════════════════════════════════════════════════════════════════════ */}
        <div 
          id="pos-receipt-printable-area"
          className={`bg-white text-slate-900 rounded-2xl ${
            paperWidth === '58mm' ? 'max-w-[270px] p-3.5 sm:p-4 text-[10px]' : 'w-full p-4 sm:p-5 text-xs'
          } font-sans shadow-inner space-y-3.5 border border-slate-200 select-none print:p-0 print:border-none print:shadow-none print:rounded-none mx-auto`}
        >
          {/* 1. Global Header Branding Section */}
          <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
            {/* Logo image (clean transparent, no black background) or fallback avatar */}
            {logoLoaded && logoUrl ? (
              <div className="flex items-center justify-center mx-auto mb-1.5">
                <img 
                  src={logoUrl} 
                  alt={companyName} 
                  className="max-h-12 w-auto max-w-[150px] object-contain block"
                  onError={() => setLogoLoaded(false)} 
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 font-black text-lg flex items-center justify-center mx-auto mb-1.5 border border-slate-200 shadow-2xs">
                <span>{companyName.charAt(0).toUpperCase()}</span>
              </div>
            )}

            {/* Company / Brand Name */}
            <h2 className="font-black text-sm sm:text-base uppercase tracking-tight text-slate-950 leading-tight">
              {companyName}
            </h2>

            {/* Slogan / Store Hierarchy */}
            <p className="text-[11px] font-bold text-slate-700 leading-snug">
              {receipt.store_name || companyName}
            </p>
            <p className="text-[9.5px] text-slate-500 font-medium leading-tight">
              {receipt.branch_name || 'Head Office'} • {receipt.warehouse_name || 'Central Warehouse'}
            </p>

            {/* Address, VAT Number & Contact Phone */}
            <div className="pt-0.5 text-[9px] text-slate-500 space-y-0.5 leading-tight font-medium">
              <p>{companyAddress}</p>
              <p className="font-mono text-slate-600">
                VAT: <strong>{vatNumber}</strong> • Tel: <strong>{companyPhone}</strong>
              </p>
            </div>

            {/* Custom Slogan / Header message */}
            {receiptHeaderMsg && (
              <div className="pt-1 text-[9.5px] font-bold text-slate-700 italic">
                « {receiptHeaderMsg} »
              </div>
            )}
          </div>

          {/* 2. Transaction Metadata (2 Columns) */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10.5px] border-b border-dashed border-slate-300 pb-2.5">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">
                {t('invoiceNo', 'Invoice #:')}
              </span>
              <span className="font-mono font-bold text-slate-950 text-[11px]">
                {receipt.order_number}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">
                {t('dateTime', 'Date & Time:')}
              </span>
              <span className="font-mono text-[10px] font-semibold text-slate-800">
                {receipt.date}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">
                {t('cashier', 'Cashier:')}
              </span>
              <span className="font-semibold text-slate-900">
                {receipt.cashier_name || authUser?.name || 'Super Admin'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">
                {t('customer', 'Customer:')}
              </span>
              <span className="font-semibold text-slate-900">
                {receipt.customer?.name || t('walkInCustomerShort', 'General Customer')}
              </span>
              {receipt.customer?.phone && (
                <span className="block font-mono text-[9px] text-slate-500">
                  {receipt.customer.phone}
                </span>
              )}
            </div>
          </div>

          {/* 3. Itemized Products Table */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
            <div className="grid grid-cols-12 text-[9.5px] font-black uppercase text-slate-600 border-b border-slate-200 pb-1 tracking-wider">
              <span className="col-span-6">{t('item', 'Item')}</span>
              <span className="col-span-2 text-center">{t('qty', 'Qty')}</span>
              <span className="col-span-4 text-right">{t('total', 'Total ($)')}</span>
            </div>

            <div className="space-y-2 pt-1">
              {receipt.items.map((item, idx) => {
                const lineTotal = item.total ?? ((item.unit_price * item.quantity) - (item.discount_amount || 0))
                return (
                  <div key={idx} className="space-y-0.5 leading-tight">
                    <div className="font-bold text-slate-900 text-xs">
                      {item.product.name}
                    </div>
                    {item.selectedVariant && (
                      <div className="text-[9px] font-mono text-slate-500 font-normal">
                        {item.selectedVariant.name ? `${item.selectedVariant.name} (${item.selectedVariant.sku})` : item.selectedVariant.sku}
                      </div>
                    )}
                    {item.imei && (
                      <div className="text-[9px] font-mono text-primary font-normal">
                        S/N: {item.imei}
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[10.5px] pt-0.5">
                      <span className="font-mono text-slate-500">
                        {item.quantity} x ${Number(item.unit_price).toFixed(2)}
                      </span>
                      <span className="font-mono font-bold text-slate-950">
                        ${Number(lineTotal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 4. Financial Calculation Summary */}
          <div className="space-y-1 text-[10.5px] pt-0.5">
            <div className="flex justify-between text-slate-600">
              <span>{t('subtotal', 'Subtotal')}</span>
              <span className="font-mono">${receipt.subtotal.toFixed(2)}</span>
            </div>

            {receipt.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>{t('discount', 'Discount')}</span>
                <span className="font-mono">-${receipt.discount_amount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>{t('vatTax10', 'VAT (10%)')}</span>
              <span className="font-mono">${receipt.tax_amount.toFixed(2)}</span>
            </div>

            {/* Grand Total Highlight */}
            <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-baseline font-black text-slate-950">
              <div>
                <span className="text-xs uppercase tracking-wider block leading-none">
                  {t('grandTotal', 'Grand Total')}
                </span>
                <span className="text-[8.5px] font-mono font-normal text-slate-500 block pt-0.5">
                  (Rate: 1$ = 4,100 ៛)
                </span>
              </div>
              <div className="text-right">
                <div className="text-base sm:text-lg font-mono font-black text-slate-950 leading-tight">
                  ${receipt.grand_total.toFixed(2)}
                </div>
                <div className="text-[10.5px] font-mono font-bold text-slate-700 leading-none">
                  ៛ {formattedKHR}
                </div>
              </div>
            </div>

            {/* Payment Method & Change Breakdown */}
            <div className="pt-2 border-t border-dashed border-slate-300 grid grid-cols-2 gap-1 text-[10px]">
              <div>
                <span className="text-slate-500 block text-[9px] font-bold uppercase">
                  {t('paymentMethod', 'Payment Method:')}
                </span>
                <span className="font-extrabold text-slate-900 uppercase">
                  {receipt.payment_method}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[9px] font-bold uppercase">
                  {t('tenderedChange', 'Tendered / Change:')}
                </span>
                <span className="font-mono font-bold text-slate-900">
                  ${receipt.cash_tendered.toFixed(2)} / ${receipt.change_due.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Bank Transfer / Card Payment Breakdown Card */}
            {receipt.payment_details && (
              <div className="mt-1.5 pt-1.5 border-t border-dashed border-slate-300 text-[9.5px] bg-slate-50 p-2 rounded-xl space-y-0.5">
                {receipt.payment_details.txn_reference ? (
                  <>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{t('transfer', 'Transfer')} ({receipt.payment_details.bank_name})</span>
                      {receipt.payment_details.account_number && (
                        <span className="font-mono">#{receipt.payment_details.account_number}</span>
                      )}
                    </div>
                    <div className="flex justify-between font-mono text-slate-600">
                      <span>{t('txnReferenceLabel', 'Txn Ref:')}</span>
                      <span className="font-bold text-slate-900">#{receipt.payment_details.txn_reference}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{receipt.payment_details.bank_name || 'Bank'}</span>
                      <span>{receipt.payment_details.card_type || 'Credit Card'}</span>
                    </div>
                    <div className="flex justify-between font-mono text-slate-600">
                      <span>{t('approvalCode', 'Approval Code:')}</span>
                      <span className="font-bold text-slate-900">{receipt.payment_details.approval_code}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 5. Barcode & Thank You Footer Section */}
          <div className="text-center pt-2 space-y-1.5 border-t border-dashed border-slate-300">
            {/* SVG Barcode Visual Representation */}
            <div className="flex flex-col items-center justify-center pt-1">
              <svg className="w-44 h-7 mx-auto" viewBox="0 0 160 30" fill="currentColor">
                <rect x="2" y="0" width="2" height="25" />
                <rect x="6" y="0" width="1" height="25" />
                <rect x="9" y="0" width="3" height="25" />
                <rect x="14" y="0" width="1" height="25" />
                <rect x="17" y="0" width="2" height="25" />
                <rect x="21" y="0" width="4" height="25" />
                <rect x="27" y="0" width="1" height="25" />
                <rect x="30" y="0" width="2" height="25" />
                <rect x="34" y="0" width="3" height="25" />
                <rect x="39" y="0" width="1" height="25" />
                <rect x="42" y="0" width="2" height="25" />
                <rect x="46" y="0" width="3" height="25" />
                <rect x="51" y="0" width="1" height="25" />
                <rect x="54" y="0" width="4" height="25" />
                <rect x="60" y="0" width="2" height="25" />
                <rect x="64" y="0" width="1" height="25" />
                <rect x="67" y="0" width="3" height="25" />
                <rect x="72" y="0" width="2" height="25" />
                <rect x="76" y="0" width="1" height="25" />
                <rect x="79" y="0" width="4" height="25" />
                <rect x="85" y="0" width="2" height="25" />
                <rect x="89" y="0" width="1" height="25" />
                <rect x="92" y="0" width="3" height="25" />
                <rect x="97" y="0" width="2" height="25" />
                <rect x="101" y="0" width="4" height="25" />
                <rect x="107" y="0" width="1" height="25" />
                <rect x="110" y="0" width="3" height="25" />
                <rect x="115" y="0" width="2" height="25" />
                <rect x="119" y="0" width="1" height="25" />
                <rect x="122" y="0" width="4" height="25" />
                <rect x="128" y="0" width="2" height="25" />
                <rect x="132" y="0" width="1" height="25" />
                <rect x="135" y="0" width="3" height="25" />
                <rect x="140" y="0" width="2" height="25" />
                <rect x="144" y="0" width="1" height="25" />
                <rect x="147" y="0" width="3" height="25" />
                <rect x="152" y="0" width="2" height="25" />
                <rect x="156" y="0" width="2" height="25" />
              </svg>
              <span className="font-mono text-[9px] font-bold text-slate-700 tracking-widest block">
                *{receipt.order_number}*
              </span>
            </div>

            {/* Custom Receipt Footer from Global Settings */}
            <p className="text-[10px] font-bold text-slate-800 leading-snug">
              {receiptFooterMsg}
            </p>

            {/* Return Policy from Global Settings */}
            <p className="text-[8.5px] text-slate-500 leading-tight">
              {returnPolicyMsg}
            </p>

            {/* Printed Watermark & Timestamp */}
            <div className="pt-1 text-[7.5px] font-mono text-slate-400 border-t border-slate-100 flex items-center justify-between">
              <span>{companyName} POS</span>
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

        </div>

        {/* Action Buttons (Print / Close - Screen Only) */}
        <div className="pt-1 space-y-2 print:hidden">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Printer size={16} />
              <span>{t('printReceipt', 'Print Receipt')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              {t('common.close', 'Close')}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
