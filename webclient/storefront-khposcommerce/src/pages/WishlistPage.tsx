import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, ArrowUpRight } from 'lucide-react'
import ProductCard from '@/components/ecommerce/ProductCard'
import EmptyState from '@/components/common/EmptyState'
import Spinner from '@/components/ui/Spinner'
import PageTransition from '@/components/common/PageTransition'
import SEOHead from '@/components/seo/SEOHead'
import { useWishlistStore } from '@/stores'
import wishlistService, { type WishlistItem } from '@/services/wishlistService'

export const WishlistPage: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { setItems } = useWishlistStore()

  useEffect(() => {
    wishlistService
      .getWishlist()
      .then((items) => {
        const list = items || []
        setWishlist(list)
        // Synchronize store count with actual server wishlist
        const productIds = list
          .map((i) => i.product_id || i.product?.id)
          .filter(Boolean) as number[]
        setItems(productIds)
      })
      .catch(() => {
        setWishlist([])
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [setItems])

  const seoElement = (
    <SEOHead
      title="My Wishlist | OptaPOS Store"
      description="Saved products in your OptaPOS wishlist."
      canonical="/wishlist"
      robots="noindex, follow"
    />
  )

  if (loading) {
    return (
      <>
        {seoElement}
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Spinner size="lg" />
          <span className="text-xs text-slate-400">Loading your saved items...</span>
        </div>
      </>
    )
  }

  return (
    <>
      {seoElement}
      <PageTransition className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                My Wishlist ({wishlist.length})
              </h1>
              <p className="text-xs text-slate-400">Saved products to buy later</p>
            </div>
          </div>

          {wishlist.length > 0 && (
            <Link
              to="/products"
              className="text-xs font-bold text-[#f58220] hover:underline"
            >
              Continue Shopping
            </Link>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-center text-rose-500 mb-4 shadow-xs">
              <Heart className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Your Wishlist is Empty
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
              Explore our tech catalog and click the heart icon on any product to save it here for later!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f58220] hover:bg-[#e07110] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <span>Explore Products</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlist.map(
              (item) =>
                item.product && (
                  <ProductCard key={item.id} product={item.product} />
                )
            )}
          </div>
        )}
      </PageTransition>
    </>
  )
}

export default WishlistPage
