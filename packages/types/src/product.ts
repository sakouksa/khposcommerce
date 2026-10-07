// ─── Product & Catalog Types ───────────────────────────────────────────

import { Category } from './category'
import { Brand } from './brand'

export type ProductStatus = 'active' | 'draft' | 'archived' | 'out_of_stock'
export type ProductType = 'standard' | 'variable' | 'combo' | 'service'

export interface Unit {
  id: number
  name: string
  short_name: string
  allow_decimal?: boolean
}

export interface Tax {
  id: number
  name: string
  rate: number
  type?: 'percentage' | 'fixed'
  is_active?: boolean
}

export interface ProductImage {
  id: number
  product_id?: number
  url: string
  path?: string
  is_primary?: boolean
  order?: number
}

export interface ProductVariant {
  id: number
  product_id: number
  sku: string
  barcode?: string | null
  name?: string
  attribute_values?: Record<string, string>
  cost_price?: number
  price: number
  selling_price?: number
  compare_price?: number | null
  stock_quantity?: number
  image?: string | null
  is_active?: boolean
}

export interface Product {
  id: number
  name: string
  name_km?: string | null
  slug: string
  sku?: string
  barcode?: string | null
  type?: ProductType
  status?: ProductStatus
  description?: string | null
  short_description?: string | null
  cost_price?: number
  selling_price: number
  price?: number
  compare_price?: number | null
  stock_quantity?: number
  min_stock_alert?: number
  is_featured?: boolean
  is_active?: boolean
  primary_image?: string | null
  images?: ProductImage[] | string[]
  category_id?: number | null
  category?: Category | null
  brand_id?: number | null
  brand?: Brand | null
  unit_id?: number | null
  unit?: Unit | null
  tax_id?: number | null
  tax?: Tax | null
  variants?: ProductVariant[]
  created_at?: string
  updated_at?: string
}

export interface ProductPayload {
  name: string
  name_km?: string
  slug?: string
  sku?: string
  barcode?: string
  category_id?: number | null
  brand_id?: number | null
  unit_id?: number | null
  tax_id?: number | null
  cost_price?: number
  selling_price: number
  compare_price?: number | null
  stock_quantity?: number
  min_stock_alert?: number
  description?: string
  short_description?: string
  is_featured?: boolean
  is_active?: boolean
  primary_image?: string | File | null
  images?: (string | File)[]
  variants?: Partial<ProductVariant>[]
}
