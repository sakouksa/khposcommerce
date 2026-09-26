import { useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSearchStore, type SearchMode } from '@/stores/searchStore'
import { productService } from '@/services'

/**
 * Global Search Hook for ultra-smooth, responsive search synchronization
 * across the header bar, autocomplete popup, and the search results page.
 */
export const useSearch = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const {
    query,
    searchMode,
    isSearching,
    isFocused,
    suggestions,
    recentSearches,
    setQuery,
    setSearchMode,
    setIsSearching,
    setIsFocused,
    setSuggestions,
    addRecentSearch,
    clearRecentSearches,
    clearSearch,
  } = useSearchStore()

  const debounceTimerRef = useRef<any>(null)

  // Sync URL search params with global search state when on search page
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    const urlMode = searchParams.get('search_type') as SearchMode

    if (urlQuery !== null && urlQuery !== query) {
      setQuery(urlQuery)
    }
    if (urlMode && ['ai', 'name', 'sku'].includes(urlMode) && urlMode !== searchMode) {
      setSearchMode(urlMode)
    }
  }, [searchParams])

  // Live autocomplete search with smooth debouncing
  const fetchSuggestions = useCallback(
    async (q: string, mode: SearchMode) => {
      if (q.trim().length < 2) {
        setSuggestions([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      try {
        const results = await productService.getSearchSuggestions(q.trim(), mode)
        setSuggestions(results)
      } catch {
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    },
    [setSuggestions, setIsSearching]
  )

  const handleQueryChange = useCallback(
    (newVal: string, mode?: SearchMode) => {
      const activeMode = mode || searchMode
      setQuery(newVal)

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(newVal, activeMode)
      }, 200)
    },
    [searchMode, setQuery, fetchSuggestions]
  )

  const handleModeChange = useCallback(
    (newMode: SearchMode) => {
      setSearchMode(newMode)
      if (query.trim().length >= 2) {
        fetchSuggestions(query, newMode)
      }
    },
    [query, setSearchMode, fetchSuggestions]
  )

  const executeSearch = useCallback(
    (customQuery?: string, customMode?: SearchMode) => {
      const targetQuery = (customQuery ?? query).trim()
      const targetMode = customMode ?? searchMode

      if (!targetQuery) return

      addRecentSearch(targetQuery)
      setIsFocused(false)

      navigate(
        `/search?q=${encodeURIComponent(targetQuery)}&search_type=${encodeURIComponent(targetMode)}`
      )
    },
    [query, searchMode, addRecentSearch, setIsFocused, navigate]
  )

  return {
    query,
    searchMode,
    isSearching,
    isFocused,
    suggestions,
    recentSearches,
    setQuery: handleQueryChange,
    setSearchMode: handleModeChange,
    setIsFocused,
    executeSearch,
    clearSearch,
    clearRecentSearches,
  }
}

export default useSearch
