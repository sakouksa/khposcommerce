import api from '@/api'
import type { StoreSettings } from '@/types/store'

export const storeSettingsService = {
  /**
   * Fetch complete storefront configuration and company branding
   */
  async getSettings(): Promise<StoreSettings> {
    const res = await api.get('/settings')
    return res.data?.data || {}
  },
}

export default storeSettingsService
