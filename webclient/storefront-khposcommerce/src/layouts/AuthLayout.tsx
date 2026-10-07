import React from 'react'
import { Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/layout/CartDrawer'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import ScrollToTop from '@/components/common/ScrollToTop'
import OfflineBanner from '@/components/common/OfflineBanner'
import { useStoreSettings } from '@/hooks'
import { useTranslation } from 'react-i18next'

export const AuthLayout: React.FC = () => {
  const { t } = useTranslation()
  const { data: storeSettings } = useStoreSettings()
  const siteName = storeSettings?.site_name || 'NexTech Store'

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>{t('nav.account', 'Account')} | {siteName}</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased pb-16 lg:pb-0">
        <OfflineBanner />
        
        {/* Full Storefront Website Header */}
        <Header />

        {/* Clean Centered Content Area with subtle contrast */}
        <main className="flex-1 flex items-center justify-center py-10 sm:py-16 px-4 bg-slate-50/60 dark:bg-slate-950">
          <div className="w-full max-w-[550px] mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Full Storefront Website Footer */}
        <Footer />

        {/* Global Drawers & Floating Elements */}
        <CartDrawer />
        <MobileBottomNav />
        <ScrollToTop />
      </div>
    </>
  )
}

export default AuthLayout
