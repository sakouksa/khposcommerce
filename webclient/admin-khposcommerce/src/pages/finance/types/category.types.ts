export interface CategoryForm {
  name: string
  code: string
  description?: string
  is_active: boolean
}

export interface ExpenseCategoryItem {
  id: number
  name: string
  code: string
  description?: string
  is_active: boolean
  expenses_count?: number
  created_at?: string
  updated_at?: string
}
