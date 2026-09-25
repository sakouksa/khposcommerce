import api from '@/api/client'

export const brandService = {
  list: (params: Record<string, any> = {}) =>
    api.get('/brands', { params }).then(r => r.data),

  show: (id: number) =>
    api.get(`/brands/${id}`).then(r => r.data.data),

  create: (formData: FormData | Record<string, any>) =>
    api.post('/brands', formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }).then(r => r.data.data ?? r.data),

  update: (id: number, formData: FormData | Record<string, any>) =>
    api.post(`/brands/${id}`, formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }).then(r => r.data.data ?? r.data),

  delete: (id: number) =>
    api.delete(`/brands/${id}`).then(r => r.data),

  restore: (id: number) =>
    api.post(`/brands/${id}/restore`).then(r => r.data),

  forceDelete: (id: number) =>
    api.delete(`/brands/${id}/force`).then(r => r.data),

  bulkDelete: (ids: number[]) =>
    api.post('/brands/bulk-delete', { ids }).then(r => r.data),

  bulkRestore: (ids: number[]) =>
    api.post('/brands/bulk-restore', { ids }).then(r => r.data),

  import: (formData: FormData) =>
    api.post('/brands/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  export: () =>
    api.get('/brands/export', { responseType: 'blob' }),
}

export default brandService
