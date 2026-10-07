export interface PaymentMethodForm {
  name: string
  code: string
  type: string
  fee_percent: string
  fee_fixed: string
  available_pos: boolean
  available_online: boolean
  is_active: boolean
}

export interface PaymentMethodItem {
  id: number
  name: string
  code: string
  type: string
  fee_percent: number | string
  fee_fixed: number | string
  available_pos: boolean
  available_online: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}
