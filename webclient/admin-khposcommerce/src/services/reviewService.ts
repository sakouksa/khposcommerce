import api from '@/api/client'

export const reviewService = {
  getReviews: (params: Record<string, any> = {}) =>
    api.get('/reviews', { params }).then(r => r.data),

  getReview: (id: number) =>
    api.get(`/reviews/${id}`).then(r => r.data.data),

  approveReview: (id: number) =>
    api.post(`/reviews/${id}/approve`).then(r => r.data),

  rejectReview: (id: number) =>
    api.post(`/reviews/${id}/reject`).then(r => r.data),

  deleteReview: (id: number) =>
    api.delete(`/reviews/${id}`).then(r => r.data),
}

export default reviewService
