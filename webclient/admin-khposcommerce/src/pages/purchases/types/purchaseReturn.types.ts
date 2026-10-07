export interface PurchaseReturnItem {
  id: number
  purchase_return_id: number
  purchase_item_id: number
  product_id: number
  product_variant_id?: number
  batch_number?: string | null
  serial_number?: string | null
  quantity: number
  unit_cost: number
  total: number
  total_amount?: number
  unit_cost_base?: number
  total_base?: number
  notes?: string
  variant?: { id?: number; name: string; sku?: string } | null
  product?: { id?: number; name?: string; sku?: string } | null
  product_name?: string | null
  sku?: string | null
}

export interface PurchaseReturn {
  id: number
  reference_number: string
  rma_number?: string | null
  purchase_id: number
  supplier_id?: number
  supplier?: { name: string; email?: string; phone?: string; address?: string }
  user?: { id?: number; name: string }
  warehouse?: { id?: number; name: string }
  date: string
  total_amount: number
  currency_code?: string
  exchange_rate?: number
  total_amount_base?: number
  reason?: string
  status: 'draft' | 'approved' | 'shipped' | 'completed' | 'cancelled' | string
  shipping_carrier?: string | null
  tracking_number?: string | null
  refund_status?: 'pending' | 'offset' | 'credited' | 'refunded' | 'cancelled' | string
  refund_method?: 'offset_invoice' | 'credit_note' | 'bank_transfer' | 'cash' | 'replacement' | string | null
  refund_amount?: number
  refund_date?: string | null
  attachment_url?: string | null
  settlement_notes?: string | null
  created_at: string
  items: PurchaseReturnItem[]
  purchase?: {
    id?: number
    reference_number: string
    status?: string
    payment_status?: string
    grand_total?: number
    total_amount?: number
    paid_amount?: number
    due_amount?: number
    warehouse_id?: number
    warehouse?: { id?: number; name: string }
  }
}

export const RETURN_STATUS_BADGE: Record<string, string> = {
  draft:     'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20',
  approved:  'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20',
  shipped:   'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20',
  completed: 'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  cancelled: 'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
}

export const REFUND_STATUS_BADGE: Record<string, string> = {
  pending:   'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
  offset:    'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20',
  credited:  'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20',
  refunded:  'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  cancelled: 'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
}
