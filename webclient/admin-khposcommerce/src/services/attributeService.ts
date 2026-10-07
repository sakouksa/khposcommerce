import api from '@/api/client'

export const attributeService = {
  list: (params: Record<string, any> = {}) =>
    api.get('/attributes', { params }).then(r => r.data),

  show: (id: number) =>
    api.get(`/attributes/${id}`).then(r => r.data.data),

  create: (payload: any) =>
    api.post('/attributes', payload).then(r => r.data.data),

  update: (id: number, payload: any) =>
    api.put(`/attributes/${id}`, payload).then(r => r.data.data),

  delete: (id: number) =>
    api.delete(`/attributes/${id}`).then(r => r.data),

  restore: (id: number) =>
    api.post(`/attributes/${id}/restore`).then(r => r.data),

  forceDelete: (id: number) =>
    api.delete(`/attributes/${id}/force`).then(r => r.data),

  bulkDelete: (ids: number[]) =>
    api.post('/attributes/bulk-delete', { ids }).then(r => r.data),

  bulkRestore: (ids: number[]) =>
    api.post('/attributes/bulk-restore', { ids }).then(r => r.data),

  import: (formData: FormData) =>
    api.post('/attributes/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  export: () =>
    api.get('/attributes/export', { responseType: 'blob' }),
}

export default attributeService
