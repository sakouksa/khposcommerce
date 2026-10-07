import React, { useState } from 'react'
import { useSearchParams, useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  SlidersHorizontal,
  Grid,
  List,
  ChevronDown,
  X,
  Filter,
  ArrowUpDown,
  Sparkles,
  Layers,
  Tag,
  Check,
  RotateCcw,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ProductCard from '@/components/ecommerce/ProductCard'
import SEOHead from '@/components/seo/SEOHead'
import LoadingSkeleton from '@/components/storefront/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import InfiniteScrollSentinel from '@/components/common/InfiniteScrollSentinel'
import PageTransition from '@/components/common/PageTransition'
import useInfiniteProducts from '@/hooks/useInfiniteProducts'
import api from '@/lib/api'

export const ProductListPage: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { slug } = useParams()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Filters state from URL query parameters
  const sort = searchParams.get('sort') || 'featured'
  const category = slug || searchParams.get('category') || ''
  const brand = searchParams.get('brand') || ''
  const search = searchParams.get('search') || searchParams.get('q') || ''
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''

  // Local price input state
  const [localMinPrice, setLocalMinPrice] = useState(minPrice)
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice)

  // Fetch real categories with product counts from database
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['storefront', 'categories'],
    queryFn: async () => {
      const res = await api.get('/categories')
      return res.data?.data || []
    },
    staleTime: 5 * 60 * 1000,
  })

  // Fetch real brands from database
  const { data: brands = [] } = useQuery<any[]>({
    queryKey: ['storefront', 'brands'],
    queryFn: async () => {
      const res = await api.get('/brands')
      return res.data?.data || []
    },
    staleTime: 5 * 60 * 1000,
  })

  // Infinite products feed from database (TanStack useInfiniteQuery)
  const {
    products,
    total,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteProducts({
    params: {
      sort,
      category,
      brand,
      search,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    },
    mode: 'catalog',
    perPage: 16,
  })

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams)
    if (val) next.set(key, val)
    else next.delete(key)
    setSearchParams(next)
  }

  const applyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (localMinPrice) next.set('min_price', localMinPrice)
    else next.delete('min_price')
    if (localMaxPrice) next.set('max_price', localMaxPrice)
    else next.delete('max_price')
    setSearchParams(next)
  }

  const clearFilters = () => {
    setLocalMinPrice('')
    setLocalMaxPrice('')
    setSearchParams({})
  }

  const activeCategory = categories.find((c: any) => c.slug === category || String(c.id) === category)
  const activeBrand = brands.find((b: any) => b.slug === brand || String(b.id) === brand)

  // ── SEO Composition ──────────────────────────────────────────────────────
  const isSearchPage = !!search
  const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://enterprise-pos-api.onrender.com'

  const pageTitle = activeCategory
    ? activeCategory.name
    : activeBrand
    ? `${activeBrand.name} Products`
    : search
    ? `Search: "${search}"`
    : 'All Products'

  const pageDescription = activeCategory
    ? activeCategory.description
      ? `${activeCategory.description.slice(0, 140)}`
      : `Shop ${activeCategory.name} products — authentic items with fast shipping across Cambodia.`
    : activeBrand
    ? activeBrand.description
      ? `${activeBrand.description.slice(0, 140)}`
      : `Explore genuine ${activeBrand.name} products. Buy ${activeBrand.name} with confidence and fast delivery.`
    : 'Shop authentic electronics, computers, smartphones and accessories with fast delivery across Cambodia.'

  const canonicalPath = activeCategory
    ? `/category/${activeCategory.slug}`
    : activeBrand
    ? `/brand/${activeBrand.slug}`
    : '/products'

  const pageBreadcrumbs = [
    { name: 'Home', url: '/' },
    ...(activeCategory ? [{ name: 'Products', url: '/products' }, { name: activeCategory.name, url: `/category/${activeCategory.slug}` }] : []),
    ...(activeBrand ? [{ name: 'Brands', url: '/products' }, { name: activeBrand.name, url: `/brand/${activeBrand.slug}` }] : []),
    ...(!activeCategory && !activeBrand ? [{ name: 'All Products', url: '/products' }] : []),
  ]

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageDescription,
    url: `${SITE_URL}${canonicalPath}`,
  }

  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={canonicalPath}
        robots={isSearchPage ? 'noindex, follow' : 'index, follow'}
        schema={collectionSchema}
        breadcrumbs={pageBreadcrumbs}
      />

      <PageTransition className="container-site py-6 space-y-6">
        {/* ── Breadcrumb & Header ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
          <div>
            <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
              <Link to="/" className="hover:text-blue-600 transition-colors">
                {t('nav.home', 'Home')}
              </Link>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold">
                {activeCategory?.name || activeBrand?.name || (search ? `"${search}"` : t('nav.products', 'All Products'))}
              </span>
            </nav>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeCategory?.name || activeBrand?.name || (search ? `Results for "${search}"` : t('nav.products', 'All Products'))}
              {total > 0 && (
                <span className="ml-2.5 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                  {total} {t('common.items', 'items')}
                </span>
              )}
            </h1>
          </div>

          {/* Controls: View Mode & Sort Dropdown */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Grid / List view mode switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="List View"
                aria-label="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-3.5 pr-8 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
              >
                <option value="featured">✨ Featured</option>
                <option value="popular">🔥 Most Popular</option>
                <option value="newest">🆕 Newest Arrivals</option>
                <option value="top_rated">⭐ Highest Rated</option>
                <option value="price_asc">💵 Price: Low to High</option>
                <option value="price_desc">💎 Price: High to Low</option>
                <option value="name_asc">🔤 Name: A to Z</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Active Filter Badges ───────────────────────────────────────── */}
        {(category || brand || search || minPrice || maxPrice) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-400">Active Filters:</span>
            {activeCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
                Category: {activeCategory.name}
                <button onClick={() => updateParam('category', '')} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeBrand && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold">
                Brand: {activeBrand.name}
                <button onClick={() => updateParam('brand', '')} className="hover:text-purple-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold">
                Search: "{search}"
                <button onClick={() => updateParam('search', '')} className="hover:text-amber-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                Price: ${minPrice || '0'} - ${maxPrice || '∞'}
                <button
                  onClick={() => {
                    setLocalMinPrice('')
                    setLocalMaxPrice('')
                    const next = new URLSearchParams(searchParams)
                    next.delete('min_price')
                    next.delete('max_price')
                    setSearchParams(next)
                  }}
                  className="hover:text-emerald-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline ml-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear All
            </button>
          </div>
        )}

        {/* ── Main Layout: Sidebar & Products Feed ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Filters</span>
              </h2>
              {(category || brand || minPrice || maxPrice) && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] font-bold text-rose-500 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Categories Filter */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  <span>Categories</span>
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  <button
                    onClick={() => updateParam('category', '')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex justify-between items-center transition-colors ${
                      !category
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>All Categories</span>
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateParam('category', category === c.slug ? '' : c.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex justify-between items-center transition-colors ${
                        category === c.slug
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          category === c.slug
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {c.products_count || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400">
                <span>Price Range ($)</span>
                <Tag className="w-3.5 h-3.5" />
              </div>
              <form onSubmit={applyPriceFilter} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Apply Price
                </button>
              </form>
            </div>

            {/* Brands Filter */}
            {brands.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  <span>Brands</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  <button
                    onClick={() => updateParam('brand', '')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex justify-between items-center transition-colors ${
                      !brand
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>All Brands</span>
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => updateParam('brand', brand === b.slug ? '' : b.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex justify-between items-center transition-colors ${
                        brand === b.slug
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{b.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          brand === b.slug
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {b.product_count || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Product Feed Area ─────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading ? (
              <LoadingSkeleton type="grid" count={8} />
            ) : products.length === 0 ? (
              <EmptyState
                title="No products found"
                description="Try adjusting your filter selection, keywords, or price range to find what you need."
                actionLabel="Clear All Filters"
                onAction={clearFilters}
              />
            ) : (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4'
                      : 'space-y-4'
                  }
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant={viewMode === 'list' ? 'horizontal' : 'default'}
                    />
                  ))}
                </div>

                {/* ── Facebook-Style Infinite Scroll Sentinel ────────────────── */}
                <InfiniteScrollSentinel
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  isError={isError}
                  totalLoaded={products.length}
                  totalCount={total}
                  onIntersect={fetchNextPage}
                  onRetry={refetch}
                  viewMode={viewMode}
                  rootMargin="400px"
                />
              </>
            )}
          </div>
        </div>
      </PageTransition>
    </>
  )
}

export default ProductListPage
