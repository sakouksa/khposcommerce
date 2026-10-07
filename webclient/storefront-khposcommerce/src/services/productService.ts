import api from '@/api'
import type { Product, ProductItem, SearchSuggestion, Banner, InfinitePaginatedResponse } from '@/types/store'

export interface ProductQueryParams {
  category?: string
  brand?: string
  sort?: string
  min_price?: number | string
  max_price?: number | string
  rating?: number | string
  in_stock?: boolean
  featured?: boolean
  page?: number
  cursor?: string
  per_page?: number
  search?: string
  q?: string
  search_type?: string
}

export const productService = {
  /**
   * Fetch paginated list of products with filters
   */
  async getProducts(params: ProductQueryParams = {}): Promise<InfinitePaginatedResponse<ProductItem>> {
    const res = await api.get('/products', { params })
    const data = res.data?.data || []
    const meta = res.data?.meta || {
      total: res.data?.total || data.length,
      per_page: params.per_page || 16,
      current_page: res.data?.current_page || 1,
      last_page: res.data?.last_page || 1,
      has_more: res.data?.current_page < res.data?.last_page,
    }

    return {
      data,
      meta,
      total: meta.total ?? res.data?.total,
      current_page: meta.current_page ?? res.data?.current_page,
      last_page: meta.last_page ?? res.data?.last_page,
    }
  },

  /**
   * Fetch search results with multi-mode & cursor/infinite pagination
   */
  async searchProducts(params: ProductQueryParams = {}): Promise<InfinitePaginatedResponse<ProductItem>> {
    const res = await api.get('/search', { params })
    const data = res.data?.data || res.data?.results || []
    const meta = res.data?.meta || {
      total: res.data?.total || data.length,
      per_page: params.per_page || 16,
      current_page: res.data?.current_page || 1,
      last_page: res.data?.last_page || 1,
      has_more: res.data?.current_page < res.data?.last_page,
    }

    return {
      data,
      meta,
      total: meta.total ?? res.data?.total,
      current_page: meta.current_page ?? res.data?.current_page,
      last_page: meta.last_page ?? res.data?.last_page,
    }
  },

  /**
   * Fetch single product detail by slug
   */
  async getProductBySlug(slug: string): Promise<any> {
    const res = await api.get(`/products/${slug}`)
    return res.data?.data || null
  },

  /**
   * Alias for getProductBySlug
   */
  async getProduct(slugOrId: string | number): Promise<any> {
    const res = await api.get(`/products/${slugOrId}`)
    return res.data?.data || null
  },

  /**
   * Fetch spotlight & hero banners
   */
  async getBanners(): Promise<Banner[]> {
    const res = await api.get('/banners')
    return res.data?.data || []
  },

  /**
   * Autocomplete search suggestions
   */
  async getSearchSuggestions(q: string, searchType = 'ai', category?: string): Promise<SearchSuggestion[]> {
    const params: Record<string, string> = { q, search_type: searchType }
    if (category && category !== 'all') params.category = category
    const res = await api.get('/search/autocomplete', { params })
    return res.data?.data || []
  },
}

export default productService
