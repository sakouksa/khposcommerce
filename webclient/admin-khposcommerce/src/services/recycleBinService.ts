import api from '@/api/client'

export const recycleBinService = {
  getStats: () =>
    api.get('/recycle-bin/stats').then(r => r.data.data ?? r.data),

  getItems: (resource: string, params: Record<string, any> = {}) =>
    api.get(`/${resource}`, { params }).then(r => r.data),

  getDeletedItems: (resource: string, params: Record<string, any> = {}) =>
    recycleBinService.getItems(resource, params),

  restoreItem: (resource: string, id: number) =>
    api.post(`/${resource}/${id}/restore`).then(r => r.data),

  forceDeleteItem: (resource: string, id: number) =>
    api.delete(`/${resource}/${id}/force`).then(r => r.data),

  bulkRestoreItems: (resource: string, ids: number[]) =>
    Promise.all(ids.map(id => api.post(`/${resource}/${id}/restore`))),

  bulkRestore: (resource: string, ids: number[]) =>
    recycleBinService.bulkRestoreItems(resource, ids),

  bulkForceDeleteItems: (resource: string, ids: number[]) =>
    Promise.all(ids.map(id => api.delete(`/${resource}/${id}/force`))),

  bulkForceDelete: (resource: string, ids: number[]) =>
    recycleBinService.bulkForceDeleteItems(resource, ids),
}

export default recycleBinService
