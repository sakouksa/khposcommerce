import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, CheckCircle2, ArrowUp, AlertCircle, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface InfiniteScrollSentinelProps {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isError?: boolean
  totalLoaded?: number
  totalCount?: number
  onIntersect: () => void
  onRetry?: () => void
  viewMode?: 'grid' | 'list'
  rootMargin?: string
}

export const InfiniteScrollSentinel: React.FC<InfiniteScrollSentinelProps> = ({
  hasNextPage,
  isFetchingNextPage,
  isError = false,
  totalLoaded = 0,
  totalCount = 0,
  onIntersect,
  onRetry,
  viewMode = 'grid',
  rootMargin = '400px',
}) => {
  const { t } = useTranslation()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage || isFetchingNextPage || isError) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage && !isError) {
          onIntersect()
        }
      },
      {
        root: null,
        rootMargin, // Prefetch before reaching bottom
        threshold: 0.05,
      }
    )

    observer.observe(sentinel)
    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isFetchingNextPage, isError, onIntersect, rootMargin])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="w-full mt-6 mb-12">
      {/* ── Active Intersection Observer Anchor ───────────────────────── */}
      <div ref={sentinelRef} className="h-4 w-full pointer-events-none opacity-0" aria-hidden="true" />

      {/* ── 1. Skeleton Shimmer while Fetching Next Batch ─────────────── */}
      <AnimatePresence>
        {isFetchingNextPage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-3 space-y-3 animate-pulse shadow-xs"
                  >
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                    <div className="space-y-2 pt-1">
                      <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-md w-3/4" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-md w-1/2" />
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3" />
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-4 flex gap-4 animate-pulse"
                  >
                    <div className="w-28 h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-3/4" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-md w-1/3" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Subdued loading indicator pill */}
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 py-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
              <span>{t('feed.loading_more', 'Loading more products...')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. Error Recovery State ───────────────────────────────────── */}
      {isError && !isFetchingNextPage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-3xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 text-center space-y-3 max-w-md mx-auto"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {t('feed.load_error', "Couldn't load more products")}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('network_error', 'Please check your connection and try again.')}
            </p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('feed.retry', 'Try Again')}
            </button>
          )}
        </motion.div>
      )}

      {/* ── 3. Reached End of Catalog ─────────────────────────────────── */}
      {!hasNextPage && !isFetchingNextPage && !isError && totalLoaded > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-6 pb-2 text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {t('feed.reached_end', "You've reached the end of the catalog")}
            </span>
            {totalCount > 0 && (
              <span className="text-slate-400 font-normal">
                ({totalLoaded} {t('common.items', 'items')})
              </span>
            )}
          </div>

          <div>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline active:scale-95 transition-transform"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              {t('feed.back_to_top', 'Back to Top')}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default InfiniteScrollSentinel
