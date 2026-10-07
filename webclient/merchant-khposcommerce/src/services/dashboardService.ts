import api from '@/api/client'

export const dashboardService = {
  getStats: (branchId?: string | number) =>
    api.get('/dashboard/stats', { params: { branch_id: branchId } }).then(r => r.data.data),

  getCharts: (branchId?: string | number) =>
    api.get('/dashboard/charts', { params: { branch_id: branchId } }).then(r => r.data.data),

  getSalesChart: (branchId?: string | number) =>
    api.get('/dashboard/sales-chart', { params: { branch_id: branchId } }).then(r => r.data.data),

  getOperationPanels: () =>
    api.get('/dashboard/operation-panels').then(r => r.data.data),

  getAlerts: () =>
    api.get('/dashboard/alerts').then(r => r.data.data),

  getSystemHealth: () =>
    api.get('/dashboard/system-health').then(r => r.data.data),

  getTopProducts: () =>
    api.get('/dashboard/top-products').then(r => r.data.data),

  getLowStock: () =>
    api.get('/dashboard/low-stock').then(r => r.data.data),
}

export default dashboardService
