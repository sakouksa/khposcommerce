export interface CurrencyForm {
  name: string
  code: string
  symbol: string
  exchange_rate: string
  is_active: boolean
  is_default: boolean
}

export interface CurrencyItem {
  id: number
  name: string
  code: string
  symbol: string
  exchange_rate: number | string
  is_active: boolean
  is_default: boolean
  created_at?: string
  updated_at?: string
}
