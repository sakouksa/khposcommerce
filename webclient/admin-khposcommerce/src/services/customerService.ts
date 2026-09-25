import api from '@/api/client'

export interface CustomerListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  customer_group_id?: number | string
  group_id?: number | string
  company_id?: number | string
  gender?: string
  payment_terms?: string
  rfm_segment?: string
  is_credit_hold?: boolean | string
  tag?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export const customerService = {
  list: (params: CustomerListParams = {}) =>
    api.get('/customers', { params }).then((r) => r.data),

  show: (id: number | string) =>
    api.get(`/customers/${id}`).then((r) => r.data.data),

  create: (payload: Record<string, any> | FormData, config: any = {}) =>
    api.post('/customers', payload, config).then((r) => r.data.data ?? r.data),

  update: (id: number | string, payload: Record<string, any> | FormData, config: any = {}) =>
    api.post(`/customers/${id}`, payload, config).then((r) => r.data.data ?? r.data),

  delete: (id: number | string) =>
    api.delete(`/customers/${id}`).then((r) => r.data),

  bulkDelete: (ids: number[]) =>
    api.post('/customers/bulk-delete', { ids }).then((r) => r.data),

  bulkActivate: (ids: number[]) =>
    api.post('/customers/bulk-activate', { ids }).then((r) => r.data),

  bulkDeactivate: (ids: number[]) =>
    api.post('/customers/bulk-deactivate', { ids }).then((r) => r.data),

  bulkAssignGroup: (ids: number[], customer_group_id: number | string) =>
    api.post('/customers/bulk-assign-group', { ids, customer_group_id }).then((r) => r.data),

  bulkToggleCreditHold: (ids: number[], is_credit_hold: boolean) =>
    api.post('/customers/bulk-toggle-credit-hold', { ids, is_credit_hold }).then((r) => r.data),

  settleDebt: (customerId: number | string, payload: { amount: number; payment_method: string; reference_no?: string; notes?: string }) =>
    api.post(`/customers/${customerId}/settle-debt`, payload).then((r) => r.data.data ?? r.data),

  mergeCustomers: (primaryId: number | string, duplicateId: number | string) =>
    api.post('/customers/merge', { primary_id: primaryId, duplicate_id: duplicateId }).then((r) => r.data.data ?? r.data),

  import: (formData: FormData) =>
    api.post('/customers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  getStats: (params: Record<string, any> = {}) =>
    api.get('/customers/stats', { params }).then((r) => r.data.data ?? r.data),

  // Enterprise Operations
  addWalletTransaction: (customerId: number | string, payload: { amount: number; type: string; payment_method?: string; reference_no?: string; notes?: string }) =>
    api.post(`/customers/${customerId}/wallet-transactions`, payload).then((r) => r.data.data ?? r.data),

  adjustLoyaltyPoints: (customerId: number | string, payload: { points: number; type: string; expiry_date?: string; reference_no?: string; notes?: string }) =>
    api.post(`/customers/${customerId}/loyalty-points`, payload).then((r) => r.data.data ?? r.data),

  recordInteraction: (customerId: number | string, payload: { type: string; subject: string; description?: string; outcome?: string; interacted_at?: string; next_follow_up_at?: string }) =>
    api.post(`/customers/${customerId}/interactions`, payload).then((r) => r.data.data ?? r.data),

  toggleCreditHold: (customerId: number | string, is_credit_hold: boolean) =>
    api.post(`/customers/${customerId}/toggle-credit-hold`, { is_credit_hold }).then((r) => r.data.data ?? r.data),

  addContact: (customerId: number | string, payload: any) =>
    api.post(`/customers/${customerId}/contacts`, payload).then((r) => r.data.data ?? r.data),

  deleteContact: (customerId: number | string, contactId: number | string) =>
    api.delete(`/customers/${customerId}/contacts/${contactId}`).then((r) => r.data),

  addKycDocument: (customerId: number | string, payload: FormData | Record<string, any>) =>
    api.post(`/customers/${customerId}/kyc-documents`, payload).then((r) => r.data.data ?? r.data),

  addPricingContract: (customerId: number | string, payload: any) =>
    api.post(`/customers/${customerId}/pricing-contracts`, payload).then((r) => r.data.data ?? r.data),

  addSupportTicket: (customerId: number | string, payload: any) =>
    api.post(`/customers/${customerId}/support-tickets`, payload).then((r) => r.data.data ?? r.data),

  // Groups
  groups: (params: Record<string, any> = {}) =>
    api.get('/customer-groups', { params }).then((r) => r.data),

  getGroup: (id: number | string) =>
    api.get(`/customer-groups/${id}`).then((r) => r.data.data),

  createGroup: (payload: any) =>
    api.post('/customer-groups', payload).then((r) => r.data.data ?? r.data),

  updateGroup: (id: number | string, payload: any) =>
    api.put(`/customer-groups/${id}`, payload).then((r) => r.data.data ?? r.data),

  deleteGroup: (id: number | string) =>
    api.delete(`/customer-groups/${id}`).then((r) => r.data),

  bulkDeleteGroups: (ids: number[]) =>
    api.post('/customer-groups/bulk-delete', { ids }).then((r) => r.data),

  // Addresses
  addresses: (params: Record<string, any> = {}) =>
    api.get('/customer-addresses', { params }).then((r) => r.data),

  getCustomerAddresses: (customerId: number | string) =>
    api.get(`/customers/${customerId}/addresses`).then((r) => r.data.data),

  getAddress: (id: number | string) =>
    api.get(`/customer-addresses/${id}`).then((r) => r.data.data),

  createAddress: (payload: any) =>
    api.post('/customer-addresses', payload).then((r) => r.data.data ?? r.data),

  updateAddress: (id: number | string, payload: any) =>
    api.put(`/customer-addresses/${id}`, payload).then((r) => r.data.data ?? r.data),

  deleteAddress: (id: number | string) =>
    api.delete(`/customer-addresses/${id}`).then((r) => r.data),

  bulkDeleteAddresses: (ids: number[]) =>
    api.post('/customer-addresses/bulk-delete', { ids }).then((r) => r.data),
}

export default customerService
