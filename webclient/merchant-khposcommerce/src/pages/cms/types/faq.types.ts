export interface FaqItem {
  id: number
  question: string
  answer: string
  category?: string
  sort_order?: number
  is_active: boolean
  created_at?: string
}
