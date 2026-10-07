import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ShoppingCart,
  Heart,
  Menu,
  X,
  MapPin,
  Scale,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  useWishlistStore,
  useCompareStore,
  useSettingsStore,
  useLocationStore,
} from '@/stores'
import { useCartStore } from '@/stores/cartStore'
import { useStoreSettings, useScrollPosition } from '@/hooks'
import { cn, resolveMediaUrl } from '@/lib/utils'
import Navbar from './Navbar'
import TopUtilityBar from './TopUtilityBar'
import GlobalSearchBar from './GlobalSearchBar'
import UserMenu from './UserMenu'
import MobileDrawer from './MobileDrawer'
import CompareModal from '@/components/common/CompareModal'
import TrackOrderModal from '@/components/common/TrackOrderModal'
import WarrantyCheckModal from '@/components/common/WarrantyCheckModal'
import AnnouncementBar from '@/components/storefront/AnnouncementBar'

export const Header: React.FC<{ announcement?: any }> = ({ announcement }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const { isScrolled } = useScrollPosition(10)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const [trackOpen, setTrackOpen] = useState(false)
  const [warrantyOpen, setWarrantyOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Use global custom hook for store settings
  const { data: storeSettings } = useStoreSettings()

  const { item_count, subtotal, toggleOpen } = useCartStore()
  const wishlistCount = useWishlistStore((s) => s.count)
  const compareCount = useCompareStore((s) => s.items.length)
  const { formatPrice } = useSettingsStore()
  const { province } = useLocationStore()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    setLogoError(false)
  }, [storeSettings?.site_logo])

  const siteName = storeSettings?.site_name || 'Enterprise'
  const siteSubtitle = storeSettings?.site_subtitle || 'Tech Store & POS'
  const hotlines = storeSettings?.hotlines && storeSettings.hotlines.length > 0
    ? storeSettings.hotlines
    : [storeSettings?.company_phone || '012 220 152']

  const activeAnnouncement = announcement || (storeSettings as any)?.announcement_bar

  return (
    <>
      <AnnouncementBar announcement={activeAnnouncement} />
      <TopUtilityBar announcement={activeAnnouncement} />

      <header
        className={cn(
          'sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 transition-all duration-300',
          isScrolled && 'shadow-lg'
        )}
      >
        <div className="container-site">
          <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-5 h-16 sm:h-[68px] lg:h-20">
            {/* Store Brand Logo & Name (Dynamically loaded from Backend) */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
              {!logoError ? (
                <div className="h-11 max-w-[170px] flex items-center justify-center rounded-xl overflow-hidden">
                  <img
                    src={resolveMediaUrl(storeSettings?.site_logo, 'company') || '/logo.png'}
                    alt={siteName}
                    onError={() => setLogoError(true)}
                    className="h-10 w-auto max-w-full object-contain rounded-xl select-none group-hover:scale-105 transition-transform"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-[#2C376B] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <span className="text-white font-black text-lg font-display">
                    {siteName.charAt(0)}
                  </span>
                </div>
              )}

              {/* Hide brand name text on xs mobile to save space */}
              <div className="hidden sm:flex flex-col">
                <span className="font-black text-lg sm:text-xl text-slate-900 dark:text-white font-display tracking-tight leading-none">
                  {siteName}
                </span>
                <span className="text-[10px] font-bold text-[#2C376B] dark:text-blue-400 tracking-wider uppercase mt-0.5">
                  {siteSubtitle}
                </span>
              </div>
            </Link>

            {/* Auto-detected Location Indicator (Non-clickable Status Badge) */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-left select-none"
              title="Auto-detected Delivery Location"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium leading-none">
                  {t('nav.hello', 'Hello')}
                </span>
                <div className="flex items-center gap-1 mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="truncate max-w-[130px]">{province || 'Phnom Penh'}</span>
                </div>
              </div>
            </div>

            {/* Center: Large Global AI Search Bar (Desktop) */}
            <GlobalSearchBar className="flex-1 max-w-xl lg:max-w-2xl xl:max-w-3xl mx-1 lg:mx-3 hidden lg:block" />

            {/* Header Control Center Icons (Compare, Wishlist with text, Cart, Account, Theme) */}
            <div className="flex items-center gap-1 sm:gap-2 xl:gap-4 ml-auto">
              {/* Compare Button with Count & Text */}
              <button
                onClick={() => setCompareOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer select-none group"
                title={t('nav.compare', 'Compare')}
              >
                <div className="relative">
                  <Scale className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {compareCount}
                  </span>
                </div>
                <span className="text-xs font-bold hidden xl:inline">
                  {t('nav.compare_short', 'Compare')}
                </span>
              </button>

              {/* Wishlist Button with Count & Text */}
              <Link
                to="/account/wishlist"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer select-none group"
                title={t('nav.wishlist', 'Wishlist')}
              >
                <div className="relative">
                  <Heart className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-rose-500 transition-colors" />
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                </div>
                <span className="text-xs font-bold hidden xl:inline">
                  {t('nav.wishlist_short', 'Wishlist')}
                </span>
              </Link>

              {/* Shopping Cart Button with Count & Text */}
              <button
                onClick={toggleOpen}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer select-none group"
                aria-label="Open Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {item_count > 9 ? '9+' : item_count}
                  </span>
                </div>
                <div className="hidden xl:flex flex-col text-left leading-none">
                  <span className="text-xs font-bold">
                    {t('nav.cart_short', 'Cart')}
                  </span>
                  {subtotal > 0 && (
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {formatPrice(subtotal)}
                    </span>
                  )}
                </div>
              </button>

              {/* Account Dropdown (Desktop) */}
              <div className="hidden lg:block">
                <UserMenu />
              </div>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center lg:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="lg:hidden pb-3">
            <GlobalSearchBar />
          </div>
        </div>

        {/* Sub-Header Navbar (Desktop All Categories & Nav links) */}
        <Navbar />
      </header>

      {/* Modern Clean Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onOpenTrack={() => setTrackOpen(true)}
        onOpenWarranty={() => setWarrantyOpen(true)}
      />

      <CompareModal isOpen={compareOpen} onClose={() => setCompareOpen(false)} />
      <TrackOrderModal isOpen={trackOpen} onClose={() => setTrackOpen(false)} />
      <WarrantyCheckModal isOpen={warrantyOpen} onClose={() => setWarrantyOpen(false)} />
    </>
  )
}

export default Header
