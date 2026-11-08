// ─── Point of Sale (POS) Specific Types ────────────────────────────────

import { PaymentMethod } from './order'

export interface PosShift {
  id: number
  branch_id: number
  user_id: number
  opening_cash: number
  closing_cash?: number | null
  expected_cash?: number | null
  difference?: number | null
  total_sales?: number
  cash_sales?: number
  khqr_sales?: number
  status: 'open' | 'closed'
  opened_at: string
  closed_at?: string | null
  notes?: string | null
}

export interface SplitPaymentLine {
  method: PaymentMethod
  amount: number
  reference_no?: string
}

export interface PosCheckoutPayload {
  branch_id: number
  customer_id?: number | null
  items: {
    product_id: number
    product_variant_id?: number | null
    quantity: number
    unit_price: number
    discount_amount?: number
  }[]
  payments: SplitPaymentLine[]
  subtotal: number
  discount_amount?: number
  tax_amount?: number
  total_amount: number
  received_amount: number
  change_amount?: number
  notes?: string
}

export interface BakongKhqrPayload {
  qr_string: string
  md5: string
  amount: number
  currency: 'USD' | 'KHR'
  transaction_id: string
}
