// ─── Brand Types ────────────────────────────────────────────────────────

export interface Brand {
  id: number
  name: string
  slug: string
  code?: string | null
  description?: string | null
  logo?: string | null
  website?: string | null
  is_active?: boolean
  products_count?: number
  created_at?: string
  updated_at?: string
}

export interface BrandPayload {
  name: string
  slug?: string
  code?: string
  description?: string
  logo?: string
  website?: string
  is_active?: boolean
}
