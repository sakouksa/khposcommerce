import api from '@/api/client'

export const unitService = {
  list: (params: Record<string, any> = {}) =>
    api.get('/units', { params }).then(r => r.data),

  show: (id: number | string) =>
    api.get(`/units/${id}`).then(r => r.data.data),

  create: (payload: any) =>
    api.post('/units', payload).then(r => r.data.data ?? r.data),

  update: (id: number | string, payload: any) =>
    api.put(`/units/${id}`, payload).then(r => r.data.data ?? r.data),

  delete: (id: number | string) =>
    api.delete(`/units/${id}`).then(r => r.data),

  restore: (id: number | string) =>
    api.post(`/units/${id}/restore`).then(r => r.data),

  forceDelete: (id: number | string) =>
    api.delete(`/units/${id}/force`).then(r => r.data),

  bulkDelete: (ids: (number | string)[]) =>
    api.post('/units/bulk-delete', { ids }).then(r => r.data),

  bulkRestore: (ids: (number | string)[]) =>
    api.post('/units/bulk-restore', { ids }).then(r => r.data),

  import: (formData: FormData) =>
    api.post('/units/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  export: () =>
    api.get('/units/export', { responseType: 'blob' }),
}

export default unitService
