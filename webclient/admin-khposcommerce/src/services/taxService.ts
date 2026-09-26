import api from '@/api/client'

export const taxService = {
  list: (params: Record<string, any> = {}) =>
    api.get('/taxes', { params }).then(r => r.data),

  show: (id: number | string) =>
    api.get(`/taxes/${id}`).then(r => r.data.data),

  create: (payload: any) =>
    api.post('/taxes', payload).then(r => r.data.data ?? r.data),

  update: (id: number | string, payload: any) =>
    api.put(`/taxes/${id}`, payload).then(r => r.data.data ?? r.data),

  delete: (id: number | string) =>
    api.delete(`/taxes/${id}`).then(r => r.data),

  restore: (id: number | string) =>
    api.post(`/taxes/${id}/restore`).then(r => r.data),

  forceDelete: (id: number | string) =>
    api.delete(`/taxes/${id}/force`).then(r => r.data),

  bulkDelete: (ids: (number | string)[]) =>
    api.post('/taxes/bulk-delete', { ids }).then(r => r.data),

  bulkRestore: (ids: (number | string)[]) =>
    api.post('/taxes/bulk-restore', { ids }).then(r => r.data),

  import: (formData: FormData) =>
    api.post('/taxes/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  export: () =>
    api.get('/taxes/export', { responseType: 'blob' }),
}

export default taxService
