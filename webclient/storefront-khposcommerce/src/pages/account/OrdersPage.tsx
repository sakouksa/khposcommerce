import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  ChevronRight,
  Search,
  Calendar,
  Clock,
  ArrowUpRight,
  ShoppingBag,
  Filter,
} from 'lucide-react'
import { useSettingsStore } from '@/stores'
import orderService from '@/services/orderService'
import type { Order } from '@/types/store'
import Spinner from '@/components/ui/Spinner'
import OrderStatusBadge from '@/components/ecommerce/OrderStatusBadge'
import { formatDate } from '@/lib/utils'

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { formatPrice } = useSettingsStore()

  useEffect(() => {
    orderService
      .getOrders()
      .then((data) => setOrders(data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus =
        statusFilter === 'all' ||
        order.status?.toLowerCase() === statusFilter.toLowerCase()

      return matchSearch && matchStatus
    })
  }, [orders, searchQuery, statusFilter])

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      processing: orders.filter((o) => ['processing', 'pending', 'confirmed'].includes(o.status?.toLowerCase() || '')).length,
      completed: orders.filter((o) => ['completed', 'delivered'].includes(o.status?.toLowerCase() || '')).length,
      cancelled: orders.filter((o) => ['cancelled', 'refunded'].includes(o.status?.toLowerCase() || '')).length,
    }
  }, [orders])

  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-12 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <span className="text-xs text-slate-400">Loading order history...</span>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ─── Header Card with Search & Filters ──────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f58220]/10 text-[#f58220] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                My Orders ({orders.length})
              </h2>
              <p className="text-xs text-slate-400">View and track all your previous purchases</p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { key: 'all', label: 'All Orders', count: statusCounts.all },
            { key: 'processing', label: 'Processing', count: statusCounts.processing },
            { key: 'completed', label: 'Completed', count: statusCounts.completed },
            { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === tab.key
                  ? 'bg-white/20 dark:bg-slate-900/20 text-inherit'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Orders List ────────────────────────────────────────────────────── */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-center text-[#f58220] mb-4 shadow-xs">
            <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {orders.length === 0 ? 'No orders placed yet' : 'No matching orders found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
            {orders.length === 0
              ? 'Browse our extensive catalog of authentic tech products, computers, and accessories.'
              : 'Try clearing your search query or selecting a different status filter.'}
          </p>
          {orders.length === 0 ? (
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f58220] hover:bg-[#e07110] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <span>Start Shopping</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-white font-mono tracking-tight">
                    #{order.order_number}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(order.created_at)}
                  </span>
                  {order.items_count ? (
                    <>
                      <span>•</span>
                      <span>{order.items_count} items</span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                <div className="text-left sm:text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Amount</div>
                  <div className="font-bold text-base text-slate-900 dark:text-white font-mono text-[#f58220]">
                    {formatPrice(order.grand_total ?? order.total ?? 0)}
                  </div>
                </div>

                <Link
                  to={`/account/orders/${order.order_number}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#f58220] hover:text-white dark:hover:bg-[#f58220] text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs group"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
