import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ShoppingCart,
  Heart,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
  ExternalLink,
  Plus,
  Minus,
  CheckCircle2,
  Layers,
  ZoomIn,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn, calculateDiscountPercent, resolveMediaUrl, DEFAULT_FALLBACKS } from '@/lib/utils'
import { getCategoryTheme } from '@/lib/icons'
import { useProductPreviewStore } from '@/stores/productPreviewStore'
import { useWishlistStore } from '@/stores'
import { useAddToCart } from '@/hooks/useAddToCart'
import productService from '@/services/productService'

export const ProductQuickPreview: React.FC = () => {
  const { t } = useTranslation()
  const { activeProduct, isOpen, closePreview } = useProductPreviewStore()

  const { has: isInWishlist, addItem: addWishlist, removeItem: removeWishlist } =
    useWishlistStore()

  const { addToCart, isAdding, isAdded } = useAddToCart({
    openDrawerOnAdd: false,
    feedbackDuration: 2200,
  })

  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [detailedProduct, setDetailedProduct] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Interactive Magnifier Zoom States
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Fetch full details dynamically on modal open
  useEffect(() => {
    if (activeProduct && isOpen) {
      setQuantity(1)
      setSelectedImageIndex(0)
      setSelectedVariantId(null)
      setIsZoomed(false)
      setDetailedProduct(activeProduct)

      if (activeProduct.slug) {
        setLoadingDetails(true)
        productService
          .getProductBySlug(activeProduct.slug)
          .then((data) => {
            if (data) {
              setDetailedProduct((prev: any) => ({ ...prev, ...data }))
              if (data.variants && data.variants.length > 0) {
                setSelectedVariantId(data.variants[0].id)
              }
            }
          })
          .catch(() => {
            // Safely fallback to activeProduct
          })
          .finally(() => {
            setLoadingDetails(false)
          })
      }
    } else {
      setDetailedProduct(null)
      setSelectedVariantId(null)
      setIsZoomed(false)
    }
  }, [activeProduct, isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreview()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closePreview])

  const handleWishlistToggle = useCallback(
    (e: React.MouseEvent, productId: number) => {
      e.preventDefault()
      e.stopPropagation()
      if (isInWishlist(productId)) {
        removeWishlist(productId)
      } else {
        addWishlist(productId)
      }
    },
    [isInWishlist, addWishlist, removeWishlist]
  )

  // Interactive Zoom Mouse Move Handler
  const handleImageMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    setZoomPos({ x, y })
  }, [])

  const product = detailedProduct || activeProduct
  const variants: any[] = useMemo(() => product?.variants || [], [product])
  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) || null,
    [variants, selectedVariantId]
  )

  // Build full dynamic images gallery (including variant images)
  const images: string[] = useMemo(() => {
    if (!product) return []
    const list: string[] = []
    if (selectedVariant?.image && !list.includes(selectedVariant.image)) {
      list.push(selectedVariant.image)
    }
    if (product.image && !list.includes(product.image)) {
      list.push(product.image)
    }
    if (Array.isArray(product.images)) {
      product.images.forEach((img: any) => {
        const url = typeof img === 'string' ? img : img?.url || img?.path
        if (url && !list.includes(url)) list.push(url)
      })
    }
    if (Array.isArray(product.variants)) {
      product.variants.forEach((v: any) => {
        if (v.image && !list.includes(v.image)) list.push(v.image)
      })
    }
    return list.length > 0 ? list : [product.image || '']
  }, [product, selectedVariant])

  // Clean variant name helper (removes repeating product name prefix)
  const formatVariantLabel = useCallback((vName: string, pName?: string) => {
    if (!vName) return 'Standard'
    if (!pName) return vName
    const regex = new RegExp(`^${pName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*-\\s*`, 'i')
    const cleaned = vName.replace(regex, '').trim()
    return cleaned || vName
  }, [])

  // If closed or no active product, early return AFTER all hooks
  if (!isOpen || !product) return null

  const inWishlist = isInWishlist(product.id)
  const adding = isAdding(product.id)
  const added = isAdded(product.id)

  // Dynamic price calculation based on selected variant or base product
  const activePrice =
    selectedVariant?.selling_price ??
    product.flash_price ??
    product.selling_price ??
    product.price ??
    0

  const comparePrice = selectedVariant?.compare_price ?? product.compare_price
  const discount =
    product.discount_pct ||
    (comparePrice && comparePrice > activePrice
      ? calculateDiscountPercent(activePrice, comparePrice)
      : 0)

  const savingsPerUnit = comparePrice && comparePrice > activePrice ? comparePrice - activePrice : 0
  const totalPrice = activePrice * quantity

  const stockVal = selectedVariant?.stock_quantity ?? product.stock ?? product.stock_quantity
  const isOutOfStock =
    selectedVariant
      ? Number(selectedVariant.stock_quantity || 0) <= 0
      : product.in_stock !== undefined
        ? !product.in_stock
        : stockVal !== undefined
          ? Number(stockVal) <= 0
          : false

  const theme = getCategoryTheme(product.category_slug || product.category || product.brand)
  const CategoryIcon = theme.icon
  const activeImage = images[selectedImageIndex] || images[0] || product.image || ''

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
        {/* Clean Bright Backdrop (PTC Computer Style) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={closePreview}
          className="fixed inset-0 bg-slate-900/35 dark:bg-slate-950/55 backdrop-blur-[2px]"
        />

        {/* Modal Dialog Card (Pure Clean & Balanced Layout) */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 12 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl p-5 sm:p-7 md:p-8 select-text"
        >
          {/* Top-Right Close Button */}
          <button
            onClick={closePreview}
            aria-label="Close Preview"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
            {/* ── LEFT AREA: Thumbnail Gallery + Interactive Zoom Image ── */}
            <div className="md:col-span-5 flex items-start gap-3 min-w-0 w-full">
              {/* Vertical Thumbnail Strip (No visible scrollbar, still scrollable) */}
              {images.length > 1 && (
                <div className="flex flex-col gap-2.5 max-h-[370px] overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
                  {images.slice(0, 8).map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedImageIndex(idx)
                        setIsZoomed(false)
                      }}
                      className={cn(
                        'w-14 h-14 sm:w-15 sm:h-15 aspect-square rounded-2xl overflow-hidden p-1.5 bg-slate-50 dark:bg-slate-800/90 border-2 transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 shadow-2xs',
                        selectedImageIndex === idx
                          ? 'border-blue-600 dark:border-blue-500 shadow-sm ring-2 ring-blue-500/20 scale-[1.03]'
                          : 'border-slate-200/90 dark:border-slate-700/90 hover:border-slate-300 dark:hover:border-slate-600 opacity-70 hover:opacity-100'
                      )}
                    >
                      <img
                        src={resolveMediaUrl(img)}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_FALLBACKS.product
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image Frame with Interactive Zoom */}
              <div
                ref={imageContainerRef}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseMove={handleImageMouseMove}
                onMouseLeave={() => setIsZoomed(false)}
                className="relative flex-1 min-w-0 h-[300px] sm:h-[370px] rounded-3xl overflow-hidden bg-slate-50/70 dark:bg-slate-800/60 p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-center cursor-crosshair select-none group"
              >
                <img
                  src={resolveMediaUrl(activeImage)}
                  alt={product.name}
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: isZoomed ? 'scale(2.3)' : 'scale(1)',
                    transition: isZoomed
                      ? 'transform 0.08s ease-out'
                      : 'transform 0.3s ease-out',
                  }}
                  className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-sm will-change-transform"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_FALLBACKS.product
                  }}
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                  {discount > 0 && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-rose-500 text-white shadow-xs leading-none">
                      -{discount}%
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs flex items-center gap-1 leading-none">
                      <Sparkles className="w-3 h-3" />
                      <span>HOT</span>
                    </span>
                  )}
                </div>

                {/* Interactive Zoom Indicator Pill */}
                {isZoomed ? (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1.5 pointer-events-none shadow-md z-10 animate-fade-in">
                    <ZoomIn className="w-3 h-3 text-blue-400" />
                    <span>Zoom 2.3x</span>
                  </div>
                ) : (
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/85 dark:bg-slate-900/85 text-slate-500 dark:text-slate-400 text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-200/60 dark:border-slate-700/60">
                    <ZoomIn className="w-3 h-3 text-slate-400" />
                    <span>Hover to zoom</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT AREA: Product Info, Compact Options, Pricing & Action ── */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4 min-w-0 w-full">
              {/* Category & Brand Badges */}
              <div className="flex items-center gap-2 flex-wrap pr-8">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border',
                    theme.bgLight,
                    theme.textClass,
                    theme.borderClass
                  )}
                >
                  <CategoryIcon className="w-3.5 h-3.5" />
                  <span>{product.category || product.brand || 'Category'}</span>
                </span>

                {product.brand && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>{product.brand}</span>
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {product.name}
              </h2>

              {/* SKU, Stock & Rating */}
              <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px]">
                  {selectedVariant?.sku || product.sku ? `SKU: ${selectedVariant?.sku || product.sku}` : `ID: #${product.id}`}
                </span>

                {/* Stock Status */}
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 font-semibold',
                    !isOutOfStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                  )}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      !isOutOfStock ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    )}
                  />
                  {!isOutOfStock
                    ? `${t('product.in_stock', 'In Stock')} (${stockVal ?? 10}+)`
                    : t('product.out_of_stock', 'Out of Stock')}
                </span>

                {/* Rating */}
                <div className="flex items-center gap-1 font-semibold text-amber-500">
                  <span>★ {product.rating_avg ? product.rating_avg.toFixed(1) : '4.8'}</span>
                  <span className="text-slate-400 font-normal">
                    ({product.rating_count ?? 106} {t('product.reviews', 'reviews')})
                  </span>
                </div>
              </div>

              {/* Clean Option Variants (Compact Flex Chips without scrollbar clutter) */}
              {variants.length > 1 && (
                <div className="space-y-2 pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t('product.options', 'Options')}:</span>
                    </span>
                    {selectedVariant && (
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        {formatVariantLabel(selectedVariant.name, product.name)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {variants.map((v) => {
                      const cleanLabel = formatVariantLabel(v.name, product.name)
                      const isSelected = selectedVariantId === v.id
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={cn(
                            'px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-2xs',
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500/25 shadow-xs font-bold'
                              : 'bg-slate-50/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30'
                          )}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                          <span>{cleanLabel}</span>
                          {v.selling_price && (
                            <span
                              className={cn(
                                'text-[10.5px] font-mono font-bold ml-0.5',
                                isSelected ? 'text-white/90' : 'text-slate-400 dark:text-slate-500'
                              )}
                            >
                              ${Number(v.selling_price).toFixed(0)}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Price, Stepper & Total Container (PTC Style Clean Bar) */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {/* Unit Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {t('product.price', 'Price')}:
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-500 font-display">
                      ${activePrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/pc</span>

                    {comparePrice && comparePrice > activePrice && (
                      <span className="text-sm font-semibold text-slate-400 line-through ml-1">
                        ${comparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Savings Badge */}
                  {savingsPerUnit > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {t('product.save', 'Save')}: ${(savingsPerUnit * quantity).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Quantity Stepper & Live Total */}
                <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {t('product.quantity', 'Quantity')}:
                    </span>
                    <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 shadow-2xs select-none">
                      <button
                        type="button"
                        disabled={quantity <= 1 || isOutOfStock}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35 transition-colors cursor-pointer select-none"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-slate-900 dark:text-slate-100 font-mono select-none pointer-events-none">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        disabled={isOutOfStock || (stockVal ? quantity >= stockVal : false)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35 transition-colors cursor-pointer select-none"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {t('product.total', 'TOTAL')}:
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Add to Cart + Wishlist */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={isOutOfStock || adding}
                  onClick={(e) => addToCart(product.id, quantity, selectedVariantId, e)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base shadow-lg transition-all duration-200 cursor-pointer',
                    added
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                      : isOutOfStock
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white shadow-rose-600/25 hover:shadow-rose-600/40'
                  )}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>{t('product.added', 'Added to Cart')}</span>
                    </>
                  ) : adding ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('product.adding', 'Adding...')}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>{t('product.add_to_cart', 'Add to Cart')}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleWishlistToggle(e, product.id)}
                  aria-label="Add to Wishlist"
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-200 cursor-pointer shadow-xs shrink-0',
                    inWishlist
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:bg-white'
                  )}
                >
                  <Heart className={cn('w-5 h-5', inWishlist && 'fill-rose-500 text-rose-500')} />
                </button>
              </div>

              {/* View Full Product Details Link */}
              <div className="text-center pt-1">
                <Link
                  to={`/products/${product.slug}`}
                  onClick={closePreview}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <span>{t('product.view_full_details', 'View Full Product Details')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ProductQuickPreview
