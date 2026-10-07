import React, { useState } from 'react'
import { Search, Package, Clock, CheckCircle2 } from 'lucide-react'
import api from '@/lib/api'
import Spinner from '@/components/ui/Spinner'
import PageTransition from '@/components/common/PageTransition'
import SEOHead from '@/components/seo/SEOHead'

const TrackOrderPage: React.FC = () => {
  const [number, setNumber]   = useState('')
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder]     = useState<any>(null)
  const [error, setError]     = useState<string | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!number.trim()) return
    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      const { data } = await api.get(`/track/${number.trim()}`, { params: { email: email.trim() || undefined } })
      setOrder(data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order not found. Please check order number and email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead
        title="Track Your Order"
        description="Check live shipping status and delivery updates for your Enterprise Store order in Cambodia."
        canonical="/track"
        robots="noindex, follow"
      />
      <PageTransition className="container-site py-12 max-w-xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">
          Track Your Order
        </h1>
        <p className="text-xs text-gray-500">
          Enter your order number (e.g. ORD-XXXXXXXXXX) to view live delivery status.
        </p>
      </div>

      <div className="card p-6 space-y-4 shadow-lg">
        {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium">{error}</div>}

        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Order Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ORD-12345678"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="input uppercase"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Email Address (Optional for verification)
            </label>
            <input
              type="email"
              placeholder="customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            {loading ? <Spinner size="sm" /> : <Search className="w-4 h-4" />}
            {loading ? 'Searching...' : 'Track Order Status'}
          </button>
        </form>
      </div>

      {order && (
        <div className="card p-6 space-y-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <div className="font-bold text-sm text-gray-900 dark:text-white">{order.order_number}</div>
              <div className="text-xs text-gray-400">Placed on {new Date(order.created_at).toLocaleDateString()}</div>
            </div>
            <span className="badge-primary">{order.status}</span>
          </div>

          {order.timeline?.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status History
              </h4>
              <div className="space-y-2">
                {order.timeline.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white capitalize">{item.status}</div>
                      <div className="text-gray-500">{item.comment}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageTransition>
    </>
  )
}

export default TrackOrderPage
