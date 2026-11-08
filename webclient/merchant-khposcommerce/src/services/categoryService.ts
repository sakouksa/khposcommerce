import api from '@/api/client'

export const categoryService = {
  list: (params: Record<string, any> = {}) =>
    api.get('/categories', { params }).then(r => r.data),

  show: (id: number) =>
    api.get(`/categories/${id}`).then(r => r.data.data),

  create: (formData: FormData | Record<string, any>) =>
    api.post('/categories', formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }).then(r => r.data.data ?? r.data),

  update: (id: number, formData: FormData | Record<string, any>) =>
    api.post(`/categories/${id}`, formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }).then(r => r.data.data ?? r.data),

  delete: (id: number) =>
    api.delete(`/categories/${id}`).then(r => r.data),

  restore: (id: number) =>
    api.post(`/categories/${id}/restore`).then(r => r.data),

  forceDelete: (id: number) =>
    api.delete(`/categories/${id}/force`).then(r => r.data),

  bulkDelete: (ids: number[]) =>
    api.post('/categories/bulk-delete', { ids }).then(r => r.data),

  bulkRestore: (ids: number[]) =>
    api.post('/categories/bulk-restore', { ids }).then(r => r.data),

  import: (formData: FormData) =>
    api.post('/categories/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  export: () =>
    api.get('/categories/export', { responseType: 'blob' }),
}

export default categoryService
