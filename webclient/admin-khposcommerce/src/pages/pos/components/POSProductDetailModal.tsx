import React, { useState, useEffect, useMemo } from 'react'
import {
  X, ShoppingCart, Tag, ShieldCheck, Check, Layers, Barcode, Warehouse, Palette, Sparkles,
  Monitor, Smartphone, Laptop, Watch, Keyboard, Headphones, Camera, Zap, Footprints, Shirt, Ban
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Product, ProductVariant } from '../types/pos.types'
import { sound } from '@/utils/sound'
import { useToast } from '@/hooks/useToast'
import { getAbsoluteImageUrl, resolveProductPhoto, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'

interface POSProductDetailModalProps {
  product: Product | null
  onClose: () => void
  onAddToCart: (p: Product, variant?: ProductVariant, imei?: string) => void
}

export const POSProductDetailModal: React.FC<POSProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const { t } = useTranslation(['pos', 'common'])
  const toast = useToast()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined)
  const [imei, setImei] = useState('')
  const [activeImgIndex, setActiveImgIndex] = useState(0)

  // Combined Spec/Size & Color state
  const [selectedSpec, setSelectedSpec] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')

  // Check if product actually has variants enabled
  const hasVariants = Boolean(
    product &&
    product.has_variants &&
    product.variants &&
    product.variants.length > 0
  )

  const variantsList = useMemo(() => {
    if (!product || !hasVariants) return []
    return product.variants || []
  }, [product, hasVariants])

  // Helper: parse SPEC/SIZE and COLOR intelligently from variant name or attributes
  const parseVariantName = (v: ProductVariant, productName: string): { spec: string; color: string } => {
    let spec = ''
    let color = ''

    // 1. Try from attributes array (most reliable)
    if (v.attributes && Array.isArray(v.attributes) && v.attributes.length > 0) {
      const specAttr = v.attributes.find((a: any) => {
        const name = (a.attribute_name || a.attribute?.name || a.name || '').toLowerCase()
        return ['size', 'spec', 'storage', 'ram', 'capacity', 'display', 'dimension', 'switch', 'screen', 'wattage', 'lens', 'resolution', 'shoe', 'clothing'].some(k => name.includes(k))
      })
      const colorAttr = v.attributes.find((a: any) => {
        const name = (a.attribute_name || a.attribute?.name || a.name || '').toLowerCase()
        return ['color', 'colour', 'shade'].some(k => name.includes(k))
      })
      if (specAttr) spec = specAttr.value || (specAttr as any).attribute_value || ''
      if (colorAttr) color = colorAttr.value || (colorAttr as any).attribute_value || ''
    }

    // 2. Parse from variant name
    if ((!spec || !color) && v.name) {
      let cleanName = v.name
      // Strip base product name prefix if present
      if (productName && cleanName.toLowerCase().startsWith(productName.toLowerCase())) {
        cleanName = cleanName.slice(productName.length).replace(/^[\s\-–:]+/, '').trim()
      }

      // Split by '/' or ' - ' or '-'
      let parts: string[] = []
      if (cleanName.includes('/')) {
        parts = cleanName.split('/').map(p => p.trim()).filter(Boolean)
      } else if (cleanName.includes(' - ')) {
        parts = cleanName.split(' - ').map(p => p.trim()).filter(Boolean)
      } else if (cleanName.includes('-')) {
        parts = cleanName.split('-').map(p => p.trim()).filter(Boolean)
      } else {
        parts = [cleanName.trim()]
      }

      const colorKeywords = [
        'black', 'white', 'silver', 'space gray', 'space grey', 'space black',
        'natural titanium', 'titanium gray', 'titanium grey', 'desert titanium', 'titanium',
        'gold', 'rose gold', 'red', 'blue', 'green', 'purple', 'pink', 'orange', 'yellow',
        'midnight', 'starlight', 'gray', 'grey', 'brown', 'cyan', 'magenta', 'teal', 'navy',
        'violet', 'beige', 'charcoal', 'emerald', 'amber', 'retro gray', 'pure white', 'triple black',
        'ខ្មៅ', 'ស', 'ប្រាក់', 'ប្រផេះ', 'ក្រហម', 'ខៀវ', 'មាស', 'លឿង', 'ស្វាយ', 'ផ្កាឈូក', 'ទឹកក្រូច', 'ត្នោត'
      ]

      const isSpecPattern = (text: string): boolean => {
        const t = text.trim().toLowerCase()
        if (/\b\d+\s*(gb|tb|mb|g|t)\b/i.test(t)) return true
        if (/\b\d+\s*gb\s*\/\s*\d+\s*(gb|tb)\b/i.test(t)) return true
        if (/\d+(\.\d+)?\s*("|inch|in)\b/i.test(t) || /\b(fhd|qhd|4k|uhd|1080p|144hz|165hz|curved|ultrawide)\b/i.test(t)) return true
        if (/\b\d+\s*mm\b/i.test(t) || /\b(gps|cellular|ultra)\b/i.test(t)) return true
        if (/\b(eu|us|uk)\s*\d+\b/i.test(t) || /^size\s*\d+/i.test(t)) return true
        if (/^(xs|s|m|l|xl|xxl|xxxl|free size)$/i.test(t)) return true
        if (/\b(switch|wired|bluetooth|rgb|w|gan|pro zoom|kit lens|body only|studio|cinema|wireless|noise canceling|fast charger)\b/i.test(t)) return true
        return false
      }

      const isColorText = (text: string): boolean => {
        const t = text.trim().toLowerCase()
        if (isSpecPattern(t)) return false
        return colorKeywords.some(c => t.includes(c))
      }

      let foundSpec = ''
      let foundColor = ''

      parts.forEach(p => {
        if (isSpecPattern(p)) {
          if (!foundSpec) foundSpec = p
          else foundSpec += ` / ${p}`
        } else if (isColorText(p)) {
          if (!foundColor) foundColor = p
        } else {
          if (!foundSpec && !foundColor) {
            foundSpec = p
          } else if (!foundColor) {
            foundColor = p
          }
        }
      })

      if (!spec && foundSpec) spec = foundSpec
      if (!color && foundColor) color = foundColor

      if (!spec && !color && parts.length === 1 && parts[0]) {
        if (isSpecPattern(parts[0])) {
          spec = parts[0]
        } else {
          color = parts[0]
        }
      }
    }

    if (spec) {
      spec = spec.replace(/^Size\s+/i, '').trim()
    }

    return { spec, color }
  }

  // Dynamic Label Generator based on Category or Spec text
  const getSpecGroupHeader = (specSample: string, catName: string): { title: string; Icon: React.ElementType } => {
    const c = (catName || '').toLowerCase()
    const s = (specSample || '').toLowerCase()

    if (c.includes('phone') || c.includes('mobile') || c.includes('smartphone')) {
      return { title: 'Storage & RAM', Icon: Smartphone }
    }
    if (c.includes('laptop') || c.includes('computer') || c.includes('macbook')) {
      return { title: 'RAM & SSD Spec', Icon: Laptop }
    }
    if (c.includes('monitor') || c.includes('display') || c.includes('screen')) {
      return { title: 'Display Size & Resolution', Icon: Monitor }
    }
    if (c.includes('watch') || c.includes('smartwatch')) {
      return { title: 'Case Size & Connectivity', Icon: Watch }
    }
    if (c.includes('keyboard')) {
      return { title: 'Switch Type & Format', Icon: Keyboard }
    }
    if (c.includes('headphone') || c.includes('speaker') || c.includes('audio') || c.includes('earbud') || c.includes('sound') || c.includes('mice') || c.includes('mouse')) {
      return { title: 'Audio Type & Connectivity', Icon: Headphones }
    }
    if (c.includes('camera') || c.includes('lens')) {
      return { title: 'Lens Kit & Sensor Spec', Icon: Camera }
    }
    if (c.includes('charger') || c.includes('power') || c.includes('adapter')) {
      return { title: 'Output Wattage & Ports', Icon: Zap }
    }
    if (c.includes('shoe') || c.includes('sneaker') || c.includes('footwear')) {
      return { title: 'Shoe Size', Icon: Footprints }
    }
    if (c.includes('apparel') || c.includes('clothing') || c.includes('shirt') || c.includes('fashion') || c.includes('dress')) {
      return { title: 'Clothing Size', Icon: Shirt }
    }

    // Spec content fallbacks
    if (/\b(gb|tb|mb|ram|storage)\b/i.test(s)) {
      return { title: 'Storage / RAM', Icon: Smartphone }
    }
    if (/\b(fhd|qhd|4k|uhd|144hz|165hz|curved|ultrawide)\b/i.test(s) || /"/i.test(s)) {
      return { title: 'Display Size & Resolution', Icon: Monitor }
    }
    if (/\b(gps|cellular|ultra)\b/i.test(s) || /\b\d+mm\b/i.test(s)) {
      return { title: 'Case Size & Connectivity', Icon: Watch }
    }
    if (/\b(switch|tkl|rgb)\b/i.test(s)) {
      return { title: 'Switch Type & Format', Icon: Keyboard }
    }
    if (/\b(wired|bluetooth|wireless|anc|noise canceling|studio)\b/i.test(s)) {
      return { title: 'Audio Type & Connectivity', Icon: Headphones }
    }
    if (/\b(lens|body only|zoom|cinema)\b/i.test(s)) {
      return { title: 'Lens Kit & Sensor Spec', Icon: Camera }
    }
    if (/\b(watt|usb-c|gan|\d+w)\b/i.test(s)) {
      return { title: 'Output Wattage & Ports', Icon: Zap }
    }
    if (/\b(eu\s*\d+|us\s*\d+|uk\s*\d+)\b/i.test(s)) {
      return { title: 'Shoe Size', Icon: Footprints }
    }
    if (/^(xs|s|m|l|xl|xxl|xxxl|free size)$/i.test(s.trim())) {
      return { title: 'Clothing Size', Icon: Shirt }
    }

    return { title: 'Options & Specifications', Icon: Sparkles }
  }

  // Extract available specs dynamically from product variants
  const specOptions = useMemo(() => {
    if (!hasVariants || variantsList.length === 0) return []
    const map = new Map<string, { code: string; label: string; price?: number }>()

    variantsList.forEach(v => {
      const { spec } = parseVariantName(v, product?.name || '')
      if (spec && !map.has(spec)) {
        map.set(spec, {
          code: spec,
          label: spec,
          price: v.selling_price,
        })
      }
    })

    return Array.from(map.values())
  }, [hasVariants, variantsList, product])

  // Extract available colors dynamically from product variants
  const colorOptions = useMemo(() => {
    if (!hasVariants || variantsList.length === 0) return []
    const map = new Map<string, { name: string; hex: string }>()

    const hexMap: Record<string, string> = {
      'black': '#111827', 'white': '#ffffff', 'silver': '#c0c0c0', 'space gray': '#4b5563',
      'space grey': '#4b5563', 'red': '#ef4444', 'blue': '#3b82f6', 'gold': '#f59e0b',
      'green': '#22c55e', 'purple': '#a855f7', 'orange': '#f97316', 'pink': '#ec4899',
      'midnight': '#1e293b', 'starlight': '#f1f5f9', 'titanium': '#94a3b8',
    }

    variantsList.forEach(v => {
      const { color: cName } = parseVariantName(v, product?.name || '')
      if (cName && !map.has(cName)) {
        map.set(cName, {
          name: cName,
          hex: hexMap[cName.toLowerCase()] || '#9ca3af',
        })
      }
    })

    return Array.from(map.values())
  }, [hasVariants, variantsList, product])

  // Helper to find exact variant matching (Spec + Color)
  const findMatchingVariant = (spec: string, color: string): ProductVariant | undefined => {
    if (!variantsList || variantsList.length === 0) return undefined

    // 1. Exact match by parsed spec AND color
    if (spec && color) {
      const exact = variantsList.find(v => {
        const parsed = parseVariantName(v, product?.name || '')
        return parsed.spec.toLowerCase() === spec.toLowerCase() && parsed.color.toLowerCase() === color.toLowerCase()
      })
      if (exact) return exact
    }

    // 2. Match spec only
    if (spec) {
      const specMatch = variantsList.find(v => {
        const parsed = parseVariantName(v, product?.name || '')
        return parsed.spec.toLowerCase() === spec.toLowerCase()
      })
      if (specMatch) return specMatch
    }

    // 3. Match color only
    if (color) {
      const colorMatch = variantsList.find(v => {
        const parsed = parseVariantName(v, product?.name || '')
        return parsed.color.toLowerCase() === color.toLowerCase()
      })
      if (colorMatch) return colorMatch
    }

    return variantsList[0]
  }

  useEffect(() => {
    if (hasVariants && variantsList.length > 0) {
      const initSpec = specOptions[0]?.code || ''
      const initColor = colorOptions[0]?.name || ''
      setSelectedSpec(initSpec)
      setSelectedColor(initColor)

      const matched = findMatchingVariant(initSpec, initColor)
      setSelectedVariant(matched || variantsList[0])
    } else {
      setSelectedVariant(undefined)
    }
    setImei('')
    setActiveImgIndex(0)
  }, [product, hasVariants, variantsList, specOptions, colorOptions])

  if (!product) return null

  const fallbackUrl = resolveProductPhoto(product.primary_image, product.images, product.category?.name, product.name)

  const rawImages = product.images && product.images.length > 0
    ? product.images.map(i => getAbsoluteImageUrl(i.url || i))
    : [getAbsoluteImageUrl(product.primary_image) || fallbackUrl]

  // Handle Spec click -> Keep current color and update matching variant
  const handleSelectSpec = (code: string) => {
    setSelectedSpec(code)
    const matched = findMatchingVariant(code, selectedColor)
    if (matched) {
      setSelectedVariant(matched)
    }
  }

  // Handle Color click -> Keep current selectedSpec and update color
  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName)
    const matched = findMatchingVariant(selectedSpec, colorName)
    if (matched) {
      setSelectedVariant(matched)
    }
  }


  const currentPrice = selectedVariant?.selling_price ?? (product.selling_price || 0)
  const currentStock = Number(selectedVariant ? (selectedVariant.stock ?? product.stock ?? 0) : (product.stock ?? 0))
  const isOutOfStock = currentStock <= 0

  const handleAdd = () => {
    if (isOutOfStock) {
      sound.playError()
      toast.error(t('productOutOfStock', `Product "${product.name}" is out of stock!`))
      return
    }
    onAddToCart(product, selectedVariant, imei.trim() || undefined)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">

        {/* ── 1. 1688 / 168express Style Header (Thumbnail + Price + Variant Title) ── */}
        <div className="flex items-start gap-3 border-b border-border/60 pb-4 relative">
          {/* Left: Square Thumbnail Product Image */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-muted/30 border border-border/80 overflow-hidden shrink-0 shadow-xs relative">
            <img
              src={getAbsoluteImageUrl((selectedVariant as any)?.image) || rawImages[activeImgIndex] || DEFAULT_PRODUCT_IMAGE}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PRODUCT_IMAGE
              }}
            />
          </div>

          {/* Right: Price & Selected Variant Description */}
          <div className="flex-1 pr-6 space-y-1">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-500 font-mono tracking-tight">
              ${currentPrice.toFixed(2)}
            </div>
            <div className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-snug">
              {selectedVariant?.name || `${product.name}`}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              SKU: {selectedVariant?.sku || product.sku}
            </div>
          </div>

          {/* Top Right: Close button */}
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── 2. CONDITIONAL SPEC / SIZE SELECTION ──────────────────────────────── */}
        {hasVariants && specOptions.length > 0 && (
          <div className="space-y-2">
            {(() => {
              const { title, Icon } = getSpecGroupHeader(specOptions[0]?.label || '', product.category?.name || '')
              return (
                <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Icon size={14} className="text-rose-500 shrink-0" />
                  <span>{title}</span>
                </label>
              )
            })()}
            <div className="grid grid-cols-2 gap-2">
              {specOptions.map((s) => {
                const isSelected = selectedSpec === s.code
                const matchedV = findMatchingVariant(s.code, selectedColor)
                const priceForSpec = matchedV?.selling_price || s.price || product.selling_price || 0

                return (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => handleSelectSpec(s.code)}
                    className={`p-3 rounded-2xl border text-center text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black shadow-xs'
                        : 'border-border/80 bg-muted/20 text-foreground hover:bg-muted font-medium'
                    }`}
                  >
                    <div className="font-extrabold leading-snug">{s.label}</div>
                    <div className="text-[10px] mt-0.5 opacity-80 font-mono">${priceForSpec.toFixed(2)}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── 3. CONDITIONAL COLOR SELECTION (1688 STYLED PILLS) ───────────────── */}
        {hasVariants && colorOptions.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Palette size={14} className="text-rose-500 shrink-0" />
              <span>{t('selectColor', 'Select Color')}</span>
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {colorOptions.map((c) => {
                const isSelected = selectedColor === c.name || (selectedVariant && selectedVariant.name?.toLowerCase().includes(c.name.toLowerCase()))
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelectColor(c.name)}
                    className={`w-full p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black shadow-xs'
                        : 'border-border/80 bg-muted/20 text-foreground hover:bg-muted font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </div>
                    {isSelected && <Check size={16} className="text-rose-600 dark:text-rose-400" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── 4. DIRECT VARIANT LIST FALLBACK IF NO COLOR OR SPEC EXTRACTED ────── */}
        {hasVariants && colorOptions.length === 0 && specOptions.length === 0 && (
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-rose-500 shrink-0" />
              <span>{t('productOptions', 'Product Options')}</span>
            </label>
            <div className="space-y-1.5">
              {variantsList.map((v) => {
                const isSelected = selectedVariant?.id === v.id
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`w-full p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black shadow-xs'
                        : 'border-border/80 bg-muted/20 text-foreground hover:bg-muted font-medium'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-extrabold">{v.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{v.sku}</div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div className="font-mono text-rose-600 font-bold">${(v.selling_price || 0).toFixed(2)}</div>
                      {isSelected && <Check size={16} className="text-rose-600 dark:text-rose-400" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Serial / IMEI Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Barcode size={14} className="text-primary" /> {t('serialOrImei', 'Serial Number / IMEI (Optional)')}
          </label>
          <input
            type="text"
            value={imei}
            onChange={(e) => setImei(e.target.value)}
            placeholder={t('imeiPlaceholder', 'Scan or enter device IMEI / S/N...')}
            className="form-input text-xs font-sans"
          />
        </div>

        {/* Inventory & Meta Info */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-muted/30 border border-border/60 text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px]">{t('availableStock', 'Available Stock')}</span>
            {isOutOfStock ? (
              <span className="font-bold text-rose-500 flex items-center gap-1">
                <Ban size={12} />
                0 {t('units', 'units')} ({t('outOfStock', 'Out of Stock')})
              </span>
            ) : (
              <span className="font-bold text-foreground flex items-center gap-1">
                <Warehouse size={12} className="text-emerald-500" />
                {currentStock} {t('units', 'units')}
              </span>
            )}
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">{t('unitTaxVat', 'Unit Tax / VAT')}</span>
            <span className="font-bold text-foreground flex items-center gap-1">
              <ShieldCheck size={12} className="text-primary" />
              {t('standardTax', '10% Standard')}
            </span>
          </div>
        </div>

        {/* ── 4. 1688 STYLED BOTTOM FULL-WIDTH ACTION BUTTON ────────────── */}
        <div className="pt-2 border-t border-border/60">
          {isOutOfStock ? (
            <button
              type="button"
              disabled={true}
              onClick={handleAdd}
              className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-not-allowed shadow-none"
            >
              <Ban size={18} className="text-rose-500" />
              <span>{t('outOfStockCannotSell', 'Out of Stock - Cannot Sell')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <ShoppingCart size={18} /> {t('addToSaleCart', 'Add to Cart')}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
