import api from '@/api/client'

export const posService = {
  getSales: (params: Record<string, any> = {}) =>
    api.get('/pos/sales', { params }).then((r) => r.data),

  productSearch: (params: Record<string, any> = {}) =>
    api.get('/pos/product-search', { params }).then((r) => r.data),

  barcodeLookup: (code: string, params: Record<string, any> = {}) =>
    api.get(`/pos/products/barcode/${encodeURIComponent(code)}`, { params }).then((r) => r.data),

  voiceSearch: (payload: { query: string; branch_id?: number | string }) =>
    api.post('/pos/voice-search', payload).then((r) => r.data),

  visionSearch: (payload: { image: string; branch_id?: number | string }) =>
    api.post('/pos/vision-search', payload).then((r) => r.data),

  checkout: (payload: Record<string, any>) =>
    api.post('/pos/sales', payload).then((r) => r.data),

  validateCoupon: (payload: { code: string; subtotal: number }) =>
    api.post('/coupons/validate', payload).then((r) => r.data),
}

export default posService
