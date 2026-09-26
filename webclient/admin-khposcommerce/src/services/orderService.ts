import api from '@/api/client'

export const orderService = {
  list: (params?: any) => api.get('/orders', { params }).then((response) => response.data),
  show: (id: number | string) => api.get(`/orders/${id}`).then((response) => response.data.data ?? response.data),
  create: (data: any) => api.post('/orders', data).then((response) => response.data.data ?? response.data),
  update: (id: number | string, data: any) => api.put(`/orders/${id}`, data).then((response) => response.data.data ?? response.data),
  delete: (id: number | string) => api.delete(`/orders/${id}`).then((response) => response.data.data ?? response.data),
  updateStatus: (id: number | string, status: string) => api.put(`/orders/${id}/status`, { status }).then((response) => response.data.data ?? response.data),
  export: (params?: any) => api.get('/orders/export', { params, responseType: 'blob' }).then((response) => response.data),
}

export default orderService
