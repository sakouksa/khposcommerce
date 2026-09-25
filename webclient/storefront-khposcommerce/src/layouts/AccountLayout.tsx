import React from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  Star,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  Award,
  CheckCircle2,
  Headphones,
  ExternalLink,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore, useWishlistStore } from '@/stores'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SEOHead from '@/components/seo/SEOHead'
import { cn } from '@/lib/utils'

export const AccountLayout: React.FC = () => {
  const { t } = useTranslation()
  const { customer, user, logout } = useAuthStore()
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  // Calculate Loyalty Tier
  const points = customer?.loyalty_points ?? 0
  const getTierInfo = (pts: number) => {
    if (pts >= 1000) return { name: 'Platinum VIP', next: null, progress: 100, color: 'from-purple-500 to-indigo-600', badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' }
    if (pts >= 500) return { name: 'Gold Member', next: 1000, progress: (pts / 1000) * 100, color: 'from-amber-500 to-yellow-600', badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' }
    if (pts >= 100) return { name: 'Silver Member', next: 500, progress: (pts / 500) * 100, color: 'from-blue-500 to-cyan-600', badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' }
    return { name: 'Bronze Member', next: 100, progress: (pts / 100) * 100, color: 'from-slate-500 to-slate-700', badgeBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' }
  }

  const tier = getTierInfo(points)

  const navItems = [
    {
      to: '/account',
      icon: LayoutDashboard,
      label: t('account.dashboard', 'Dashboard'),
      exact: true,
      badge: null,
    },
    {
      to: '/account/orders',
      icon: Package,
      label: t('account.my_orders', 'My Orders'),
      badge: customer?.order_count ? String(customer.order_count) : null,
    },
    {
      to: '/account/wishlist',
      icon: Heart,
      label: t('account.wishlist', 'Saved Wishlist'),
      badge: wishlistCount > 0 ? String(wishlistCount) : null,
    },
    {
      to: '/account/addresses',
      icon: MapPin,
      label: t('account.addresses', 'Delivery Addresses'),
      badge: null,
    },
    {
      to: '/account/reviews',
      icon: Star,
      label: t('account.reviews', 'My Reviews'),
      badge: null,
    },
    {
      to: '/account/profile',
      icon: ShieldCheck,
      label: t('account.profile_security', 'Profile & Security'),
      badge: null,
    },
  ]

  const displayName = customer?.name || user?.name || 'Customer'
  const displayEmail = customer?.email || user?.email || ''
  const avatarUrl = customer?.photo

  return (
    <>
      <SEOHead
        title={`${displayName} - Account Dashboard | OptaPOS`}
        description="Manage your account, order history, delivery addresses, reward points, and preferences on OptaPOS."
        canonical="/account"
        robots="noindex, nofollow"
      />

      <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
        <Header />

        <main className="flex-1 py-6 sm:py-8 lg:py-10">
          <div className="container-site">
            {/* ─── Modern Premium Account Banner ─────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-900/90 text-white p-6 sm:p-8 mb-8 border border-slate-800 shadow-xl">
              {/* Subtle background ambient gradients */}
              <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-[#f58220]/15 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left: User Identity Info */}
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* High-res Avatar or Stylized Initials */}
                  <div className="relative flex-shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-[#f58220] shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#f58220] to-[#e07110] text-white flex items-center justify-center text-2xl sm:text-3xl font-extrabold shadow-md ring-2 ring-white/20">
                        {displayName[0]?.toUpperCase() ?? 'U'}
                      </div>
                    )}
                    <span
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center shadow-xs"
                      title="Active Customer Account"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </span>
                  </div>

                  {/* Name, Email, & Member Tier */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
                        {displayName}
                      </h1>
                      <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1', tier.badgeBg)}>
                        <Sparkles className="w-3 h-3" />
                        {tier.name}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                      <span>{displayEmail}</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.2 rounded-md">
                        Verified
                      </span>
                    </p>

                    {/* Loyalty Points Pill */}
                    <div className="flex items-center gap-3 pt-1 text-xs text-slate-300">
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Award className="w-3.5 h-3.5" />
                        {points.toLocaleString()} Points
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 text-[11px]">
                        Cash Value: <strong className="text-slate-200 font-mono">${(points * 0.01).toFixed(2)}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Tier Progress Bar & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-4">
                  {/* Tier Progress Bar */}
                  <div className="w-full sm:w-64 bg-slate-800/80 backdrop-blur-md rounded-2xl p-3 border border-slate-700/60">
                    <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1.5">
                      <span>Tier Status</span>
                      <span className="text-[#f58220] font-bold">{tier.name}</span>
                    </div>
                    <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500 bg-gradient-to-r', tier.color)}
                        style={{ width: `${Math.min(100, Math.max(10, tier.progress))}%` }}
                      />
                    </div>
                    {tier.next ? (
                      <p className="text-[10px] text-slate-400 mt-1.5 text-right">
                        {(tier.next - points).toLocaleString()} pts to next tier
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-400 mt-1.5 text-right font-medium">
                        Top VIP Level Unlocked
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      to="/products"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold border border-white/15 backdrop-blur-sm transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t('account.continue_shopping', 'Continue Shopping')}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Grid: Sidebar Navigation + Main Outlet ───────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ── Left Sidebar Navigation (4 cols) ─────────────────────────── */}
              <aside className="lg:col-span-4 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Account Navigation
                  </div>

                  <nav className="space-y-1 mt-1">
                    {navItems.map(({ to, icon: Icon, label, exact, badge }) => (
                      <NavLink
                        key={to}
                        to={to}
                        end={exact}
                        className={({ isActive }) =>
                          cn(
                            'group flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 select-none',
                            isActive
                              ? 'bg-[#f58220]/10 text-[#f58220] dark:bg-[#f58220]/15 dark:text-[#f58220] shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                                  isActive
                                    ? 'bg-[#f58220] text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-900 dark:group-hover:text-white'
                                )}
                              >
                                <Icon className="w-4 h-4" />
                              </span>
                              <span>{label}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {badge && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f58220] text-white shadow-xs">
                                  {badge}
                                </span>
                              )}
                              <ChevronRight
                                className={cn(
                                  'w-4 h-4 transition-transform duration-150',
                                  isActive
                                    ? 'text-[#f58220] translate-x-0.5'
                                    : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5'
                                )}
                              />
                            </div>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </nav>

                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 dark:text-rose-400 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                          <LogOut className="w-4 h-4" />
                        </span>
                        <span>{t('auth.sign_out', 'Sign Out')}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-400 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* ── 24/7 Customer Support Help Card ─────────────────────── */}
                <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#f58220]/20 border border-[#f58220]/40 flex items-center justify-center text-[#f58220]">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Need Assistance?</h4>
                      <p className="text-[11px] text-slate-400">24/7 Dedicated Support</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Have questions about an order or delivery? Reach our team directly via Telegram or Live Chat.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href="https://t.me/sakousaa"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f58220] hover:bg-[#e07110] text-white text-[11px] font-bold shadow-xs transition-colors"
                    >
                      <span>Telegram Support</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </aside>

              {/* ── Right Content Area (8 cols) ───────────────────────────── */}
              <section className="lg:col-span-8">
                <Outlet />
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}

export default AccountLayout
