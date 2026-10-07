import api from '@/api/client'

export const inventoryService = {
  // Inventory Stock Levels
  list: (params: Record<string, any> = {}) =>
    api.get('/inventory', { params }).then(r => r.data),

  show: (id: number | string) =>
    api.get(`/inventory/${id}`).then(r => r.data.data),

  stats: () =>
    api.get('/inventory/stats').then(r => r.data.data ?? r.data),

  lowStock: (params: Record<string, any> = {}) =>
    api.get('/inventory/low-stock', { params }).then(r => r.data),

  byProduct: (productId: number | string) =>
    api.get(`/inventory/product/${productId}`).then(r => r.data.data),

  // Inventory Movements
  getMovements: (params: Record<string, any> = {}) =>
    api.get('/inventory-movements', { params }).then(r => r.data),

  getMovement: (id: number | string) =>
    api.get(`/inventory-movements/${id}`).then(r => r.data.data),

  // Stock Adjustments
  listAdjustments: (params: Record<string, any> = {}) =>
    api.get('/stock-adjustments', { params }).then(r => r.data),

  getAdjustment: (id: number | string) =>
    api.get(`/stock-adjustments/${id}`).then(r => r.data.data),

  createAdjustment: (payload: any) =>
    api.post('/stock-adjustments', payload).then(r => r.data.data),

  updateAdjustment: (id: number | string, payload: any) =>
    api.put(`/stock-adjustments/${id}`, payload).then(r => r.data.data),

  approveAdjustment: (id: number | string) =>
    api.post(`/stock-adjustments/${id}/approve`).then(r => r.data),

  deleteAdjustment: (id: number | string) =>
    api.delete(`/stock-adjustments/${id}`).then(r => r.data),

  // Stock Transfers
  listTransfers: (params: Record<string, any> = {}) =>
    api.get('/stock-transfers', { params }).then(r => r.data),

  getTransfer: (id: number | string) =>
    api.get(`/stock-transfers/${id}`).then(r => r.data.data),

  createTransfer: (payload: any) =>
    api.post('/stock-transfers', payload).then(r => r.data.data),

  updateTransfer: (id: number | string, payload: any) =>
    api.put(`/stock-transfers/${id}`, payload).then(r => r.data.data),

  shipTransfer: (id: number | string) =>
    api.post(`/stock-transfers/${id}/ship`).then(r => r.data),

  receiveTransfer: (id: number | string, payload?: { items: any[] }) =>
    api.post(`/stock-transfers/${id}/receive`, payload).then(r => r.data),

  deleteTransfer: (id: number | string) =>
    api.delete(`/stock-transfers/${id}`).then(r => r.data),

  // Stock Opnames (Physical Inventory Audit)
  listOpnames: (params: Record<string, any> = {}) =>
    api.get('/stock-opnames', { params }).then(r => r.data),

  getOpname: (id: number | string) =>
    api.get(`/stock-opnames/${id}`).then(r => r.data.data),

  createOpname: (payload: any) =>
    api.post('/stock-opnames', payload).then(r => r.data),

  updateOpnameItems: (id: number | string, items: any[]) =>
    api.post(`/stock-opnames/${id}/items`, { items }).then(r => r.data),

  completeOpname: (id: number | string) =>
    api.post(`/stock-opnames/${id}/complete`).then(r => r.data),

  deleteOpname: (id: number | string) =>
    api.delete(`/stock-opnames/${id}`).then(r => r.data),
}

export default inventoryService
