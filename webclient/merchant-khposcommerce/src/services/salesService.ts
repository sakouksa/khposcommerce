import api from '@/api/client'

export interface SalesListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  payment_status?: string
  channel?: string
  branch_id?: number | string
  customer_id?: number | string
  start_date?: string
  end_date?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export const salesService = {
  list: (params: SalesListParams = {}) =>
    api.get('/sales', { params }).then((response) => response.data),

  show: (id: number | string) =>
    api.get(`/sales/${id}`).then((response) => response.data.data),

  create: (payload: Record<string, any>) =>
    api.post('/sales', payload).then((response) => response.data.data),

  orders: (params: Record<string, any> = {}) =>
    api.get('/orders', { params }).then((response) => response.data),

  orderDetail: (id: number | string) =>
    api.get(`/orders/${id}`).then((response) => response.data.data),

  processRefund: (id: number | string, payload: Record<string, any>) =>
    api.post(`/sales/${id}/refund`, payload).then((response) => response.data.data),

  returnSale: (id: number | string, payload: Record<string, any>) =>
    api.post(`/pos/sales/${id}/return`, payload).then((response) => response.data),
}

export default salesService
