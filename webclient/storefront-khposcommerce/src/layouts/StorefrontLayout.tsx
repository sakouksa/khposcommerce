import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/layout/CartDrawer'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import ScrollToTop from '@/components/common/ScrollToTop'
import OfflineBanner from '@/components/common/OfflineBanner'
import PromoBannerPopup from '@/components/common/PromoBannerPopup'
import { useCartStore } from '@/stores/cartStore'
import { WEBSITE_SCHEMA, ORGANIZATION_SCHEMA } from '@/components/seo/SEOHead'
import ChatbotWidget from '@/components/chatbot'
import ProductQuickPreview from '@/components/ecommerce/ProductQuickPreview'
import ProductHoverPopover from '@/components/ecommerce/ProductHoverPopover'
import api from '@/lib/api'

const StorefrontLayout: React.FC = () => {
  const setCart = useCartStore((s) => s.setCart)

  // Fetch initial cart on mount
  useEffect(() => {
    api.get('/cart')
      .then(({ data }) => {
        if (data?.data) {
          setCart(data.data)
        }
      })
      .catch(() => {
        // Silently fail
      })
  }, [setCart])

  return (
    <>
      {/* Root-level structured data — injected once for all storefront pages */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify([WEBSITE_SCHEMA, ORGANIZATION_SCHEMA])}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased pb-16 lg:pb-0">
        <OfflineBanner />
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
        <MobileBottomNav />
        <ScrollToTop />
        <PromoBannerPopup />
        <ChatbotWidget />
        <ProductQuickPreview />
        <ProductHoverPopover />
      </div>
    </>
  )
}

export default StorefrontLayout
