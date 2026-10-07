import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react'
import { useSettingsStore } from '@/stores'
import SEOHead from '@/components/seo/SEOHead'

const CheckoutSuccessPage: React.FC = () => {
  const location = useLocation()
  const { formatPrice } = useSettingsStore()
  const order = location.state?.order

  return (
    <>
      <SEOHead
        title="Order Placed Successfully"
        description="Thank you for your order at Enterprise Store."
        canonical="/checkout/success"
        robots="noindex, nofollow"
      />
      <div className="container-site py-16 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shadow-lg">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">
          Thank You For Your Order!
        </h1>
        <p className="text-sm text-gray-500">
          Your order has been placed successfully and is now being processed.
        </p>
      </div>

      {order && (
        <div className="card p-6 w-full text-left space-y-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-xs">
          <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500">Order Number</span>
            <span className="font-bold text-gray-900 dark:text-white">{order.order_number}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500">Grand Total</span>
            <span className="font-bold text-blue-600">{formatPrice(order.grand_total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="badge-success">{order.status || 'Pending'}</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 w-full pt-4">
        <Link to="/account/orders" className="btn-primary flex-1 py-3 text-xs flex items-center justify-center gap-2">
          <Package className="w-4 h-4" /> View My Orders
        </Link>
        <Link to="/" className="btn-secondary flex-1 py-3 text-xs flex items-center justify-center gap-2">
          <Home className="w-4 h-4" /> Home Page
        </Link>
      </div>
    </div>
    </>
  )
}

export default CheckoutSuccessPage
