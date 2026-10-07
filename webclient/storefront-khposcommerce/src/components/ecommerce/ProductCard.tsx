import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Scale, Check, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn, calculateDiscountPercent } from '@/lib/utils'
import { getCategoryIconElement } from '@/lib/icons'
import type { ProductItem } from '@/types/store'
import { useCompareStore } from '@/stores'
import { useProductPreviewStore } from '@/stores/productPreviewStore'
import ImageWithFallback from '@/components/common/ImageWithFallback'
import ProductPrice from './ProductPrice'
import RatingStars from './RatingStars'
import WishlistButton from './WishlistButton'
import AddToCartButton from './AddToCartButton'

export interface ProductCardProps {
  product: ProductItem
  variant?: 'default' | 'compact' | 'featured' | 'horizontal'
  aspectRatio?: 'square' | 'video'
  className?: string
  showWishlist?: boolean
  showAddToCart?: boolean
  showRating?: boolean
  showBadges?: boolean
  showCompare?: boolean
  onQuickView?: (product: ProductItem) => void
}

export const ProductCard = React.memo<ProductCardProps>(({
  product,
  variant = 'default',
  aspectRatio = 'square',
  className,
  showWishlist = true,
  showAddToCart = true,
  showRating = true,
  showBadges = true,
  showCompare = true,
  onQuickView,
}) => {
  const { t } = useTranslation()
  const { addItem: addCompare, removeItem: removeCompare, has: inCompare } = useCompareStore()
  const {
    modalProduct,
    isModalOpen,
    openModal,
    openHover,
    closeHover,
    hoverProduct,
    isHoverOpen,
  } = useProductPreviewStore()

  const cardRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isCurrentActivePreview = isModalOpen && modalProduct?.id === product.id
  const isCurrentHovered = isHoverOpen && hoverProduct?.id === product.id

  const handleMouseEnter = () => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return
    hoverTimeoutRef.current = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        openHover(product, rect)
      }
    }, 180)
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setTimeout(() => {
      const { isHoverLocked, hoverProduct } = useProductPreviewStore.getState()
      if (!isHoverLocked && hoverProduct?.id === product.id) {
        closeHover()
      }
    }, 140)
  }

  const handlePreviewTrigger = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    closeHover()
    openModal(product)
    if (onQuickView) onQuickView(product)
  }

  const isComparing = inCompare(product.id)
  const activePrice = product.flash_price ?? product.selling_price ?? product.price ?? 0
  const comparePrice = product.compare_price
  const discount =
    product.discount_pct ||
    (comparePrice && comparePrice > activePrice
      ? calculateDiscountPercent(activePrice, comparePrice)
      : 0)

  const stockVal = product.stock ?? product.stock_quantity
  const isOutOfStock =
    product.in_stock !== undefined
      ? !product.in_stock
      : stockVal !== undefined
        ? Number(stockVal) <= 0
        : false

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isComparing) {
      removeCompare(product.id)
    } else {
      addCompare(product.id)
    }
  }

  // ── 1. Horizontal Layout (for List Views, Cart / Wishlist) ─────────────────
  if (variant === 'horizontal') {
    return (
      <div
        className={cn(
          'group relative flex flex-col sm:flex-row items-center gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-300',
          className
        )}
      >
        <Link
          to={`/products/${product.slug}`}
          className="w-full sm:w-36 h-36 rounded-2xl overflow-hidden flex-shrink-0 relative block"
        >
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            aspectRatio="square"
            className="group-hover:scale-105 transition-transform duration-300"
          />
          {showBadges && discount > 0 && (
            <span className="absolute top-2 left-2 rounded-md font-black text-[10px] bg-rose-500 text-white px-2 py-0.5 shadow-xs">
              -{discount}%
            </span>
          )}
        </Link>

        <div className="flex-1 min-w-0 space-y-2 w-full">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate">
              {getCategoryIconElement(product.category_slug || product.category || product.brand, 'w-3 h-3 flex-shrink-0')}
              <span className="truncate">{product.brand || product.category || 'Enterprise'}</span>
            </div>
            {showRating && (
              <RatingStars
                rating={product.rating_avg}
                count={product.rating_count}
                size="xs"
              />
            )}
          </div>

          <Link
            to={`/products/${product.slug}`}
            className="block font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors line-clamp-2"
          >
            {product.name}
          </Link>

          <ProductPrice
            price={activePrice}
            comparePrice={comparePrice}
            discountPct={discount}
            size="sm"
          />
        </div>

        <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto justify-end">
          {showWishlist && <WishlistButton productId={product.id} size="sm" />}
          {showAddToCart && (
            <AddToCartButton
              productId={product.id}
              isOutOfStock={isOutOfStock}
              size="sm"
            />
          )}
        </div>
      </div>
    )
  }

  // ── 2. Compact Layout (for Sidebars, Widgets) ──────────────────────────────
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'group relative flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all',
          className
        )}
      >
        <Link
          to={`/products/${product.slug}`}
          className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 block"
        >
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            aspectRatio="square"
            className="group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            to={`/products/${product.slug}`}
            className="block font-bold text-xs text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <ProductPrice price={activePrice} comparePrice={comparePrice} size="xs" />
        </div>

        {showAddToCart && (
          <AddToCartButton
            productId={product.id}
            variant="icon"
            isOutOfStock={isOutOfStock}
            size="sm"
            className="w-8 h-8 rounded-xl flex-shrink-0"
          />
        )}
      </div>
    )
  }

  // ── 3. Default & Featured Grid Card Layout ─────────────────────────────────
  const isFeatured = variant === 'featured' || product.is_featured

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 transform hover:-translate-y-1',
        isFeatured && 'ring-1 ring-amber-400/30 border-amber-300/40 dark:border-amber-500/20',
        (isCurrentActivePreview || isCurrentHovered) && 'ring-2 ring-blue-500 shadow-xl border-blue-500/50',
        className
      )}
    >
      {/* ── Image & Action Floating Buttons ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-800/60 p-2 sm:p-3 rounded-t-3xl">
        <Link
          to={`/products/${product.slug}`}
          className="block overflow-hidden rounded-2xl relative"
        >
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            aspectRatio={aspectRatio}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl"
          />
        </Link>

        {/* Badges */}
        {showBadges && (
          <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10 pointer-events-none">
            {discount > 0 && (
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-rose-500 text-white shadow-xs leading-none">
                -{discount}%
              </span>
            )}
            {isFeatured && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs flex items-center gap-1 leading-none">
                <Sparkles className="w-3 h-3" />
                <span>HOT</span>
              </span>
            )}
            {isOutOfStock && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800/90 text-slate-200 backdrop-blur-xs">
                {t('product.out_of_stock', 'Sold Out')}
              </span>
            )}
          </div>
        )}

        {/* Quick action buttons (Wishlist, Quick View & Compare) */}
        <div className="absolute top-3.5 right-3.5 flex flex-col gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {showWishlist && <WishlistButton productId={product.id} size="sm" />}

          {/* Quick View Eye Button under Wishlist */}
          <button
            onClick={handlePreviewTrigger}
            type="button"
            aria-label="Quick View Preview"
            title={t('product.quick_view', 'Quick View')}
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer',
              isCurrentActivePreview
                ? 'bg-blue-600 text-white shadow-blue-600/30'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60'
            )}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {showCompare && (
            <button
              onClick={handleToggleCompare}
              type="button"
              aria-label={isComparing ? 'Remove from compare' : 'Add to compare'}
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer',
                isComparing
                  ? 'bg-blue-600 text-white shadow-blue-600/30'
                  : 'bg-white/90 dark:bg-slate-900/90 text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60'
              )}
            >
              {isComparing ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Scale className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Product Info & Price ────────────────────────────────────────────── */}
      <div className="p-3.5 sm:p-4.5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Brand / Category */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <div className="flex items-center gap-1.5 uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate">
              {getCategoryIconElement(product.category_slug || product.category || product.brand, 'w-3.5 h-3.5 flex-shrink-0')}
              <span className="truncate">{product.brand || product.category || 'Enterprise'}</span>
            </div>
            {product.has_variants && (
              <span className="text-[10px] text-slate-400 font-semibold flex-shrink-0">
                {t('product.options', 'Options')}
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link
            to={`/products/${product.slug}`}
            className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* Rating */}
          {showRating && (
            <div className="mb-2">
              <RatingStars
                rating={product.rating_avg}
                count={product.rating_count}
                size="xs"
              />
            </div>
          )}

          {/* Price & Add to Cart Action */}
          <div className="flex items-center justify-between gap-2">
            <ProductPrice
              price={activePrice}
              comparePrice={comparePrice}
              discountPct={discount}
              size="sm"
            />

            {showAddToCart && (
              <AddToCartButton
                productId={product.id}
                variant="icon"
                size="md"
                isOutOfStock={isOutOfStock}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
