import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn, resolveMediaUrl } from '@/lib/utils'
import { getCategoryLocalizedName } from '@/lib/categories'
import { getCategoryTheme } from '@/lib/icons'

export interface CategoryItem {
  id: number
  name: string
  slug: string
  image?: string | null
  icon?: string | null
  description?: string | null
  product_count?: number
}

interface CategoryCardProps {
  category: CategoryItem
  className?: string
}

export const CategoryCard = React.memo<CategoryCardProps>(({ category, className }) => {
  const { t } = useTranslation()
  const [imgError, setImgError] = useState(!category.image)
  const imgSrc = resolveMediaUrl(category.image, 'category')
  const localizedName = getCategoryLocalizedName(category, t)
  const theme = getCategoryTheme(category.slug || category.name)
  const IconComponent = theme.icon

  React.useEffect(() => {
    setImgError(!category.image)
  }, [category.image])

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className={cn(
        'group relative flex flex-col items-center justify-between p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1.5 text-center overflow-hidden',
        className
      )}
    >
      {/* Pristine Image Frame with Dark Mode Support */}
      <div className="relative w-full aspect-square max-w-[110px] sm:max-w-[120px] mx-auto rounded-2xl overflow-hidden bg-white dark:bg-white p-2 sm:p-2.5 flex items-center justify-center mb-2.5 border border-slate-100 dark:border-slate-200/20 shadow-xs group-hover:border-blue-500/40 group-hover:shadow-md transition-all duration-300">
        {/* Subtle Ambient Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-indigo-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-colors duration-500 rounded-2xl pointer-events-none" />

        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            alt={localizedName}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain rounded-xl drop-shadow-xs group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div
            className={cn(
              'w-full h-full rounded-xl flex items-center justify-center transition-all duration-300',
              theme.bgLight,
              theme.textClass
            )}
          >
            <IconComponent className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}

        {/* Small floating category icon badge */}
        <span
          className={cn(
            'absolute top-1.5 right-1.5 w-6 h-6 rounded-lg flex items-center justify-center shadow-xs backdrop-blur-xs border transition-transform duration-300 group-hover:scale-110 bg-white/95 dark:bg-slate-900/95 border-slate-200/90 dark:border-slate-700',
            theme.textClass
          )}
          title={localizedName}
        >
          <IconComponent className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Category Name & Count */}
      <div className="w-full">
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {localizedName}
        </h3>

        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {category.product_count ?? 10}+ {t('common.items', 'មុខទំនិញ')}
        </span>
      </div>
    </Link>
  )
})

CategoryCard.displayName = 'CategoryCard'

export default CategoryCard

