// ─── Global Store & Domain TypeScript Types ───────────────────────────────

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image?: string | null
  icon?: string | null
  parent_id?: number | null
  products_count?: number
  is_active?: boolean
  children?: Category[]
}

export type CategoryItem = Category

export interface Brand {
  id: number
  name: string
  slug: string
  description?: string
  logo?: string | null
  website?: string | null
  products_count?: number
  is_active?: boolean
}

export type BrandItem = Brand

export interface StoreSettings {
  site_name?: string
  site_subtitle?: string
  site_logo?: string | null
  favicon?: string | null
  site_email?: string
  company_phone?: string
  company_email?: string
  company_address?: string
  hotlines?: string[]
  social_facebook?: string
  social_telegram?: string
  social_tiktok?: string
  social_youtube?: string
  currency?: string
  exchange_rate_khr?: number
  free_shipping_min?: number
}

export interface ProductVariant {
  id: number
  name: string
  sku?: string
  selling_price: number
  compare_price?: number
  cost_price?: number
  stock_quantity?: number
  attributes?: Record<string, string>
}

export interface Product {
  id: number
  name: string
  slug: string
  sku?: string
  barcode?: string
  price: number
  selling_price?: number
  compare_price?: number
  cost_price?: number
  stock?: number
  stock_quantity?: number
  image?: string | null
  images?: Array<{ id?: number; url: string; is_primary?: boolean }> | string[]
  brand_id?: number
  category_id?: number
  brand?: Brand
  category?: Category
  short_description?: string
  description?: string
  rating?: number
  rating_avg?: number
  rating_count?: number
  reviews_count?: number
  is_featured?: boolean
  is_active?: boolean
  variants?: ProductVariant[]
  tags?: string[]
  meta_title?: string
  meta_description?: string
}

export interface ProductItem {
  id: number
  name: string
  slug: string
  sku?: string
  selling_price: number
  compare_price?: number
  discount_pct?: number
  is_featured?: boolean
  has_variants?: boolean
  stock?: number
  stock_quantity?: number
  rating_avg?: number
  rating_count?: number
  image?: string | null
  category?: string
  category_slug?: string
  brand?: string
  brand_slug?: string
  flash_price?: number
  quota?: number
  sold_count?: number
  price?: number
  description?: string
  short_description?: string
  weight?: number | null
  dimensions?: string
  warranty?: string
}

export interface Banner {
  id: number | string
  company_id?: number
  store_id?: number
  title?: string
  subtitle?: string
  badge?: string
  badge_color?: string
  image?: string
  image_url?: string
  mobile_image?: string
  link?: string
  link_url?: string
  button_text?: string
  category_tag?: string
  discount_tag?: string
  position?: string
  is_active?: boolean
  sort_order?: number
  order?: number
  starts_at?: string
  ends_at?: string
}

export interface SearchSuggestion {
  id: number
  name: string
  slug: string
  sku?: string
  barcode?: string
  price: number
  compare_price?: number
  image?: string
  brand?: string
  category?: string
}

export interface CartItemProduct {
  id: number
  name: string
  sku: string
  selling_price: number
  compare_price?: number
  image?: string
}

export interface CartItemVariant {
  id: number
  name: string
  selling_price: number
}

export interface CartItem {
  id: number
  product_id: number
  product_variant_id?: number | null
  quantity: number
  product?: CartItemProduct
  variant?: CartItemVariant | null
  line_total: number
}

export interface OrderItem {
  id?: number
  product_id?: number
  product_variant_id?: number | null
  name: string
  sku?: string
  price: number
  quantity: number
  total: number
}

export interface OrderTimelineStep {
  status: string
  comment?: string
  created_at: string
}

export interface Order {
  id: number
  order_number: string
  customer_id?: number
  shipping_name?: string
  shipping_phone?: string
  shipping_address?: string
  shipping_city?: string
  shipping_country?: string
  subtotal: number
  discount: number
  shipping_fee: number
  grand_total: number
  total?: number
  payment_method: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  notes?: string
  items?: OrderItem[]
  timeline?: OrderTimelineStep[]
  created_at: string
  updated_at?: string
}

export interface CustomerUser {
  id: number
  name: string
  email: string
  phone?: string
  photo?: string
  loyalty_points: number
  total_spent: number
  order_count: number
  group?: string
  addresses?: unknown[]
}

export interface CouponItem {
  id: number
  code: string
  name?: string
  type: string
  value: number
  min_purchase?: number
  max_discount?: number
  expires_at?: string
  description?: string
}

export interface ReviewItem {
  id: number
  product_id: number
  customer_name: string
  rating: number
  title?: string
  comment: string
  created_at: string
}

export interface PaginationMeta {
  total?: number
  per_page: number
  current_page?: number
  last_page?: number
  has_more: boolean
  next_page?: number | null
  next_cursor?: string | null
  prev_cursor?: string | null
  query?: string
  search_type?: string
  suggestions?: string[]
}

export interface InfinitePaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  total?: number
  current_page?: number
  last_page?: number
}
