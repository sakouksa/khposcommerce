import api from '@/api'
import type { Category } from '@/types/store'

export const categoryService = {
  /**
   * Fetch all active categories with product counts
   */
  async getCategories(): Promise<Category[]> {
    const res = await api.get('/categories')
    return res.data?.data || []
  },

  /**
   * Fetch single category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const res = await api.get(`/categories/${slug}`)
    return res.data?.data || null
  },
}

export default categoryService
