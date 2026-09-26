import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import productService, { type ProductQueryParams } from '@/services/productService'
import type { ProductItem } from '@/types/store'
import type { InfinitePaginatedResponse } from '@/types/store'

export interface UseInfiniteProductsOptions {
  params?: ProductQueryParams
  mode?: 'catalog' | 'search'
  perPage?: number
  enabled?: boolean
}

export function useInfiniteProducts({
  params = {},
  mode = 'catalog',
  perPage = 16,
  enabled = true,
}: UseInfiniteProductsOptions = {}) {
  // Stable query parameters object
  const queryParams = useMemo(
    () => ({
      ...params,
      per_page: perPage,
    }),
    [
      params.category,
      params.brand,
      params.sort,
      params.min_price,
      params.max_price,
      params.rating,
      params.in_stock,
      params.featured,
      params.search,
      params.q,
      params.search_type,
      perPage,
    ]
  )

  const queryKey = useMemo(
    () => ['storefront', 'products', 'infinite', mode, queryParams],
    [mode, queryParams]
  )

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<InfinitePaginatedResponse<ProductItem>>({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const fetchParams: ProductQueryParams = {
        ...queryParams,
        page: pageParam as number,
      }

      if (mode === 'search') {
        return await productService.searchProducts(fetchParams)
      }
      return await productService.getProducts(fetchParams)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.meta) return undefined
      if (lastPage.meta.has_more) {
        if (lastPage.meta.next_page) {
          return lastPage.meta.next_page
        }
        const current = lastPage.meta.current_page || lastPage.current_page || 1
        return current + 1
      }
      return undefined
    },
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    gcTime: 10 * 60 * 1000,
    enabled,
  })

  // Flatten and deduplicate products across all pages
  const products = useMemo<ProductItem[]>(() => {
    if (!data?.pages) return []
    const seen = new Set<number>()
    const flattened: ProductItem[] = []

    for (const page of data.pages) {
      if (Array.isArray(page.data)) {
        for (const item of page.data) {
          if (!seen.has(item.id)) {
            seen.add(item.id)
            flattened.push(item)
          }
        }
      }
    }

    return flattened
  }, [data?.pages])

  // Get total count from first page metadata
  const total = useMemo<number>(() => {
    if (!data?.pages || data.pages.length === 0) return 0
    return data.pages[0]?.meta?.total ?? data.pages[0]?.total ?? products.length
  }, [data?.pages, products.length])

  return {
    products,
    total,
    fetchNextPage,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  }
}

export default useInfiniteProducts
