import api from '@/api/client'

export interface EmployeeListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  department_id?: number | string
  designation_id?: number | string
  position_id?: number | string
  branch_id?: number | string
  reporting_to_id?: number | string
  is_driver?: boolean | string
  is_pos_supervisor?: boolean | string
  is_fulfillment_picker?: boolean | string
  driver_status?: string
  contract_type?: string
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: any
}

export const employeeService = {
  list: (params: EmployeeListParams = {}) =>
    api.get('/employees', { params }).then((r) => r.data),

  show: (id: number | string) =>
    api.get(`/employees/${id}`).then((r) => r.data.data ?? r.data),

  create: (payload: Record<string, any>) =>
    api.post('/employees', payload).then((r) => r.data.data ?? r.data),

  update: (id: number | string, payload: Record<string, any>) =>
    api.put(`/employees/${id}`, payload).then((r) => r.data.data ?? r.data),

  delete: (id: number | string) =>
    api.delete(`/employees/${id}`).then((r) => r.data),

  getStats: () =>
    api.get('/employees/stats').then((r) => r.data.data ?? r.data),

  stats: () =>
    api.get('/employees/stats').then((r) => r.data.data ?? r.data),

  departments: (params: Record<string, any> = {}) =>
    api.get('/departments', { params }).then((r) => r.data),

  positions: (params: Record<string, any> = {}) =>
    api.get('/positions', { params }).then((r) => r.data),

  designations: (params: Record<string, any> = {}) =>
    api.get('/designations', { params }).then((r) => r.data),

  shifts: (params: Record<string, any> = {}) =>
    api.get('/shifts', { params }).then((r) => r.data),

  createShift: (payload: any) =>
    api.post('/shifts', payload).then((r) => r.data.data ?? r.data),

  updateShift: (id: number | string, payload: any) =>
    api.put(`/shifts/${id}`, payload).then((r) => r.data.data ?? r.data),

  deleteShift: (id: number | string) =>
    api.delete(`/shifts/${id}`).then((r) => r.data),

  attendances: (params: Record<string, any> = {}) =>
    api.get('/attendances', { params }).then((r) => r.data),

  attendance: (params: Record<string, any> = {}) =>
    api.get('/attendances', { params }).then((r) => r.data),

  createAttendance: (payload: any) =>
    api.post('/attendances', payload).then((r) => r.data.data ?? r.data),

  updateAttendance: (id: number | string, payload: any) =>
    api.put(`/attendances/${id}`, payload).then((r) => r.data.data ?? r.data),

  deleteAttendance: (id: number | string) =>
    api.delete(`/attendances/${id}`).then((r) => r.data),

  getAttendanceDashboardStats: (params: { company_id?: number; branch_id?: number; date?: string } = {}) =>
    api.get('/attendances/dashboard-stats', { params }).then((r) => r.data.data ?? r.data),

  getMonthlyAttendanceSummary: (params: { period_month: string; company_id?: number; branch_id?: number }) =>
    api.get('/attendances/monthly-summary', { params }).then((r) => r.data.data ?? r.data),

  exportAttendanceCsv: async (params: Record<string, any> = {}) => {
    const res = await api.get('/attendances/export', {
      params,
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `attendances_export_${new Date().toISOString().substring(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    return res.data
  },

  generateQr: (payload: any) =>
    api.post('/attendances/generate-qr', payload).then((r) => r.data.data ?? r.data),

  getEntranceQr: (params: { company_id?: number; branch_id?: number } = {}) =>
    api.get('/attendances/entrance-qr', { params }).then((r) => r.data.data ?? r.data),

  revokeEntranceQr: (payload: { company_id: number; branch_id: number; session_id?: number }) =>
    api.post('/attendances/revoke-entrance-qr', payload).then((r) => r.data.data ?? r.data),

  // ─── LEAVE MANAGEMENT ─────────────────────────────────────────────────────
  leaveRequests: (params: Record<string, any> = {}) =>
    api.get('/leave-requests', { params }).then((r) => r.data),

  createLeaveRequest: (payload: any) =>
    api.post('/leave-requests', payload).then((r) => r.data.data ?? r.data),

  createLeave: (payload: any) =>
    api.post('/leave-requests', payload).then((r) => r.data.data ?? r.data),

  approveLeave: (id: number | string, payload: { manager_notes?: string } = {}) =>
    api.post(`/leave-requests/${id}/approve`, payload).then((r) => r.data.data ?? r.data),

  rejectLeave: (id: number | string, payload: { manager_notes: string }) =>
    api.post(`/leave-requests/${id}/reject`, payload).then((r) => r.data.data ?? r.data),

  getLeaveBalance: (employeeId: number | string, year?: number) =>
    api.get(`/leave-balances/${employeeId}`, { params: { year } }).then((r) => r.data.data ?? r.data),

  deleteLeaveRequest: (id: number | string) =>
    api.delete(`/leave-requests/${id}`).then((r) => r.data),

  deleteLeave: (id: number | string) =>
    api.delete(`/leave-requests/${id}`).then((r) => r.data),

  bulkDeleteLeaves: (ids: (number | string)[]) =>
    api.post('/leave-requests/bulk-delete', { ids }).then((r) => r.data),

  // ─── PAYROLL MANAGEMENT ───────────────────────────────────────────────────
  payrolls: (params: Record<string, any> = {}) =>
    api.get('/payrolls', { params }).then((r) => r.data),

  autoGeneratePayroll: (payload: { period_month: string; company_id?: number; branch_id?: number }) =>
    api.post('/payrolls/auto-generate', payload).then((r) => r.data.data ?? r.data),

  getPayslip: (id: number | string) =>
    api.get(`/payrolls/${id}/payslip`).then((r) => r.data.data ?? r.data),

  getAbaPreview: (params: { period_month: string; debit_account?: string }) =>
    api.get('/payrolls/aba-preview', { params }).then((r) => r.data.data ?? r.data),

  exportAbaBulkCsv: async (params: {
    period_month: string
    debit_account?: string
    exclude_missing?: boolean
    mark_paid?: boolean
  }) => {
    const res = await api.get('/payrolls/export-aba-bulk', {
      params,
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `ABA_Bulk_Payroll_${params.period_month}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    return res.data
  },

  exportAbaBulk: async (periodMonth: string) => {
    return employeeService.exportAbaBulkCsv({ period_month: periodMonth })
  },

  uploadPhoto: (formData: FormData) =>
    api.post('/employees/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  bulkDelete: (tab: string, ids: (number | string)[]) => {
    const endpoint = tab === 'leaves' || tab === 'leave-requests' ? 'leave-requests' : tab
    return api.post(`/${endpoint}/bulk-delete`, { ids }).then((r) => r.data)
  },

  importData: (tab: string, formData: FormData) =>
    api.post(`/${tab}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  // ─── HOLIDAY MANAGEMENT ───────────────────────────────────────────────────
  holidays: async (params: Record<string, any> = {}) => {
    const res = await api.get('/holidays', { params })
    return res.data
  },

  createHoliday: async (payload: any) => {
    const res = await api.post('/holidays', payload)
    return res.data?.data ?? res.data
  },

  updateHoliday: async (id: number | string, payload: any) => {
    const res = await api.put(`/holidays/${id}`, payload)
    return res.data?.data ?? res.data
  },

  deleteHoliday: async (id: number | string) => {
    const res = await api.delete(`/holidays/${id}`)
    return res.data
  },

  bulkDeleteHolidays: async (ids: (number | string)[]) => {
    const res = await api.post('/holidays/bulk-delete', { ids })
    return res.data
  },

  loadCambodiaHolidaysPreset: async (year: number = 2026) => {
    return employeeService.syncLiveHolidays(year)
  },

  syncLiveHolidays: async (year: number = new Date().getFullYear()) => {
    const res = await api.post('/holidays/sync-live-api', { year })
    return res.data
  },

  getItemsByTab: (tab: string, params: any = {}) => {
    if (tab === 'leaves') {
      return api.get('/leave-requests', { params }).then((r) => r.data)
    }
    if (tab === 'holidays') {
      return employeeService.holidays(params)
    }
    return api.get(`/${tab}`, { params }).then((r) => r.data)
  },

  createItemByTab: (tab: string, payload: any) => {
    if (tab === 'leaves') {
      return api.post('/leave-requests', payload).then((r) => r.data.data ?? r.data)
    }
    if (tab === 'holidays') {
      return employeeService.createHoliday(payload)
    }
    return api.post(`/${tab}`, payload).then((r) => r.data.data ?? r.data)
  },

  updateItemByTab: (tab: string, id: number | string, payload: any) => {
    if (tab === 'leaves') {
      return api.put(`/leave-requests/${id}`, payload).then((r) => r.data.data ?? r.data)
    }
    if (tab === 'holidays') {
      return employeeService.updateHoliday(id, payload)
    }
    return api.put(`/${tab}/${id}`, payload).then((r) => r.data.data ?? r.data)
  },

  deleteItemByTab: (tab: string, id: number | string) => {
    if (tab === 'leaves') {
      return api.delete(`/leave-requests/${id}`).then((r) => r.data)
    }
    if (tab === 'holidays') {
      return employeeService.deleteHoliday(id)
    }
    return api.delete(`/${tab}/${id}`).then((r) => r.data)
  },
}

export default employeeService


