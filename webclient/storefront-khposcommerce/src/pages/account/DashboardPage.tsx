import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Heart,
  Award,
  MapPin,
  ChevronRight,
  Truck,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Clock,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore, useSettingsStore, useWishlistStore } from '@/stores'
import orderService from '@/services/orderService'
import type { Order } from '@/types/store'
import Spinner from '@/components/ui/Spinner'
import OrderStatusBadge from '@/components/ecommerce/OrderStatusBadge'
import { formatDate } from '@/lib/utils'

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation()
  const { customer, user } = useAuthStore()
  const { formatPrice } = useSettingsStore()
  const wishlistCount = useWishlistStore((s) => s.items.length)

  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService
      .getOrders({ per_page: 5 })
      .then((data) => setRecentOrders(data || []))
      .catch(() => setRecentOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const points = customer?.loyalty_points ?? 0
  const orderCount = customer?.order_count || recentOrders.length || 0

  return (
    <div className="space-y-6">
      {/* ─── Metric & Stats Cards Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Orders */}
        <Link
          to="/account/orders"
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            {orderCount}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-2 group-hover:translate-x-0.5 transition-transform">
            <span>View order history</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Card 2: Reward Points */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Reward Points
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1.5">
            <span>{points.toLocaleString()}</span>
            <span className="text-xs font-semibold text-amber-500">pts</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Worth ${(points * 0.01).toFixed(2)} off next order</span>
          </div>
        </div>

        {/* Card 3: Saved Wishlist */}
        <Link
          to="/account/wishlist"
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-rose-500/40 dark:hover:border-rose-500/40 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Saved Items
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            {wishlistCount}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-2 group-hover:translate-x-0.5 transition-transform">
            <span>Explore wishlist</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Card 4: Default Address */}
        <Link
          to="/account/addresses"
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Delivery Address
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {customer?.phone || 'Cambodia Delivery'}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2 group-hover:translate-x-0.5 transition-transform">
            <span>Manage addresses</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* ─── Quick Shortcuts ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/account/orders"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-[#f58220]/60 hover:shadow-xs transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-[#f58220] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Truck className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Track Orders</div>
            <div className="text-[10px] text-slate-400 truncate">Check shipment status</div>
          </div>
        </Link>

        <Link
          to="/flash-sale"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-[#f58220]/60 hover:shadow-xs transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Flash Deals</div>
            <div className="text-[10px] text-slate-400 truncate">Up to 40% discount</div>
          </div>
        </Link>

        <Link
          to="/account/addresses"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-[#f58220]/60 hover:shadow-xs transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Saved Location</div>
            <div className="text-[10px] text-slate-400 truncate">Fast checkout address</div>
          </div>
        </Link>

        <Link
          to="/account/profile"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-[#f58220]/60 hover:shadow-xs transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Security</div>
            <div className="text-[10px] text-slate-400 truncate">Password & Profile</div>
          </div>
        </Link>
      </div>

      {/* ─── Recent Orders Section ───────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f58220]/10 text-[#f58220] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-display">
                Recent Orders
              </h3>
              <p className="text-[11px] text-slate-400">Track and manage your recent purchases</p>
            </div>
          </div>

          <Link
            to="/account/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#f58220] hover:text-[#d97015] hover:underline"
          >
            <span>View All ({orderCount})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Spinner size="md" />
            <span className="text-xs text-slate-400">Loading your orders...</span>
          </div>
        ) : recentOrders.length === 0 ? (
          /* Clean & Friendly Empty State */
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-center text-[#f58220] mb-4 shadow-xs">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              No orders placed yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
              Explore our wide collection of laptops, gaming hardware, smart devices, and accessories with nationwide fast delivery!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f58220] hover:bg-[#e07110] text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              <span>Browse Products</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Recent Orders List */
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-mono">
                      #{order.order_number}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60 dark:border-slate-700">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Amount</div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                      {formatPrice(order.grand_total ?? order.total ?? 0)}
                    </div>
                  </div>

                  <Link
                    to={`/account/orders/${order.order_number}`}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Member Benefits Card ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white">Free Express Delivery</h5>
            <p className="text-[11px] text-slate-400">On all eligible orders over $50</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white">Cashback Reward Points</h5>
            <p className="text-[11px] text-slate-400">Earn points on every item you buy</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white">Genuine Product Warranty</h5>
            <p className="text-[11px] text-slate-400">100% authentic with 30-day support</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
