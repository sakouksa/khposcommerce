import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ArrowRight,
  Sparkles,
  Flame,
  Star,
  Zap,
  ShieldCheck,
  Truck,
  TrendingUp,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCategories, useBrands, useCategoryProducts, useMenuHover } from '@/hooks'
import { useSettingsStore } from '@/stores'
import { getCategoryIconElement } from '@/lib/icons'
import { getCategoryLocalizedName, getCategoryLocalizedDescription } from '@/lib/categories'
import { BrandLogo } from '@/lib/brandLogos'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { cn } from '@/lib/utils'
import type { Category, Brand } from '@/types/store'

interface ActiveCategorySectionProps {
  category: Category
  allBrands: Brand[]
  onClose: () => void
}

const ActiveCategorySection: React.FC<ActiveCategorySectionProps> = ({
  category,
  allBrands,
  onClose,
}) => {
  const { t } = useTranslation()
  const { formatPrice } = useSettingsStore()
  const { data: products = [], isLoading: isLoadingProducts } = useCategoryProducts(
    category.slug,
    4
  )

  const localizedName = getCategoryLocalizedName(category, t)
  const localizedDesc = getCategoryLocalizedDescription(category, t)

  // Associated brands for this category
  const categoryBrands = useMemo(() => {
    const productBrandSlugs = new Set(
      products.map((p) => p.brand_slug?.toLowerCase()).filter(Boolean)
    )
    const matching = allBrands.filter(
      (b) =>
        productBrandSlugs.has(b.slug?.toLowerCase()) ||
        (b.products_count && b.products_count > 0)
    )
    return (matching.length > 0 ? matching : allBrands).slice(0, 6)
  }, [allBrands, products])

  return (
    <div className="space-y-4">
      {/* ── Category Header & Direct Link ───────────────────────── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100/80 dark:border-blue-900/50 flex items-center justify-center flex-shrink-0 shadow-xs">
            {getCategoryIconElement(category.slug, 'w-5 h-5')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                {localizedName}
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60">
                {category.products_count ?? products.length} {t('common.products', 'Products')}
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {localizedDesc}
            </p>
          </div>
        </div>

        <Link
          to={`/products?category=${category.slug}`}
          onClick={onClose}
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all"
        >
          <span>{t('common.view_all_in', 'View All in')} {localizedName}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ── Quick Discovery Filter Badges ───────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          to={`/products?category=${category.slug}&sort=deals`}
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/50 text-xs font-bold transition-all group"
        >
          <Flame className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>{t('nav.discount_deals', 'Hot Deals')}</span>
        </Link>
        <Link
          to={`/products?category=${category.slug}&sort=rating`}
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50 text-xs font-bold transition-all group"
        >
          <Star className="w-3.5 h-3.5 group-hover:scale-110 transition-transform fill-amber-500" />
          <span>{t('nav.top_rated', 'Top Rated')}</span>
        </Link>
        <Link
          to={`/products?category=${category.slug}&sort=newest`}
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50 text-xs font-bold transition-all group"
        >
          <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>{t('nav.new_2026_releases', 'New Arrivals 2026')}</span>
        </Link>
        <Link
          to={`/products?category=${category.slug}&sort=price_asc`}
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50 text-xs font-bold transition-all group"
        >
          <TrendingUp className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>{t('nav.best_value_models', 'Best Value')}</span>
        </Link>
      </div>

      {/* ── Subcategories (if available) ────────────────────────── */}
      {category.children && category.children.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('nav.subcategories', 'Subcategories')}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {category.children.map((sub) => (
              <Link
                key={sub.id}
                to={`/products?category=${sub.slug}`}
                onClick={onClose}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-100 dark:border-slate-800 transition-all group"
              >
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                  {getCategoryLocalizedName(sub, t)}
                </span>
                {sub.products_count !== undefined && (
                  <span className="text-[10px] text-slate-400 group-hover:text-blue-500 font-bold">
                    {sub.products_count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Real Category Products Showcase (Clean 2x2 Grid) ────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('product.featured', 'Featured Products in')} {localizedName}
          </span>
          <span className="text-[10px] text-slate-400">
            {products.length} {t('common.items', 'items')}
          </span>
        </div>

        {isLoadingProducts ? (
          <div className="grid grid-cols-2 gap-2.5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5">
            {products.slice(0, 4).map((product) => {
              const discountPct =
                product.compare_price && product.compare_price > product.selling_price
                  ? Math.round(
                      ((product.compare_price - product.selling_price) /
                        product.compare_price) *
                        100
                    )
                  : 0

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-100/90 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800/60 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-200 group cursor-pointer"
                >
                  {/* Clean rounded product image */}
                  <div className="w-16 h-16 min-w-16 min-h-16 max-w-16 max-h-16 rounded-xl overflow-hidden bg-white dark:bg-slate-900 flex-shrink-0 p-1 flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover:border-blue-200/80 dark:group-hover:border-blue-900/80 transition-colors">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      fallbackType="product"
                      containerClassName="w-full h-full rounded-lg bg-transparent overflow-hidden"
                      className="w-full h-full object-cover rounded-lg group-hover:scale-108 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {product.brand && (
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate leading-none uppercase">
                          {product.brand}
                        </span>
                      )}
                      {discountPct > 0 && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200/60">
                          -{discountPct}%
                        </span>
                      )}
                    </div>

                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate leading-snug">
                      {product.name}
                    </h5>

                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">
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
              )
            })}
          </div>
        ) : (
          <div className="py-8 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
              {t('common.no_products_found', 'Browse full catalog in this category')}
            </p>
            <Link
              to={`/products?category=${category.slug}`}
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <span>{t('common.view_all', 'Explore All')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export const MegaMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation()

  // Use global custom hooks
  const { data: categories = [] } = useCategories()
  const { data: brands = [] } = useBrands()

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) || categories[0] || null

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {/* ── Fixed Dimming Backdrop to prevent page background bleed ── */}
      <motion.div
        key="megamenu-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        className="fixed inset-0 top-[128px] bg-slate-950/50 backdrop-blur-xs z-40 pointer-events-auto"
        aria-hidden="true"
      />

      {/* ── 100% Solid Opaque MegaMenu Container ─────────────────── */}
      <motion.div
        key="megamenu-content"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-[0_30px_70px_rgba(0,0,0,0.22)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.8)] z-50 text-slate-900 dark:text-slate-100 select-none"
      >
        <div className="container-site py-5">
          <div className="grid grid-cols-12 gap-6 min-h-[420px]">
            {/* ── Left Column: Categories List (Col 3) ────────────────── */}
            <div className="col-span-3 border-r border-slate-100 dark:border-slate-800 pr-4 flex flex-col justify-between">
              <div>
                <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 mb-2">
                  <span>{t('nav.all_categories', 'All Categories')}</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900">
                    {categories.length} {t('common.total', 'Total')}
                  </span>
                </div>

                <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                  {categories.map((cat) => {
                    const isSelected = activeCategory?.id === cat.id
                    return (
                      <button
                        key={cat.id}
                        onMouseEnter={() => setActiveCategoryId(cat.id)}
                        onClick={() => onClose()}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all duration-150 text-left group cursor-pointer',
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shadow-xs border border-blue-200 dark:border-blue-800 font-black'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                        )}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div
                            className={cn(
                              'w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-150',
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:scale-110'
                            )}
                          >
                            {getCategoryIconElement(cat.slug, 'w-3.5 h-3.5')}
                          </div>
                          <span className="truncate">{getCategoryLocalizedName(cat, t)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {cat.products_count !== undefined && (
                            <span
                              className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors',
                                isSelected
                                  ? 'bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              )}
                            >
                              {cat.products_count}
                            </span>
                          )}
                          <ChevronRight
                            className={cn(
                              'w-3.5 h-3.5 transition-transform duration-150',
                              isSelected
                                ? 'text-blue-600 dark:text-blue-400 translate-x-0.5'
                                : 'text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5'
                            )}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* View All Products Link */}
              <Link
                to="/products"
                onClick={onClose}
                className="mt-3 flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400 transition-all border border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span>{t('common.view_all_products', 'View All Products')}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* ── Middle Column: Active Category & Real Products (Col 6) ── */}
            <div className="col-span-6 pl-1 pr-3">
              {activeCategory && (
                <ActiveCategorySection
                  category={activeCategory}
                  allBrands={brands}
                  onClose={onClose}
                />
              )}
            </div>

            {/* ── Right Column: Official Brands & Assurance Card (Col 3) ── */}
            <div className="col-span-3 border-l border-slate-100 dark:border-slate-800 pl-4 space-y-4 flex flex-col justify-between">
              {/* Brands Showcase */}
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between mb-2">
                  <span>{t('nav.official_brands', 'Official Brands')}</span>
                  <Link
                    to="/products"
                    onClick={onClose}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold"
                  >
                    {t('common.view_all', 'View all')} →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {brands.slice(0, 6).map((brand) => (
                    <Link
                      key={brand.id}
                      to={`/products?brand=${brand.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800/60 transition-all group"
                    >
                      <BrandLogo brand={brand} className="w-6 h-6 rounded-lg" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {brand.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Enterprise Guarantee & Promo Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E2749] via-[#2C376B] to-slate-900 text-white shadow-lg border border-blue-500/20 space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('nav.enterprise_warranty', 'Enterprise Warranty')}</span>
                </div>

                <div>
                  <div className="text-xs font-black leading-snug">
                    {t('nav.genuine_tech_warranty', '100% Genuine Tech with Official Warranty')}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-300">
                    <div className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-blue-300" />
                      <span>25 Provinces</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-300" />
                      <span>Fast Delivery</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/products?sort=deals"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md shadow-blue-600/30 transition-all group cursor-pointer"
                >
                  <span>{t('nav.explore_special_promotions', 'Explore Special Deals')}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default MegaMenu

