import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Check, Star, ExternalLink, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getCategoryIconElement } from '@/lib/icons'
import api from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'

export interface StructuredProduct {
  id: number
  name: string
  slug?: string
  sku?: string
  price: number
  compare_price?: number | null
  currency?: string
  category?: string
  brand?: string
  stock?: number
  in_stock?: boolean
  image_url?: string | null
  rating?: number
}

interface ProductCardProps {
  product: StructuredProduct
  onProductClick?: () => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const { t } = useTranslation()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const setCart = useCartStore((s) => s.setCart)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (adding) return

    setAdding(true)
    try {
      const response = await api.post('/cart/add', {
        product_id: product.id,
        quantity: 1,
      })

      if (response.data?.data) {
        setCart(response.data.data)
      }

      setAdded(true)
      setTimeout(() => setAdded(false), 2500)
    } catch (err) {
      console.error('Failed to add to cart:', err)
    } finally {
      setAdding(false)
    }
  }

  const discountPercent = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null

  const isAvailable = product.in_stock !== false

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 text-left w-[240px] shrink-0 group">
      {/* Thumbnail */}
      <div className="relative aspect-4/3 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-1">
            <Package className="w-8 h-8 opacity-40" />
            <span className="text-[10px] uppercase font-medium">
              {t('chatbot.product.no_image', 'No Image')}
            </span>
          </div>
        )}

        {discountPercent && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-md shadow-xs">
            -{discountPercent}%
          </span>
        )}

        {product.category && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-medium bg-slate-900/70 backdrop-blur-xs text-white rounded-md flex items-center gap-1">
            {getCategoryIconElement(product.category, 'w-3 h-3 text-white')}
            <span>{product.category}</span>
          </span>
        )}
      </div>

      {/* Info Container */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating ? Number(product.rating).toFixed(1) : '5.0'}</span>
          </div>

          <h4
            className="font-medium text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug"
            title={product.name}
          >
            {product.name}
          </h4>
        </div>

        {/* Price & Stock */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-[11px] text-slate-400 line-through">
                ${Number(product.compare_price).toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className={isAvailable ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-500 font-medium'}>
              {isAvailable ? t('chatbot.product.in_stock', '• In Stock') : t('chatbot.product.out_of_stock', '• Out of Stock')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <Link
            to={product.slug ? `/products/${product.slug}` : `/products`}
            onClick={onProductClick}
            className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span>{t('chatbot.product.view', 'View')}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable || adding}
            className={`flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-all shadow-xs ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3 h-3 stroke-[3]" />
                <span>{t('chatbot.product.added', 'Added')}</span>
              </>
            ) : adding ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-3 h-3" />
                <span>{t('chatbot.product.add', 'Add')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
