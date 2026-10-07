export interface TransactionForm {
  type: string
  amount: string
  description: string
  reference_type: string
  reference_id: string
  payment_method_id: string
}

export interface FinancialTransactionItem {
  id: number
  type: 'income' | 'expense' | 'transfer' | string
  amount: number
  description?: string
  reference_type?: string
  reference_id?: string | number
  payment_method_id?: number
  payment_method_name?: string
  created_at?: string
  updated_at?: string
}
