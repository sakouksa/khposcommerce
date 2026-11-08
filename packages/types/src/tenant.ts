// ─── Multi-Tenant, Company, Branch & Store Settings ────────────────────

export interface Tenant {
  id: string | number
  name: string
  subdomain?: string
  domain?: string
  plan?: 'free' | 'starter' | 'pro' | 'enterprise'
  is_active: boolean
  created_at?: string
}

export interface Company {
  id: number
  tenant_id?: string | number
  name: string
  legal_name?: string
  vat_tin?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  logo?: string | null
  currency: 'USD' | 'KHR'
  exchange_rate_khr: number
}

export interface Branch {
  id: number
  company_id: number
  name: string
  code: string
  phone?: string
  address?: string
  is_main?: boolean
  is_active: boolean
}

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
  currency?: 'USD' | 'KHR'
  exchange_rate_khr?: number
  free_shipping_min?: number
}
