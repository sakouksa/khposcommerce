export interface ExpenseForm {
  title: string
  expense_category_id: string
  amount: string
  date: string
  description: string
  branch_id: string
  reference_number: string
  receipt: string
  status: string
  payment_method?: string
  payee?: string
}

export interface ExpenseItem {
  id: number
  title: string
  expense_category_id: number
  category_name?: string
  amount: number
  date: string
  description?: string
  branch_id?: number
  reference_number?: string
  receipt?: string
  status: string
  payment_method?: string
  payee?: string
  created_at?: string
  updated_at?: string
}
