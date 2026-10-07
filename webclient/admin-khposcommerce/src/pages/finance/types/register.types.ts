export interface RegisterForm {
  title: string
  status: string
  opening_balance: string
  closing_balance: string
  branch_id: string
  store_id: string
  notes: string
}

export interface CashRegisterItem {
  id: number
  title: string
  status: 'open' | 'closed' | string
  opening_balance: number | string
  closing_balance?: number | string
  cash_sales_total?: number | string
  difference?: number | string
  branch_id?: number | string
  store_id?: number | string
  notes?: string
  opened_at?: string
  closed_at?: string
  created_at?: string
  updated_at?: string
}
