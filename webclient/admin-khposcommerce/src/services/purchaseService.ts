import api from '@/api/client'

export interface PurchaseListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  payment_status?: string
  supplier_id?: number | string
  warehouse_id?: number | string
  start_date?: string
  end_date?: string
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: any
}

export const purchaseService = {
  list: (params: PurchaseListParams = {}) =>
    api.get('/purchases', { params }).then((r) => r.data),

  show: (id: number | string) =>
    api.get(`/purchases/${id}`).then((r) => r.data.data ?? r.data),

  create: (payload: Record<string, any>) =>
    api.post('/purchases', payload).then((r) => r.data.data ?? r.data),

  update: (id: number | string, payload: Record<string, any>) =>
    api.put(`/purchases/${id}`, payload).then((r) => r.data.data ?? r.data),

  delete: (id: number | string) =>
    api.delete(`/purchases/${id}`).then((r) => r.data),

  receiveShipment: (id: number | string, payload: Record<string, any>) =>
    api.post(`/purchases/${id}/receive`, payload).then((r) => r.data.data ?? r.data),

  cancel: (id: number | string) =>
    api.post(`/purchases/${id}/cancel`).then((r) => r.data.data ?? r.data),

  recordPayment: (id: number | string, payload: Record<string, any>) =>
    api.post(`/purchases/${id}/record-payment`, payload).then((r) => r.data.data ?? r.data),

  // Purchase Returns
  getReturns: (params: Record<string, any> = {}) =>
    api.get('/purchase-returns', { params }).then((r) => r.data),

  getReturn: (id: number | string) =>
    api.get(`/purchase-returns/${id}`).then((r) => r.data.data ?? r.data),

  createReturn: (payload: Record<string, any>) =>
    api.post('/purchase-returns', payload).then((r) => r.data.data ?? r.data),

  approveReturn: (id: number | string) =>
    api.post(`/purchase-returns/${id}/approve`).then((r) => r.data.data ?? r.data),

  shipReturn: (id: number | string, payload: Record<string, any> = {}) =>
    api.post(`/purchase-returns/${id}/ship`, payload).then((r) => r.data.data ?? r.data),

  settleReturn: (id: number | string, payload: Record<string, any>) =>
    api.post(`/purchase-returns/${id}/settle`, payload).then((r) => r.data.data ?? r.data),

  updateReturn: (id: number | string, payload: Record<string, any>) =>
    api.put(`/purchase-returns/${id}`, payload).then((r) => r.data.data ?? r.data),

  cancelReturn: (id: number | string) =>
    api.post(`/purchase-returns/${id}/cancel`).then((r) => r.data.data ?? r.data),

  deleteReturn: (id: number | string) =>
    api.delete(`/purchase-returns/${id}`).then((r) => r.data),
}

export default purchaseService
