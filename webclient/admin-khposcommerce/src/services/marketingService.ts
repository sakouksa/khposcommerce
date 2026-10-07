import api from '@/api/client'

export const marketingService = {
  // Banners
  getBanners: (params: Record<string, any> = {}) =>
    api.get('/banners', { params }).then(r => r.data),

  getBanner: (id: number) =>
    api.get(`/banners/${id}`).then(r => r.data.data || r.data),

  createBanner: (formData: FormData | Record<string, any>) =>
    api.post('/banners', formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }).then(r => r.data.data || r.data),

  updateBanner: (id: number, formData: FormData | Record<string, any>) =>
    api.post(`/banners/${id}`, formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }).then(r => r.data.data || r.data),

  deleteBanner: (id: number) =>
    api.delete(`/banners/${id}`).then(r => r.data),

  bulkDeleteBanners: (ids: number[]) =>
    api.post('/banners/bulk-delete', { ids }).then(r => r.data),

  // Promotions
  getPromotions: (params: Record<string, any> = {}) =>
    api.get('/promotions', { params }).then(r => r.data),

  getPromotion: (id: number) =>
    api.get(`/promotions/${id}`).then(r => r.data.data),

  createPromotion: (payload: any) =>
    api.post('/promotions', payload).then(r => r.data.data),

  updatePromotion: (id: number, payload: any) =>
    api.put(`/promotions/${id}`, payload).then(r => r.data.data),

  deletePromotion: (id: number) =>
    api.delete(`/promotions/${id}`).then(r => r.data),

  togglePromotionStatus: (id: number, is_active: boolean) =>
    api.put(`/promotions/${id}`, { is_active }).then(r => r.data.data),

  // Coupons
  getCoupons: (params: Record<string, any> = {}) =>
    api.get('/coupons', { params }).then(r => r.data),

  getCoupon: (id: number) =>
    api.get(`/coupons/${id}`).then(r => r.data.data),

  createCoupon: (payload: any) =>
    api.post('/coupons', payload).then(r => r.data.data),

  updateCoupon: (id: number, payload: any) =>
    api.put(`/coupons/${id}`, payload).then(r => r.data.data),

  deleteCoupon: (id: number) =>
    api.delete(`/coupons/${id}`).then(r => r.data),

  toggleCouponStatus: (id: number, is_active: boolean) =>
    api.put(`/coupons/${id}`, { is_active }).then(r => r.data.data),

  generateCouponCode: () =>
    api.get('/coupons/generate-code').then(r => r.data),

  // Flash Sales
  getFlashSales: (params: Record<string, any> = {}) =>
    api.get('/flash-sales', { params }).then(r => r.data),

  getFlashSale: (id: number) =>
    api.get(`/flash-sales/${id}`).then(r => r.data.data),

  createFlashSale: (payload: any) =>
    api.post('/flash-sales', payload).then(r => r.data.data),

  updateFlashSale: (id: number, payload: any) =>
    api.put(`/flash-sales/${id}`, payload).then(r => r.data.data),

  deleteFlashSale: (id: number) =>
    api.delete(`/flash-sales/${id}`).then(r => r.data),

  toggleFlashSaleStatus: (id: number, is_active: boolean) =>
    api.put(`/flash-sales/${id}`, { is_active }).then(r => r.data.data),
}

export default marketingService
