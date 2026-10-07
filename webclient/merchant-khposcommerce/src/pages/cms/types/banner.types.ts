export interface BannerItem {
  id: number
  title: string
  subtitle?: string | null
  badge?: string | null
  discount_tag?: string | null
  button_text?: string | null
  theme_gradient?: string | null
  image?: string
  image_url?: string
  link_url?: string
  link?: string
  position: 'hero' | 'sidebar' | 'popup' | 'footer' | string
  sort_order: number
  is_active: boolean
  starts_at?: string
  ends_at?: string
  created_at?: string
}
