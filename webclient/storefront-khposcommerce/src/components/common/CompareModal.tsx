import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, X, Trash2, ShoppingCart } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCompareStore } from '@/stores'
import { Link } from 'react-router-dom'
import type { ProductItem } from '@/types/store'
import productService from '@/services/productService'
import ImageWithFallback from './ImageWithFallback'
import ProductPrice from '@/components/ecommerce/ProductPrice'
import RatingStars from '@/components/ecommerce/RatingStars'
import { useAddToCart } from '@/hooks/useAddToCart'
import queryKeys from '@/constants/queryKeys'

interface CompareModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CompareModal: React.FC<CompareModalProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, clear } = useCompareStore()
  const { addToCart } = useAddToCart({ openDrawerOnAdd: true })

  // Fetch product details for items in compare
  const { data: products = [] } = useQuery<ProductItem[]>({
    queryKey: queryKeys.products.compare(items),
    queryFn: async () => {
      if (items.length === 0) return []
      const res = await productService.getProducts({ per_page: 50 })
      const all = res.data || []
      return all.filter((p) => items.includes(p.id))
    },
    enabled: isOpen && items.length > 0,
  })

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-transparent dark:from-slate-800/50 dark:via-slate-800/30 dark:to-transparent flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Product Comparison ({items.length}/4)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Compare technical specifications, price, and ratings side-by-side
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clear}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
            {items.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Scale className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  No products added to comparison
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the compare button on any product card in our catalog to compare up to 4 devices.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Remove Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                          title="Remove from compare"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Image */}
                      <div className="aspect-square rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-2 flex items-center justify-center">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          aspectRatio="square"
                        />
                      </div>

                      {/* Info */}
                      <div>
                        <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          {product.brand || 'Enterprise'}
                        </div>
                        <Link
                          to={`/products/${product.slug}`}
                          onClick={onClose}
                          className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 line-clamp-2"
                        >
                          {product.name}
                        </Link>
                      </div>

                      {/* Price & Rating */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                        <ProductPrice
                          price={product.selling_price || product.price || 0}
                          comparePrice={product.compare_price}
                          size="sm"
                        />
                        <RatingStars
                          rating={product.rating_avg}
                          showCount={false}
                          showScore
                          size="xs"
                        />
                      </div>

                      {/* Specifications Summary */}
                      <div className="text-[11px] space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Category:</span>
                          <span className="font-semibold">{product.category || 'Catalog'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Availability:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            In Stock
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Warranty:</span>
                          <span className="font-semibold">Official Genuine</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={async () => {
                        await addToCart(product.id, 1)
                        onClose()
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CompareModal
