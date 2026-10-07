import React from 'react'
import { Link } from 'react-router-dom'
import { XCircle, RefreshCw, ShoppingBag } from 'lucide-react'
import SEOHead from '@/components/seo/SEOHead'

const CheckoutFailedPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Payment Failed"
        description="Payment could not be processed."
        canonical="/checkout/failed"
        robots="noindex, nofollow"
      />
      <div className="container-site py-16 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center shadow-lg">
          <XCircle className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">
            Payment Unsuccessful
          </h1>
          <p className="text-sm text-gray-500">
            We couldn't process your payment. Please try again or select a different payment method.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full pt-4">
          <Link to="/checkout" className="btn-primary flex-1 py-3 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> Try Again
          </Link>
          <Link to="/cart" className="btn-secondary flex-1 py-3 text-xs flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Return to Cart
          </Link>
        </div>
      </div>
    </>
  )
}

export default CheckoutFailedPage
