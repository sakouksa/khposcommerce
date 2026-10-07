import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useCategories, useBrands, useCategoryProducts, useMenuHover } from '@/hooks'
import { useSettingsStore } from '@/stores'
import { getCategoryIconElement } from '@/lib/icons'
import { getCategoryLocalizedName } from '@/lib/categories'
import { BrandLogo } from '@/lib/brandLogos'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { cn } from '@/lib/utils'
import type { Category, Brand } from '@/types/store'

interface CategoryFlyoutProps {
  category: Category
  allBrands: Brand[]
  onClose: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

const CategoryFlyout: React.FC<CategoryFlyoutProps> = ({
  category,
  allBrands,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { t } = useTranslation()
  const { formatPrice } = useSettingsStore()
  const { data: products = [], isLoading: isLoadingProducts } = useCategoryProducts(category.slug, 4)

  const localizedName = getCategoryLocalizedName(category, t)

  // Real brands associated with the category or products
  const categoryBrands = useMemo(() => {
    const productBrandSlugs = new Set(
      products.map((p) => p.brand_slug?.toLowerCase()).filter(Boolean)
    )
    const matching = allBrands.filter(
      (b) => productBrandSlugs.has(b.slug?.toLowerCase()) || (b.products_count && b.products_count > 0)
    )
    return matching.slice(0, 6)
  }, [allBrands, products])

  return (
    <motion.div
      initial={{ opacity: 0, x: -8, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -8, scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-full top-0 ml-3 w-[490px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-50 text-slate-900 dark:text-slate-100 flex flex-col justify-between min-h-[350px] before:absolute before:-left-4 before:top-0 before:bottom-0 before:w-5 before:content-['']"
    >
      <div className="space-y-3.5">
        {/* Dynamic Category Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              {getCategoryIconElement(category.slug, 'w-4 h-4')}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                {localizedName}
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">
                {category.products_count ?? products.length} {t('common.products', 'Products')}
              </span>
            </div>
          </div>

          <Link
            to={`/products?category=${category.slug}`}
            onClick={onClose}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group transition-colors"
          >
            <span>{t('common.view_all', 'View all')}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Real Subcategories from Database (if available) */}
        {category.children && category.children.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('nav.subcategories', 'Subcategories')}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {category.children.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/products?category=${sub.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <span className="truncate">{getCategoryLocalizedName(sub, t)}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {sub.products_count !== undefined && (
                      <span className="text-[10px] text-slate-400">{sub.products_count}</span>
                    )}
                    <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Real Products from Database (Ultra Clean Grid) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('product.featured', 'Featured Products')}
            </span>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-2 gap-2.5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/40 animate-pulse"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {products.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-100/80 dark:border-slate-800/60 hover:border-blue-200/80 dark:hover:border-blue-900/60 hover:shadow-md hover:shadow-slate-200/40 dark:hover:shadow-black/30 transition-all duration-200 group cursor-pointer"
                >
                  {/* Clean softly rounded image container (រាងកោង មិនជ្រុង និង fit ទំហំត្រឹមត្រូវ) */}
                  <div className="w-14 h-14 min-w-14 min-h-14 max-w-14 max-h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800/90 flex-shrink-0 p-1 flex items-center justify-center transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      fallbackType="product"
                      containerClassName="w-full h-full rounded-xl bg-transparent overflow-hidden"
                      className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    {product.brand && (
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block truncate leading-none mb-1">
                        {product.brand}
                      </span>
                    )}
                    <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate leading-snug">
                      {product.name}
                    </h5>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(product.selling_price)}
                      </span>
                      {product.compare_price && product.compare_price > product.selling_price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatPrice(product.compare_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              {t('common.no_products_found', 'No products found')}
            </div>
          )}
        </div>

        {/* Real Brands from Database (Clean Minimalist Chips) */}
        {categoryBrands.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('nav.brands', 'Brands')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categoryBrands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/products?category=${category.slug}&brand=${brand.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/60 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 transition-colors"
                >
                  <BrandLogo brand={brand} className="w-4 h-4 rounded-xs p-0" />
                  <span>{brand.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Bottom Link (Clean & Minimalist) */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
        <Link
          to={`/products?category=${category.slug}`}
          onClick={onClose}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all group"
        >
          <span>{t('common.view_all_in', 'View all')} {localizedName}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  )
}

export const CategorySidebar: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation()
  const { data: categories = [] } = useCategories()
  const { data: allBrands = [] } = useBrands()
  const sidebarHover = useMenuHover<Category>({ closeDelay: 160 })

  return (
    <div
      className={cn(
        'relative w-64 bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-between hidden lg:flex select-none z-30',
        className
      )}
      onMouseLeave={sidebarHover.handleMouseLeave}
    >
      <div className="space-y-1">
        {/* Header with localized Categories label & Total counter */}
        <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 mb-1">
          <span>{t('nav.categories', 'Categories')}</span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
            {categories.length} {t('common.total', 'Total')}
          </span>
        </div>

        {/* Category List */}
        {categories.slice(0, 9).map((cat) => {
          const isHovered = sidebarHover.activeItem?.id === cat.id

          return (
            <div
              key={cat.id}
              onMouseEnter={() => {
                sidebarHover.openMenu()
                sidebarHover.handleItemHover(cat)
              }}
              className="relative"
            >
              <Link
                to={`/products?category=${cat.slug}`}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 group',
                  isHovered
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold translate-x-0.5'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400'
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className={cn(
                      'transition-transform duration-150',
                      isHovered ? 'scale-110 text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                    )}
                  >
                    {getCategoryIconElement(cat.slug, 'w-4 h-4')}
                  </div>
                  <span className="truncate">{getCategoryLocalizedName(cat, t)}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {cat.products_count !== undefined && (
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors',
                        isHovered
                          ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      )}
                    >
                      {cat.products_count}
                    </span>
                  )}
                  <ChevronRight
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-150',
                      isHovered
                        ? 'text-blue-600 dark:text-blue-400 translate-x-0.5'
                        : 'text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5'
                    )}
                  />
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* ── Dynamic Real Backend Data Hover Flyout ────────── */}
      <AnimatePresence>
        {sidebarHover.isOpen && sidebarHover.activeItem && (
          <CategoryFlyout
            key={sidebarHover.activeItem.id}
            category={sidebarHover.activeItem}
            allBrands={allBrands}
            onClose={() => sidebarHover.closeMenu(true)}
            onMouseEnter={sidebarHover.openMenu}
            onMouseLeave={sidebarHover.handleMouseLeave}
          />
        )}
      </AnimatePresence>

      {/* View All Categories Link (Clean & Minimal) */}
      <Link
        to="/products"
        className="mt-2 flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 transition-all border border-slate-100 dark:border-slate-800/80 group"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
          <span>{t('common.view_all_products', 'View All Products')}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
      </Link>
    </div>
  )
}

export default CategorySidebar
