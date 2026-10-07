export type Tab =
  | 'blogs'
  | 'blog-categories'
  | 'blog-tags'
  | 'banners'
  | 'pages'
  | 'faqs'
  | 'announcements'
  | 'testimonials'
  | 'media'

export interface BlogPost {
  id: number
  title: string
  slug: string
  content?: string
  excerpt?: string
  status: 'published' | 'draft' | 'archived' | 'pending' | 'scheduled'
  featured_image?: string
  category_id?: number
  category_name?: string
  author_name?: string
  views_count?: number
  created_at?: string
  published_at?: string
  meta_title?: string
  meta_description?: string
}

export interface BlogCategory {
  id: number
  name: string
  slug: string
  description?: string
  posts_count?: number
  is_active: boolean
}

export interface BlogTag {
  id: number
  name: string
  slug: string
  posts_count?: number
}

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

export interface CmsPage {
  id: number
  title: string
  slug: string
  content?: string
  status: 'published' | 'draft'
  views_count?: number
  created_at?: string
  meta_title?: string
  meta_description?: string
  page_type?: 'general' | 'policy' | 'landing'
}

export interface FaqItem {
  id: number
  question: string
  answer: string
  category?: string
  sort_order?: number
  is_active: boolean
  created_at?: string
}

export interface AnnouncementConfig {
  id?: number
  company_id?: number
  title?: string
  enabled?: boolean
  is_active?: boolean
  message?: string
  message_km?: string
  message_en?: string
  link?: string
  link_url?: string
  code?: string
  coupon_code?: string
  bg_gradient?: string
  badge_text?: string
  sort_order?: number
  starts_at?: string
  ends_at?: string
  created_at?: string
  updated_at?: string
}

export interface TestimonialItem {
  id: number
  author_name: string
  role?: string
  company?: string
  avatar?: string
  rating: number
  comment: string
  is_featured: boolean
  is_active: boolean
  created_at?: string
}

export interface MediaItem {
  id: number
  name: string
  file_name: string
  path: string
  url?: string
  mime_type?: string
  size?: number
  type?: 'image' | 'video' | 'document' | 'icon'
  created_at?: string
}

export interface PolicyTemplate {
  key: string
  name_km: string
  name_en: string
  slug: string
  meta_title: string
  meta_description: string
  content: string
}

export interface CMSAnalytics {
  totalContent: number
  publishedCount: number
  draftCount: number
  archivedCount: number
  publishedToday: number
  totalViews: number
  avgReadTimeMin: number
  seoHealthScore: number
}
