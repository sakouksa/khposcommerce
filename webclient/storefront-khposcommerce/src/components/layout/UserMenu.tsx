import React, { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Heart,
  LogOut,
  Package,
  Settings,
  User,
  Scale,
  ShieldCheck,
  MapPin,
  HelpCircle,
  Sparkles,
  Award,
  ChevronRight,
  LogIn,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore, useWishlistStore, useCompareStore } from '@/stores'
import { useClickOutside, useMenuHover } from '@/hooks'
import { cn } from '@/lib/utils'

export const UserMenu: React.FC = () => {
  const { t } = useTranslation()
  const menuHover = useMenuHover({ closeDelay: 180 })
  const { isLoggedIn, customer, logout } = useAuthStore()
  const wishlistCount = useWishlistStore((s) => s.count)
  const compareCount = useCompareStore((s) => s.items.length)
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  // Global click outside hook to close dropdown
  useClickOutside(menuRef, () => menuHover.closeMenu(true))

  const handleLogout = () => {
    logout()
    navigate('/')
    menuHover.closeMenu(true)
  }

  const handleClose = () => {
    menuHover.closeMenu(true)
  }

  return (
    <div
      ref={menuRef}
      className="relative"
      {...menuHover.hoverProps}
    >
      {/* ── Trigger Button ─────────────────────────────────────────────── */}
      {!isLoggedIn ? (
        <button
          onClick={menuHover.toggleMenu}
          className={cn(
            'flex flex-col text-left px-2.5 py-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group select-none',
            menuHover.isOpen && 'bg-slate-100 dark:bg-slate-800'
          )}
          aria-expanded={menuHover.isOpen}
          aria-label="Account & Lists Menu"
        >
          <span className="text-[10px] text-slate-400 font-medium leading-none">
            {t('nav.hello_signin', 'Hello, Sign In')}
          </span>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-0.5 leading-tight mt-0.5">
            <span>{t('nav.account_and_lists', 'Account & Lists')}</span>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
                menuHover.isOpen && 'rotate-180 text-blue-600'
              )}
            />
          </span>
        </button>
      ) : (
        <button
          onClick={menuHover.toggleMenu}
          className={cn(
            'flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer group select-none',
            menuHover.isOpen && 'bg-slate-100 dark:bg-slate-800'
          )}
          aria-expanded={menuHover.isOpen}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f58220] to-[#e07110] flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
            {customer?.photo ? (
              <img src={customer.photo} alt={customer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : customer?.name ? (
              customer.name[0].toUpperCase()
            ) : (
              'U'
            )}
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium leading-none">
              Hello, {customer?.name?.split(' ')[0] || 'Customer'}
            </span>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-0.5 leading-tight mt-0.5">
              <span>{t('nav.account', 'My Account')}</span>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
                  menuHover.isOpen && 'rotate-180 text-blue-600'
                )}
              />
            </span>
          </div>
        </button>
      )}

      {/* ── Dropdown Popup (Fully Responsive) ─────────────────────────── */}
      <AnimatePresence>
        {menuHover.isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-[min(90vw,320px)] sm:w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-50 select-none divide-y divide-slate-100 dark:divide-slate-800"
          >
            {/* ── 1. GUEST STATE POPUP (Modern Focused UX) ─────────────── */}
            {!isLoggedIn ? (
              <div className="p-4 space-y-4">
                {/* Header Welcome Card */}
                <div className="text-center space-y-1.5 pt-1">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/20 dark:from-blue-900/40 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 mb-1 border border-blue-100 dark:border-blue-800/60 shadow-inner">
                    <User className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                    {t('nav.welcome_guest', 'សូមស្វាគមន៍!')}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[260px] mx-auto">
                    {t('nav.guest_signin_prompt', 'ចូលគណនីដើម្បីគ្រប់គ្រងការបញ្ជាទិញ និងទទួលបានការផ្តល់ជូនពិសេស')}
                  </p>
                </div>

                {/* Primary & Secondary Action CTAs */}
                <div className="space-y-2">
                  <Link
                    to="/auth/login"
                    onClick={handleClose}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-[#2C376B] to-blue-600 hover:from-[#1e264d] hover:to-blue-700 !text-white text-xs font-bold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] group cursor-pointer select-none"
                  >
                    <LogIn className="w-4 h-4 !text-white group-hover:!text-white flex-shrink-0" />
                    <span className="!text-white font-bold group-hover:!text-white">{t('nav.login', 'ចូលគណនី')}</span>
                  </Link>

                  <Link
                    to="/auth/register"
                    onClick={handleClose}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white text-xs font-bold rounded-2xl transition-all active:scale-[0.98] group cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <span className="font-bold text-slate-800 group-hover:text-slate-950 dark:text-slate-200 dark:group-hover:text-white">{t('nav.create_account', 'បង្កើតគណនីថ្មី')}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Member Perks Highlight Banner */}
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:to-transparent border border-amber-200/60 dark:border-amber-800/40">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('nav.member_benefits', 'អត្ថប្រយោជន៍សមាជិក')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-500">🎁</span>
                      <span>{t('nav.perk_points', 'សន្សំពិន្ទុរង្វាន់')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-blue-500">⚡</span>
                      <span>{t('nav.perk_deals', 'តម្លៃពិសេស')}</span>
                    </div>
                  </div>
                </div>

                {/* Guest Quick Tools / Utilities */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 py-1">
                    {t('nav.quick_services', 'សេវាកម្មរហ័ស')}
                  </div>

                  <Link
                    to="/track-order"
                    onClick={handleClose}
                    className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-blue-500" />
                      <span>{t('nav.track_order', 'តាមដានការបញ្ជាទិញ')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    to="/warranty"
                    onClick={handleClose}
                    className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>{t('nav.warranty_check', 'ពិនិត្យការធានា')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    to="/faq"
                    onClick={handleClose}
                    className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-purple-500" />
                      <span>{t('nav.help_center', 'មជ្ឈមណ្ឌលជំនួយ & សំណួរញឹកញាប់')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ) : (
              /* ── 2. LOGGED IN CUSTOMER POPUP ──────────────────────────── */
              <div>
                {/* Profile Card Header */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-800/80 dark:to-slate-850">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#f58220] to-[#e07110] flex items-center justify-center text-white text-base font-black flex-shrink-0 shadow-md overflow-hidden">
                      {customer?.photo ? (
                        <img src={customer.photo} alt={customer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : customer?.name ? (
                        customer.name[0].toUpperCase()
                      ) : (
                        'U'
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {customer?.name || 'Customer'}
                      </div>
                      <div className="text-xs text-slate-400 truncate">{customer?.email}</div>
                    </div>
                  </div>

                  {/* Tier Badge & Loyalty Points */}
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-black">
                      <Award className="w-3 h-3" />
                      <span>{t('nav.vip_member', 'VIP Member')}</span>
                    </div>

                    {customer?.loyalty_points != null && (
                      <div className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                        🏆 {customer.loyalty_points.toFixed(0)} {t('nav.points_unit', 'points')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Navigation Links */}
                <div className="p-2 space-y-0.5">
                  {[
                    { to: '/account', icon: User, label: t('nav.account', 'My Profile') },
                    { to: '/account/orders', icon: Package, label: t('nav.my_orders', 'My Orders') },
                    { to: '/account/wishlist', icon: Heart, label: t('nav.wishlist', 'Wishlist') },
                    { to: '/account/addresses', icon: MapPin, label: t('nav.addresses', 'Addresses') },
                    { to: '/account/profile', icon: Settings, label: t('nav.profile_settings', 'Settings') },
                  ].map(({ to, icon: Icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={handleClose}
                      className="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-slate-700 dark:text-slate-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        <span>{label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>

                {/* Logout Action */}
                <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold text-red-600 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout', 'Sign Out')}</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserMenu
