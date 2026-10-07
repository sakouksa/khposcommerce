import api from '@/api'
import type { Brand } from '@/types/store'

export const brandService = {
  /**
   * Fetch all active official brands
   */
  async getBrands(): Promise<Brand[]> {
    const res = await api.get('/brands')
    return res.data?.data || []
  },

  /**
   * Fetch single brand by slug
   */
  async getBrandBySlug(slug: string): Promise<Brand | null> {
    const res = await api.get(`/brands/${slug}`)
    return res.data?.data || null
  },
}

export default brandService
