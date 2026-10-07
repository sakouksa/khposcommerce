import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  X,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { useSettingsStore } from '@/stores'

interface TrackOrderModalProps {
  isOpen: boolean
  onClose: () => void
}

interface OrderTrackingData {
  order_number: string
  status: string
  total: number
  created_at: string
  customer_name?: string
  shipping_address?: string
  items_count?: number
  items?: Array<{ name: string; quantity: number; price: number }>
  histories?: Array<{ status: string; note: string; created_at: string }>
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const { formatPrice } = useSettingsStore()
  const [orderNumber, setOrderNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<OrderTrackingData | null>(null)

  const steps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: ShieldCheck },
  ]

  const getStepIndex = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'delivered' || s === 'completed') return 4
    if (s === 'shipped' || s === 'delivering') return 3
    if (s === 'processing' || s === 'packed') return 2
    if (s === 'confirmed' || s === 'paid') return 1
    return 0
  }

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim()) return

    setLoading(true)
    setError(null)
    setOrderData(null)

    try {
      const res = await api.get(`/track/${encodeURIComponent(orderNumber.trim())}`)
      if (res.data?.data) {
        setOrderData(res.data.data)
      } else {
        setError('Order not found. Please check your order number.')
      }
    } catch {
      setError('Unable to find order details. Please verify your invoice number.')
    } finally {
      setLoading(false)
    }
  }

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
          className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-transparent dark:from-gray-800/50 dark:via-gray-800/30 dark:to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">
                  {t('nav.track_order', 'Track Your Order')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter your Order / Invoice number to see live status
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Form */}
          <div className="p-6">
            <form onSubmit={handleTrack} className="flex gap-2">
              <div className="relative flex-1">
                <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. ORD-202608-0001 or INV-1002"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !orderNumber.trim()}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Track</span>
                  </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 border border-red-200 dark:border-red-900/50">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Order Tracking Progress Card */}
            {orderData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-5"
              >
                {/* Meta details */}
                <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-gray-700/60 pb-3">
                  <div>
                    <div className="text-xs text-gray-500">Order Number</div>
                    <div className="text-sm font-bold font-mono text-gray-900 dark:text-white">
                      {orderData.order_number}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Total Amount</div>
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(orderData.total || 0)}
                    </div>
                  </div>
                </div>

                {/* Progress Step Timeline */}
                <div className="py-2">
                  <div className="relative flex items-center justify-between">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 dark:bg-gray-700 -z-0" />
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 -z-0"
                      style={{
                        width: `${(getStepIndex(orderData.status) / (steps.length - 1)) * 100}%`,
                      }}
                    />

                    {steps.map((step, idx) => {
                      const isComplete = idx <= getStepIndex(orderData.status)
                      const isCurrent = idx === getStepIndex(orderData.status)
                      const Icon = step.icon

                      return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                              isComplete
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                            } ${isCurrent ? 'ring-4 ring-blue-500/20 scale-110' : ''}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span
                            className={`text-[10px] mt-1.5 font-bold whitespace-nowrap ${
                              isComplete
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>Need immediate help? Call hotline: 012 220 152</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default TrackOrderModal
