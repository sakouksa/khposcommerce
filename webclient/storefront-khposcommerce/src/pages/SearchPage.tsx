import React, { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Sparkles, Tag, Barcode, SlidersHorizontal, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '@/hooks'
import ProductCard from '@/components/ecommerce/ProductCard'
import InfiniteScrollSentinel from '@/components/common/InfiniteScrollSentinel'
import PageTransition from '@/components/common/PageTransition'
import useInfiniteProducts from '@/hooks/useInfiniteProducts'
import LoadingSkeleton from '@/components/storefront/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import SEOHead from '@/components/seo/SEOHead'

export const SearchPage: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') || ''
  const urlSearchType = searchParams.get('search_type') || 'ai'

  const { query, searchMode, setQuery, setSearchMode } = useSearch()

  // Keep global search state synchronized with URL params
  useEffect(() => {
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery)
    }
    if (urlSearchType && urlSearchType !== searchMode) {
      setSearchMode(urlSearchType as any)
    }
  }, [urlQuery, urlSearchType])

  const activeQuery = urlQuery || query
  const activeType = urlSearchType || searchMode

  // Infinite search feed powered by TanStack useInfiniteQuery
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
      q: activeQuery.trim(),
      search_type: activeType,
    },
    mode: 'search',
    perPage: 16,
    enabled: Boolean(activeQuery.trim()),
  })

  const getModeInfo = () => {
    switch (activeType) {
      case 'sku':
        return {
          label: t('search.by_sku', 'Search By SKU / Barcode'),
          icon: Barcode,
          color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
        }
      case 'name':
        return {
          label: t('search.by_name', 'Search By Name'),
          icon: Tag,
          color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800',
        }
      default:
        return {
          label: t('search.ai_search', 'AI Smart Search'),
          icon: Sparkles,
          color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
        }
    }
  }

  const modeInfo = getModeInfo()
  const ModeIcon = modeInfo.icon
  const displayQuery = activeQuery

  return (
    <>
      <SEOHead
        title={displayQuery ? `Search: "${displayQuery}"` : 'Search Products'}
        description="Search genuine laptops, smartphones, gaming accessories, and POS systems in Enterprise Store Cambodia."
        canonical="/search"
        robots="noindex, follow"
      />
      <PageTransition className="container-site py-8 space-y-6">
      {/* ── Breadcrumb & Search Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t('nav.home', 'Home')}
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">Search Results</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
              {displayQuery ? `Results for "${displayQuery}"` : 'Search Catalog'}
            </h1>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${modeInfo.color}`}
            >
              <ModeIcon className="w-3.5 h-3.5" />
              <span>{modeInfo.label}</span>
            </div>
          </div>

          {displayQuery && total > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Found {total} matching items in enterprise catalog
            </p>
          )}
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors self-start sm:self-auto shadow-xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{t('nav.products', 'Explore All Products')}</span>
        </Link>
      </div>

      {/* ── Search Results Content ────────────────────────────────────────── */}
      {!displayQuery ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Search 10,000+ Genuine Tech Products
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Type product name, AI prompt (e.g. "RTX 4060 laptop under $1000"), or SKU barcode into the search bar.
          </p>
        </div>
      ) : isLoading ? (
        <LoadingSkeleton type="grid" count={8} />
      ) : products.length === 0 ? (
        <EmptyState
          title={`No products matching "${displayQuery}"`}
          description="Try switching search modes (AI, Name, or SKU), using broader keywords, or exploring our product categories."
          actionLabel="Browse All Products"
          onAction={() => window.location.assign('/products')}
        />
      ) : (
        <div className="space-y-6">
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* ── Facebook-Style Infinite Scroll Sentinel for Search ───────── */}
          <InfiniteScrollSentinel
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isError={isError}
            totalLoaded={products.length}
            totalCount={total}
            onIntersect={fetchNextPage}
            onRetry={refetch}
            viewMode="grid"
            rootMargin="400px"
          />
        </div>
      )}
      </PageTransition>
    </>
  )
}

export default SearchPage
