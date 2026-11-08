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

export * from './category.types'
export * from './tag.types'
