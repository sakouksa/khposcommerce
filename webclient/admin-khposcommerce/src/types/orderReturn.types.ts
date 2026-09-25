export interface ReturnPolicy {
  id: number
  company_id: number
  category_id?: number | null
  category?: { id: number; name: string }
  name: string
  return_window_days: number
  is_returnable: boolean
  allow_exchange: boolean
  restocking_fee_percentage: number
  restocking_fee_flat: number
  customer_fault_shipping_fee: number
  store_fault_shipping_fee: number
  requires_original_packaging: boolean
  requires_receipt: boolean
  conditions_accepted?: string[]
  is_default: boolean
  created_at?: string
  updated_at?: string
}

export type ReturnStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'received'
  | 'inspecting'
  | 'inspected'
  | 'completed'
  | 'cancelled'
  | 'expired'

export type ReturnFault = 'customer' | 'store' | 'courier'
export type ReturnType = 'return' | 'exchange'
export type RefundMethod = 'original_payment' | 'store_credit' | 'cash' | 'bakong_khqr' | 'bank_transfer'
export type ConditionGrade = 'resellable_new' | 'open_box' | 'refurbished' | 'damaged_repairable' | 'scrap'
export type InventoryAction = 'restock_available' | 'move_to_refurbished' | 'move_to_damaged_quarantine' | 'scrap_write_off' | 'return_to_customer'

export interface OrderReturnItemProduct {
  id: number
  name: string
  sku?: string
  image?: string
  primary_image?: any
  primaryImage?: any
  images?: any[]
  category?: {
    id: number
    name: string
    [key: string]: any
  }
  [key: string]: any
}

export interface OrderReturnItem {
  id: number
  order_return_id: number
  order_item_id?: number | null
  sale_item_id?: number | null
  product_id: number
  product_variant_id?: number | null
  product_name?: string
  product_image?: string
  product?: OrderReturnItemProduct
  variant?: {
    id: number
    name?: string
    sku?: string
  }
  quantity_requested: number
  quantity_received: number
  unit_price: number
  allocated_discount: number
  allocated_tax: number
  net_unit_refund: number
  total_refund: number
  sold_serial_number?: string | null
  returned_serial_number?: string | null
  condition_grade?: ConditionGrade | null
  inspection_status: 'pending' | 'passed' | 'failed' | 'partial'
  notes?: string | null
}

export interface ReturnShipment {
  id: number
  order_return_id: number
  carrier?: string | null
  tracking_number?: string | null
  pickup_type: string
  shipping_fee: number
  paid_by: 'customer' | 'store' | 'split'
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'failed'
  shipped_at?: string | null
  delivered_at?: string | null
  notes?: string | null
}

export interface ReturnInspectionItem {
  id: number
  return_inspection_id: number
  order_return_item_id: number
  orderReturnItem?: OrderReturnItem
  serial_matched: boolean
  accessories_checklist?: Record<string, boolean>
  condition_grade: ConditionGrade
  deduction_amount: number
  inventory_action: InventoryAction
  inspector_notes?: string | null
  photos?: string[]
}

export interface ReturnInspection {
  id: number
  order_return_id: number
  warehouse_id: number
  warehouse?: { id: number; name: string }
  inspector_id: number
  inspector?: { id: number; name: string }
  inspection_number: string
  status: string
  verdict: 'pass' | 'partial_pass' | 'reject' | 'fraud_suspected'
  summary_notes?: string | null
  images?: string[]
  inspected_at?: string | null
  items?: ReturnInspectionItem[]
}

export interface ExchangeOrder {
  id: number
  order_return_id: number
  replacement_order_id?: number | null
  replacementOrder?: any
  old_items_credit: number
  new_items_cost: number
  price_difference: number
  exchange_fee: number
  shipping_difference: number
  customer_balance_due: number
  store_refund_due: number
  payment_status: string
  notes?: string | null
}

export interface OrderReturn {
  id: number
  company_id: number
  order_id?: number | null
  order?: {
    id: number
    order_number: string
    grand_total: number
    payment_status: string
    status: string
    customer?: {
      id: number
      name: string
      phone?: string
      email?: string
    }
  }
  sale_id?: number | null
  sale?: any
  customer_id?: number | null
  customer?: {
    id: number
    name: string
    phone?: string
    email?: string
    wallet_balance?: number
  }
  warehouse_id?: number | null
  warehouse?: {
    id: number
    name: string
  }
  return_number: string
  type: ReturnType
  channel: 'web' | 'pos' | 'mobile' | 'admin'
  fault: ReturnFault
  reason_code: string
  reason_notes?: string | null
  status: ReturnStatus
  currency_code: string
  exchange_rate: number
  subtotal_amount: number
  allocated_discount_amount: number
  tax_amount: number
  restocking_fee: number
  return_shipping_fee: number
  total_refund_amount: number
  refund_status: 'pending' | 'processing' | 'refunded' | 'offset_exchange' | 'store_credit'
  refund_method: RefundMethod
  refund_account_info?: Record<string, any> | null
  expires_at?: string | null
  approved_by?: number | null
  approvedBy?: { id: number; name: string }
  approved_at?: string | null
  completed_at?: string | null
  admin_notes?: string | null
  created_at: string
  updated_at: string
  items?: OrderReturnItem[]
  shipments?: ReturnShipment[]
  latestShipment?: ReturnShipment | null
  inspections?: ReturnInspection[]
  latestInspection?: ReturnInspection | null
  exchangeOrder?: ExchangeOrder | null
}

export interface OrderReturnFilters {
  page?: number
  per_page?: number
  search?: string
  status?: string
  type?: string
  fault?: string
  company_id?: number
}

export const ORDER_RETURN_MODULE = 'order-returns'
