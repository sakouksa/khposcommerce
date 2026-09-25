import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useSettingsStore } from '@/stores'
import cartService from '@/services/cartService'
import ImageWithFallback from '@/components/common/ImageWithFallback'
import ProductPrice from '@/components/ecommerce/ProductPrice'
import EmptyState from '@/components/common/EmptyState'

export const CartDrawer: React.FC = () => {
  const {
    isOpen,
    setOpen,
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
      // Error handled
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
      // Error handled
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
      setCouponError(err.response?.data?.message || 'Failed to apply coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white font-display text-lg tracking-tight">
                  Shopping Cart ({items.length})
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <EmptyState
                  variant="empty-cart"
                  actionLabel="Start Shopping"
                  onAction={() => {
                    setOpen(false)
                    navigate('/products')
                  }}
                  className="h-full border-0 bg-transparent"
                />
              ) : (
                items.map((item) => {
                  const itemPrice =
                    item.variant?.selling_price ?? item.product?.selling_price ?? 0
                  const itemCompare = item.product?.compare_price
                  const itemImg = item.product?.image

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 relative group"
                    >
                      {/* Item Image */}
                      <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-700">
                        <ImageWithFallback
                          src={itemImg}
                          alt={item.product?.name || 'Product'}
                          aspectRatio="square"
                        />
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                            {item.product?.name}
                          </h4>
                          {item.variant && (
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                              Variant: {item.variant.name}
                            </span>
                          )}
                          <ProductPrice
                            price={itemPrice}
                            comparePrice={itemCompare}
                            size="xs"
                          />
                        </div>

                        {/* Qty Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                            <button
                              onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                              disabled={updatingId === item.id || item.quantity <= 1}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 disabled:opacity-40 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-2 min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                              disabled={updatingId === item.id}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                {/* Coupon form */}
                {coupon_code ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-xs text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Tag className="w-3.5 h-3.5" />
                      Coupon applied: <span className="font-bold">{coupon_code}</span>
                    </div>
                    <button
                      onClick={clearCoupon}
                      className="text-emerald-800 dark:text-emerald-300 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo / Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="input py-1.5 text-xs flex-1 uppercase"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="btn-secondary py-1.5 text-xs font-bold"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-xs text-rose-500">{couponError}</p>}

                {/* Subtotals */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  {discount ? (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800 font-display">
                    <span>Estimated Total</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/cart"
                    onClick={() => setOpen(false)}
                    className="btn-secondary text-center text-xs py-3 rounded-xl font-bold"
                  >
                    View Cart
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={() => setOpen(false)}
                    className="btn-primary text-center text-xs py-3 rounded-xl font-bold flex items-center justify-center gap-1"
                  >
                    Checkout <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer
