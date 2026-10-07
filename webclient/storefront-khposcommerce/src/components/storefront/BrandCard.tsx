import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn, getImageUrl } from '@/lib/utils'

export interface BrandItem {
  id: number
  name: string
  slug: string
  logo?: string | null
  description?: string | null
  product_count?: number
}

interface BrandCardProps {
  brand: BrandItem
  className?: string
}

export const BrandCard = React.memo<BrandCardProps>(({ brand, className }) => {
  const { t } = useTranslation()
  const defaultPlaceholder = '/images/placeholder-product.png'

  return (
    <Link
      to={`/brand/${brand.slug}`}
      className={cn(
        'group flex flex-col items-center justify-between p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 transform hover:-translate-y-1 text-center',
        className
      )}
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/80 overflow-hidden mb-3 p-1.5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
        <img
          src={getImageUrl(brand.logo) || defaultPlaceholder}
          alt={brand.name}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = defaultPlaceholder
          }}
          className="w-full h-full object-contain rounded-xl"
          loading="lazy"
        />
      </div>

      <div>
        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {brand.name}
        </h4>
        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
          {brand.product_count ?? 15}+ {t('common.items')}
        </p>
      </div>
    </Link>
  )
})

BrandCard.displayName = 'BrandCard'

export default BrandCard
