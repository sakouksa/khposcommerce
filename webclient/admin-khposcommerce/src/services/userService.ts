import api from '@/api/client'

export interface UserListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  role?: string
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: any
}

export const userService = {
  list: (params: UserListParams = {}) =>
    api.get('/users', { params }).then((r) => r.data),

  show: (id: number | string) =>
    api.get(`/users/${id}`).then((r) => r.data.data ?? r.data),

  create: (payload: Record<string, any>) =>
    api.post('/users', payload).then((r) => r.data.data ?? r.data),

  update: (id: number | string, payload: Record<string, any>) =>
    api.put(`/users/${id}`, payload).then((r) => r.data.data ?? r.data),

  delete: (id: number | string) =>
    api.delete(`/users/${id}`).then((r) => r.data),

  getStats: () =>
    api.get('/users/stats').then((r) => r.data.data ?? r.data),

  getRoles: (params?: any) =>
    api.get('/roles', { params }).then((r) => r.data.data ?? r.data ?? []),

  uploadAvatar: (formData: FormData) =>
    api.post('/users/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  resetPassword: (id: number | string, payload: Record<string, any>) =>
    api.post(`/users/${id}/reset-password`, payload).then((r) => r.data),

  updatePassword: (id: number | string, password: string) =>
    api.put(`/users/${id}`, { password }).then((r) => r.data),

  updatePermissions: (id: number | string, permissions: (number | string)[]) =>
    api.post(`/users/${id}/permissions`, { permissions }).then((r) => r.data),
}

export default userService
