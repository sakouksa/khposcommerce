import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Tag,
  Barcode,
  Check,
  Laptop,
  Clock,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearch, useClickOutside } from '@/hooks'
import type { SearchMode } from '@/stores/searchStore'
import { cn, getImageUrl } from '@/lib/utils'

interface GlobalSearchBarProps {
  className?: string
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({ className }) => {
  const { t } = useTranslation()

  // Use global synchronized search hook
  const {
    query,
    searchMode,
    isSearching,
    isFocused,
    suggestions,
    recentSearches,
    setQuery,
    setSearchMode,
    setIsFocused,
    executeSearch,
    clearSearch,
    clearRecentSearches,
  } = useSearch()

  const [modeDropdownOpen, setModeDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const modeDropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close popups on click outside
  useClickOutside(containerRef, () => {
    setIsFocused(false)
    setModeDropdownOpen(false)
  })

  useClickOutside(modeDropdownRef, () => setModeDropdownOpen(false))

  const searchModes = [
    {
      id: 'ai' as SearchMode,
      label: t('search.ai_search', 'AI Search'),
      icon: Sparkles,
      iconColor: 'text-blue-500',
      placeholder: t('search.placeholder_ai', 'Search with AI (e.g. RTX 4060, Apple M3, gaming laptop)...'),
      badge: 'Smart',
    },
    {
      id: 'name' as SearchMode,
      label: t('search.by_name', 'Search By Name'),
      icon: Tag,
      iconColor: 'text-indigo-500',
      placeholder: t('search.placeholder_name', 'Search by product name (e.g. MacBook Pro, ASUS ROG)...'),
      badge: 'Name',
    },
    {
      id: 'sku' as SearchMode,
      label: t('search.by_sku', 'Search By SKU'),
      icon: Barcode,
      iconColor: 'text-emerald-500',
      placeholder: t('search.placeholder_sku', 'Search by SKU or Barcode (e.g. LAP-2026-X1)...'),
      badge: 'Code',
    },
  ]

  const activeMode = searchModes.find((m) => m.id === searchMode) || searchModes[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      executeSearch()
      inputRef.current?.blur()
    }
  }

  const handleRecentClick = (term: string) => {
    setQuery(term)
    executeSearch(term)
    inputRef.current?.blur()
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="flex items-center">
        <div
          className={cn(
            'flex items-stretch w-full bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl transition-all duration-200 border border-slate-300 dark:border-slate-700 overflow-visible shadow-xs h-10 sm:h-11',
            isFocused &&
              'shadow-lg border-[#f58220] ring-2 ring-[#f58220]/20'
          )}
        >
          {/* ── Search Mode Selector Dropdown (AI Search / By Name / By SKU) ── */}
          <div ref={modeDropdownRef} className="relative flex-shrink-0 flex items-center">
            <button
              type="button"
              onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
              className="h-full flex items-center gap-1.5 px-3 sm:px-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-r border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer select-none rounded-l-lg sm:rounded-l-xl"
              aria-label="Select Search Mode"
            >
              <activeMode.icon className={cn('w-3.5 h-3.5 flex-shrink-0', activeMode.iconColor)} />
              <span className="whitespace-nowrap hidden sm:inline">{activeMode.label}</span>
              <span className="whitespace-nowrap sm:hidden">{activeMode.badge}</span>
              <ChevronDown
                className={cn(
                  'w-3 h-3 text-slate-400 transition-transform duration-200',
                  modeDropdownOpen && 'rotate-180 text-[#f58220]'
                )}
              />
            </button>

            {/* Custom Mode Dropdown Menu */}
            <AnimatePresence>
              {modeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 mt-1.5 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 select-none divide-y divide-slate-100 dark:divide-slate-800"
                >
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2.5 py-1">
                    {t('search.filter_mode', 'Search Filter Mode')}
                  </div>

                  <div className="pt-1 space-y-0.5">
                    {searchModes.map((mode) => {
                      const isSelected = mode.id === searchMode
                      const Icon = mode.icon
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            setSearchMode(mode.id)
                            setModeDropdownOpen(false)
                            inputRef.current?.focus()
                          }}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors text-left cursor-pointer group',
                            isSelected
                              ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={cn('w-4 h-4', mode.iconColor)} />
                            <span>{mode.label}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Search Input Field ── */}
          <div className="flex-1 flex items-center px-3 sm:px-4 gap-2 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={activeMode.placeholder}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none min-w-0 font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5 transition-colors"
                aria-label="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ── Search Submit Action Button (PTC Reference 2026 Orange Button) ── */}
          <button
            type="submit"
            className="px-5 sm:px-7 bg-[#f58220] hover:bg-[#e07519] active:bg-[#d96608] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none rounded-r-lg sm:rounded-r-xl shadow-xs"
            aria-label="Submit Search"
          >
            <span>2026</span>
          </button>
        </div>
      </form>

      {/* ── Autocomplete & Recent Search Dropdown Popup ── */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-50 divide-y divide-slate-100 dark:divide-slate-800"
          >
            {/* Loading Indicator */}
            {isSearching && (
              <div className="px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>{t('search.searching_with', 'Searching products with')} {activeMode.label}...</span>
              </div>
            )}

            {/* Suggestions Results */}
            {suggestions.length > 0 && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    to={`/products/${item.slug}`}
                    onClick={() => setIsFocused(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-contain bg-slate-50 dark:bg-slate-800 p-1 border border-slate-100 dark:border-slate-700/50"
                        onError={(e) => { e.currentTarget.src = '/images/placeholder-product.png' }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Laptop className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        {item.sku && (
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-[10px] text-slate-600 dark:text-slate-400">
                            SKU: {item.sku}
                          </span>
                        )}
                        {item.brand && <span>{item.brand}</span>}
                        {item.category && <span>• {item.category}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                        ${item.price?.toFixed(2)}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}

                <button
                  type="button"
                  onClick={() => executeSearch()}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5" />
                    <span>{t('search.see_all_results_for', 'See all results for')} "{query}"</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Recent Searches (when input is focused and empty) */}
            {!query && recentSearches.length > 0 && (
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t('search.recent_searches', 'Recent Searches')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t('search.clear', 'Clear')}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleRecentClick(term)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GlobalSearchBar
