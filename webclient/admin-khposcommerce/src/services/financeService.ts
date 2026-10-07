import api from '@/api/client'

export const resolveTabEndpoint = (tab: string): string => {
  switch (tab) {
    case 'categories':
      return 'expense-categories'
    case 'registers':
      return 'pos/cash-registers'
    case 'payment_methods':
      return 'payment-methods'
    default:
      return tab
  }
}

export const financeService = {
  // Financial Analytics & KPIs
  getAnalytics: () =>
    api.get('/finance/analytics').then(r => r.data.data),

  // Payment Methods
  getPaymentMethods: (params: Record<string, any> = {}) =>
    api.get('/payment-methods', { params }).then(r => r.data),

  getPaymentMethod: (id: number) =>
    api.get(`/payment-methods/${id}`).then(r => r.data.data),

  createPaymentMethod: (payload: any) =>
    api.post('/payment-methods', payload).then(r => r.data.data),

  updatePaymentMethod: (id: number, payload: any) =>
    api.put(`/payment-methods/${id}`, payload).then(r => r.data.data),

  deletePaymentMethod: (id: number) =>
    api.delete(`/payment-methods/${id}`).then(r => r.data),

  togglePaymentMethodStatus: (id: number, active: boolean) =>
    api.put(`/payment-methods/${id}`, { is_active: active }).then(r => r.data.data),

  // Transactions
  getTransactions: (params: Record<string, any> = {}) =>
    api.get('/transactions', { params }).then(r => r.data),

  getTransaction: (id: number | string) =>
    api.get(`/transactions/${id}`).then(r => r.data.data),

  createTransaction: (payload: any) =>
    api.post('/transactions', payload).then(r => r.data.data ?? r.data),

  updateTransaction: (id: number | string, payload: any) =>
    api.put(`/transactions/${id}`, payload).then(r => r.data.data ?? r.data),

  deleteTransaction: (id: number | string) =>
    api.delete(`/transactions/${id}`).then(r => r.data),

  // Cash Registers
  getCashRegisters: (params: Record<string, any> = {}) =>
    api.get('/pos/cash-registers', { params }).then(r => r.data),

  updateCashRegister: (id: number, payload: any) =>
    api.put(`/pos/cash-registers/${id}`, payload).then(r => r.data.data),

  closeCashRegister: (id: number, payload: any) =>
    api.put(`/pos/cash-registers/${id}`, payload).then(r => r.data.data),

  // Currencies & Taxes
  getCurrencies: (params: Record<string, any> = {}) =>
    api.get('/currencies', { params }).then(r => r.data),

  getTaxes: (params: Record<string, any> = {}) =>
    api.get('/taxes', { params }).then(r => r.data),

  // Generic dynamic tab CRUD (for unified FinancePage tabs)
  getItemsByTab: (tab: string, params: Record<string, any> = {}) =>
    api.get(`/${resolveTabEndpoint(tab)}`, { params }).then(r => r.data),

  createItemByTab: (tab: string, payload: any) =>
    api.post(`/${resolveTabEndpoint(tab)}`, payload).then(r => r.data.data),

  updateItemByTab: (tab: string, id: number, payload: any) =>
    api.put(`/${resolveTabEndpoint(tab)}/${id}`, payload).then(r => r.data.data),

  deleteItemByTab: (tab: string, id: number) =>
    api.delete(`/${resolveTabEndpoint(tab)}/${id}`).then(r => r.data),

  importData: (tab: string, formData: FormData) =>
    api.post(`/${resolveTabEndpoint(tab)}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
}

export default financeService
