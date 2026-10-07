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

export interface PolicyTemplate {
  key: string
  name_km: string
  name_en: string
  slug: string
  meta_title: string
  meta_description: string
  content: string
}
