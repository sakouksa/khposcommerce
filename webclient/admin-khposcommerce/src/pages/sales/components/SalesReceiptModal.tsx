import React, { useRef, useState, useEffect, useCallback } from 'react'
import {Receipt, Store } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { salesService } from '@/services/salesService'
import { settingsService } from '@/services/settingsService'
import { useCompanyStore } from '@/stores/companyStore'
import { getAbsoluteImageUrl } from '@/utils/image'
import { sound } from '@/utils/sound'
import { GlobalPrintContainer } from '@/components/shared/GlobalPrint'

export interface SaleItem {
  id:                 number
  sale_id?:           number
  product_id:         number
  product_name:       string
  sku:                string
  quantity:           number
  unit_price:         number
  discount_amount:    number
  tax_amount:         number
  subtotal:           number
  total:              number
  product?:           { id?: number; name?: string; image?: string; primary_image?: string }
  variant?:           { id?: number; name?: string; sku?: string }
}

export interface Sale {
  id:              number
  invoice_number:  string
  customer?:      { id?: number; name: string; phone?: string; tax_number?: string; email?: string }
  cashier?:       {
    id?: number
    name: string
    email?: string
    avatar?: string
    photo?: string
    role?: string
    employee?: {
      id?: number
      name?: string
      photo?: string
      position?: any
    }
  }
  company?:       { id?: number; name?: string; email?: string; phone?: string; address?: string; logo?: string; tax_number?: string; website?: string }
  branch?:        { id?: number; name?: string; code?: string; phone?: string; address?: string }
  store?:         { id?: number; name?: string; code?: string; phone?: string; address?: string; logo?: string; domain?: string }
  warehouse?:     { id?: number; name?: string; code?: string; phone?: string; address?: string }
  date:            string
  created_at:      string
  status:          'pending' | 'completed' | 'cancelled' | 'refunded'
  payment_status?: string
  payment_method?: any
  paymentMethod?:  { id?: number; name?: string; code?: string }
  subtotal:        number
  tax_amount:      number
  discount_amount: number
  grand_total:     number
  paid_amount:     number
  change_amount:   number
  currency_code:   string
  notes?:          string
  receipt_header?: string
  receipt_footer?: string
  return_policy?:  string
  items?:          SaleItem[]
}

interface SalesReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  sale: Sale | null
}

const KHR_RATE = 4100 // Standard Cambodian Riel Exchange Rate

