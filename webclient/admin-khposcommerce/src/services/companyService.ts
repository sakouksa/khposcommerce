import api from '@/api/client'

export const companyService = {
  // Companies
  getCompanies: (params: Record<string, any> = {}) =>
    api.get('/companies', { params }).then(r => r.data),

  getCompany: (id: number) =>
    api.get(`/companies/${id}`).then(r => r.data.data),

  createCompany: (payload: any) =>
    api.post('/companies', payload).then(r => r.data.data),

  updateCompany: (id: number, payload: any) =>
    api.put(`/companies/${id}`, payload).then(r => r.data.data),

  deleteCompany: (id: number) =>
    api.delete(`/companies/${id}`).then(r => r.data),

  // Branches
  getBranches: (params: Record<string, any> = {}) =>
    api.get('/branches', { params }).then(r => r.data),

  getBranch: (id: number) =>
    api.get(`/branches/${id}`).then(r => r.data.data),

  createBranch: (payload: any) =>
    api.post('/branches', payload).then(r => r.data.data),

  updateBranch: (id: number, payload: any) =>
    api.put(`/branches/${id}`, payload).then(r => r.data.data),

  deleteBranch: (id: number) =>
    api.delete(`/branches/${id}`).then(r => r.data),

  // Stores
  getStores: (params: Record<string, any> = {}) =>
    api.get('/stores', { params }).then(r => r.data),

  getStore: (id: number) =>
    api.get(`/stores/${id}`).then(r => r.data.data),

  createStore: (payload: any) =>
    api.post('/stores', payload).then(r => r.data.data),

  updateStore: (id: number, payload: any) =>
    api.put(`/stores/${id}`, payload).then(r => r.data.data),

  deleteStore: (id: number) =>
    api.delete(`/stores/${id}`).then(r => r.data),

  // Warehouses
  getWarehouses: (params: Record<string, any> = {}) =>
    api.get('/warehouses', { params }).then(r => r.data),

  getWarehouse: (id: number) =>
    api.get(`/warehouses/${id}`).then(r => r.data.data),

  createWarehouse: (payload: any) =>
    api.post('/warehouses', payload).then(r => r.data.data),

  updateWarehouse: (id: number, payload: any) =>
    api.put(`/warehouses/${id}`, payload).then(r => r.data.data),

  deleteWarehouse: (id: number) =>
    api.delete(`/warehouses/${id}`).then(r => r.data),

  // Generic dynamic tab handler (for unified CompanyPage)
  getItemsByTab: (tab: string, params: Record<string, any> = {}) =>
    api.get(`/${tab}`, { params }).then(r => r.data),

  createItemByTab: (tab: string, payload: any) =>
    api.post(`/${tab}`, payload).then(r => r.data.data),

  updateItemByTab: (tab: string, id: number, payload: any) =>
    api.put(`/${tab}/${id}`, payload).then(r => r.data.data),

  deleteItemByTab: (tab: string, id: number) =>
    api.delete(`/${tab}/${id}`).then(r => r.data),
}

export default companyService
