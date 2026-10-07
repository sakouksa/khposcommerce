export type TabType = 'companies' | 'branches' | 'stores' | 'warehouses' | 'structures'

export interface Company {
  id: number
  name: string
  code?: string
  legal_name?: string
  tax_id?: string
  registration_number?: string
  email?: string
  phone?: string
  website?: string
  logo?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  country?: string
  currency?: string
  timezone?: string
  status?: string
  is_active?: boolean
  branches_count?: number
  stores_count?: number
  warehouses_count?: number
  employees_count?: number
  created_at?: string
  updated_at?: string
}

export interface CompanyStats {
  total_companies?: number
  active_companies?: number
  total_branches?: number
  active_branches?: number
  total_stores?: number
  active_stores?: number
  total_warehouses?: number
  active_warehouses?: number
  total_employees?: number
}
