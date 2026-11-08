import React, { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Barcode, Layers, Sliders, Printer, CheckSquare, Square, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ModalHeader } from '@/components/common/ModalHeader'
import type { Product } from '../types/productsPage.types'

interface ProductBarcodePrintModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  formatCurrency: (val: number) => string
}

export type PrintTemplateType = 'a4_3cols' | 'a4_2cols' | 'a4_4cols' | 'thermal_roll'

export const ProductBarcodePrintModal: React.FC<ProductBarcodePrintModalProps> = ({
  isOpen,
  onClose,
  product,
  formatCurrency,
}) => {
  const { t } = useTranslation(['products', 'common'])
  const [selectedVariantId, setSelectedVariantId] = useState<string | number>('main')
  const [template, setTemplate] = useState<PrintTemplateType>('a4_3cols')
  const [printCopies, setPrintCopies] = useState<number>(6)
  const [showStoreName, setShowStoreName] = useState<boolean>(true)
  const [showProductName, setShowProductName] = useState<boolean>(true)
  const [showSku, setShowSku] = useState<boolean>(true)
  const [showPrice, setShowPrice] = useState<boolean>(true)
  const [showBarcodeText, setShowBarcodeText] = useState<boolean>(true)

  // Target item calculation
  const printTargetItem = useMemo(() => {
    if (!product) return null
    if (selectedVariantId !== 'main' && product.variants && product.variants.length > 0) {
      const variant = product.variants.find((v: any) => String(v.id) === String(selectedVariantId))
      if (variant) {
        return {
          name: `${product.name} (${variant.name})`,
          sku: variant.sku || product.sku,
          barcode: variant.barcode || product.barcode || variant.sku || '8880000000001',
          price: Number(variant.selling_price || product.selling_price || 0),
          stock: Number(variant.stock || 0),
        }
      }
    }
    return {
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || product.sku || '8880000000001',
      price: Number(product.selling_price || 0),
      stock: Number(product.stock ?? (product as any)?.total_stock ?? 0),
    }
  }, [product, selectedVariantId])

  // Handle ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const executeBarcodePrint = () => {
    if (!printTargetItem) return

    const copies = Math.max(1, Math.min(300, printCopies))
    const formattedPrice = formatCurrency(printTargetItem.price)
    const storeName = 'ENTERPRISE POS'

    // Individual label inner content
    const singleLabelHtml = `
      <div class="label-card">
        ${showStoreName ? `<div class="store-name">${storeName}</div>` : ''}
        ${showProductName ? `<div class="prod-name">${printTargetItem.name}</div>` : ''}
        ${showSku ? `<div class="sku-code">SKU: ${printTargetItem.sku}</div>` : ''}
        
        <div class="barcode-box">
          <div class="barcode-bars">
            <span class="b2"></span><span class="b1"></span><span class="b1"></span><span class="b3"></span>
            <span class="b1"></span><span class="b2"></span><span class="b4"></span><span class="b1"></span>
            <span class="b3"></span><span class="b1"></span><span class="b2"></span><span class="b1"></span>
            <span class="b4"></span><span class="b2"></span><span class="b1"></span><span class="b3"></span>
            <span class="b1"></span><span class="b2"></span><span class="b1"></span><span class="b4"></span>
            <span class="b2"></span><span class="b1"></span><span class="b3"></span><span class="b1"></span>
          </div>
          ${showBarcodeText ? `<div class="barcode-digits">${printTargetItem.barcode}</div>` : ''}
        </div>

        ${showPrice ? `<div class="price-tag">${formattedPrice}</div>` : ''}
      </div>
    `

    let pageCss = ''
    let bodyContent = ''

    if (template === 'thermal_roll') {
      // 1-by-1 Continuous Roll Mode
      pageCss = `
        @page {
          size: 50mm 30mm;
          margin: 0mm;
        }
        html, body {
          width: 50mm;
          height: 30mm;
          margin: 0;
          padding: 0;
          background: #fff;
        }
        .roll-page {
          width: 50mm;
          height: 30mm;
          page-break-after: always;
          break-after: page;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          padding: 1.5mm;
          overflow: hidden;
        }
        .label-card {
          width: 47mm;
          height: 27mm;
          border: 1px dashed #aaa;
          border-radius: 3px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-sizing: border-box;
          padding: 1mm;
          overflow: hidden;
        }
        .store-name { font-size: 7.5px; font-weight: 800; text-transform: uppercase; color: #444; margin-bottom: 0.5px; }
        .prod-name { font-size: 9px; font-weight: 800; line-height: 1.1; max-height: 20px; overflow: hidden; color: #000; }
        .sku-code { font-size: 8px; font-family: monospace; font-weight: 700; color: #222; margin: 0.5px 0; }
        .barcode-bars { height: 18px; display: flex; align-items: center; justify-content: center; gap: 1.2px; margin: 0.5px 0; }
        .barcode-digits { font-family: monospace; font-size: 7.5px; font-weight: 700; letter-spacing: 1px; }
        .price-tag { font-size: 11px; font-weight: 900; color: #000; margin-top: 0.5px; }
      `
      bodyContent = Array.from({ length: copies }).map(() => `<div class="roll-page">${singleLabelHtml}</div>`).join('')
    } else {
      // Multi-Label Compact A4 Grid Mode (Fills the page with multiple stickers)
      let labelWidth = 'calc((100% - 5mm) / 3)' // 3 columns default
      let labelHeight = '29.5mm'
      let nameSize = '9px'
      let priceSize = '11px'
      let barHeight = '17px'

      if (template === 'a4_2cols') {
        labelWidth = 'calc((100% - 3mm) / 2)' // 2 columns
        labelHeight = '42mm'
        nameSize = '11.5px'
        priceSize = '14px'
        barHeight = '28px'
      } else if (template === 'a4_4cols') {
        labelWidth = 'calc((100% - 7.5mm) / 4)' // 4 columns
        labelHeight = '21.5mm'
        nameSize = '7.5px'
        priceSize = '9px'
        barHeight = '13px'
      }

      pageCss = `
        @page {
          size: A4 portrait;
          margin: 8mm 6mm;
        }
        html, body {
          width: 100%;
          margin: 0;
          padding: 0;
          background: #fff;
        }
        .labels-grid {
          display: flex;
          flex-wrap: wrap;
          align-content: flex-start;
          gap: 2.5mm;
          width: 100%;
        }
        .label-card {
          width: ${labelWidth};
          height: ${labelHeight};
          box-sizing: border-box;
          border: 1px dashed #bbb;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 1.5mm;
          overflow: hidden;
          page-break-inside: avoid;
          break-inside: avoid;
          background: #fff;
        }
        .store-name { font-size: 7px; font-weight: 800; text-transform: uppercase; color: #555; }
        .prod-name { font-size: ${nameSize}; font-weight: 800; line-height: 1.1; max-height: 22px; overflow: hidden; color: #000; }
        .sku-code { font-size: 7.5px; font-family: monospace; font-weight: 700; color: #222; }
        .barcode-bars { height: ${barHeight}; display: flex; align-items: center; justify-content: center; gap: 1.2px; margin: 0.5px 0; }
        .barcode-digits { font-family: monospace; font-size: 7.5px; font-weight: 700; letter-spacing: 1px; }
        .price-tag { font-size: ${priceSize}; font-weight: 900; color: #000; }
      `
      bodyContent = `<div class="labels-grid">${Array.from({ length: copies }).map(() => singleLabelHtml).join('')}</div>`
    }

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${t('printBarcodeLabels', 'Print Barcode Labels')} - ${printTargetItem.sku}</title>
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #000;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .b1 { width: 1.2px; height: 100%; background: #000; display: inline-block; }
            .b2 { width: 2.2px; height: 100%; background: #000; display: inline-block; }
            .b3 { width: 3.4px; height: 100%; background: #000; display: inline-block; }
            .b4 { width: 4.6px; height: 100%; background: #000; display: inline-block; }
            ${pageCss}
          </style>
        </head>
        <body>
          ${bodyContent}
        </body>
      </html>
    `

    let iframe = document.getElementById('barcode-print-iframe') as HTMLIFrameElement
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.id = 'barcode-print-iframe'
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      document.body.appendChild(iframe)
    }

    const doc = iframe.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(fullHtml)
      doc.close()
      setTimeout(() => {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      }, 250)
    }
  }

  if (!isOpen || !product || !printTargetItem) return null

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-card max-w-2xl w-full rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Standardized Global Modal Header */}
          <ModalHeader
            title={t('barcodePrintCenter', 'Barcode & Label Print Center')}
            subtitle={`${printTargetItem.name} • ${printTargetItem.sku}`}
            icon={<Barcode size={20} />}
            iconVariant="blue"
            onClose={onClose}
          />

          {/* Modal Body - 2 Columns */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
            {/* Left Controls Column (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              {/* Variant Selection if available */}
              {product?.variants && product.variants.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Layers size={13} className="text-primary" />
                    <span>{t('selectVariant', 'Select Variant / Model')}</span>
                  </label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary/30 outline-none cursor-pointer"
                  >
                    <option value="main">{t('mainProductDefault', 'Main Product')}</option>
                    {product.variants.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.name} — {v.sku || product.sku} ({formatCurrency(Number(v.selling_price || product.selling_price || 0))})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Paper Layout / Template Picker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sliders size={13} className="text-primary" />
                    <span>{t('labelSize', 'Paper Size / Template')}</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'a4_3cols', label: t('template_a4_3cols', 'A4 Sheet (3 Cols — Full Sheet)'), desc: t('desc_a4_3cols', 'Standard 50×30 mm (27 labels/sheet)') },
                    { id: 'a4_2cols', label: t('template_a4_2cols', 'A4 Sheet (2 Cols — Large Labels)'), desc: t('desc_a4_2cols', 'Shelf Label 70×40 mm (12 labels/sheet)') },
                    { id: 'a4_4cols', label: t('template_a4_4cols', 'A4 Sheet (4 Cols — Small Labels)'), desc: t('desc_a4_4cols', 'Jewelry/Small 40×20 mm (48 labels/sheet)') },
                    { id: 'thermal_roll', label: t('template_thermal_roll', 'Thermal Roll (1 Label/Page)'), desc: t('desc_thermal_roll', 'For thermal printers (Xprinter/Zebra)') },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTemplate(item.id as PrintTemplateType)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        template === item.id
                          ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20 shadow-2xs'
                          : 'bg-card border-border text-foreground hover:bg-muted/70'
                      }`}
                    >
                      <p className="text-xs font-bold leading-tight line-clamp-1">{item.label}</p>
                      <span className="text-[10px] text-muted-foreground line-clamp-1">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Print Copies */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">{t('printCopies', 'Print Copies')}</label>
                  <button
                    type="button"
                    onClick={() => setPrintCopies(printTargetItem.stock || 1)}
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    {t('matchStockQty', 'Match Current Stock')} ({printTargetItem.stock})
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center rounded-xl bg-card border border-border overflow-hidden shrink-0 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setPrintCopies(Math.max(1, printCopies - 1))}
                      className="px-3 py-2 hover:bg-muted text-foreground font-bold text-sm cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={printCopies}
                      onChange={(e) => setPrintCopies(Math.max(1, Math.min(300, Number(e.target.value) || 1)))}
                      className="w-14 text-center text-xs font-black bg-transparent text-foreground outline-none py-2"
                    />
                    <button
                      type="button"
                      onClick={() => setPrintCopies(Math.min(300, printCopies + 1))}
                      className="px-3 py-2 hover:bg-muted text-foreground font-bold text-sm cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[6, 12, 24, 48, 100].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setPrintCopies(qty)}
                        className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                          printCopies === qty ? 'bg-primary text-white border-primary shadow-2xs' : 'bg-card border-border hover:bg-muted text-foreground'
                        }`}
                      >
                        {qty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Toggles */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <label className="text-xs font-bold text-foreground block">{t('displayElementsOnSticker', 'Label Display Elements')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowStoreName(!showStoreName)}
                    className="flex items-center gap-2 text-left p-2 rounded-xl hover:bg-muted text-foreground cursor-pointer transition-colors border border-transparent hover:border-border/60"
                  >
                    {showStoreName ? <CheckSquare size={16} className="text-primary shrink-0" /> : <Square size={16} className="text-muted-foreground shrink-0" />}
                    <span>{t('showStoreName', 'Show Store Name')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowProductName(!showProductName)}
                    className="flex items-center gap-2 text-left p-2 rounded-xl hover:bg-muted text-foreground cursor-pointer transition-colors border border-transparent hover:border-border/60"
                  >
                    {showProductName ? <CheckSquare size={16} className="text-primary shrink-0" /> : <Square size={16} className="text-muted-foreground shrink-0" />}
                    <span>{t('showProductName', 'Show Product Name')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSku(!showSku)}
                    className="flex items-center gap-2 text-left p-2 rounded-xl hover:bg-muted text-foreground cursor-pointer transition-colors border border-transparent hover:border-border/60"
                  >
                    {showSku ? <CheckSquare size={16} className="text-primary shrink-0" /> : <Square size={16} className="text-muted-foreground shrink-0" />}
                    <span>{t('showSku', 'Show SKU Code')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPrice(!showPrice)}
                    className="flex items-center gap-2 text-left p-2 rounded-xl hover:bg-muted text-foreground cursor-pointer transition-colors border border-transparent hover:border-border/60"
                  >
                    {showPrice ? <CheckSquare size={16} className="text-primary shrink-0" /> : <Square size={16} className="text-muted-foreground shrink-0" />}
                    <span>{t('showPrice', 'Show Selling Price')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Preview Column (5 cols) */}
            <div className="md:col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-4">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                  {t('liveLabelPreview', 'Real-time Label Preview')}
                </span>

                {/* Realistic Label Card */}
                <div className="bg-white text-black p-4 rounded-xl border-2 border-dashed border-zinc-400 shadow-md text-center space-y-1.5 max-w-[240px] mx-auto transition-all">
                  {showStoreName && (
                    <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">ENTERPRISE POS</p>
                  )}
                  
                  {showProductName && (
                    <p className="text-xs font-black uppercase leading-tight line-clamp-2 text-black">{printTargetItem.name}</p>
                  )}

                  {showSku && (
                    <p className="text-[10px] font-mono font-bold text-zinc-700">SKU: {printTargetItem.sku}</p>
                  )}

                  {/* Barcode Visual Stripes */}
                  <div className="py-1.5 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-[2px] h-10 w-44 mx-auto">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-full ${
                            i % 4 === 0 || i % 7 === 0 || i % 11 === 0 ? 'w-[3px] bg-black' : (i % 2 === 0 ? 'w-[1.5px] bg-black' : 'w-[1px] bg-transparent')
                          }`}
                        />
                      ))}
                    </div>
                    {showBarcodeText && (
                      <span className="font-mono text-[10px] font-bold tracking-widest mt-1 text-black">
                        {printTargetItem.barcode}
                      </span>
                    )}
                  </div>

                  {showPrice && (
                    <p className="text-sm font-black text-black pt-1 border-t border-zinc-200">
                      {formatCurrency(printTargetItem.price)}
                    </p>
                  )}
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-primary/5 border border-primary/15 text-[11px] text-muted-foreground flex items-center gap-2">
                  <Info size={14} className="text-primary shrink-0" />
                  <span>
                    {template === 'thermal_roll'
                      ? t('thermalRollNotice', 'Prints 1 continuous label per page for thermal roll printers')
                      : t('a4GridNotice', 'Automatically arranges {{count}} labels across A4 sheets', { count: printCopies })}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={executeBarcodePrint}
                  className="w-full py-3 px-4 rounded-xl bg-primary text-white hover:opacity-90 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Printer size={16} />
                  <span>{t('printBarcodeLabels', 'Print Barcode Labels')} ({printCopies})</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer text-center transition-colors"
                >
                  {t('common.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}

export default ProductBarcodePrintModal
