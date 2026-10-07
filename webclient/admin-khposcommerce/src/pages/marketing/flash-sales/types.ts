export type ChannelScope = 'all' | 'pos_only' | 'storefront_only' | 'app_only'

export interface FlashSaleProductItem {
  id?: number
  product_id: number
  product_name?: string
  product_sku?: string
  product_image?: string
  product_category?: string
  product_brand?: string
  original_price: number
  flash_price: number
  flash_price_khr?: number
  discount_percent: number
  quota: number
  sold_count: number
  per_customer_limit?: number
  product_variant_id?: number | null
  variant_name?: string
}

export interface FlashSaleConditions {
  channel_scope?: ChannelScope
  branch_ids?: number[] | 'all'
  payment_methods?: string[] // 'all' | 'khqr_bakong' | 'aba_pay' | 'wing' | 'acleda' | 'cash'
  customer_groups?: string[]
  per_customer_limit?: number
  auto_stock_rollback?: boolean
  pos_quick_code?: string
  priority?: number
}

export interface FlashSale {
  id: number
  name: string
  description?: string
  banner_url?: string
  starts_at: string
  ends_at: string
  is_active: boolean
  channel_scope?: ChannelScope
  branch_ids?: number[] | 'all'
  time_slot_name?: string
  products_count?: number
  products?: FlashSaleProductItem[]
  items?: FlashSaleProductItem[]
  
  // Analytics fields
  category?: string
  brand?: string
  product?: string
  orders_count?: number
  units_sold?: number
  revenue_generated?: number
  discount_amount?: number
  marketing_cost?: number
  visitors_count?: number
  status?: 'active' | 'scheduled' | 'expired' | 'paused' | 'sold_out'
  created_at?: string
}

export interface FlashSaleAnalytics {
  totalSales: number
  activeSales: number
  scheduledSales: number
  expiredSales: number
  pausedSales: number
  
  totalOrders: number
  totalProductsSold: number
  conversionRate: number
  aov: number
  
  totalRevenue: number
  totalDiscountAmount: number
  netRevenue: number
  profitGenerated: number
  
  totalProductsIncluded: number
  stockRemaining: number
  lowStockAlerts: number
  
  todaysSales: number
  salesTodayCount: number
  revenueTodayVal: number
  visitorsTodayCount: number
  endingSoonCount: number
  topSellingProductName: string
}

export interface FlashSalePreset {
  id: string
  nameKm: string
  nameEn: string
  badge: string
  category: string
  time_slot_name: string
  default_duration_hours: number
  channel_scope: ChannelScope
  discount_percent: number
  descriptionKm: string
  descriptionEn: string
  quota_per_product: number
  per_customer_limit: number
}

export interface TimeSlotSession {
  id: string
  labelKm: string
  labelEn: string
  timeRange: string
  startHour: number
  endHour: number
  iconName: string
  badge: string
}

export interface SimulatorFlashProduct {
  id: number
  name: string
  sku: string
  barcode?: string
  image?: string
  category?: string
  regular_price: number
  stock: number
  flash_price?: number
  flash_sale_name?: string
  discount_percent?: number
  quota_total?: number
  quota_sold?: number
  per_customer_limit?: number
  is_in_flash_sale: boolean
  flash_status?: 'active' | 'scheduled' | 'expired' | 'sold_out'
}

export interface FlashSimulationResult {
  product: SimulatorFlashProduct
  isFlashActive: boolean
  regularPrice: number
  flashPrice: number
  discountAmount: number
  discountPercent: number
  priceKhr: number
  regularPriceKhr: number
  savingsKhr: number
  quotaRemaining: number
  isQuotaAvailable: boolean
  customerLimit: number
  channelEligible: boolean
  reason: string
}

export { formatJsonValue, formatDateTimeLocal } from '@/utils/formatters'
