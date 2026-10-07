// ─── API Envelope & Response Types ──────────────────────────────────────

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]> | string | null
}

export interface ApiPaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from?: number | null
  to?: number | null
}

export interface PaginatedData<T> {
  items: T[]
  meta: ApiPaginationMeta
}

export interface ApiPaginatedResponse<T> {
  success: boolean
  message: string
  data: PaginatedData<T>
}

export interface QueryFilterParams {
  page?: number
  per_page?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  is_active?: boolean | number
  branch_id?: number
  company_id?: number
  created_from?: string
  created_to?: string
  [key: string]: any
}
