export interface SupplierContact {
  id?:                 number
  name:                string
  email?:              string
  phone?:              string
  position?:           string
  title?:              string
  is_primary?:         boolean
}

export interface SupplierRecentPurchase {
  id:                  number
  reference_number:    string
  date?:               string
  status:              string
  payment_status:      string
  grand_total:         number
  paid_amount:         number
  due_amount:          number
  branch_name?:        string
  warehouse_name?:     string
  items_count?:        number
}

export interface SuppliedProduct {
  id:                  number
  name:                string
  sku:                 string
  barcode?:            string
  last_cost:           number
  total_qty:           number
  category_name?:      string
  last_purchased?:     string
}

export interface SupplierPerformance {
  fulfillment_rate:    number
  on_time_rate:        number
  rating_score:        number
}

export interface Supplier {
  id:                  number
  company_id?:         number
  name:                string
  code:                string
  logo?:               string
  email?:              string
  phone?:              string
  fax?:                string
  website?:            string
  hotline?:            string
  support_email?:      string
  supplier_type?:      'manufacturer' | 'wholesaler' | 'distributor' | 'importer' | 'service' | string
  tier?:               'strategic' | 'preferred' | 'standard' | string
  address?:            string
  city?:               string
  province?:           string
  country?:            string
  postal_code?:        string
  tax_number?:         string
  credit_limit?:       number
  payment_terms?:      string
  payment_term_days?:  number
  lead_time_days?:     number
  currency_code?:      string
  currency?:           string
  bank_name?:          string
  bank_account_number?: string
  bank_account_name?:   string
  swift_code?:          string
  notes?:              string
  is_active:           boolean
  created_at?:         string
  updated_at?:         string
  contacts?:           SupplierContact[]
  purchases_count?:    number
  total_purchased?:    number
  total_purchases_sum?: number
  total_paid?:         number
  total_paid_sum?:     number
  total_due?:          number
  total_due_sum?:      number
  outstanding_balance?: number
  recent_purchases?:   SupplierRecentPurchase[]
  supplied_products?:  SuppliedProduct[]
  returns_count?:      number
  performance?:        SupplierPerformance
}

export interface SupplierFormData {
  name:                string
  code:                string
  logo?:               string
  email:               string
  phone:               string
  fax:                 string
  website:             string
  hotline:             string
  support_email:       string
  supplier_type:       string
  tier:                string
  address:             string
  city:                string
  province:            string
  country:             string
  postal_code:         string
  tax_number:          string
  credit_limit:        number
  payment_terms:       string
  payment_term_days:   number
  lead_time_days:      number
  currency_code:       string
  bank_name:           string
  bank_account_number: string
  bank_account_name:   string
  swift_code:          string
  notes:               string
  is_active:           boolean
}

export const BLANK_SUPPLIER_FORM: SupplierFormData = {
  name: '',
  code: '',
  logo: '',
  email: '',
  phone: '',
  fax: '',
  website: '',
  hotline: '',
  support_email: '',
  supplier_type: 'distributor',
  tier: 'standard',
  address: '',
  city: '',
  province: '',
  country: '',
  postal_code: '',
  tax_number: '',
  credit_limit: 0,
  payment_terms: 'Net 30',
  payment_term_days: 30,
  lead_time_days: 3,
  currency_code: 'USD',
  bank_name: '',
  bank_account_number: '',
  bank_account_name: '',
  swift_code: '',
  notes: '',
  is_active: true,
}
