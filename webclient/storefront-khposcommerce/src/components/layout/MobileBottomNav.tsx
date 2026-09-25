import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Layers,
  Search,
  Heart,
  ShoppingCart,
  User,
  Scale,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore, useCompareStore, useAuthStore } from '@/stores'
import CompareModal from '@/components/common/CompareModal'

export const MobileBottomNav: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { item_count, toggleOpen } = useCartStore()
  const wishlistCount = useWishlistStore((s) => s.count)
  const compareCount = useCompareStore((s) => s.items.length)
  const { isLoggedIn } = useAuthStore()
  const [compareOpen, setCompareOpen] = useState(false)

  const items = [
    { label: t('nav.home'), to: '/', icon: Home },
    { label: t('nav.products') || 'Shop', to: '/products', icon: Layers },
    { label: t('nav.wishlist') || 'Wishlist', to: '/account/wishlist', icon: Heart, badge: wishlistCount },
    { label: t('nav.account') || 'Account', to: isLoggedIn ? '/account' : '/auth/login', icon: User },
  ]

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 lg:hidden py-1.5 px-2 select-none shadow-2xl safe-bottom">
        <div className="flex items-center justify-around gap-1 max-w-lg mx-auto">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to

            return (
              <Link
                key={item.to + item.label}
                to={item.to}
                className={cn(
                  'flex flex-col items-center justify-center py-1 px-1.5 rounded-xl relative transition-all flex-1 min-w-0 text-center',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                )}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.badge != null && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center shadow-xs">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 whitespace-nowrap truncate w-full tracking-tight leading-none block">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
                )}
              </Link>
            )
          })}

          {/* Compare Button (if items present) */}
          {compareCount > 0 && (
            <button
              onClick={() => setCompareOpen(true)}
              className="flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-purple-600 dark:text-purple-400 relative flex-1 min-w-0 text-center cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <Scale className="w-5 h-5 flex-shrink-0" />
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-purple-600 text-white text-[8px] font-black flex items-center justify-center shadow-xs">
                  {compareCount}
                </span>
              </div>
              <span className="text-[10px] mt-0.5 whitespace-nowrap truncate w-full tracking-tight leading-none block">
                Compare
              </span>
            </button>
          )}

          {/* Cart Floating Trigger */}
          <button
            onClick={toggleOpen}
            className="flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 relative flex-1 min-w-0 text-center cursor-pointer"
            aria-label="Shopping Cart"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 flex-shrink-0" />
              {item_count > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-blue-600 text-white text-[8px] font-black flex items-center justify-center shadow-xs">
                  {item_count > 9 ? '9+' : item_count}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 whitespace-nowrap truncate w-full tracking-tight leading-none block">
              Cart
            </span>
          </button>
        </div>
      </div>

      <CompareModal isOpen={compareOpen} onClose={() => setCompareOpen(false)} />
    </>
  )
}

export default MobileBottomNav
