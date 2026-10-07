import React, { useState } from 'react'
import { Plus, Heart, Sparkles, Tag, Layers, Ban } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Product } from '../types/pos.types'
import { sound } from '@/utils/sound'
import { getAbsoluteImageUrl, resolveProductPhoto, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'
import { useToast } from '@/hooks/useToast'
import { formatCurrency } from '@/utils/formatters'

interface POSProductCardProps {
  product: Product
  onAddToCart: (p: Product) => void
  onOpenDetails: (p: Product) => void
  isFavorite: boolean
  onToggleFavorite: (id: number) => void
}

export const POSProductCard: React.FC<POSProductCardProps> = ({
  product,
  onAddToCart,
  onOpenDetails,
  isFavorite,
  onToggleFavorite,
}) => {
  const { t } = useTranslation(['pos', 'common', 'products'])
  const toast = useToast()
  const [imgError, setImgError] = useState(false)

  const fallbackImg = DEFAULT_PRODUCT_IMAGE

  const getImageUrl = (): string => {
    if (imgError) return fallbackImg
    return resolveProductPhoto(product.primary_image, product.images, product.category?.name, product.name)
  }

  const stock = (product.stock !== undefined && product.stock !== null) ? Number(product.stock) : 0
  const isOutOfStock = stock <= 0
  const isLowStock = stock > 0 && stock <= (product.low_stock_threshold ?? 5)
  const imageUrl = getImageUrl()

  const handleCardClick = () => {
    if (isOutOfStock) {
      sound.playError()
      toast.error(t('productOutOfStock', `Product "${product.name}" is out of stock!`))
      return
    }
    sound.playClick()
    onOpenDetails(product)
  }

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isOutOfStock) {
      sound.playError()
      toast.error(t('productOutOfStock', `Product "${product.name}" is out of stock!`))
      return
    }

    if (product.has_variants) {
      sound.playClick()
      onOpenDetails(product)
    } else {
      sound.playSuccess()
      onAddToCart(product)
    }
  }

  return (
    <div
      className={`bg-card hover:bg-accent/40 border rounded-3xl p-2.5 sm:p-3.5 flex flex-col justify-between transition-all duration-200 group relative shadow-2xs hover:shadow-md ${
        isOutOfStock
          ? 'opacity-70 border-rose-500/20 bg-rose-500/[0.02]'
          : 'border-border/80 hover:border-primary/40'
      }`}
    >
      {/* Top Badges & Favorite Heart */}
      <div className="flex items-center justify-between gap-1 mb-2 z-10">
        <div className="flex flex-wrap gap-1">
          {product.compare_price && product.compare_price > product.selling_price && (
            <span className="px-1.5 py-0.5 rounded-lg bg-rose-500 text-white text-[9px] font-black uppercase flex items-center gap-0.5 shadow-xs">
              <Tag size={10} /> {t('sale', 'Sale')}
            </span>
          )}
          {product.is_featured && (
            <span className="px-1.5 py-0.5 rounded-lg bg-amber-500 text-white text-[9px] font-black uppercase flex items-center gap-0.5 shadow-xs">
              <Sparkles size={10} /> {t('featured', 'Featured')}
            </span>
          )}
          {product.has_variants && (
            <span className="px-1.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[9px] font-extrabold flex items-center gap-0.5">
              <Layers size={10} /> {t('variants', 'Variants')}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            sound.playClick()
            onToggleFavorite(product.id)
          }}
          className={`p-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
            isFavorite
              ? 'text-rose-500 bg-rose-500/10'
              : 'text-muted-foreground hover:text-rose-500 hover:bg-muted'
          }`}
          title={t('toggleFavorite', 'Toggle Favorite')}
        >
          <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Image Display */}
      <div
        onClick={handleCardClick}
        className={`relative w-full h-28 xs:h-32 sm:h-36 rounded-2xl overflow-hidden bg-muted/30 mb-2 transition-transform duration-300 border border-border/40 ${
          isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer group-hover:scale-[1.02]'
        }`}
      >
        <img
          src={imageUrl}
          alt={product.name}
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isOutOfStock ? 'grayscale-[0.4] opacity-80' : 'group-hover:scale-105'
          }`}
        />

        {/* Stock status overlay pill */}
        <div className="absolute bottom-2 left-2 z-10">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-extrabold text-[10px] shadow-sm flex items-center gap-1">
              <Ban size={10} /> {t('outOfStock', 'Out of Stock')}
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white font-extrabold text-[10px] shadow-sm">
              {t('lowStockLeft', `Low: ${stock} left`, { stock })}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white font-mono text-[10px]">
              {t('stockCount', `Stock: ${stock}`, { stock })}
            </span>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-1">
        <h4
          onClick={handleCardClick}
          className={`font-bold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug transition-colors ${
            isOutOfStock ? 'cursor-not-allowed opacity-75' : 'hover:text-primary cursor-pointer'
          }`}
        >
          {product.name}
        </h4>
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground font-mono">
          <span className="truncate max-w-[90px]">{t('sku', 'SKU:')} {product.sku}</span>
          {product.category && (
            <span className="font-sans font-medium text-[9px] sm:text-[10px] bg-muted/70 px-1.5 py-0.2 rounded-md truncate max-w-[80px]">
              {product.category.name}
            </span>
          )}
        </div>
      </div>

      {/* Price & Add to Cart Button */}
      <div className="flex items-center justify-between mt-2.5 sm:mt-3 pt-2 border-t border-border/60">
        <div className="min-w-0">
          <div className="font-black text-xs sm:text-sm text-primary flex items-baseline gap-1 truncate">
            {formatCurrency(product.selling_price)}
            {product.compare_price && product.compare_price > product.selling_price && (
              <span className="text-[10px] text-muted-foreground line-through font-normal">
                {formatCurrency(product.compare_price)}
              </span>
            )}
          </div>
        </div>

        {isOutOfStock ? (
          <button
            type="button"
            disabled={true}
            onClick={handleAddClick}
            className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 cursor-not-allowed shadow-none"
            title={t('outOfStock', 'Out of Stock')}
          >
            <Ban size={12} className="text-rose-500" />
            <span>{t('outOfStock', 'Out of Stock')}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAddClick}
            className="btn-primary p-1.5 sm:p-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title={t('quickAddToCart', 'Quick Add to Cart')}
          >
            <Plus size={14} />
            <span className="font-bold hidden sm:inline text-[11px]">{t('add', 'Add')}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default POSProductCard
