import React, { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Package, Star, Edit2, Barcode, Copy, Check, Warehouse, Layers, Tag,
  ShieldCheck, TrendingUp, Eye, DollarSign, Box,
  Smartphone, Laptop, Monitor, Watch, Keyboard,
  Headphones, Camera, Zap, Footprints, Shirt,
  Calendar, Clock, Printer, Globe, Sliders, CheckSquare, Square
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { productService } from '@/services/productService'
import { getAbsoluteImageUrl, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'
import StatusBadge from '@/components/common/StatusBadge'
import {
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerBody,
  DetailDrawerFooter,
  ModalHeader,
  ActionButton,
} from '@/components/common'
import WorkspaceTabs from '@/components/shared/WorkspaceTabs'
import { formatDisplayDate } from '@/utils/formatters'
import { Image as AntImage } from 'antd'
import type { Product } from '../types/productsPage.types'
import { getDynamicColorMatchedImage } from '../ProductFormPage'

interface ProductDetailDrawerProps {
  product: Product | null
  onClose: () => void
  onEdit: (product: Product) => void
  onDuplicate?: (product: Product) => void
  onQuickStockAdjust?: (product: Product) => void
  onPrintBarcode?: (product: Product) => void
  formatCurrency: (val: number) => string
}

type TabType = 'overview' | 'variants' | 'inventory' | 'performance'
type LabelSizeType = '50x30' | '70x40' | '40x20' | 'a4'

export const ProductDetailDrawer: React.FC<ProductDetailDrawerProps> = ({
  product: initialProduct,
  onClose,
  onEdit,
  onDuplicate,
  onQuickStockAdjust,
  onPrintBarcode,
  formatCurrency,
}) => {
  const { t, i18n } = useTranslation(['products', 'common'])
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  
  // Barcode Print Center Modal State
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string | number>('main')
  const [labelSize, setLabelSize] = useState<LabelSizeType>('50x30')
  const [printCopies, setPrintCopies] = useState<number>(1)
  const [showStoreName, setShowStoreName] = useState<boolean>(true)
  const [showProductName, setShowProductName] = useState<boolean>(true)
  const [showSku, setShowSku] = useState<boolean>(true)
  const [showPrice, setShowPrice] = useState<boolean>(true)
  const [showBarcodeText, setShowBarcodeText] = useState<boolean>(true)

  // Fetch full rich product details if ID is available
  const { data: fullProduct } = useQuery({
    queryKey: ['product-detail-drawer', initialProduct?.id],
    queryFn: () => initialProduct?.id ? productService.show(initialProduct.id) : null,
    enabled: !!initialProduct?.id,
    staleTime: 1000 * 60 * 2,
  })

  // Merge full product data over initial product
  const product = fullProduct || initialProduct

  const handleCopy = (text: string, key: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Handle ESC key to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPrintModal) {
          setShowPrintModal(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, showPrintModal])

  // Category Icon & Color detector
  const categoryInfo = useMemo(() => {
    const catName = (product?.category?.name || '').toLowerCase()
    if (catName.includes('phone') || catName.includes('mobile') || catName.includes('smartphone')) {
      return { Icon: Smartphone, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' }
    }
    if (catName.includes('laptop') || catName.includes('computer') || catName.includes('macbook')) {
      return { Icon: Laptop, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' }
    }
    if (catName.includes('monitor') || catName.includes('display') || catName.includes('screen')) {
      return { Icon: Monitor, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' }
    }
    if (catName.includes('watch') || catName.includes('smartwatch')) {
      return { Icon: Watch, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' }
    }
    if (catName.includes('keyboard')) {
      return { Icon: Keyboard, color: 'text-violet-500 bg-violet-500/10 border-violet-500/20' }
    }
    if (catName.includes('headphone') || catName.includes('speaker') || catName.includes('audio') || catName.includes('sound')) {
      return { Icon: Headphones, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' }
    }
    if (catName.includes('camera') || catName.includes('lens')) {
      return { Icon: Camera, color: 'text-red-500 bg-red-500/10 border-red-500/20' }
    }
    if (catName.includes('charger') || catName.includes('power') || catName.includes('adapter')) {
      return { Icon: Zap, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' }
    }
    if (catName.includes('shoe') || catName.includes('sneaker') || catName.includes('footwear')) {
      return { Icon: Footprints, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' }
    }
    if (catName.includes('apparel') || catName.includes('clothing') || catName.includes('shirt')) {
      return { Icon: Shirt, color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' }
    }
    return { Icon: Package, color: 'text-primary bg-primary/10 border-primary/20' }
  }, [product?.category?.name])

  // Category Name Translator Helper (across 5 languages)
  const getCategoryName = (name?: string) => {
    if (!name) return t('general', 'General')
    const key = name.toLowerCase().trim()
    if (key.includes('phone') || key.includes('mobile') || key.includes('smartphone')) return t('catSmartphones', 'Smartphones')
    if (key.includes('laptop') || key.includes('computer') || key.includes('macbook')) return t('catLaptops', 'Laptops')
    if (key.includes('monitor') || key.includes('display') || key.includes('screen')) return t('catMonitors', 'Monitors')
    if (key.includes('watch') || key.includes('smartwatch')) return t('catSmartwatches', 'Smartwatches')
    if (key.includes('keyboard')) return t('catKeyboards', 'Keyboards')
    if (key.includes('headphone') || key.includes('speaker') || key.includes('audio') || key.includes('sound')) return t('catAudio', 'Audio')
    if (key.includes('camera') || key.includes('lens')) return t('catCameras', 'Cameras')
    if (key.includes('charger') || key.includes('power') || key.includes('adapter')) return t('catChargers', 'Chargers')
    if (key.includes('shoe') || key.includes('sneaker') || key.includes('footwear')) return t('catShoes', 'Shoes')
    if (key.includes('apparel') || key.includes('clothing') || key.includes('shirt')) return t('catApparel', 'Apparel')
    return name
  }

  // Unit Name Translator Helper (across 5 languages)
  const getUnitName = (unitName?: string) => {
    if (!unitName) return t('unitPiece', 'Piece')
    const u = unitName.toLowerCase().trim()
    if (u === 'piece' || u === 'pcs' || u === 'pc') return t('unitPiece', 'Piece')
    if (u === 'box') return t('unitBox', 'Box')
    if (u === 'set') return t('unitSet', 'Set')
    if (u === 'pair') return t('unitPair', 'Pair')
    if (u === 'kg' || u === 'kilogram') return t('unitKg', 'kg')
    return unitName
  }

  // Warehouse Name Translator Helper (across 5 languages)
  const getWarehouseName = (whName?: string, whId?: number) => {
    if (!whName) return `${t('warehouse', 'Warehouse')} #${whId || 1}`
    const w = whName.toLowerCase().trim()
    if (w.includes('main') || w.includes('primary') || w === 'main warehouse') return t('mainWarehouse', 'Main Warehouse')
    if (w.includes('second') || w.includes('branch') || w === 'second warehouse') return t('secondWarehouse', 'Second Warehouse')
    return whName
  }

  // Images list
  const allImages = useMemo(() => {
    if (!product) return []
    const list: string[] = []
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img: any) => {
        const url = typeof img === 'string' ? img : (img.url || img.image)
        if (url) list.push(getAbsoluteImageUrl(url) || url)
      })
    }
    if (list.length === 0) {
      const pImg = product.primary_image || (product as any).image
      if (pImg) {
        const resolved = getAbsoluteImageUrl(pImg)
        if (resolved) list.push(resolved)
      }
    }
    if (list.length === 0) {
      list.push(DEFAULT_PRODUCT_IMAGE)
    }
    return list
  }, [product])

  // Pricing & Margins
  const sellingPrice = Number(product?.selling_price || 0)
  const costPrice = Number(product?.cost_price || 0)
  const comparePrice = product?.compare_price ? Number(product.compare_price) : null
  const profit = sellingPrice > 0 && costPrice > 0 ? sellingPrice - costPrice : 0
  const marginPercent = sellingPrice > 0 && costPrice > 0 ? Math.round((profit / sellingPrice) * 100) : 0
  const discountPercent = comparePrice && comparePrice > sellingPrice ? Math.round(((comparePrice - sellingPrice) / comparePrice) * 100) : 0

  // Dimensions & Volumetric Weight
  const length = Number(product?.length || 0)
  const width = Number(product?.width || 0)
  const height = Number(product?.height || 0)
  const weight = Number(product?.weight || 0)
  const volumeCm3 = length > 0 && width > 0 && height > 0 ? (length * width * height).toLocaleString() : null
  const volumetricWeightKg = length > 0 && width > 0 && height > 0 ? ((length * width * height) / 5000).toFixed(2) : null

  // Stock status
  const totalStock = Number(product?.stock ?? (product as any)?.total_stock ?? 0)
  const isOutOfStock = totalStock <= 0
  const isLowStock = totalStock > 0 && totalStock <= (product?.low_stock_threshold || 5)

  // Target item for Barcode Print
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
          stock: Number(variant.stock || 0)
        }
      }
    }
    return {
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || product.sku || '8880000000001',
      price: sellingPrice,
      stock: totalStock
    }
  }, [product, selectedVariantId, sellingPrice, totalStock])

  // Format date helper
  const formatDate = (isoString?: string) => {
    return formatDisplayDate(isoString, { locale: i18n.language || 'en', includeTime: true, fallback: 'N/A' })
  }

  // Isolated Barcode Print Execution
  const executeBarcodePrint = () => {
    if (!printTargetItem) return

    const copies = Math.max(1, Math.min(100, printCopies))
    const formattedPrice = formatCurrency(printTargetItem.price)
    const storeName = 'ENTERPRISE POS'

    // Generate individual label HTML
    const singleLabelHtml = `
      <div class="label-card size-${labelSize}">
        ${showStoreName ? `<div class="store-name">${storeName}</div>` : ''}
        ${showProductName ? `<div class="prod-name">${printTargetItem.name}</div>` : ''}
        ${showSku ? `<div class="sku-code">SKU: ${printTargetItem.sku}</div>` : ''}
        
        <div class="barcode-box">
          <div class="barcode-bars">
            <span class="b1"></span><span class="b2"></span><span class="b1"></span><span class="b3"></span>
            <span class="b2"></span><span class="b1"></span><span class="b4"></span><span class="b2"></span>
            <span class="b1"></span><span class="b3"></span><span class="b2"></span><span class="b1"></span>
            <span class="b4"></span><span class="b2"></span><span class="b1"></span><span class="b3"></span>
            <span class="b2"></span><span class="b1"></span><span class="b2"></span><span class="b3"></span>
            <span class="b1"></span><span class="b4"></span><span class="b2"></span><span class="b1"></span>
          </div>
          ${showBarcodeText ? `<div class="barcode-digits">${printTargetItem.barcode}</div>` : ''}
        </div>

        ${showPrice ? `<div class="price-tag">${formattedPrice}</div>` : ''}
      </div>
    `

    let contentHtml = ''
    if (labelSize === 'a4') {
      contentHtml = `<div class="a4-sheet">${Array.from({ length: copies }).map(() => singleLabelHtml).join('')}</div>`
    } else {
      contentHtml = Array.from({ length: copies }).map(() => `<div class="thermal-page">${singleLabelHtml}</div>`).join('')
    }

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Barcode Labels - ${printTargetItem.sku}</title>
          <style>
            @page {
              size: auto;
              margin: 0mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background: #fff;
              color: #000;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .thermal-page {
              page-break-after: always;
              break-after: page;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2mm;
              height: 100vh;
            }
            .a4-sheet {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 4mm;
              padding: 8mm;
              width: 210mm;
              margin: 0 auto;
            }
            .label-card {
              border: 1px solid #000;
              border-radius: 4px;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: #fff;
            }
            .size-50x30 {
              width: 48mm;
              height: 28mm;
              padding: 1.5mm;
            }
            .size-70x40 {
              width: 68mm;
              height: 38mm;
              padding: 2.5mm;
            }
            .size-40x20 {
              width: 38mm;
              height: 18mm;
              padding: 1mm;
            }
            .size-a4 {
              width: 62mm;
              height: 32mm;
              padding: 2mm;
            }
            .store-name {
              font-size: 8px;
              font-weight: 800;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              margin-bottom: 1px;
              color: #333;
            }
            .prod-name {
              font-size: 9px;
              font-weight: 700;
              line-height: 1.1;
              max-height: 20px;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              margin-bottom: 2px;
            }
            .sku-code {
              font-size: 8px;
              font-family: monospace;
              font-weight: 600;
              color: #222;
              margin-bottom: 2px;
            }
            .barcode-box {
              margin: 1px 0;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .barcode-bars {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 24px;
              gap: 1.5px;
            }
            .size-70x40 .barcode-bars { height: 36px; gap: 2px; }
            .size-40x20 .barcode-bars { height: 16px; gap: 1px; }
            .b1 { width: 1.5px; height: 100%; background: #000; display: inline-block; }
            .b2 { width: 3px; height: 100%; background: #000; display: inline-block; }
            .b3 { width: 4.5px; height: 100%; background: #000; display: inline-block; }
            .b4 { width: 6px; height: 100%; background: #000; display: inline-block; }
            .barcode-digits {
              font-family: monospace;
              font-size: 8px;
              font-weight: 700;
              letter-spacing: 1.5px;
              margin-top: 1px;
            }
            .price-tag {
              font-size: 11px;
              font-weight: 900;
              margin-top: 2px;
              color: #000;
            }
            .size-70x40 .price-tag { font-size: 14px; }
            .size-40x20 .price-tag { font-size: 9px; }
          </style>
        </head>
        <body>
          ${contentHtml}
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

  if (!initialProduct) return null

  return (
    <>
      <DetailDrawer
        isOpen={!!initialProduct}
        onClose={onClose}
        size="2xl"
      >
        <DetailDrawerHeader
          title={t('productDetails', 'Product Details')}
          subtitle={`${getCategoryName(product?.category?.name)} • ${product?.brand?.name || t('unbranded', 'Unbranded')}`}
          badge={
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              #{product?.id}
            </span>
          }
          actions={
            <ActionButton
              onClick={() => {
                if (onPrintBarcode && product) {
                  onPrintBarcode(product as Product)
                } else {
                  setShowPrintModal(true)
                }
              }}
              title={t('barcodePrintCenter', 'Barcode & Label Print Center')}
              label={t('printBarcode', 'Print Label')}
              icon={<Printer size={14} />}
              variant="outline"
              size="sm"
            />
          }
          onClose={onClose}
        />

        <DetailDrawerBody>
            {/* Hero Clean Card */}
            <div className="p-5 rounded-3xl bg-muted/30 border border-border/70 shadow-2xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Product Image & Thumbnail Gallery */}
                <AntImage.PreviewGroup items={allImages}>
                  <div className="flex flex-col gap-2 shrink-0">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-card border border-border/80 flex items-center justify-center overflow-hidden relative shadow-2xs group">
                      {allImages[selectedImageIndex] ? (
                        <AntImage
                          src={allImages[selectedImageIndex]}
                          alt={product?.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          wrapperClassName="w-full h-full flex items-center justify-center cursor-pointer"
                          fallback={DEFAULT_PRODUCT_IMAGE}
                          preview={{
                            mask: (
                              <div className="flex items-center gap-1 text-[11px] font-semibold text-white drop-shadow-md">
                                <Eye size={13} />
                                <span>{t('common.view', 'Preview')}</span>
                              </div>
                            ),
                          }}
                        />
                      ) : (
                        <Package size={38} className="text-muted-foreground/40" />
                      )}

                      {product?.is_featured && (
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black flex items-center gap-0.5 shadow-xs pointer-events-none z-10">
                          <Star size={10} fill="currentColor" />
                        </span>
                      )}

                      {discountPercent > 0 && (
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-black shadow-xs pointer-events-none z-10">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>

                    {/* Thumbnail Row */}
                    {allImages.length > 1 && (
                      <div className="flex items-center gap-1.5 max-w-[128px] overflow-x-auto py-0.5">
                        {allImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`w-7 h-7 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                              selectedImageIndex === idx ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-border opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </AntImage.PreviewGroup>

                {/* Info & Badges */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    {/* Category, Status & Type Badges (Uniform Proportions) */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`h-6 px-3 rounded-full text-xs font-bold border inline-flex items-center justify-center leading-none ${categoryInfo.color}`}>
                        {getCategoryName(product?.category?.name)}
                      </span>

                      <StatusBadge
                        status={product?.status === 'active' || product?.is_active}
                        className="h-6 !px-3 !rounded-full text-xs font-bold leading-none inline-flex items-center justify-center"
                      />

                      <span className="h-6 px-3 rounded-full text-xs font-bold bg-muted/60 text-muted-foreground border border-border inline-flex items-center justify-center leading-none">
                        {product?.is_digital ? t('digitalProduct', 'Digital') : t('physicalProduct', 'Physical')}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight leading-snug break-words">
                      {product?.name}
                    </h2>

                    {/* SKU & Barcode pills */}
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <div
                        onClick={() => handleCopy(product?.sku || '', 'sku')}
                        className="group flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card hover:bg-muted border border-border/80 text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        title={t('copySku', 'Copy SKU')}
                      >
                        <span className="text-[10px] text-muted-foreground font-sans font-semibold">SKU:</span>
                        <span className="font-bold text-foreground">{product?.sku}</span>
                        {copiedKey === 'sku' ? (
                          <Check size={12} className="text-emerald-500" />
                        ) : (
                          <Copy size={11} className="opacity-40 group-hover:opacity-100" />
                        )}
                      </div>

                      {product?.barcode && (
                        <div
                          onClick={() => handleCopy(product.barcode || '', 'barcode')}
                          className="group flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card hover:bg-muted border border-border/80 text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                          title={t('copyBarcode', 'Copy Barcode')}
                        >
                          <span className="text-[10px] text-muted-foreground font-sans font-semibold">Barcode:</span>
                          <span className="font-semibold text-foreground">{product.barcode}</span>
                          {copiedKey === 'barcode' ? (
                            <Check size={12} className="text-emerald-500" />
                          ) : (
                            <Copy size={11} className="opacity-40 group-hover:opacity-100" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Banner */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-baseline gap-3 flex-wrap">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {formatCurrency(sellingPrice)}
                      </span>
                      {comparePrice && comparePrice > sellingPrice && (
                        <span className="text-sm font-semibold text-muted-foreground line-through decoration-rose-500/70">
                          {formatCurrency(comparePrice)}
                        </span>
                      )}
                    </div>

                    {costPrice > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        +{formatCurrency(profit)} ({marginPercent}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick stats 4-column row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-border/60">
                <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-2xs">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('stockLabel', 'Stock')}</p>
                  <p className={`text-sm font-black truncate mt-1 ${isOutOfStock ? 'text-rose-500' : isLowStock ? 'text-amber-500' : 'text-foreground'}`}>
                    {totalStock} <span className="text-xs font-medium text-muted-foreground">{getUnitName(product?.unit?.name)}</span>
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-2xs">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('totalSoldLabel', 'Sold')}</p>
                  <p className="text-sm font-black text-foreground truncate mt-1">
                    {product?.sold_count ?? 0} <span className="text-xs font-medium text-muted-foreground">{getUnitName(product?.unit?.name)}</span>
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-2xs">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('totalViewsLabel', 'Views')}</p>
                  <p className="text-sm font-black text-foreground truncate mt-1">
                    {(product?.view_count ?? 0).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-2xs">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('ratingLabel', 'Rating')}</p>
                  <p className="text-sm font-black text-amber-500 truncate mt-1">
                    {Number(product?.rating_avg || 5.0).toFixed(1)} <span className="text-xs font-medium text-muted-foreground">/ 5.0</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Workspace Tabs Navigation (Product Menu style) */}
            <WorkspaceTabs
              tabs={[
                { id: 'overview', label: t('tabOverview', 'Overview'), icon: Eye },
                {
                  id: 'variants',
                  label: t('tabVariants', 'Variants'),
                  count: product?.variants && product.variants.length > 0 ? product.variants.length : undefined,
                  icon: Layers,
                },
                { id: 'inventory', label: t('tabInventory', 'Warehouses'), icon: Warehouse },
                { id: 'performance', label: t('tabPerformance', 'Analytics'), icon: TrendingUp },
              ]}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as TabType)}
              size="sm"
            />

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Financial & Pricing Breakdown */}
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/70 space-y-3 shadow-2xs">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('pricingAndProfit', 'Pricing & Profit Margin')}
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-sm">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                      <p className="text-[11px] text-muted-foreground font-medium">{t('sellingPrice', 'Selling Price')}</p>
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(sellingPrice)}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                      <p className="text-[11px] text-muted-foreground font-medium">{t('costPrice', 'Cost Price')}</p>
                      <p className="text-base font-bold text-foreground mt-0.5">{costPrice > 0 ? formatCurrency(costPrice) : 'N/A'}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                      <p className="text-[11px] text-muted-foreground font-medium">{t('profitPerUnit', 'Profit / Unit')}</p>
                      <p className="text-base font-bold text-emerald-600 mt-0.5">
                        {costPrice > 0 ? `+${formatCurrency(profit)}` : 'N/A'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                      <p className="text-[11px] text-muted-foreground font-medium">{t('marginRate', 'Margin')}</p>
                      <p className="text-base font-bold text-foreground mt-0.5">
                        {costPrice > 0 ? `${marginPercent}%` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pt-1 border-t border-border/40">
                    <span>{t('taxRate', 'Tax')}: <strong className="text-foreground">{product?.tax?.name || 'VAT'} ({product?.tax?.rate || 10}%)</strong></span>
                    <span>{t('filterUnit', 'Unit')}: <strong className="text-foreground">{getUnitName(product?.unit?.name)}</strong></span>
                  </div>
                </div>

                {/* Product Specifications & Details */}
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/70 space-y-3 shadow-2xs">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('specsAndDimensions', 'Specifications & Dimensions')}
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                      <span className="text-muted-foreground font-medium">{t('packageWeight', 'Weight')}</span>
                      <p className="text-sm font-bold text-foreground mt-0.5">{weight > 0 ? `${weight} kg` : 'N/A'}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                      <span className="text-muted-foreground font-medium">{t('packageDimensions', 'Dimensions (L×W×H)')}</span>
                      <p className="text-sm font-bold text-foreground mt-0.5">
                        {length > 0 && width > 0 && height > 0 ? `${length} × ${width} × ${height} cm` : 'N/A'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                      <span className="text-muted-foreground font-medium">{t('packageVolume', 'Volume')}</span>
                      <p className="text-sm font-bold text-foreground mt-0.5">{volumeCm3 ? `${volumeCm3} cm³` : 'N/A'}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                      <span className="text-muted-foreground font-medium">{t('volumetricWeight', 'Dim Weight')}</span>
                      <p className="text-sm font-bold text-foreground mt-0.5">{volumetricWeightKg ? `${volumetricWeightKg} kg` : 'N/A'}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                      <span className="text-muted-foreground font-medium">{t('lowStockThreshold', 'Alert Threshold')}</span>
                      <p className="text-sm font-bold text-amber-600 mt-0.5">≤ {product?.low_stock_threshold || 5} {getUnitName(product?.unit?.name)}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                      <span className="text-muted-foreground font-medium">{t('inventoryTracking', 'Inventory Mode')}</span>
                      <p className="text-sm font-bold text-emerald-600 mt-0.5">
                        {product?.track_inventory ? t('trackedStock', 'Tracked') : t('untrackedStock', 'Untracked')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Descriptions */}
                {product?.description && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/70 space-y-2.5 shadow-2xs">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('description', 'Product Description')}</h4>
                    {product.short_description && (
                      <p className="text-xs font-semibold text-primary/90 bg-primary/5 p-3 rounded-xl border border-primary/15">
                        {product.short_description}
                      </p>
                    )}
                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line p-3 rounded-xl bg-muted/30 border border-border/50">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* SEO Metadata Box */}
                {(product?.meta_title || product?.meta_description || product?.slug) && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/70 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        SEO & Search Metadata
                      </h4>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">/{product.slug}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1.5">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate">
                        {product.meta_title || `${product.name} | Official Store`}
                      </p>
                      <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate">
                        https://pos.store/products/{product.slug}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {product.meta_description || product.short_description || product.description}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: VARIANTS & MODELS */}
            {activeTab === 'variants' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('variantMatrix', 'Variant Options Matrix')} ({product?.variants?.length || 0})
                  </h4>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {product?.has_variants ? t('hasVariants', 'Multi-Variant Product') : t('noVariants', 'Single Item')}
                  </span>
                </div>

                {product?.variants && product.variants.length > 0 ? (
                  <div className="space-y-2">
                    {product.variants.map((v: any, index: number) => {
                      const vStock = Number(v.stock ?? 0)
                      const vSelling = Number(v.selling_price || sellingPrice)
                      const vCost = Number(v.cost_price || costPrice)

                      return (
                        <div
                          key={v.id || index}
                          className="p-3.5 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Variant Image / Icon */}
                            <div className="w-10 h-10 rounded-xl bg-muted border border-border/80 flex items-center justify-center shrink-0 overflow-hidden">
                              {v.image ? (
                                <AntImage
                                  src={getAbsoluteImageUrl(v.image)}
                                  alt={v.name}
                                  className="w-full h-full object-cover"
                                  wrapperClassName="w-full h-full flex items-center justify-center cursor-pointer"
                                  preview={{
                                    mask: (
                                      <div className="flex items-center justify-center w-full h-full bg-black/40 text-white">
                                        <Eye size={12} />
                                      </div>
                                    ),
                                  }}
                                />
                              ) : (
                                <Package size={16} className="text-muted-foreground" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <h5 className="text-xs font-extrabold text-foreground truncate">{v.name}</h5>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                {v.sku && (
                                  <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded border border-border">
                                    {v.sku}
                                  </span>
                                )}
                                {v.barcode && (
                                  <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded border border-border">
                                    {v.barcode}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Pricing & Stock Badges */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-none border-border/50">
                            <div className="text-right">
                              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(vSelling)}
                              </p>
                              {vCost > 0 && (
                                <p className="text-[10px] text-muted-foreground">
                                  {t('costPrice', 'Cost')}: {formatCurrency(vCost)}
                                </p>
                              )}
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${
                              vStock <= 0
                                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                : vStock <= 5
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            }`}>
                              {vStock} {getUnitName(product?.unit?.name)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-muted/20 border border-dashed border-border text-center space-y-2">
                    <Package size={36} className="mx-auto text-muted-foreground/40" />
                    <p className="text-xs font-bold text-foreground">{t('noVariants', 'Single Item Product')}</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      {t('noVariantsDetail', 'This is a single standalone product with no variant options.')}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: INVENTORY & STOCK */}
            {activeTab === 'inventory' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/70 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {t('warehouseBreakdown', 'Warehouse Inventory Breakdown')}
                    </h4>
                    <span className="text-xs font-bold text-foreground">
                      {t('totalStockAvailable', 'Total')}: <strong className="text-emerald-600">{totalStock} {getUnitName(product?.unit?.name)}</strong>
                    </span>
                  </div>

                  {product?.warehouse_stocks && product.warehouse_stocks.length > 0 ? (
                    <div className="space-y-2.5">
                      {product.warehouse_stocks.map((ws: any, idx: number) => {
                        const qty = Number(ws.quantity || 0)
                        const reserved = Number(ws.reserved_quantity || 0)
                        const available = qty - reserved
                        const reorder = Number(ws.reorder_point || 5)
                        const isLow = qty <= reorder

                        return (
                          <div key={idx} className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">{getWarehouseName(ws.warehouse_name, ws.warehouse_id)}</span>
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                isLow ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              }`}>
                                {isLow ? t('lowStockAlert', 'Low Stock') : t('inStock', 'In Stock')}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                              <div className="p-2 rounded-xl bg-card border border-border/40">
                                <span className="text-[10px] text-muted-foreground block font-medium">{t('stockOnHand', 'On Hand')}</span>
                                <strong className="text-foreground font-black">{qty}</strong>
                              </div>
                              <div className="p-2 rounded-xl bg-card border border-border/40">
                                <span className="text-[10px] text-muted-foreground block font-medium">{t('reservedQty', 'Reserved')}</span>
                                <strong className="text-amber-600 font-black">{reserved}</strong>
                              </div>
                              <div className="p-2 rounded-xl bg-card border border-border/40">
                                <span className="text-[10px] text-muted-foreground block font-medium">{t('availableQty', 'Available')}</span>
                                <strong className="text-emerald-600 font-black">{available}</strong>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-muted/20 border border-dashed border-border text-center space-y-1">
                      <p className="text-xs text-muted-foreground">{t('noWarehouseStock', 'No warehouse stock records available for this product.')}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 4: PERFORMANCE & STATS */}
            {activeTab === 'performance' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-bold">{t('totalSoldUnits', 'Total Units Sold')}</span>
                      <TrendingUp size={16} className="text-blue-500" />
                    </div>
                    <p className="text-2xl font-black text-foreground">{product?.sold_count ?? 0}</p>
                    <p className="text-[10px] text-muted-foreground">{t('syncedWithPos', 'Synced with POS & Orders')}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-bold">{t('totalViews', 'Total Views')}</span>
                      <Eye size={16} className="text-purple-500" />
                    </div>
                    <p className="text-2xl font-black text-foreground">{(product?.view_count ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{t('customerImpressions', 'Customer browsing impressions')}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-bold">{t('customerRating', 'Customer Rating')}</span>
                      <Star size={16} className="text-amber-500" fill="currentColor" />
                    </div>
                    <p className="text-2xl font-black text-amber-500">
                      {Number(product?.rating_avg || 5.0).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ 5.0</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">{product?.rating_count ?? 0} {t('reviewsCount', 'Reviews')}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-bold">{t('productStatus', 'Status & Feature')}</span>
                      <ShieldCheck size={16} className="text-emerald-500" />
                    </div>
                    <p className="text-sm font-black text-foreground capitalize">
                      {product?.status === 'active' ? t('active', 'Active') : t('inactive', 'Inactive')}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {product?.is_featured ? `★ ${t('featuredBadge', 'Featured Product')}` : t('standardCatalogItem', 'Standard Catalog Item')}
                    </p>
                  </div>
                </div>

                {/* Audit Timestamps */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {t('createdDate', 'Created Date')}
                    </span>
                    <strong className="text-foreground">{formatDate(product?.created_at)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {t('lastUpdated', 'Last Updated')}
                    </span>
                    <strong className="text-foreground">{formatDate(product?.updated_at)}</strong>
                  </div>
                </div>
              </motion.div>
            )}
        </DetailDrawerBody>

        <DetailDrawerFooter
          rightActions={
            <>
              {onQuickStockAdjust && (
                <ActionButton
                  onClick={() => { onClose(); onQuickStockAdjust(product as Product); }}
                  label={t('quickStockAdjust', 'Adjust Stock')}
                  title={t('quickStockAdjust', 'Quick Stock Adjust')}
                  variant="outline"
                />
              )}

              {onDuplicate && (
                <ActionButton
                  onClick={() => { onClose(); onDuplicate(product as Product); }}
                  label={t('duplicateProduct', 'Duplicate')}
                  title={t('duplicateProduct', 'Duplicate Product')}
                  variant="outline"
                />
              )}

              <ActionButton
                onClick={() => { onClose(); onEdit(product as Product); }}
                label={t('editProduct', 'Edit Product')}
                icon={<Edit2 size={15} />}
                variant="primary"
              />
            </>
          }
        />
      </DetailDrawer>

        {/* State-of-the-Art Barcode & Label Print Center Modal (Fallback) */}
        {showPrintModal && printTargetItem && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card max-w-2xl w-full rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <ModalHeader
                title={t('barcodePrintCenter', 'Barcode & Label Print Center')}
                subtitle={`${printTargetItem.name} • ${printTargetItem.sku}`}
                icon={<Barcode size={20} />}
                iconVariant="blue"
                onClose={() => setShowPrintModal(false)}
              />

              {/* Modal Body - 2 Columns */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
                {/* Left Controls Column (7 cols) */}
                <div className="md:col-span-7 space-y-4">
                  {/* Variant Selection if available */}
                  {product?.variants && product.variants.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground block">
                        {t('selectVariant', 'Select Variant / Model')}
                      </label>
                      <select
                        value={selectedVariantId}
                        onChange={(e) => setSelectedVariantId(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary/30 outline-none"
                      >
                        <option value="main">{t('allVariants', 'Main Product (Default)')}</option>
                        {product.variants.map((v: any) => (
                          <option key={v.id} value={v.id}>
                            {v.name} — {v.sku || product.sku} ({formatCurrency(Number(v.selling_price || sellingPrice))})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Label Size / Template */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      {t('labelSize', 'Label Size / Template')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: '50x30', label: t('thermalStandard', 'Thermal 50×30 mm'), desc: 'Standard Roll' },
                        { id: '70x40', label: t('shelfTag', 'Shelf Tag 70×40 mm'), desc: 'Large Shelf' },
                        { id: '40x20', label: t('miniTag', 'Mini Tag 40×20 mm'), desc: 'Compact / Jewelry' },
                        { id: 'a4', label: t('a4Sheet', 'A4 Sheet (30 Labels)'), desc: 'Laser / Inkjet' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLabelSize(item.id as LabelSizeType)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            labelSize === item.id
                              ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20'
                              : 'bg-card border-border text-foreground hover:bg-muted'
                          }`}
                        >
                          <p className="text-xs font-bold leading-tight">{item.label}</p>
                          <span className="text-[10px] text-muted-foreground">{item.desc}</span>
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
                        className="text-[11px] font-bold text-primary hover:underline"
                      >
                        {t('matchStockQty', 'Match Current Stock')} ({printTargetItem.stock})
                      </button>
                    </div>
                    <div className="flex items-center rounded-xl bg-card border border-border overflow-hidden w-fit shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setPrintCopies(Math.max(1, printCopies - 1))}
                        className="px-3 py-2 hover:bg-muted text-foreground font-bold text-sm"
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
                        className="px-3 py-2 hover:bg-muted text-foreground font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Content Toggles */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <label className="text-xs font-bold text-foreground block">{t('displayElementsOnSticker', 'Label Display Elements')}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowStoreName(!showStoreName)}
                        className="flex items-center gap-2 text-left p-2 rounded-xl hover:bg-muted text-foreground transition-colors border border-transparent hover:border-border/60"
                      >
                        {showStoreName ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-muted-foreground" />}
                        <span>{t('showStoreName', 'Show Store Name')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowProductName(!showProductName)}
                        className="flex items-center gap-2 text-left p-2 rounded-xl hover:bg-muted text-foreground transition-colors border border-transparent hover:border-border/60"
                      >
                        {showProductName ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-muted-foreground" />}
                        <span>{t('showProductName', 'Show Product Name')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSku(!showSku)}
                        className="flex items-center gap-2 text-left p-2 rounded-xl hover:bg-muted text-foreground transition-colors border border-transparent hover:border-border/60"
                      >
                        {showSku ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-muted-foreground" />}
                        <span>{t('showSku', 'Show SKU Code')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowPrice(!showPrice)}
                        className="flex items-center gap-2 text-left p-2 rounded-xl hover:bg-muted text-foreground transition-colors border border-transparent hover:border-border/60"
                      >
                        {showPrice ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-muted-foreground" />}
                        <span>{t('showPrice', 'Show Price')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Live Preview Column (5 cols) */}
                <div className="md:col-span-5 flex flex-col justify-between space-y-4 p-4 rounded-2xl bg-muted/30 border border-border/70">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                      {t('livePreview', 'Live Label Preview')}
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
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={executeBarcodePrint}
                      className="w-full py-3 px-4 rounded-xl bg-primary text-white hover:opacity-90 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                    >
                      <Printer size={16} />
                      <span>{t('startPrint', 'Print Barcode Labels')} ({printCopies})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPrintModal(false)}
                      className="w-full py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      {t('closeBtn', 'Close')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export default ProductDetailDrawer
