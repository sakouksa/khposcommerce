export interface TaxForm {
  name: string
  rate: string
  type: string
  is_active: boolean
}

export interface TaxRuleItem {
  id: number
  name: string
  rate: number | string
  type: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}
