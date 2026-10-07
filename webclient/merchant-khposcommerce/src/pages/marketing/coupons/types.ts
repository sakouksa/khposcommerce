export type CouponChannelScope = 'all' | 'pos_only' | 'storefront_only'

export interface Coupon {
  id: number
  name: string
  code: string
  type: 'fixed' | 'percentage' | 'free_shipping'
  value: number
  currency?: 'USD' | 'KHR'
  max_discount_cap?: number
  minimum_amount?: number
  minimum_amount_khr?: number
  usage_limit?: number
  used_count?: number
  per_customer_limit?: number
  expires_at?: string
  starts_at?: string
  is_active: boolean
  channel_scope?: CouponChannelScope
  branch_ids?: number[] | 'all'
  payment_methods?: string[] // 'all' | 'khqr_bakong' | 'aba_pay' | 'wing' | 'cash'
  customer_target_type?: 'all' | 'new_customer_only' | 'vip_tiers' | 'specific_customer'
  customer_phone?: string
  customer_tiers?: string[]
  is_single_use?: boolean
  barcode?: string
  batch_id?: string
  batch_count?: number
  status?: 'active' | 'expired' | 'scheduled' | 'paused' | 'inactive'
  created_at?: string
  campaign?: string
  customer_group?: string
  revenue_generated?: number
  marketing_cost?: number
}

export interface CouponAnalytics {
  totalCoupons: number
  activeCoupons: number
  expiredCoupons: number
  scheduledCoupons: number
  totalRedemptions: number
  totalUsageLimit: number
  redemptionRate: number
  totalDiscountGiven: number
  totalRevenueGenerated: number
  marketingROI: number
  avgOrderValue: number
}

export interface BulkVoucherGenParams {
  name: string
  prefix: string
  count: number
  length: number
  type: 'fixed' | 'percentage' | 'free_shipping'
  value: number
  currency: 'USD' | 'KHR'
  max_discount_cap?: number
  minimum_amount: number
  channel_scope: CouponChannelScope
  branch_ids: number[] | 'all'
  expires_at: string
}

export interface VoucherPreset {
  id: string
  nameKm: string
  nameEn: string
  badge: string
  codePrefix: string
  type: 'fixed' | 'percentage' | 'free_shipping'
  value: number
  currency: 'USD' | 'KHR'
  max_discount_cap?: number
  minimum_amount: number
  minimum_amount_khr?: number
  channel_scope: CouponChannelScope
  payment_methods?: string[]
  customer_target_type?: 'all' | 'new_customer_only' | 'vip_tiers'
  usage_limit: number
  per_customer_limit: number
  descriptionKm: string
  descriptionEn: string
}

export interface VoucherVerificationResult {
  code: string
  isValid: boolean
  status: 'valid' | 'invalid_code' | 'expired' | 'min_spend_unmet' | 'limit_reached' | 'channel_mismatch' | 'payment_mismatch'
  coupon?: Coupon
  discountAmount: number
  finalPayable: number
  reason: string
}
