export type ChannelScope = 'all' | 'pos' | 'web' | 'mobile' | 'pos_only' | 'storefront_only'

export type PromotionRuleType =
  | 'product_discount'
  | 'category_discount'
  | 'brand_discount'
  | 'cart_discount'
  | 'buy_x_get_y'
  | 'bundle_discount'
  | 'free_shipping'
  | 'coupon_discount'

export type PromotionDiscountType =
  | 'percentage'
  | 'fixed_amount'
  | 'fixed_price'
  | 'free_item'
  | 'free_shipping'
  | 'bogo'
  | 'bundle'
  | 'tier_quantity'
  | 'free_gift'

export interface TieredPriceBreak {
  min_qty: number
  max_qty?: number
  unit_price: number
}

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'expired' | 'cancelled'

export interface PromotionRule {
  id?: number
  promotion_campaign_id?: number
  name: string
  rule_type: PromotionRuleType
  discount_type: PromotionDiscountType
  discount_value: number
  min_qty?: number | null
  max_qty?: number | null
  min_subtotal?: number | null
  max_subtotal?: number | null
  max_discount_amount?: number | null
  priority: number
  is_stackable: boolean
  is_active: boolean
  products?: Array<{ id: number; name: string; sku?: string; selling_price?: number; price?: number }>
  categories?: Array<{ id: number; name: string }>
  brands?: Array<{ id: number; name: string }>
  product_ids?: number[]
  category_ids?: number[]
  brand_ids?: number[]
}

export interface PromotionCoupon {
  id?: number
  promotion_campaign_id?: number
  code: string
  usage_limit?: number | null
  usage_per_customer?: number
  used_count?: number
  starts_at?: string | null
  expires_at?: string | null
  is_active?: boolean
}

export interface PromotionCampaign {
  id: number
  company_id?: number
  name: string
  code: string
  description?: string
  status: CampaignStatus
  start_at?: string | null
  end_at?: string | null
  priority: number
  is_stackable: boolean
  is_active: boolean
  usage_limit?: number | null
  usage_count?: number
  branches?: Array<{ id: number; name: string; code?: string }>
  channels?: Array<{ id?: number; channel: string }>
  customer_groups?: Array<{ id: number; name: string }>
  customerGroups?: Array<{ id: number; name: string }>
  customers?: Array<{ id: number; name: string; phone?: string }>
  rules: PromotionRule[]
  coupons?: PromotionCoupon[]
  usages_count?: number
  rules_count?: number
  performance?: {
    total_discount_given: number
    total_redemptions: number
    remaining_usage: number | null
  }
  created_at?: string
  updated_at?: string

  // Backward compatibility alias properties
  starts_at?: string
  ends_at?: string
  type?: string
  conditions?: any
  rewards?: any
  channel_scope?: string
  branch_ids?: any
}

export interface PricingEngineLineItem {
  product_id: number
  product_variant_id?: number | null
  product_name: string
  sku: string
  quantity: number
  unit_price: number
  cost_price?: number
  discount_amount: number
  discount_percent: number
  discount_type: string | null
  promotion_id: number | null
  promotion_rule_id: number | null
  final_unit_price: number
  subtotal: number
  tax_percent: number
  tax_amount: number
  total: number
}

export interface PricingEngineResult {
  success: boolean
  summary: {
    subtotal: number
    items_discount: number
    cart_discount: number
    coupon_discount: number
    total_discount: number
    tax_amount: number
    grand_total: number
    applied_promotions_cnt: number
  }
  items: PricingEngineLineItem[]
  applied_promotions: Array<{
    campaign_id: number
    campaign_name: string
    campaign_code: string
    rule_id: number | null
    rule_name: string
    rule_type: string
    product_id?: number
    discount_amount: number
  }>
  coupon_applied?: {
    id: number
    code: string
    discount_amount: number
  } | null
}

// Legacy Type alias
export type Promotion = PromotionCampaign

export interface PromotionAnalytics {
  totalPromotions: number
  runningPromotions: number
  scheduledPromotions: number
  expiredPromotions: number
  totalCustomerReach: number
  totalOrdersDriven: number
  avgConversionRate: number
  totalRevenueGenerated: number
  totalDiscountGranted: number
  campaignCost: number
  campaignProfit: number
  marketingROI: number
  avgOrderValue: number
  todayPromotions: number
  todayRevenue: number
  newCustomersAcquired: number
  repeatOrdersCount: number
  lowStockItemsInPromo: number
  endingSoonCount: number
}

export interface CampaignPreset {
  id: string
  nameKm: string
  nameEn: string
  badge: string
  category: string
  type: PromotionDiscountType
  channel_scope: ChannelScope
  descriptionKm: string
  descriptionEn: string
  conditions: any
  rewards: any
  priority: number
  is_stackable: boolean
  total_budget_cap: number
  max_redemptions: number
  per_customer_limit: number
}

export interface SimulatorCartItem {
  id: number
  name: string
  sku: string
  category_id: number
  unit_price: number
  quantity: number
}

export interface SimulationResult {
  originalSubtotal: number
  totalDiscount: number
  finalPayable: number
  appliedPromotions: Array<{
    promo: any
    discountAmount: number
    reason: string
  }>
  estimatedProfitMargin: number
  isMarginSafe: boolean
}

export { formatJsonValue, formatDateTimeLocal } from '@/utils/formatters'