export const SalesReceiptModal: React.FC<SalesReceiptModalProps> = ({
  isOpen,
  onClose,
  sale,
}) => {
  const { t, i18n } = useTranslation(['sales', 'common'])
  const { branding } = useCompanyStore()
  const printRef = useRef<HTMLDivElement>(null)
  const [logoLoaded, setLogoLoaded] = useState(true)
  // Fetch live global settings from database
  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings().then((response: any) => (Array.isArray(response) ? response : response?.data ?? [])),
    staleTime: 5 * 60 * 1000,
  })

  const getSettingVal = (key: string): string => {
    if (!Array.isArray(settingsData)) return ''
    return settingsData.find((setting: any) => setting.key === key)?.value ?? ''
  }

  // Paper width strictly configured in Settings database (pos_receipt_paper_size: '80mm' | '58mm')
  const paperWidth: '80mm' | '58mm' =
    (getSettingVal('pos_receipt_paper_size') as '80mm' | '58mm') ||
    (typeof window !== 'undefined' ? (localStorage.getItem('pos_receipt_paper_size') as '80mm' | '58mm') : null) ||
    '80mm'

  // Fetch full details from controller database if needed
  const { data: detailedSale } = useQuery<Sale | null>({
    queryKey: ['sales', 'receipt-modal-detail', sale?.id],
    queryFn: () => (sale?.id ? salesService.show(sale.id) : Promise.resolve(null)),
    enabled: isOpen && !!sale?.id,
    initialData: sale || null,
  })

  const activeSale = detailedSale || sale

  // Extract items list
  const itemsList: SaleItem[] =
    activeSale?.items ||
    (activeSale as any)?.sale_items ||
    (activeSale as any)?.details ||
    (activeSale as any)?.saleDetails ||
    []

  // Real store / company info extracted dynamically from controller database
  const companyName =
    activeSale?.company?.name ||
    getSettingVal('company_name') ||
    getSettingVal('site_name') ||
    branding.company_name ||
    'NexTech Cambodia'

  const storeName =
    activeSale?.store?.name ||
    activeSale?.branch?.name ||
    companyName

  const storeAddress =
    activeSale?.store?.address ||
    activeSale?.company?.address ||
    activeSale?.branch?.address ||
    getSettingVal('company_address') ||
    branding.address ||
    ''

  const storePhone =
    activeSale?.store?.phone ||
    activeSale?.company?.phone ||
    activeSale?.branch?.phone ||
    getSettingVal('company_phone') ||
    branding.phone ||
    ''

  const taxNumber =
    activeSale?.company?.tax_number ||
    (activeSale as any)?.tax_number ||
    getSettingVal('company_vat_number') ||
    getSettingVal('vat_number') ||
    (branding as any)?.tax_number ||
    ''

  // Real Database Logo resolution:
  // Prefer explicitly configured pos_receipt_logo or site_logo from settings,
  // then company logo, then valid store logo, fallback to global branding
  const validStoreLogo =
    activeSale?.store?.logo && !activeSale.store.logo.includes('stores/logo-')
      ? activeSale.store.logo
      : null

  const rawLogo =
    getSettingVal('pos_receipt_logo') ||
    getSettingVal('site_logo') ||
    activeSale?.company?.logo ||
    validStoreLogo ||
    branding.logo ||
    '/logo.png'

  const logoUrl = rawLogo ? getAbsoluteImageUrl(rawLogo) : '/logo.png'

  // Real Header Slogan and Footer Policy from database
  const receiptHeaderMsg =
    activeSale?.receipt_header ||
    getSettingVal('pos_receipt_header') ||
    branding.brand_tagline_km ||
    branding.brand_tagline ||
    ''

  const receiptFooterMsg =
    activeSale?.receipt_footer ||
    getSettingVal('pos_receipt_footer') ||
    t('receiptThankYou', 'Thank you! Please come again')

  const companyWebsite =
    activeSale?.company?.website ||
    getSettingVal('company_website') ||
    activeSale?.store?.domain ||
    ''

  const notes = activeSale?.notes

  // Cashier & Customer
  const cashierName = activeSale?.cashier?.name
    ? activeSale.cashier.name.replace(/\s*\(system\)/i, '')
    : 'Super Admin'

  const customerName = activeSale?.customer?.name || null
  const customerPhone = activeSale?.customer?.phone
  const customerTaxNumber = activeSale?.customer?.tax_number

  // Totals calculations
  const grandTotalUSD = Number(activeSale?.grand_total || 0)
  const grandTotalKHR = Math.round(grandTotalUSD * KHR_RATE)
  const paidUSD = Number(activeSale?.paid_amount || grandTotalUSD)
  const changeUSD = Number(activeSale?.change_amount || 0)
  const changeKHR = Math.round(changeUSD * KHR_RATE)
  const subtotalUSD = Number(activeSale?.subtotal || grandTotalUSD)
  const discountUSD = Number(activeSale?.discount_amount || 0)
  const taxUSD = Number(activeSale?.tax_amount || 0)

  const createdDate = activeSale?.created_at
    ? new Date(activeSale.created_at)
    : activeSale?.date
    ? new Date(activeSale.date)
    : new Date()

  // Payment method localized display using translation system
  const getPaymentMethodDisplay = (method: any) => {
    const candidate = (
      method?.name ||
      method?.code ||
      (typeof method === 'string' ? method : '') ||
      'cash'
    ).toLowerCase()

    if (candidate.includes('khqr') || candidate.includes('aba') || candidate.includes('bakong')) {
      return t('khqr', 'KHQR')
    }
    if (candidate.includes('card') || candidate.includes('credit') || candidate.includes('debit')) {
      return t('card', 'Card')
    }
    if (candidate.includes('cash')) {
      return t('cash', 'Cash')
    }
    if (candidate.includes('bank')) {
      return t('bankTransfer', 'Bank Transfer')
    }

    if (typeof method === 'string') return method.replace(/_/g, ' ').toUpperCase()
    return (method?.name || 'CASH').toUpperCase()
  }

  const formattedDateTime = `${createdDate.toLocaleDateString(
    i18n.language === 'km' ? 'km-KH' : 'en-US',
    { year: 'numeric', month: 'numeric', day: 'numeric' }
  )} ${createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

  // ── Standard POS Thermal Paper Roll (80mm / 58mm) Direct Iframe Print Handler ──
  const handlePrint = useCallback(() => {
    if (!activeSale) return
    sound.playClick()
    const targetWidth = paperWidth === '58mm' ? '58mm' : '80mm'
    const wrapWidth = paperWidth === '58mm' ? '54mm' : '76mm'
    const is58 = paperWidth === '58mm'
    const fontBase = is58 ? '10px' : '11.5px'
    const fontSmall = is58 ? '8.5px' : '9.5px'
    const fontXs = is58 ? '7.5px' : '8.5px'
    const storeTitleSize = is58 ? '13px' : '15px'

    let iframe = document.getElementById('sales-receipt-print-iframe') as HTMLIFrameElement
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.id = 'sales-receipt-print-iframe'
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

    const paymentText = getPaymentMethodDisplay(activeSale.paymentMethod || activeSale.payment_method)

    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html lang="${i18n.language || 'km'}">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Receipt - ${activeSale.invoice_number}</title>
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
              font-size: ${fontBase};
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
              max-height: ${is58 ? '36px' : '44px'};
              max-width: ${is58 ? '110px' : '130px'};
              margin: 0 auto;
              display: block;
              object-fit: contain;
            }
            .store-title {
              font-size: ${storeTitleSize};
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: -0.01em;
              line-height: 1.2;
              color: #000000;
            }
            .company-subtitle {
              font-size: ${fontSmall};
              font-weight: 700;
              color: #1e293b;
              margin-top: 1px;
            }
            .contact-text {
              font-size: ${fontSmall};
              color: #475569;
              margin-top: 2px;
              line-height: 1.25;
            }
            .header-slogan {
              font-size: ${fontSmall};
              font-weight: 700;
              color: #334155;
              margin-top: 3px;
            }

            .meta-grid {
              display: flex;
              justify-content: space-between;
              font-size: ${fontSmall};
              line-height: 1.4;
            }
            .meta-col {
              flex: 1;
            }
            .meta-label {
              font-size: ${fontXs};
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
              font-size: ${fontSmall};
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
              font-size: ${fontBase};
              font-weight: 700;
              color: #000000;
              line-height: 1.25;
            }
            .item-sub {
              font-size: ${fontXs};
              color: #64748b;
              font-family: ui-monospace, SFMono-Regular, monospace;
            }
            .item-calc {
              display: flex;
              justify-content: space-between;
              font-size: ${fontSmall};
              margin-top: 1px;
            }

            .calc-row {
              display: flex;
              justify-content: space-between;
              font-size: ${fontSmall};
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
              font-size: ${is58 ? '11px' : '13px'};
              font-weight: 900;
              text-transform: uppercase;
              color: #000000;
            }
            .grand-total-val {
              font-size: ${is58 ? '14px' : '17px'};
              font-weight: 900;
              font-family: ui-monospace, SFMono-Regular, monospace;
              color: #000000;
              line-height: 1;
            }
            .khr-val {
              font-size: ${is58 ? '10px' : '11.5px'};
              font-weight: 800;
              font-family: ui-monospace, SFMono-Regular, monospace;
              color: #334155;
            }

            .barcode-wrap {
              text-align: center;
              margin: 6px 0 3px 0;
            }
            .barcode-svg {
              width: ${is58 ? '130px' : '160px'};
              height: 26px;
              margin: 0 auto;
              display: block;
            }
            .barcode-text {
              font-family: ui-monospace, SFMono-Regular, monospace;
              font-size: 8px;
              font-weight: 700;
              letter-spacing: 0.12em;
              color: #334155;
              margin-top: 1px;
            }
            .footer-msg {
              font-size: ${fontSmall};
              font-weight: 700;
              color: #1e293b;
              margin-top: 3px;
              line-height: 1.3;
            }
            .notes-msg {
              font-size: ${fontXs};
              color: #64748b;
              font-style: italic;
              margin-top: 2px;
            }
            .website-text {
              font-size: ${fontXs};
              color: #94a3b8;
              font-family: monospace;
              margin-top: 2px;
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
            <!-- 1. Header & Branding from Database -->
            <div class="text-center">
              ${logoLoaded && logoUrl ? `
                <div class="logo-box">
                  <img src="${logoUrl}" alt="${storeName}" class="logo-img" />
                </div>
              ` : ''}
              
              <div class="store-title">${storeName}</div>
              ${activeSale.company?.name && activeSale.company.name !== storeName ? `
                <div class="company-subtitle">${activeSale.company.name}</div>
              ` : ''}
              
              ${taxNumber ? `
                <div style="font-size: ${fontSmall}; font-weight: 700; color: #1e293b; margin-top: 2px;">
                  ${t('receiptTaxNumber', 'Tax ID (VATTIN)')}: <span>${taxNumber}</span>
                </div>
              ` : ''}

              <div class="contact-text">
                ${storeAddress ? `<div>${storeAddress}</div>` : ''}
                ${storePhone ? `<div>${t('tel', 'Tel')}: <strong>${storePhone}</strong></div>` : ''}
              </div>

              ${receiptHeaderMsg ? `<div class="header-slogan italic">« ${receiptHeaderMsg} »</div>` : ''}
            </div>

            <div class="dashed-line"></div>

            <!-- 2. Transaction Metadata -->
            <div class="meta-grid">
              <div class="meta-col">
                <span class="meta-label">${t('receiptInvoice', 'Invoice')}</span>
                <span class="meta-val font-mono">#${activeSale.invoice_number}</span>
                <div style="margin-top: 3px;">
                  <span class="meta-label">${t('receiptCashier', 'Cashier')}</span>
                  <span class="meta-val">${cashierName}</span>
                </div>
              </div>
              <div class="meta-col text-right">
                <span class="meta-label">${t('receiptDate', 'Date')}</span>
                <span class="meta-val font-mono" style="font-size: 10px;">${formattedDateTime}</span>
                <div style="margin-top: 3px;">
                  <span class="meta-label">${t('receiptCustomer', 'Customer')}</span>
                  <span class="meta-val">${customerName ? (customerPhone ? `${customerName} (${customerPhone})` : customerName) : t('walkInCustomer', 'Walk-in Customer')}</span>
                </div>
              </div>
            </div>

            ${customerTaxNumber ? `
              <div style="font-size: 9px; display: flex; justify-content: space-between; margin-top: 2px;">
                <span style="color: #64748b;">${t('receiptCustomerTaxNumber', 'Customer Tax ID')}:</span>
                <span class="font-bold">${customerTaxNumber}</span>
              </div>
            ` : ''}

            <div style="font-size: ${fontSmall}; display: flex; justify-content: space-between; margin-top: 3px;">
              <span style="color: #64748b;">${t('receiptPayment', 'Payment Method')}:</span>
              <span class="font-bold uppercase">${paymentText}</span>
            </div>

            <div class="dashed-line"></div>

            <!-- 3. Items List -->
            <div>
              <div class="items-header">
                <span style="flex: 6;">${t('receiptItem', 'Item')}</span>
                <span style="flex: 2; text-align: center;">${t('receiptQty', 'Qty')}</span>
                <span style="flex: 4; text-align: right;">${t('receiptTotal', 'Total ($)')}</span>
              </div>

              ${itemsList.map((item, index) => {
                const name = item.product_name || item.product?.name || (item as any)?.name || `Item #${index + 1}`
                const qty = item.quantity || (item as any)?.qty || 1
                const price = Number(item.unit_price || (item as any)?.price || 0)
                const total = Number(item.total || item.subtotal || qty * price)
                const sku = item.sku || item.variant?.sku || ''

                return `
                  <div class="item-row">
                    <div class="item-main">${name}</div>
                    ${sku ? `<div class="item-sub">${sku}</div>` : ''}
                    <div class="item-calc">
                      <span class="font-mono" style="color: #64748b;">${Math.round(qty)} x $${price.toFixed(2)}</span>
                      <span class="font-mono font-bold" style="color: #0f172a;">$${total.toFixed(2)}</span>
                    </div>
                  </div>
                `
              }).join('')}

              ${itemsList.length === 0 ? `
                <div style="text-align: center; color: #94a3b8; font-size: 10px; padding: 4px 0;">
                  ${t('noItemsListed', 'No items listed')}
                </div>
              ` : ''}
            </div>

            <div class="dashed-line"></div>

            <!-- 4. Calculation Summary -->
            <div>
              <div class="calc-row">
                <span>${t('receiptSubtotal', 'Subtotal')}</span>
                <span class="font-mono">$${subtotalUSD.toFixed(2)}</span>
              </div>
              
              ${discountUSD > 0 ? `
                <div class="calc-row font-bold" style="color: #e11d48;">
                  <span>${t('receiptDiscount', 'Discount')}</span>
                  <span class="font-mono">-$${discountUSD.toFixed(2)}</span>
                </div>
              ` : ''}

              ${taxUSD > 0 ? `
                <div class="calc-row">
                  <span>${t('receiptTax', 'Tax (VAT)')}</span>
                  <span class="font-mono">$${taxUSD.toFixed(2)}</span>
                </div>
              ` : ''}

              <!-- Grand Total -->
              <div class="double-line">
                <div class="grand-total-box">
                  <div>
                    <div class="grand-total-label">${t('receiptGrandTotal', 'GRAND TOTAL')}</div>
                    <div style="font-size: 8.5px; color: #64748b; font-family: monospace;">(Rate: 1$ = 4,100 ៛)</div>
                  </div>
                  <div class="text-right">
                    <div class="grand-total-val">$${grandTotalUSD.toFixed(2)}</div>
                    <div class="khr-val">៛ ${grandTotalKHR.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div class="dashed-line"></div>

              <!-- Payment Method & Tendered -->
              <div class="calc-row">
                <span>${t('receiptCashReceived', 'Cash Received')}:</span>
                <span class="font-mono font-bold">$${paidUSD.toFixed(2)}</span>
              </div>

              ${changeUSD > 0 ? `
                <div class="calc-row font-bold">
                  <span>${t('receiptChangeDue', 'Change Due')}:</span>
                  <span class="font-mono">$${changeUSD.toFixed(2)} (៛ ${changeKHR.toLocaleString()})</span>
                </div>
              ` : ''}

              <div class="calc-row" style="font-size: 8.5px; color: #64748b;">
                <span>${t('receiptExchangeRate', 'Exchange Rate')}:</span>
                <span>$1 = ៛ ${KHR_RATE.toLocaleString()}</span>
              </div>
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
                <div class="barcode-text">*${activeSale.invoice_number}*</div>
              </div>

              <div class="footer-msg">${receiptFooterMsg}</div>
              ${notes ? `<div class="notes-msg">${t('notes', 'Note')}: ${notes}</div>` : ''}
              ${companyWebsite ? `<div class="website-text">${companyWebsite.replace(/^https?:\/\//, '')}</div>` : ''}

              <div class="system-tag">
                <span>${storeName}</span>
                <span>${formattedDateTime}</span>
              </div>
            </div>

          </div>
        </body>
      </html>
    `)
    doc.close()

    setTimeout(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    }, 250)
  }, [
    paperWidth,
    activeSale,
    cashierName,
    customerName,
    customerPhone,
    formattedDateTime,
    grandTotalUSD,
    grandTotalKHR,
    paidUSD,
    changeUSD,
    changeKHR,
    subtotalUSD,
    discountUSD,
    taxUSD,
    itemsList,
    logoLoaded,
    logoUrl,
    storeName,
    taxNumber,
    storeAddress,
    storePhone,
    receiptHeaderMsg,
    receiptFooterMsg,
    notes,
    companyWebsite,
    i18n.language,
    t,
  ])

  // Synchronize body class for thermal print isolation and intercept Cmd+P / Ctrl+P
  useEffect(() => {
    if (!isOpen) return

    document.body.classList.add('has-thermal-receipt')

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        handlePrint()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.classList.remove('has-thermal-receipt')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handlePrint])

  if (!isOpen || !sale || !activeSale) return null

  return (
    <GlobalPrintContainer
      isOpen={isOpen}
      onClose={onClose}
      onPrint={handlePrint}
      modalTitle={t('thermalReceipt', 'POS Thermal Receipt')}
      documentSubtitle={`#${activeSale.invoice_number}`}
      layout="modal"
      width="max-w-md"
      actionsPosition="bottom"
      contentClassName="p-4 sm:p-5 bg-muted/10 print:p-0"
      printButtonText={t('printThisReceipt', 'Print this Invoice')}
      closeButtonText={t('close', 'Close')}
      icon={<Receipt className="h-4.5 w-4.5 text-primary shrink-0" />}
    >
      {/* Thermal Receipt Simulation Container */}
      <div
        ref={printRef}
        className={`w-full ${
          paperWidth === '58mm' ? 'max-w-[270px] p-3.5 sm:p-4 text-[10px]' : 'max-w-[340px] p-5 text-[11px]'
        } mx-auto bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 rounded-xl border border-zinc-200/80 shadow-sm print:border-0 print:shadow-none print:p-0 print:max-w-none print:w-full font-mono leading-relaxed selection:bg-zinc-200 transition-all duration-200`}
      >
            {/* Header: Store Branding & Official Tax Information from Database */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-zinc-300">
              {logoLoaded && logoUrl ? (
                <div className="flex items-center justify-center mx-auto mb-1.5">
                  <img
                    src={logoUrl}
                    alt={storeName}
                    className="max-h-12 w-auto max-w-[140px] object-contain block"
                    onError={() => setLogoLoaded(false)}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 mx-auto rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold mb-1 shadow-xs print:border print:border-black">
                  <Store size={20} />
                </div>
              )}

              <h2 className="font-extrabold text-sm tracking-tight text-zinc-900 uppercase">
                {storeName}
              </h2>

              {/* VATTIN / Tax Number from Database */}
              {taxNumber && (
                <p className="text-[10px] font-semibold text-zinc-800">
                  {t('receiptTaxNumber', 'Tax ID (VATTIN)')}: <span className="font-bold">{taxNumber}</span>
                </p>
              )}

              {storeAddress && (
                <p className="text-[10px] text-zinc-600 leading-tight">
                  {storeAddress}
                </p>
              )}

              {storePhone && (
                <p className="text-[10px] text-zinc-600">
                  {t('tel', 'Tel')}: {storePhone}
                </p>
              )}

              {/* Real Receipt Header Slogan from Database (pos_receipt_header) */}
              {receiptHeaderMsg && (
                <div className="pt-1 text-[9.5px] font-bold text-zinc-700 italic">
                  « {receiptHeaderMsg} »
                </div>
              )}
            </div>

            {/* Receipt Meta (Invoice #, Date, Cashier, Customer, Payment) */}
            <div className="py-2.5 space-y-1 text-[10px] border-b border-dashed border-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">{t('receiptInvoice', 'Invoice')}:</span>
                <span className="font-bold text-zinc-900">#{activeSale.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">{t('receiptDate', 'Date')}:</span>
                <span>{formattedDateTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">{t('receiptCashier', 'Cashier')}:</span>
                <span className="font-medium text-zinc-900">{cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">{t('receiptCustomer', 'Customer')}:</span>
                <span className="font-medium text-zinc-900">
                  {customerName ? (
                    customerPhone ? `${customerName} (${customerPhone})` : customerName
                  ) : (
                    t('walkInCustomer', 'Walk-in Customer')
                  )}
                </span>
              </div>
              {customerTaxNumber && (
                <div className="flex justify-between text-[9px]">
                  <span className="text-zinc-500 font-sans">{t('receiptCustomerTaxNumber', 'Customer Tax ID')}:</span>
                  <span className="font-semibold text-zinc-800">{customerTaxNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">{t('receiptPayment', 'Payment Method')}:</span>
                <span className="font-bold uppercase text-zinc-900">
                  {getPaymentMethodDisplay(activeSale.paymentMethod || activeSale.payment_method)}
                </span>
              </div>
            </div>

            {/* Items Header */}
            <div className={`pt-2 pb-1 ${paperWidth === '58mm' ? 'text-[9px]' : 'text-[10px]'} uppercase font-bold text-zinc-700 flex justify-between border-b border-zinc-300`}>
              <span className="flex-1">{t('receiptItem', 'Item')}</span>
              <span className={`${paperWidth === '58mm' ? 'w-6' : 'w-10'} text-center`}>{t('receiptQty', 'Qty')}</span>
              <span className={`${paperWidth === '58mm' ? 'w-11' : 'w-14'} text-right`}>{t('receiptPrice', 'Price')}</span>
              <span className={`${paperWidth === '58mm' ? 'w-11' : 'w-14'} text-right`}>{t('receiptTotal', 'Total')}</span>
            </div>

            {/* Items List */}
            <div className="py-1.5 space-y-2 border-b border-dashed border-zinc-300">
              {itemsList.map((item, index) => {
                const name =
                  item.product_name ||
                  item.product?.name ||
                  (item as any)?.name ||
                  `Item #${index + 1}`
                const qty = item.quantity || (item as any)?.qty || 1
                const price = Number(item.unit_price || (item as any)?.price || 0)
                const total = Number(item.total || item.subtotal || qty * price)

                return (
                  <div key={item.id || index} className={`${paperWidth === '58mm' ? 'text-[9.5px]' : 'text-[10px]'} leading-tight`}>
                    <div className="font-semibold text-zinc-900 break-words">{name}</div>
                    <div className="flex justify-between text-zinc-600">
                      <span className="text-[9px] text-zinc-500">
                        {item.sku || item.variant?.sku || `SKU-${index + 1}`}
                      </span>
                      <div className="flex gap-1 text-right">
                        <span className={`${paperWidth === '58mm' ? 'w-6' : 'w-10'} text-center font-bold text-zinc-800`}>
                          {Math.round(qty)}
                        </span>
                        <span className={`${paperWidth === '58mm' ? 'w-11' : 'w-14'} text-right`}>${price.toFixed(2)}</span>
                        <span className={`${paperWidth === '58mm' ? 'w-11' : 'w-14'} text-right font-bold text-zinc-900`}>
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {itemsList.length === 0 && (
                <div className="py-2 text-center text-zinc-400 text-[10px]">
                  {t('noItemsListed', 'No items listed')}
                </div>
              )}
            </div>

            {/* Totals & Financial Breakdown */}
            <div className="py-2.5 space-y-1 text-[10px] border-b border-dashed border-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">{t('receiptSubtotal', 'Subtotal')}:</span>
                <span>${subtotalUSD.toFixed(2)}</span>
              </div>
              {discountUSD > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span className="font-sans">{t('receiptDiscount', 'Discount')}:</span>
                  <span>-${discountUSD.toFixed(2)}</span>
                </div>
              )}
              {taxUSD > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-sans">{t('receiptTax', 'Tax (VAT)')}:</span>
                  <span>${taxUSD.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-zinc-200 text-xs font-black text-zinc-950">
                <span className="font-sans">{t('receiptGrandTotal', 'GRAND TOTAL')}:</span>
                <span>${grandTotalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-zinc-900">
                <span className="font-sans">{t('receiptTotalKhr', 'Total in KHR')}:</span>
                <span>៛ {grandTotalKHR.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment & Change breakdown */}
            <div className="py-2 space-y-1 text-[10px] border-b border-dashed border-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">{t('receiptCashReceived', 'Cash Received')}:</span>
                <span className="font-semibold">${paidUSD.toFixed(2)}</span>
              </div>
              {changeUSD > 0 && (
                <div className="flex justify-between text-zinc-900 font-bold">
                  <span className="font-sans">{t('receiptChangeDue', 'Change Due')}:</span>
                  <span>${changeUSD.toFixed(2)} (៛ {changeKHR.toLocaleString()})</span>
                </div>
              )}
              <div className="flex justify-between text-[9px] text-zinc-500 pt-0.5">
                <span>{t('receiptExchangeRate', 'Exchange Rate')}:</span>
                <span>$1 = ៛ {KHR_RATE.toLocaleString()}</span>
              </div>
            </div>

            {/* Barcode & Real Footer Policy / Notes / Website from Database */}
            <div className="pt-2.5 text-center space-y-1.5">
              <div className="inline-block p-1 bg-white border border-zinc-200 rounded-md">
                <svg className="w-40 h-6 mx-auto text-zinc-900" viewBox="0 0 160 30" fill="currentColor">
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
                <div className="text-[8px] text-zinc-500 font-mono tracking-wider font-bold">
                  *{activeSale.invoice_number}*
                </div>
              </div>

              <div className="space-y-0.5">
                {/* Real Footer Notice / Policy from Database (pos_receipt_footer) */}
                <p className="text-[10px] font-bold text-zinc-900 leading-snug">
                  {receiptFooterMsg}
                </p>

                {/* Transaction Notes from Database */}
                {notes && (
                  <p className="text-[9px] text-zinc-500 italic">
                    {t('notes', 'Note')}: {notes}
                  </p>
                )}

                {/* Company Website / Domain from Database */}
                {companyWebsite && (
                  <p className="text-[8.5px] text-zinc-400 font-mono pt-0.5">
                    {companyWebsite.replace(/^https?:\/\//, '')}
                  </p>
                )}
              </div>

              {/* Printed Watermark & Timestamp */}
              <div className="pt-1.5 text-[8px] font-mono text-zinc-400 border-t border-zinc-100 flex items-center justify-between">
                <span>{storeName}</span>
                <span>{formattedDateTime}</span>
              </div>
            </div>
          </div>
        </GlobalPrintContainer>
      )
    }

export default SalesReceiptModal
