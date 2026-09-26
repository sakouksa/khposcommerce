import api from '@/api/client'

export const reportService = {
  // Summary & Overview
  salesSummary: (params: Record<string, any> = {}) =>
    api.get('/reports/sales', { params }).then((r) => r.data?.data ?? r.data),

  salesOverview: (params: Record<string, any> = {}) =>
    api.get('/reports/sales/overview', { params }).then((r) => r.data?.data ?? r.data),

  salesList: (params: Record<string, any> = {}) =>
    api.get('/reports/sales/list', { params }).then((r) => r.data),

  inventorySummary: (params: Record<string, any> = {}) =>
    api.get('/reports/inventory', { params }).then((r) => r.data?.data ?? r.data),

  inventoryOverview: (params: Record<string, any> = {}) =>
    api.get('/reports/inventory/overview', { params }).then((r) => r.data?.data ?? r.data),

  purchaseSummary: (params: Record<string, any> = {}) =>
    api.get('/purchase-report', { params }).then((r) => r.data?.data ?? r.data),

  purchaseOverview: (params: Record<string, any> = {}) =>
    api.get('/reports/purchase/overview', { params }).then((r) => r.data?.data ?? r.data),

  purchaseTable: (params: Record<string, any> = {}) =>
    api.get('/reports/purchase/table', { params }).then((r) => r.data?.data ?? r.data),

  purchaseReturnsTable: (params: Record<string, any> = {}) =>
    api.get('/reports/purchase/returns-table', { params }).then((r) => r.data?.data ?? r.data),

  profitLossSummary: (params: Record<string, any> = {}) =>
    api.get('/reports/profit-loss', { params }).then((r) => r.data?.data ?? r.data),

  // Export
  exportSales: (params: Record<string, any> = {}) =>
    api.get('/reports/sales/export', { params, responseType: 'blob' }),

  exportPurchase: (params: Record<string, any> = {}) =>
    api.get('/reports/purchase/export', { params, responseType: 'blob' }),

  exportInventory: (params: Record<string, any> = {}) =>
    api.get('/reports/inventory/export', { params, responseType: 'blob' }),

  exportReport: (type: string, format: 'csv' | 'pdf' = 'csv', params: Record<string, any> = {}) =>
    api.get(`/reports/${type}/export`, {
      params: { ...params, format },
      responseType: 'blob',
    }),
}

export default reportService
