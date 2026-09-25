export type PaymentTerm = 'prepaid' | 'net_15' | 'net_30' | 'net_60' | 'eom'

export type RFMSegment = 'champions' | 'loyal' | 'potential' | 'at_risk' | 'hibernating' | 'new'

export interface CustomerContact {
  id: number
  customer_id: number
  name: string
  email?: string
  phone?: string
  job_title?: string
  department?: string
  is_primary: boolean
  notes?: string
  created_at?: string
}

export interface CustomerKycDocument {
  id: number
  customer_id: number
  document_type: 'patent_tax' | 'vat_certificate' | 'business_license' | 'id_card' | 'contract_agreement' | 'other'
  title: string
  document_number?: string
  file_url: string
  file_size?: string
  issue_date?: string
  expiry_date?: string
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  verified_by?: string
  verified_at?: string
  notes?: string
  created_at?: string
}

export interface CustomerWalletTransaction {
  id: number
  customer_id: number
  type: 'top_up' | 'pos_payment' | 'refund_credit' | 'manual_adjustment'
  amount: number
  balance_after: number
  reference_no?: string
  payment_method?: string
  notes?: string
  created_by?: string
  created_at: string
}

export interface CustomerPointsLedgerEntry {
  id: number
  customer_id: number
  type: 'earned' | 'redeemed' | 'expired' | 'adjustment'
  points: number
  balance_after: number
  reference_no?: string
  expiry_date?: string
  notes?: string
  created_by?: string
  created_at: string
}

export interface CustomerInteraction {
  id: number
  customer_id: number
  type: 'phone_call' | 'meeting' | 'email' | 'telegram' | 'ticket_support' | 'site_visit' | 'note'
  subject: string
  description?: string
  outcome?: string
  interacted_at: string
  next_follow_up_at?: string
  created_by?: string
  created_at?: string
}

export interface CustomerPricingContract {
  id: number
  customer_id: number
  contract_number: string
  title: string
  start_date: string
  end_date?: string
  discount_type: 'percentage' | 'fixed_price' | 'tier_volume'
  discount_value: number
  status: 'draft' | 'active' | 'expired' | 'terminated'
  items?: any[]
  terms_and_conditions?: string
  created_at?: string
}

export interface CustomerSupportTicket {
  id: number
  customer_id: number
  ticket_number: string
  subject: string
  type: 'inquiry' | 'complaint' | 'rma_return' | 'warranty_claim' | 'billing_issue'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  description?: string
  resolution?: string
  assigned_to?: string
  created_at: string
  updated_at?: string
}

export interface CustomerAddress {
  id: number
  customer_id: number
  customer?: { id?: number; name: string; email?: string; phone?: string; photo?: string; avatar?: string }
  label: string
  name: string
  phone: string
  address: string
  city: string
  province: string
  country?: string
  postal_code?: string
  latitude?: number
  longitude?: number
  is_default: boolean
  created_at?: string
}

export interface Customer {
  id: number
  company_id: number
  company?: { name: string }
  customer_group_id?: number
  group?: { name: string; discount_percent: number }
  user_id?: number
  user?: { name: string; email: string }
  name: string
  email?: string
  phone?: string
  gender?: 'male' | 'female' | 'other'
  birth_date?: string
  photo?: string
  avatar?: string
  address?: string
  orders?: any[]
  total_spent: number
  order_count: number
  loyalty_points: number
  payment_terms?: PaymentTerm
  credit_limit?: number
  outstanding_balance?: number
  is_credit_hold?: boolean
  wallet_balance?: number
  tax_number?: string
  tax_branch_code?: string
  rfm_segment?: RFMSegment
  churn_risk_score?: number
  tags?: string[]
  notes?: string
  is_active: boolean
  addresses?: CustomerAddress[]
  sales?: any[]
  contacts?: CustomerContact[]
  kyc_documents?: CustomerKycDocument[]
  kycDocuments?: CustomerKycDocument[]
  wallet_transactions?: CustomerWalletTransaction[]
  walletTransactions?: CustomerWalletTransaction[]
  points_ledger?: CustomerPointsLedgerEntry[]
  pointsLedger?: CustomerPointsLedgerEntry[]
  interactions?: CustomerInteraction[]
  pricing_contracts?: CustomerPricingContract[]
  pricingContracts?: CustomerPricingContract[]
  support_tickets?: CustomerSupportTicket[]
  supportTickets?: CustomerSupportTicket[]
  created_at: string
  updated_at: string
}

export interface CustomerFormData {
  company_id: string
  customer_group_id: string
  user_id: string
  name: string
  email: string
  phone: string
  gender: string
  birth_date: string
  payment_terms: PaymentTerm
  credit_limit: string
  is_credit_hold: boolean
  wallet_balance: string
  tax_number: string
  tax_branch_code: string
  rfm_segment: string
  tags: string
  notes: string
  is_active: boolean
}

export interface CustomerAnalytics {
  total_customers: number
  active_customers: number
  inactive_customers: number
  vip_customers: number
  new_customers_this_month: number
  total_spent: number
  total_points: number
  total_orders: number
  avg_spent: number
  total_groups: number
  total_addresses: number
  total_credit_limit?: number
  total_outstanding_balance?: number
  credit_hold_count?: number
  total_wallet_balance?: number
  avg_churn_risk?: number
  rfm_breakdown?: {
    champions: number
    loyal: number
    potential: number
    at_risk: number
    hibernating: number
    new: number
  }
  today_customers?: number
  today_orders?: number
  today_revenue?: number
  pending_payments?: number
  credit_customers?: number
}
