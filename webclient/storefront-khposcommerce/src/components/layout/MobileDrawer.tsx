import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  MapPin,
  Flame,
  Home,
  ShoppingCart,
  Smartphone,
  Info,
  Grid,
  Laptop,
  Sparkles,
  Phone,
  ShieldCheck,
  Package,
  Headset,
  HelpCircle,
  ChevronRight,
  User,
  LogIn,
  Sun,
  Moon,
  Monitor,
  Gamepad2,
  Heart,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  useAuthStore,
  useSettingsStore,
  useLocationStore,
  useWishlistStore,
} from '@/stores'
import { useStoreSettings } from '@/hooks'
import { cn, resolveMediaUrl } from '@/lib/utils'
import {
  FacebookAppIcon,
  TikTokAppIcon,
  InstagramAppIcon,
  TelegramAppIcon,
  YouTubeAppIcon,
} from '@/lib/socialIcons'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  onOpenTrack: () => void
  onOpenWarranty: () => void
}

const LANGUAGES = [
  { code: 'km', name: 'ខ្មែរ', flag: 'https://flagcdn.com/w40/kh.png' },
  { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/us.png' },
] as const

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  onOpenTrack,
  onOpenWarranty,
}) => {
  const { t } = useTranslation()
  const location = useLocation()
  const { data: storeSettings } = useStoreSettings()
  const { isLoggedIn, customer } = useAuthStore()
  const { language, setLanguage, currency, setCurrency, theme, setTheme } = useSettingsStore()
  const { province } = useLocationStore()
  const wishlistCount = useWishlistStore((s) => s.count)

  // Auto close on route change
  useEffect(() => {
    onClose()
  }, [location.pathname, location.search])

  // Lock body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const siteName = storeSettings?.site_name || 'NexTech Store'
  const siteSubtitle = storeSettings?.site_subtitle || 'Tech Store & POS'
  const logo = storeSettings?.site_logo
  const hotlines =
    storeSettings?.hotlines && storeSettings.hotlines.length > 0
      ? storeSettings.hotlines
      : [storeSettings?.company_phone || '+855 71 888 999']

  const rawSocials = (storeSettings?.socials || {}) as Record<string, string | undefined>
  const socials = {
    facebook: rawSocials.facebook || 'https://facebook.com',
    telegram: rawSocials.telegram || 'https://t.me',
    tiktok: rawSocials.tiktok || 'https://tiktok.com',
    instagram: rawSocials.instagram || 'https://instagram.com',
    youtube: rawSocials.youtube || 'https://youtube.com',
  }

  const navItems = [
    {
      to: '/',
      label: t('nav.home', 'Home'),
      icon: Home,
      exact: true,
    },
    {
      to: '/products?sort=deals',
      label: t('nav.special_offers', 'Special Offers'),
      icon: Flame,
      badge: t('nav.hot', 'HOT'),
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      to: '/products',
      label: t('nav.products', 'All Products'),
      icon: ShoppingCart,
    },
    {
      to: '/products?category=laptops',
      label: t('nav.laptops', 'Laptops & Computers'),
      icon: Laptop,
    },
    {
      to: '/products?category=smartphones',
      label: t('nav.smartphones', 'Smartphones'),
      icon: Smartphone,
    },
    {
      to: '/products?category=keyboards',
      label: t('nav.gaming_gear', 'Gaming Gear'),
      icon: Gamepad2,
    },
    {
      to: '/about',
      label: t('nav.about', 'About Us'),
      icon: Info,
    },
    {
      to: '/contact',
      label: t('nav.contact', 'Contact Us'),
      icon: Phone,
    },
  ]

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 bottom-0 left-0 w-[86vw] max-w-sm h-[100dvh] bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10 select-none overflow-hidden border-r border-slate-200/80 dark:border-slate-800"
          >
            {/* ── 1. Header (Brand & Close) ────────────────────────────── */}
            <div className="p-4 bg-gradient-to-r from-[#1D2549] via-[#242D5A] to-[#2C376B] text-white flex items-center justify-between shadow-xs">
              <Link to="/" onClick={onClose} className="flex items-center gap-3 min-w-0 group">
                <div className="w-10 h-10 rounded-2xl bg-white/10 p-1 flex items-center justify-center overflow-hidden border border-white/20 flex-shrink-0 shadow-inner">
                  {logo ? (
                    <img
                      src={resolveMediaUrl(logo, 'company') || '/logo.png'}
                      alt={siteName}
                      className="w-full h-full object-contain brightness-110"
                    />
                  ) : (
                    <span className="font-black text-lg font-display text-white">
                      {siteName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-black text-sm text-white font-display tracking-tight truncate leading-tight">
                    {siteName}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-200 tracking-wider uppercase truncate mt-0.5">
                    {siteSubtitle}
                  </span>
                </div>
              </Link>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── 2. Scrollable Body ───────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-4 divide-y divide-slate-100 dark:divide-slate-800/80 scrollbar-thin">
              {/* Account Quick Card & Deliver Badge */}
              <div className="pt-0.5 pb-1 space-y-2">
                {isLoggedIn ? (
                  <Link
                    to="/account"
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                      {customer?.first_name ? customer.first_name.charAt(0) : <User className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {customer?.first_name ? `${customer.first_name} ${customer.last_name || ''}` : t('nav.account', 'My Account')}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        {customer?.email || t('nav.view_profile', 'Manage your profile')}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </Link>
                ) : (
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/40 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-100/80 dark:border-slate-700/60 flex items-center justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {t('nav.welcome', 'Welcome')}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {t('nav.signin_to_shop', 'Sign in for faster checkout')}
                      </span>
                    </div>
                    <Link
                      to="/auth/login"
                      onClick={onClose}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2C376B] hover:bg-[#1f274e] text-white hover:text-white text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1.5 flex-shrink-0"
                    >
                      <LogIn className="w-3.5 h-3.5 text-white flex-shrink-0" />
                      <span className="text-white font-bold">{t('nav.login', 'Sign In')}</span>
                    </Link>
                  </div>
                )}

                {/* Auto-detected Delivery Area */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-slate-400 font-medium">{t('nav.deliver_to', 'Deliver to')}:</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate">{province || 'Phnom Penh'}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" title="Active Delivery Zone" />
                </div>
              </div>

              {/* Navigation Categories */}
              <div className="pt-3 pb-1 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-1.5">
                  {t('nav.categories', 'Categories')}
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = item.exact
                    ? location.pathname === item.to
                    : location.pathname + location.search === item.to

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group',
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2C376B] dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 shadow-2xs'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                            isActive
                              ? 'bg-[#2C376B] text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-slate-700'
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {item.badge && (
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wider shadow-xs',
                              item.badgeColor
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Customer Care Services */}
              <div className="pt-3 pb-1 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-1.5">
                  {t('nav.customer_care', 'Customer Care')}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenTrack()
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span>{t('nav.track_order', 'Track Order')}</span>
                      <span className="text-[10px] text-slate-400 font-normal leading-none mt-0.5">
                        {t('nav.track_order_sub', 'Live delivery tracking')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenWarranty()
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span>{t('nav.warranty_check', 'Warranty Check')}</span>
                      <span className="text-[10px] text-slate-400 font-normal leading-none mt-0.5">
                        {t('nav.warranty_check_sub', 'Check serial number')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 transition-all" />
                </button>

                {/* Wishlist Link */}
                <Link
                  to="/account/wishlist"
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>{t('nav.saved_wishlist', 'Saved Wishlist')}</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* ── 3. Quick Preferences (5 Languages, Theme & Currency) ── */}
              <div className="pt-3 pb-1 space-y-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
                  {t('nav.preferences', 'Language & Theme')}
                </div>

                {/* 5-Language Chips */}
                <div className="grid grid-cols-5 gap-1 px-1">
                  {LANGUAGES.map((l) => {
                    const isSelected = language === l.code
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setLanguage(l.code as any)}
                        className={cn(
                          'flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer',
                          isSelected
                            ? 'bg-[#2C376B] text-white border-[#2C376B] shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                      >
                        <img
                          src={l.flag}
                          alt={l.name}
                          className="w-4 h-3 object-cover rounded-xs mb-0.5 border border-black/10 shadow-2xs"
                        />
                        <span className="text-[10px] font-bold leading-none truncate max-w-full">{l.name}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Theme & Currency Switchers */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Theme Switcher */}
                  <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between border border-slate-200/60 dark:border-slate-700/50">
                    {(['light', 'dark', 'system'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTheme(m)}
                        className={cn(
                          'flex-1 py-1 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer',
                          theme === m
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        )}
                        title={m}
                      >
                        {m === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                        {m === 'dark' && <Moon className="w-3.5 h-3.5 text-blue-400" />}
                        {m === 'system' && <Monitor className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    ))}
                  </div>

                  {/* Currency Switcher */}
                  <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between border border-slate-200/60 dark:border-slate-700/50">
                    {(['USD', 'KHR'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c)}
                        className={cn(
                          'flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer',
                          currency === c
                            ? 'bg-[#2C376B] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        )}
                      >
                        {c === 'USD' ? '$ USD' : '៛ KHR'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── 4. Customer Hotline & 5 Social Channels ─────────────── */}
              <div className="pt-3 pb-10 space-y-3">
                {/* Hotlines */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/60 dark:from-slate-800/90 dark:to-slate-800/50 border border-blue-100/80 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Headset className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{t('nav.contact_hotline', 'Customer Hotline')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {hotlines.map((num, i) => (
                      <a
                        key={i}
                        href={`tel:${num.replace(/\s+/g, '')}`}
                        className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold text-[11px] border border-blue-200/60 dark:border-slate-600 shadow-2xs hover:bg-[#2C376B] hover:text-white transition-colors truncate"
                      >
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{num}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* All 5 Official Social Media Channels */}
                <div className="flex items-center justify-center gap-3.5 pt-1">
                  <a
                    href={socials.facebook}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    title="Facebook"
                    className="transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <FacebookAppIcon className="w-6 h-6 shadow-xs" size={24} />
                  </a>

                  <a
                    href={socials.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="TikTok"
                    title="TikTok"
                    className="transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <TikTokAppIcon className="w-6 h-6 shadow-xs" size={24} />
                  </a>

                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    title="Instagram"
                    className="transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <InstagramAppIcon className="w-6 h-6 shadow-xs" size={24} />
                  </a>

                  <a
                    href={socials.telegram}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Telegram"
                    title="Telegram"
                    className="transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <TelegramAppIcon className="w-6 h-6 shadow-xs" size={24} />
                  </a>

                  <a
                    href={socials.youtube}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    title="YouTube"
                    className="transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <YouTubeAppIcon className="w-6 h-6 shadow-xs" size={24} />
                  </a>
                </div>

                {/* App Version Tag */}
                <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                  © {new Date().getFullYear()} {siteName} • Enterprise Tech
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default MobileDrawer
