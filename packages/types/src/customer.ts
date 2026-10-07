// ─── Customer & Address Types ──────────────────────────────────────────

export interface CustomerAddress {
  id: number
  customer_id?: number
  type?: 'shipping' | 'billing'
  label?: string
  recipient_name: string
  phone: string
  address_line: string
  province_id?: number | string
  province_name?: string
  district?: string
  commune?: string
  postal_code?: string
  is_default?: boolean
}

export interface Customer {
  id: number
  name: string
  phone?: string | null
  email?: string | null
  avatar?: string | null
  points?: number
  customer_group_id?: number | null
  addresses?: CustomerAddress[]
  total_spent?: number
  orders_count?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}
