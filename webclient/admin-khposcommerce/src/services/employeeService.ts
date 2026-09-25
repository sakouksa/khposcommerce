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

  loadCambodiaHolidaysPreset: async () => {
    const res = await api.post('/holidays/bulk-import', { holidays: CAMBODIA_HOLIDAYS_2026 })
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

export const CAMBODIA_HOLIDAYS_2026 = [
  {
    id: 1,
    title_en: "New Year's Day",
    title_km: "ទិវាចូលឆ្នាំសកល",
    date: "2026-01-01",
    description: "First day of the new year / ទិវាចូលឆ្នាំសកល",
    status: "active",
    is_recurring: true,
  },
  {
    id: 2,
    title_en: "Victory over Genocide Day",
    title_km: "ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍",
    date: "2026-01-07",
    description: "Commemorates the end of the Khmer Rouge regime / រំលឹកខួបជ័យជម្នះ ៧ មករា",
    status: "active",
    is_recurring: true,
  },
  {
    id: 3,
    title_en: "International Women's Day",
    title_km: "ទិវាអន្តរជាតិនារី",
    date: "2026-03-08",
    description: "Celebration of women's rights and contributions / ទិវាអន្តរជាតិនារី ៨ មីនា",
    status: "active",
    is_recurring: true,
  },
  {
    id: 4,
    title_en: "Khmer New Year (Day 1)",
    title_km: "ពិធីបុណ្យចូលឆ្នាំខ្មែរ ប្រពៃណីជាតិ (ថ្ងៃទី១ - មហាសង្ក្រាន្ត)",
    date: "2026-04-14",
    description: "First day of traditional Cambodian New Year celebration / ថ្ងៃមហាសង្ក្រាន្ត",
    status: "active",
    is_recurring: false,
  },
  {
    id: 5,
    title_en: "Khmer New Year (Day 2)",
    title_km: "ពិធីបុណ្យចូលឆ្នាំខ្មែរ ប្រពៃណីជាតិ (ថ្ងៃទី២ - វារៈវនបត)",
    date: "2026-04-15",
    description: "Second day of traditional Cambodian New Year celebration / ថ្ងៃវារៈវនបត",
    status: "active",
    is_recurring: false,
  },
  {
    id: 6,
    title_en: "Khmer New Year (Day 3)",
    title_km: "ពិធីបុណ្យចូលឆ្នាំខ្មែរ ប្រពៃណីជាតិ (ថ្ងៃទី៣ - វារៈឡើងស័ក)",
    date: "2026-04-16",
    description: "Third day of traditional Cambodian New Year celebration / ថ្ងៃវារៈឡើងស័ក",
    status: "active",
    is_recurring: false,
  },
  {
    id: 7,
    title_en: "International Labour Day",
    title_km: "ទិវាពលកម្មអន្តរជាតិ",
    date: "2026-05-01",
    description: "Honors working people across the world / ទិវាពលកម្មអន្តរជាតិ ១ ឧសភា",
    status: "active",
    is_recurring: true,
  },
  {
    id: 8,
    title_en: "Visak Bochea Day",
    title_km: "ពិធីបុណ្យវិសាខបូជា",
    date: "2026-05-01",
    description: "Birth, enlightenment and passing of Buddha / ពិធីបុណ្យពុទ្ធសាសនា",
    status: "active",
    is_recurring: false,
  },
  {
    id: 9,
    title_en: "Royal Ploughing Ceremony",
    title_km: "ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល",
    date: "2026-05-05",
    description: "Traditional agricultural forecasting ceremony / ពិធីបុណ្យព្រះរាជប្រពៃណី",
    status: "active",
    is_recurring: false,
  },
  {
    id: 10,
    title_en: "King Norodom Sihamoni's Birthday",
    title_km: "ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះករុណា ព្រះបាទសម្តេច ព្រះបរមនាថ នរោត្តម សីហមុនី",
    date: "2026-05-14",
    description: "Official royal birthday holiday / ថ្ងៃចម្រើនព្រះជន្មព្រះមហាក្សត្រ",
    status: "active",
    is_recurring: true,
  },
  {
    id: 11,
    title_en: "National Day of Remembrance",
    title_km: "ទិវាជាតិនៃការចងចាំ",
    date: "2026-05-20",
    description: "Memorial day for victims of the Khmer Rouge regime / ទិវាជាតិនៃការចងចាំ ២០ ឧសភា",
    status: "active",
    is_recurring: true,
  },
  {
    id: 12,
    title_en: "Queen Mother's Birthday",
    title_km: "ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ",
    date: "2026-06-18",
    description: "Celebration of Queen Mother Norodom Monineath Sihanouk's birthday / ថ្ងៃចម្រើនព្រះជន្មសម្តេចម៉ែ",
    status: "active",
    is_recurring: true,
  },
  {
    id: 13,
    title_en: "Constitutional Day",
    title_km: "ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ",
    date: "2026-09-24",
    description: "Commemoration of the adoption of the Constitution / ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ",
    status: "active",
    is_recurring: true,
  },
  {
    id: 14,
    title_en: "Pchum Ben Festival (Day 1)",
    title_km: "ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី១)",
    date: "2026-10-10",
    description: "Ancestors' Day religious celebration / ពិធីបុណ្យភ្ជុំបិណ្ឌ",
    status: "active",
    is_recurring: false,
  },
  {
    id: 15,
    title_en: "Pchum Ben Festival (Day 2)",
    title_km: "ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី២)",
    date: "2026-10-11",
    description: "Ancestors' Day main celebration / ពិធីបុណ្យភ្ជុំបិណ្ឌ",
    status: "active",
    is_recurring: false,
  },
  {
    id: 16,
    title_en: "Pchum Ben Festival (Day 3)",
    title_km: "ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី៣)",
    date: "2026-10-12",
    description: "Ancestors' Day final celebration / ពិធីបុណ្យភ្ជុំបិណ្ឌ",
    status: "active",
    is_recurring: false,
  },
  {
    id: 17,
    title_en: "Commemoration Day of King Father",
    title_km: "ទិវារំលឹកខួបនៃការយាងសោយព្រះទិវង្គត ព្រះបរមរតនកោដ្ឋ",
    date: "2026-10-15",
    description: "Memorial day for His Majesty Preah Bat Samdech Preah Norodom Sihanouk / ព្រះបរមរតនកោដ្ឋ",
    status: "active",
    is_recurring: true,
  },
  {
    id: 18,
    title_en: "King's Coronation Day",
    title_km: "ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ ព្រះករុណា ព្រះបាទសម្តេច ព្រះបរមនាថ នរោត្តម សីហមុនី",
    date: "2026-10-29",
    description: "Coronation of His Majesty King Norodom Sihamoni / ថ្ងៃគ្រងរាជសម្បត្តិ",
    status: "active",
    is_recurring: true,
  },
  {
    id: 19,
    title_en: "National Independence Day",
    title_km: "ពិធីបុណ្យឯករាជ្យជាតិ",
    date: "2026-11-09",
    description: "Commemorates Cambodia's independence from France in 1953 / បុណ្យឯករាជ្យជាតិ ៩ វិច្ឆិកា",
    status: "active",
    is_recurring: true,
  },
  {
    id: 20,
    title_en: "Water Festival (Day 1)",
    title_km: "ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (ថ្ងៃទី១)",
    date: "2026-11-24",
    description: "Boat racing and illumination ceremony / ពិធីបុណ្យអុំទូក",
    status: "active",
    is_recurring: false,
  },
  {
    id: 21,
    title_en: "Water Festival (Day 2)",
    title_km: "ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (ថ្ងៃទី២)",
    date: "2026-11-25",
    description: "Boat racing, illuminated floats & moon worship / ពិធីបុណ្យអុំទូក",
    status: "active",
    is_recurring: false,
  },
  {
    id: 22,
    title_en: "Water Festival (Day 3)",
    title_km: "ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (ថ្ងៃទី៣)",
    date: "2026-11-26",
    description: "Final day of Water Festival / ពិធីបុណ្យអុំទូក",
    status: "active",
    is_recurring: false,
  },
]

export default employeeService

