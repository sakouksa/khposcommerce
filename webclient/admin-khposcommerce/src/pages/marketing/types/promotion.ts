export type ChannelScope = 'all' | 'pos_only' | 'storefront_only'

export type PromotionDiscountType =
  | 'percentage'
  | 'fixed_amount'
  | 'bogo'
  | 'bundle'
  | 'tier_quantity'
  | 'free_gift'
  | 'free_shipping'

export interface TieredPriceBreak {
  min_qty: number
  max_qty?: number
  unit_price: number
}

export interface PromotionConditions {
  min_spend_usd?: number
  min_spend_khr?: number
  min_quantity?: number
  applicable_category_ids?: number[]
  applicable_product_ids?: number[]
  buy_product_id?: number
  buy_quantity?: number
  get_product_id?: number
  get_quantity?: number
  tiered_pricing?: TieredPriceBreak[]
  payment_methods?: string[] // 'all' | 'khqr_bakong' | 'aba_pay' | 'wing' | 'acleda' | 'cash'
  customer_groups?: string[] // 'all' | 'retail' | 'wholesale' | 'vip_silver' | 'vip_gold' | 'vip_platinum' | 'first_time'
  branch_ids?: number[] | 'all'
  happy_hour?: {
    enabled: boolean
    start_time: string
    end_time: string
    days_of_week: number[] // 0-6 (Sun-Sat)
  }
}

export interface PromotionRewards {
  discount_type?: PromotionDiscountType
  discount_value: number
  max_discount_cap?: number
  currency?: 'USD' | 'KHR'
  free_gift_name?: string
  free_gift_product_id?: number
  bundle_price?: number
}

export interface Promotion {
  id: number
  name: string
  description?: string
  type: string
  channel_scope?: ChannelScope
  branch_ids?: number[] | 'all'
  conditions: PromotionConditions | any
  rewards: PromotionRewards | any
  starts_at: string
  ends_at: string
  priority: number
  is_active: boolean
  code?: string
  category?: string
  brand?: string
  product?: string
  customer_group?: string
  view_count?: number
  click_count?: number
  customer_reach?: number
  orders_count?: number
  revenue_generated?: number
  discount_amount?: number
  marketing_cost?: number
  total_budget_cap?: number
  total_budget_spent?: number
  max_redemptions?: number
  total_redemptions?: number
  per_customer_limit?: number
  is_stackable?: boolean
  status?: 'running' | 'scheduled' | 'expired' | 'paused' | 'draft'
  created_at?: string
}

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
  conditions: PromotionConditions
  rewards: PromotionRewards
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
    promo: Promotion
    discountAmount: number
    reason: string
  }>
  estimatedProfitMargin: number
  isMarginSafe: boolean
}

export { formatJsonValue, formatDateTimeLocal } from '@/utils/formatters'
