export type BannerPlacement =
  | 'hero'
  | 'category'
  | 'popup'
  | 'announcement'
  | 'sidebar'
  | 'footer'
  | 'pos_cfd'
  | 'kiosk_idle'
  | 'app_splash'
  | 'app_home'

export type BannerChannelScope = 'all' | 'storefront' | 'pos_cfd' | 'mobile_app' | 'kiosk'

export type BannerTargetType =
  | 'product'
  | 'flash_sale'
  | 'coupon'
  | 'category'
  | 'brand'
  | 'custom_url'

export interface Banner {
  id: number
  title: string
  title_km?: string
  subtitle?: string | null
  subtitle_km?: string | null
  badge?: string | null
  discount_tag?: string | null
  button_text?: string | null
  button_text_km?: string | null
  theme_gradient?: string | null
  image?: string
  image_url?: string
  mobile_image?: string | null
  link?: string | null
  link_url?: string | null
  position: BannerPlacement | string
  channel_scope?: BannerChannelScope
  branch_ids?: number[] | 'all'
  target_type?: BannerTargetType
  target_id?: string | number
  sort_order: number
  is_active: boolean
  starts_at?: string | null
  ends_at?: string | null

  // Performance Analytics
  views_count?: number
  clicks_count?: number
  ctr_percent?: number
  revenue_attributed?: number
  conversions_count?: number
  status?: 'active' | 'scheduled' | 'expired' | 'paused'
  created_at?: string
}

export interface BannerAnalytics {
  totalBanners: number
  activeBanners: number
  scheduledBanners: number
  expiredBanners: number
  
  totalImpressions: number
  totalClicks: number
  avgCtrPercent: number
  totalRevenueAttributed: number
  
  heroBannersCount: number
  posCfdBannersCount: number
  appBannersCount: number
  
  viewsToday: number
  clicksToday: number
  endingSoonCount: number
  topPerformingBannerTitle: string
}

export interface BannerPreset {
  id: string
  nameKm: string
  nameEn: string
  badge: string
  category: string
  placement: BannerPlacement
  channel_scope: BannerChannelScope
  descriptionKm: string
  descriptionEn: string
  titleKm: string
  titleEn: string
  subtitleKm: string
  subtitleEn: string
  buttonTextKm: string
  buttonTextEn: string
  discount_tag?: string
  theme_gradient: string
  defaultImage: string
  target_type: BannerTargetType
}

export interface DevicePreviewConfig {
  deviceType: 'desktop' | 'mobile' | 'pos_cfd'
  aspectRatio: string
  resolutionLabel: string
}

export { formatJsonValue, formatDateTimeLocal } from '@/utils/formatters'
