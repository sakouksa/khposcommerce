export const POS_MODULE_NAME = 'Enterprise POS'

export interface Category {
  id: number
  name: string
  slug?: string
}

export interface Brand {
  id: number
  name: string
  logo?: string
}

export interface ProductVariant {
  id: number
  name?: string
  sku: string
  barcode?: string
  selling_price: number
  cost_price?: number
  stock?: number
  attributes?: { name: string; value: string }[]
}

export interface ProductImage {
  id: number
  url: string
  thumb_url?: string
  is_primary: boolean
}

export interface Product {
  id: number
  name: string
  sku: string
  barcode?: string
  cost_price?: number
  selling_price: number
  compare_price?: number
  discount_percent?: number
  category_id?: number
  category?: Category
  brand_id?: number
  brand?: Brand
  tax_id?: number
  tax?: { id: number; name: string; rate: number; type: 'percentage' | 'fixed' } | null
  primary_image?: string | { url: string } | null
  images?: ProductImage[]
  stock?: number
  low_stock_threshold?: number
  status?: string
  is_featured?: boolean
  has_variants?: boolean
  variants?: ProductVariant[]
  description?: string
  rating_avg?: number
}

export interface CartItem {
  product: Product
  selectedVariant?: ProductVariant
  imei?: string
  quantity: number
  unit_price: number
  cost_price?: number
  tax_rate?: number
  discount_amount: number
  tax_amount: number
  total: number
}

export interface Customer {
  id: number | null
  name: string
  phone?: string
  email?: string
  group?: string
  loyalty_points?: number
  address?: string
  credit_limit?: number
  outstanding_balance?: number
}

export interface HeldCart {
  id: string
  name: string
  timestamp: string
  items: CartItem[]
  customer: Customer | null
}

export interface CardPaymentDetails {
  card_type: string
  approval_code: string
  bank_name: string
  card_last4?: string
  terminal_id?: string
}

export interface TransferPaymentDetails {
  bank_name: string
  account_number: string
  account_name: string
  txn_reference: string
}

export interface ReceiptData {
  order_number: string
  invoice_barcode?: string
  date: string
  customer: Customer
  cashier_name: string
  store_name: string
  branch_name: string
  warehouse_name: string
  items: CartItem[]
  subtotal: number
  discount_amount: number
  tax_amount: number
  grand_total: number
  cash_tendered: number
  change_due: number
  payment_method: string
  payment_reference?: string
  payment_details?: CardPaymentDetails | TransferPaymentDetails | any
}

