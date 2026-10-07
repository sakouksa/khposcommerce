import React from 'react'
import { Link } from 'react-router-dom'
import {
  PackageOpen,
  ShoppingBag,
  Heart,
  Package,
  Search,
  WifiOff,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export type EmptyStateVariant =
  | 'default'
  | 'no-products'
  | 'empty-cart'
  | 'empty-wishlist'
  | 'no-orders'
  | 'no-search-results'
  | 'offline'

export interface EmptyStateProps {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  icon?: React.ReactNode
  actionLabel?: string
  actionLink?: string
  onAction?: () => void
  className?: string
}

const variantPresets: Record<
  EmptyStateVariant,
  {
    icon: React.ElementType
    titleKey: string
    titleFallback: string
    descKey: string
    descFallback: string
    actionLabelFallback: string
    actionLinkDefault: string
  }
> = {
  default: {
    icon: PackageOpen,
    titleKey: 'common.no_items',
    titleFallback: 'No items found',
    descKey: 'common.no_items_desc',
    descFallback: 'There are no items to display at this moment.',
    actionLabelFallback: 'Explore Catalog',
    actionLinkDefault: '/products',
  },
  'no-products': {
    icon: PackageOpen,
    titleKey: 'product.no_products',
    titleFallback: 'No Products Found',
    descKey: 'product.no_products_desc',
    descFallback: 'We couldn’t find any products matching your selected criteria.',
    actionLabelFallback: 'Clear All Filters',
    actionLinkDefault: '/products',
  },
  'empty-cart': {
    icon: ShoppingBag,
    titleKey: 'cart.empty_title',
    titleFallback: 'Your Shopping Cart is Empty',
    descKey: 'cart.empty_desc',
    descFallback: 'Looks like you haven’t added any items to your cart yet.',
    actionLabelFallback: 'Explore Products',
    actionLinkDefault: '/products',
  },
  'empty-wishlist': {
    icon: Heart,
    titleKey: 'wishlist.empty_title',
    titleFallback: 'Your Wishlist is Empty',
    descKey: 'wishlist.empty_desc',
    descFallback: 'Save your favorite products to buy them later anytime.',
    actionLabelFallback: 'Explore Products',
    actionLinkDefault: '/products',
  },
  'no-orders': {
    icon: Package,
    titleKey: 'orders.empty_title',
    titleFallback: 'No Orders Yet',
    descKey: 'orders.empty_desc',
    descFallback: 'You haven’t placed any orders yet. Start shopping now!',
    actionLabelFallback: 'Browse Catalog',
    actionLinkDefault: '/products',
  },
  'no-search-results': {
    icon: Search,
    titleKey: 'search.no_results',
    titleFallback: 'No Results Found',
    descKey: 'search.no_results_desc',
    descFallback: 'Try checking your spelling or using more generic search terms.',
    actionLabelFallback: 'Explore Popular Items',
    actionLinkDefault: '/products',
  },
  offline: {
    icon: WifiOff,
    titleKey: 'common.offline_title',
    titleFallback: 'No Internet Connection',
    descKey: 'common.offline_desc',
    descFallback: 'Please check your connection and retry.',
    actionLabelFallback: 'Retry Connection',
    actionLinkDefault: '',
  },
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  title,
  description,
  icon,
  actionLabel,
  actionLink,
  onAction,
  className,
}) => {
  const { t } = useTranslation()
  const preset = variantPresets[variant] || variantPresets.default
  const IconComponent = preset.icon

  const displayTitle =
    title || t(preset.titleKey, preset.titleFallback)
  const displayDescription =
    description || t(preset.descKey, preset.descFallback)
  const displayActionLabel =
    actionLabel || t('common.explore_catalog', preset.actionLabelFallback)
  const targetLink = actionLink ?? preset.actionLinkDefault

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-3xl bg-slate-50/50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 shadow-2xs',
        className
      )}
    >
      <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-xs">
        {icon || <IconComponent className="w-8 h-8" />}
      </div>

      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-display tracking-tight">
        {displayTitle}
      </h3>

      {displayDescription && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md leading-relaxed">
          {displayDescription}
        </p>
      )}

      {(onAction || targetLink) && (
        <div className="mt-6">
          {onAction ? (
            <button
              onClick={onAction}
              className="btn-primary text-xs py-2.5 px-5 font-bold inline-flex items-center gap-2 rounded-xl shadow-md cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{displayActionLabel}</span>
            </button>
          ) : (
            <Link
              to={targetLink}
              className="btn-primary text-xs py-2.5 px-5 font-bold inline-flex items-center gap-2 rounded-xl shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{displayActionLabel}</span>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState
