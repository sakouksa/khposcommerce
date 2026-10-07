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
