// ─── Centralized React Query Keys ──────────────────────────────────────────

export const queryKeys = {
  // Products & Catalogs
  products: {
    all: ['products'] as const,
    list: (params?: Record<string, any>) => ['products', 'list', params] as const,
    infinite: (mode: string, params?: Record<string, any>) => ['products', 'infinite', mode, params] as const,
    detail: (slugOrId: string | number) => ['products', 'detail', slugOrId] as const,
    featured: ['products', 'featured'] as const,
    related: (productId: number) => ['products', 'related', productId] as const,
    compare: (ids: number[]) => ['products', 'compare', ids] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
    detail: (slug: string) => ['categories', 'detail', slug] as const,
  },

  // Brands
  brands: {
    all: ['brands'] as const,
    detail: (slug: string) => ['brands', 'detail', slug] as const,
  },

  // Search & Suggestions
  search: {
    suggestions: (query: string, type?: string, category?: string) =>
      ['search', 'suggestions', query, type, category] as const,
    results: (params: Record<string, any>) => ['search', 'results', params] as const,
  },

  // Cart
  cart: {
    current: ['cart'] as const,
  },

  // Wishlist
  wishlist: {
    all: ['wishlist'] as const,
    check: (productId: number) => ['wishlist', 'check', productId] as const,
  },

  // Orders & Tracking
  orders: {
    all: (params?: Record<string, any>) => ['orders', params] as const,
    detail: (orderNumber: string) => ['orders', 'detail', orderNumber] as const,
    track: (number: string, email?: string) => ['orders', 'track', number, email] as const,
  },

  // Store Settings & Banners
  store: {
    settings: ['store', 'settings'] as const,
    banners: ['store', 'banners'] as const,
    homepage: ['store', 'homepage'] as const,
    faqs: ['store', 'faqs'] as const,
    page: (slug: string) => ['store', 'page', slug] as const,
    blog: {
      list: (params?: Record<string, any>) => ['store', 'blog', 'list', params] as const,
      detail: (slug: string) => ['store', 'blog', 'detail', slug] as const,
    },
  },

  // Customer Account & Profile
  customer: {
    profile: ['customer', 'profile'] as const,
    addresses: ['customer', 'addresses'] as const,
    reviews: ['customer', 'reviews'] as const,
  },
}

export default queryKeys
