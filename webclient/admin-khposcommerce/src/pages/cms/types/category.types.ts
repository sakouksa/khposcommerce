export interface BlogCategory {
  id: number
  name: string
  slug: string
  description?: string
  posts_count?: number
  is_active: boolean
}
