import api from '@/api/client'

export const settingsService = {
  getSettings: () =>
    api.get('/settings').then(r => r.data.data ?? r.data),

  list: () =>
    api.get('/settings').then(r => r.data.data ?? r.data),

  updateSettings: (payload: any) =>
    api.post('/settings', payload).then(r => r.data.data ?? r.data),

  uploadLogo: (formData: FormData) =>
    api.post('/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  deleteLogo: (params: { type?: string }) =>
    api.delete('/settings/logo', { params }).then(r => r.data),

  // Dynamic setting path CRUD
  getItems: (path: string, params: Record<string, any> = {}) =>
    api.get(path.startsWith('/') ? path : `/${path}`, { params }).then(r => r.data),

  createItem: (path: string, payload: any) =>
    api.post(path.startsWith('/') ? path : `/${path}`, payload).then(r => r.data.data ?? r.data),

  updateItem: (path: string, id: number | string, payload: any) =>
    api.put(`${path.startsWith('/') ? path : `/${path}`}/${id}`, payload).then(r => r.data.data ?? r.data),

  deleteItem: (path: string, id: number | string) =>
    api.delete(`${path.startsWith('/') ? path : `/${path}`}/${id}`).then(r => r.data),

  bulkDeleteItems: (path: string, ids: (number | string)[]) =>
    api.post(`${path.startsWith('/') ? path : `/${path}`}/bulk-delete`, { ids }).then(r => r.data),
}

export default settingsService
