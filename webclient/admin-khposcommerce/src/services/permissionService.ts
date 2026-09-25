import api from '@/api/client'

export interface PermissionListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: any
}

export const permissionService = {
  list: (params: PermissionListParams = {}) =>
    api.get('/permissions', { params }).then((r) => r.data),

  show: (id: number | string) =>
    api.get(`/permissions/${id}`).then((r) => r.data.data ?? r.data),

  create: (payload: Record<string, any>) =>
    api.post('/permissions', payload).then((r) => r.data.data ?? r.data),

  update: (id: number | string, payload: Record<string, any>) =>
    api.put(`/permissions/${id}`, payload).then((r) => r.data.data ?? r.data),

  delete: (id: number | string) =>
    api.delete(`/permissions/${id}`).then((r) => r.data),

  getStats: () =>
    api.get('/permissions/stats').then((r) => r.data.data ?? r.data),
}

export default permissionService
