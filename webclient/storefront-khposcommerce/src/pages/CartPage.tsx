import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useSettingsStore } from '@/stores'
import PageTransition from '@/components/common/PageTransition'
import SEOHead from '@/components/seo/SEOHead'
import EmptyState from '@/components/common/EmptyState'
import ImageWithFallback from '@/components/common/ImageWithFallback'
import ProductPrice from '@/components/ecommerce/ProductPrice'
import cartService from '@/services/cartService'
import Spinner from '@/components/ui/Spinner'

export const CartPage: React.FC = () => {
  const {
    items,
    subtotal,
    total,
    coupon_code,
    discount,
    setCart,
    applyCoupon,
    clearCoupon,
  } = useCartStore()
  const { formatPrice } = useSettingsStore()
  const navigate = useNavigate()

  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const handleUpdateQty = async (itemId: number, newQty: number) => {
    setUpdatingId(itemId)
    try {
      const data = await cartService.updateQuantity(itemId, newQty)
      setCart(data)
    } catch {
      // Error handling
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (itemId: number) => {
    setUpdatingId(itemId)
    try {
      const data = await cartService.removeItem(itemId)
      setCart(data)
    } catch {
      // Error handling
    } finally {
      setUpdatingId(null)
    }
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError(null)

    try {
      const data = await cartService.applyCoupon(couponInput.trim())
      if (data.coupon_code && data.discount !== undefined) {
        applyCoupon(data.coupon_code, data.discount)
      } else {
        setCart(data)
      }
      setCouponInput('')
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code')
    } finally {
      setCouponLoading(false)
    }
  }

  const seoElement = (
    <SEOHead
      title={`Shopping Cart (${items.length})`}
      description="Review items in your shopping cart before proceeding to secure checkout."
      canonical="/cart"
      robots="noindex, follow"
    />
  )

  if (items.length === 0) {
    return (
      <>
        {seoElement}
        <div className="container-site py-12 max-w-2xl mx-auto">
          <EmptyState variant="empty-cart" />
        </div>
      </>
    )
  }

  return (
    <>
      {seoElement}
      <PageTransition className="container-site py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Shopping Cart ({items.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review your items before proceeding to checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Cart Items List ────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const itemPrice =
                item.variant?.selling_price ?? item.product?.selling_price ?? 0
              const itemCompare = item.product?.compare_price
              const itemImg = item.product?.image

              return (
                <div
                  key={item.id}
                  className="card p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50 dark:bg-slate-800">
                    <ImageWithFallback
                      src={itemImg}
                      alt={item.product?.name || 'Product'}
                      aspectRatio="square"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left w-full">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                      {item.product?.name}
                    </h3>
                    {item.variant && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Variant: {item.variant.name}
                      </div>
                    )}
                    <ProductPrice price={itemPrice} comparePrice={itemCompare} size="xs" />
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                        disabled={updatingId === item.id || item.quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 shadow-xs disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">
                        {updatingId === item.id ? <Spinner size="sm" /> : item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                        disabled={updatingId === item.id}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 shadow-xs disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {formatPrice(itemPrice * item.quantity)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={updatingId === item.id}
                      className="text-slate-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Order Summary ─────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="card p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white font-display">
                Order Summary
              </h2>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="input text-xs uppercase flex-1"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="btn-secondary text-xs px-3 font-bold flex items-center gap-1.5"
                  >
                    {couponLoading ? <Spinner size="sm" /> : <Tag className="w-3.5 h-3.5" />}
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-xs text-rose-500">{couponError}</p>}
              </form>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                {discount && discount > 0 ? (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({coupon_code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-3 border-t border-slate-100 dark:border-slate-800 font-display">
                  <span>Total</span>
                  <span className="text-blue-600 dark:text-blue-400">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg rounded-2xl"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center gap-3 text-xs text-blue-700 dark:text-blue-300 shadow-2xs">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span>Guaranteed Safe & Secure Checkout with 256-bit SSL</span>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  )
}

export default CartPage
