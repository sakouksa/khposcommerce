// ─── Category Types ─────────────────────────────────────────────────────

export interface Category {
  id: number
  name: string
  name_km?: string | null
  slug: string
  code?: string | null
  description?: string | null
  image?: string | null
  icon?: string | null
  parent_id?: number | null
  is_active?: boolean
  sort_order?: number
  products_count?: number
  children?: Category[]
  created_at?: string
  updated_at?: string
}

export interface CategoryPayload {
  name: string
  name_km?: string
  slug?: string
  code?: string
  description?: string
  image?: string
  icon?: string
  parent_id?: number | null
  is_active?: boolean
  sort_order?: number
}
