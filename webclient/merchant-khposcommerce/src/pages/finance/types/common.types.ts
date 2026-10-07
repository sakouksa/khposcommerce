export type TabType =
  | 'expenses'
  | 'categories'
  | 'registers'
  | 'transactions'
  | 'payment_methods'
  | 'currencies'
  | 'taxes'

export interface FinancePaginationParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
}
