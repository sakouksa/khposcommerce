import api from '@/api/client'

export const shippingService = {
  getShippingMethods: (params: Record<string, any> = {}) =>
    api.get('/shipping-methods', { params }).then(r => r.data.data ?? r.data),

  getShippingZones: (params: Record<string, any> = {}) =>
    api.get('/shipping-zones', { params }).then(r => r.data.data ?? r.data),

  getItemsByTab: (tab: string, params: Record<string, any> = {}) =>
    api.get(`/${tab}`, { params }).then(r => r.data),

  createItemByTab: (tab: string, payload: any) =>
    api.post(`/${tab}`, payload).then(r => r.data.data ?? r.data),

  updateItemByTab: (tab: string, id: number, payload: any) =>
    api.put(`/${tab}/${id}`, payload).then(r => r.data.data ?? r.data),

  deleteItemByTab: (tab: string, id: number) =>
    api.delete(`/${tab}/${id}`).then(r => r.data),
}

export default shippingService
