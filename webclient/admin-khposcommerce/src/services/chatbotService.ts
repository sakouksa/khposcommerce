import api from '@/api/client'

export const chatbotService = {
  getDashboard: () =>
    api.get('/admin/chatbot/dashboard').then((r) => r.data),

  getSessions: (params: Record<string, any> = {}) =>
    api.get('/admin/chatbot/sessions', { params }).then((r) => r.data),

  getSessionDetail: (id: number | string) =>
    api.get(`/admin/chatbot/sessions/${id}`).then((r) => r.data),

  getSupportRequests: () =>
    api.get('/admin/chatbot/support-requests').then((r) => r.data),

  updateSupportStatus: (id: number | string, status: string) =>
    api.put(`/admin/chatbot/support-requests/${id}`, { status }).then((r) => r.data),

  getTelegramUsers: () =>
    api.get('/admin/chatbot/telegram-users').then((r) => r.data),

  sendTestNotification: (type: string) =>
    api.post('/admin/chatbot/test-notification', { type }).then((r) => r.data),
}

export default chatbotService
