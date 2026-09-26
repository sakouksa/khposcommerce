import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  ChevronDown,
  Home,
  Flame,
  ShoppingCart,
  Laptop,
  Gamepad2,
  Tag,
  ShieldCheck,
  Package,
  Percent,
  Sparkles,
  Smartphone,
  Tv,
  Phone,
  HelpCircle,
  Truck,
  Info,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useBrands, useClickOutside, useMenuHover } from '@/hooks'
import { cn } from '@/lib/utils'
import MegaMenu from './MegaMenu'
import TrackOrderModal from '@/components/common/TrackOrderModal'
import WarrantyCheckModal from '@/components/common/WarrantyCheckModal'

export const Navbar: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const megaMenu = useMenuHover({ closeDelay: 180 })
  const [trackOpen, setTrackOpen] = useState(false)
  const [warrantyOpen, setWarrantyOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  // Use global custom hook for official brands
  const { data: dbBrands = [] } = useBrands()

  // Use global click outside hook
  useClickOutside(navRef, () => megaMenu.closeMenu(true))

  // Close menus on route change
  useEffect(() => {
    megaMenu.closeMenu(true)
  }, [location.pathname])

  const isHome = location.pathname === '/'
  const isDeals = location.search.includes('sort=deals')
  const topBrands = dbBrands.slice(0, 10)

  return (
    <>
      <div
        ref={navRef}
        className={cn(
          'w-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-b border-slate-200/80 dark:border-slate-800 hidden lg:block select-none shadow-xs',
          megaMenu.isOpen ? 'relative z-50' : 'relative z-30'
        )}
      >
        <div className="container-site flex items-center h-12">
          {/* ── Continuous Navigation Links Row (Clean & Fit without scrolling) ── */}
          <div className="flex items-center gap-0.5 xl:gap-1.5 w-full flex-nowrap text-xs xl:text-[13px] font-bold">
            {/* 1. ALL CATEGORIES Mega Menu Button with Hover & Click Support */}
            <div
              {...megaMenu.hoverProps}
              className="relative flex-shrink-0 mr-1"
            >
              <button
                onClick={megaMenu.toggleMenu}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 bg-[#2C376B] hover:bg-[#202952] text-white text-xs font-black uppercase tracking-wider transition-all rounded-lg shadow-xs cursor-pointer',
                  megaMenu.isOpen && 'bg-blue-700'
                )}
                title={t('nav.all_categories', 'All Categories')}
              >
                <LayoutGrid className="w-4 h-4 flex-shrink-0 text-blue-200" />
                <span className="whitespace-nowrap">{t('nav.all_categories', 'All Categories')}</span>
                <ChevronDown
                  className={cn('w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 text-blue-200', megaMenu.isOpen && 'rotate-180')}
                />
              </button>
            </div>

            {/* 2. HOME */}
            <Link
              to="/"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex-shrink-0',
                isHome
                  ? 'text-[#2C376B] dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/60 font-black'
                  : 'text-slate-700 dark:text-slate-200 hover:text-[#2C376B] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <Home className="w-3.5 h-3.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>{t('nav.home', 'Home')}</span>
            </Link>

            {/* 3. SPECIAL OFFERS (PTC Reference Badge Style) */}
            <div className="relative group flex-shrink-0">
              <Link
                to="/products?sort=deals"
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap border',
                  isDeals
                    ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 shadow-xs font-black'
                    : 'text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/90 dark:border-rose-900/50 hover:bg-rose-100/80 font-black'
                )}
              >
                <Flame className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 animate-pulse" />
                <span>{t('nav.special_offers', 'Special Offer')}</span>
                <ChevronDown className="w-3 h-3 text-rose-400 transition-transform group-hover:rotate-180" />
              </Link>

              {/* Special Offer Flyout */}
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 min-w-[240px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-slate-900 dark:text-white">
                <Link
                  to="/products?sort=deals"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                >
                  <Flame className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <div>
                    <div>{t('nav.flash_deals_desc', "Today's Super Flash Deals")}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {t('nav.flash_deals_sub', 'Up to 50% discount on tech')}
                    </div>
                  </div>
                </Link>
                <Link
                  to="/products?sort=price_asc"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Percent className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div>
                    <div>{t('nav.budget_friendly', 'Budget Friendly Products')}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {t('nav.budget_friendly_sub', 'Lowest price guaranteed')}
                    </div>
                  </div>
                </Link>
                <Link
                  to="/products?sort=newest"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <div>{t('nav.new_arrivals_menu', 'New Tech Arrivals')}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {t('nav.new_arrivals_menu_sub', 'Fresh 2026 released models')}
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* 4. SHOP / PRODUCTS (Dropdown) */}
            <div className="relative group flex-shrink-0">
              <Link
                to="/products"
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap',
                  location.pathname === '/products' && !isDeals
                    ? 'text-[#2C376B] dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/60 font-black'
                    : 'text-slate-700 dark:text-slate-200 hover:text-[#2C376B] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <ShoppingCart className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span>{t('nav.products', 'Shop')}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 min-w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-slate-900 dark:text-white">
                <Link
                  to="/products"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600"
                >
                  <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>{t('nav.all_tech', 'All Tech Products')}</span>
                </Link>
                <Link
                  to="/products?category=smartphones"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600"
                >
                  <Smartphone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>{t('nav.smartphones', 'Smartphones')}</span>
                </Link>
                <Link
                  to="/products?category=monitors"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600"
                >
                  <Tv className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                  <span>{t('nav.monitors', 'Monitors & Displays')}</span>
                </Link>
              </div>
            </div>

            {/* 5. LAPTOP / DESKTOP */}
            <Link
              to="/products?category=laptops"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex-shrink-0',
                location.search.includes('category=laptops')
                  ? 'text-[#2C376B] dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/60 font-bold'
                  : 'text-slate-700 dark:text-slate-200 hover:text-[#2C376B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <Laptop className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span>{t('nav.laptops', 'Laptop / Desktop')}</span>
            </Link>

            {/* 6. GAMING */}
            <Link
              to="/products?category=keyboards"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex-shrink-0',
                location.search.includes('category=keyboards')
                  ? 'text-[#2C376B] dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/60 font-bold'
                  : 'text-slate-700 dark:text-slate-200 hover:text-[#2C376B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
              <span>{t('nav.gaming', 'Gaming')}</span>
            </Link>

            {/* 7. BRANDS DROPDOWN */}
            <div className="relative group flex-shrink-0">
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-[#2C376B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap">
                <Tag className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                <span>{t('nav.brands', 'Brands')}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 transition-transform group-hover:rotate-180" />
              </button>

              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 min-w-[280px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-slate-900 dark:text-white">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1 border-b border-slate-100 dark:border-slate-800 mb-2">
                  {t('nav.featured_brands', 'Featured Official Brands')}
                </div>
                <div className="grid grid-cols-2 gap-1 max-h-[260px] overflow-y-auto pr-1">
                  {topBrands.map((b) => (
                    <Link
                      key={b.id}
                      to={`/products?brand=${b.slug}`}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                      <span className="truncate">{b.name}</span>
                    </Link>
                  ))}
                </div>
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    to="/products"
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t('nav.view_all_brands', 'View All Brands')} →
                  </Link>
                </div>
              </div>
            </div>

            {/* 8. CUSTOMER CARE (Services) DROPDOWN */}
            <div className="relative group flex-shrink-0">
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-[#2C376B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>{t('nav.customer_care', 'Customer Care')}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 min-w-[230px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-slate-900 dark:text-white">
                <button
                  onClick={() => setWarrantyOpen(true)}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <div>
                    <div>{t('nav.warranty_check', 'Warranty Check')}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {t('nav.warranty_check_sub', 'Check serial number validity')}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setTrackOpen(true)}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Package className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <div>{t('nav.track_order', 'Track Order')}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {t('nav.track_order_sub', 'Live delivery tracking')}
                    </div>
                  </div>
                </button>
                <Link
                  to="/contact"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <div>{t('nav.contact_hotline', 'Contact Hotline')}</div>
                    <div className="text-[10px] text-slate-400 font-normal">012 220 152 / 093 456 747</div>
                  </div>
                </Link>
                <Link
                  to="/faq"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <div>
                    <div>{t('nav.help_center', 'Help Center & FAQs')}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {t('nav.help_center_sub', 'Common questions & policies')}
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* 9. TRACK INFO (Quick Trigger) */}
            <button
              onClick={() => setTrackOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-[#2C376B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              <Truck className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>{t('nav.track_info', 'Track Info')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* 10. ABOUT US */}
            <Link
              to="/about"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-[#2C376B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap flex-shrink-0',
                location.pathname === '/about' && 'text-[#2C376B] dark:text-blue-400 font-black bg-blue-50/80 dark:bg-blue-950/50'
              )}
            >
              <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>{t('nav.about', 'About')}</span>
            </Link>

            {/* 11. CONTACT US */}
            <Link
              to="/contact"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-[#2C376B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap flex-shrink-0',
                location.pathname === '/contact' && 'text-[#2C376B] dark:text-blue-400 font-black bg-blue-50/80 dark:bg-blue-950/50'
              )}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>{t('nav.contact', 'Contact Us')}</span>
            </Link>
          </div>
        </div>

        {/* Full Category Mega Menu Flyout with Hover enter/leave support */}
        <div {...megaMenu.hoverProps}>
          <MegaMenu isOpen={megaMenu.isOpen} onClose={() => megaMenu.closeMenu(true)} />
        </div>
      </div>

      <TrackOrderModal isOpen={trackOpen} onClose={() => setTrackOpen(false)} />
      <WarrantyCheckModal isOpen={warrantyOpen} onClose={() => setWarrantyOpen(false)} />
    </>
  )
}

export default Navbar
