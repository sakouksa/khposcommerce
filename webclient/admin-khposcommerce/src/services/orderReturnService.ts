import api from '@/api/client'
import type {
  OrderReturn,
  OrderReturnFilters,
  ReturnPolicy,
  ReturnShipment,
  ReturnInspection,
  ExchangeOrder,
} from '@/types/orderReturn.types'

export const orderReturnService = {
  // Returns List & Detail
  list: (params: OrderReturnFilters = {}) =>
    api.get('/order-returns', { params }).then((r) => r.data),

  show: (id: number | string): Promise<OrderReturn> =>
    api.get(`/order-returns/${id}`).then((r) => r.data.data ?? r.data),

  create: (payload: Record<string, any>): Promise<OrderReturn> =>
    api.post('/order-returns', payload).then((r) => r.data.data ?? r.data),

  // Action Workflows
  approve: (id: number | string, adminNotes?: string): Promise<OrderReturn> =>
    api.post(`/order-returns/${id}/approve`, { admin_notes: adminNotes }).then((r) => r.data.data ?? r.data),

  reject: (id: number | string, reason: string): Promise<OrderReturn> =>
    api.post(`/order-returns/${id}/reject`, { reason }).then((r) => r.data.data ?? r.data),

  recordShipment: (id: number | string, payload: Record<string, any>): Promise<ReturnShipment> =>
    api.post(`/order-returns/${id}/ship`, payload).then((r) => r.data.data ?? r.data),

  receive: (id: number | string, warehouseId: number | string, notes?: string): Promise<OrderReturn> =>
    api.post(`/order-returns/${id}/receive`, { warehouse_id: warehouseId, notes }).then((r) => r.data.data ?? r.data),

  completeInspection: (id: number | string, payload: Record<string, any>): Promise<ReturnInspection> =>
    api.post(`/order-returns/${id}/inspect`, payload).then((r) => r.data.data ?? r.data),

  settleRefund: (id: number | string, payload: { refund_method?: string; refund_amount?: number }): Promise<OrderReturn> =>
    api.post(`/order-returns/${id}/settle`, payload).then((r) => r.data.data ?? r.data),

  processExchange: (id: number | string, payload: Record<string, any>): Promise<ExchangeOrder> =>
    api.post(`/order-returns/${id}/exchange`, payload).then((r) => r.data.data ?? r.data),

  // Return Policies
  listPolicies: (params: Record<string, any> = {}) =>
    api.get('/return-policies', { params }).then((r) => r.data),

  getPolicy: (id: number | string): Promise<ReturnPolicy> =>
    api.get(`/return-policies/${id}`).then((r) => r.data.data ?? r.data),

  createPolicy: (payload: Record<string, any>): Promise<ReturnPolicy> =>
    api.post('/return-policies', payload).then((r) => r.data.data ?? r.data),

  updatePolicy: (id: number | string, payload: Record<string, any>): Promise<ReturnPolicy> =>
    api.put(`/return-policies/${id}`, payload).then((r) => r.data.data ?? r.data),

  deletePolicy: (id: number | string) =>
    api.delete(`/return-policies/${id}`).then((r) => r.data),

  seedDefaultPolicies: (companyId?: number | string) =>
    api.post('/return-policies/seed-defaults', { company_id: companyId }).then((r) => r.data),
}

export default orderReturnService
