import api from '@/api/client'

export interface RoleListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: any
}

export const roleService = {
  list: (params: RoleListParams = {}) =>
    api.get('/roles', { params }).then((r) => r.data),

  show: (id: number | string) =>
    api.get(`/roles/${id}`).then((r) => r.data.data ?? r.data),

  create: (payload: Record<string, any>) =>
    api.post('/roles', payload).then((r) => r.data.data ?? r.data),

  update: (id: number | string, payload: Record<string, any>) =>
    api.put(`/roles/${id}`, payload).then((r) => r.data.data ?? r.data),

  delete: (id: number | string) =>
    api.delete(`/roles/${id}`).then((r) => r.data),

  getStats: () =>
    api.get('/roles/stats').then((r) => r.data.data ?? r.data),

  permissions: (params: Record<string, any> = {}) =>
    api.get('/permissions', { params }).then((r) => r.data),

  assignPermissions: (roleId: number | string, permissions: (number | string)[]) =>
    api.post(`/roles/${roleId}/permissions`, { permissions }).then((r) => r.data),
}

export default roleService
