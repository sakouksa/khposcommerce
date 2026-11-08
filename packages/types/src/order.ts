// ─── Order & E-Commerce Cart Types ─────────────────────────────────────

import { Product, ProductVariant } from './product'
import { Customer, CustomerAddress } from './customer'

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'failed' | 'refunded'
export type PaymentMethod = 'cash' | 'bakong_khqr' | 'aba_payway' | 'credit_card' | 'bank_transfer' | 'cod'

export interface OrderItem {
  id: number
  order_id?: number
  product_id: number
  product?: Product
  product_variant_id?: number | null
  variant?: ProductVariant | null
  product_name: string
  sku?: string
  price: number
  cost_price?: number
  quantity: number
  discount_amount?: number
  tax_amount?: number
  total_amount: number
}

export interface Order {
  id: number
  order_number: string
  invoice_number?: string | null
  customer_id?: number | null
  customer?: Customer | null
  branch_id?: number | null
  user_id?: number | null
  subtotal: number
  discount_amount: number
  discount_type?: 'fixed' | 'percentage'
  tax_amount: number
  shipping_fee: number
  total_amount: number
  paid_amount: number
  change_amount?: number
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method?: PaymentMethod
  shipping_address?: CustomerAddress | null
  notes?: string | null
  items: OrderItem[]
  channel?: 'pos' | 'storefront' | 'mobile' | 'manual'
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string | number
  product_id: number
  variant_id?: number | null
  product: Product
  variant?: ProductVariant | null
  quantity: number
  unit_price: number
  total_price: number
}
