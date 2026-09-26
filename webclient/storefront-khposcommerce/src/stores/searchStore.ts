import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SearchSuggestion } from '@/types/store'

export type SearchMode = 'ai' | 'name' | 'sku'

interface SearchState {
  query: string
  searchMode: SearchMode
  isSearching: boolean
  isFocused: boolean
  suggestions: SearchSuggestion[]
  recentSearches: string[]

  setQuery: (query: string) => void
  setSearchMode: (mode: SearchMode) => void
  setIsSearching: (isSearching: boolean) => void
  setIsFocused: (isFocused: boolean) => void
  setSuggestions: (suggestions: SearchSuggestion[]) => void
  addRecentSearch: (term: string) => void
  clearRecentSearches: () => void
  clearSearch: () => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: '',
      searchMode: 'ai',
      isSearching: false,
      isFocused: false,
      suggestions: [],
      recentSearches: ['Apple MacBook Pro', 'RTX 4060 Laptop', 'Sony Headphones', 'Logitech Mouse'],

      setQuery: (query) => set({ query }),

      setSearchMode: (searchMode) => set({ searchMode }),

      setIsSearching: (isSearching) => set({ isSearching }),

      setIsFocused: (isFocused) => set({ isFocused }),

      setSuggestions: (suggestions) => set({ suggestions }),

      addRecentSearch: (term) => {
        const trimmed = term.trim()
        if (!trimmed) return
        const current = get().recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())
        set({ recentSearches: [trimmed, ...current].slice(0, 8) })
      },

      clearRecentSearches: () => set({ recentSearches: [] }),

      clearSearch: () => set({ query: '', suggestions: [], isSearching: false, isFocused: false }),
    }),
    {
      name: 'customer_search_history',
      partialize: (s) => ({ recentSearches: s.recentSearches, searchMode: s.searchMode }),
    }
  )
)

export default useSearchStore
