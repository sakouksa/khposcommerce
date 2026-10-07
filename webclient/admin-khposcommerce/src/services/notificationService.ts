import api from '@/api/client'
import type {
  NotificationItem,
  NotificationTemplateItem,
  NotificationSettings,
  NotificationFilters,
  NotificationStats,
  NotificationLogsResponse,
} from '@/pages/notifications/types/notification.types'

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export const notificationService = {
  // Notifications
  getNotifications: async (filters: NotificationFilters = {}): Promise<PaginatedResponse<NotificationItem>> => {
    const response = await api.get('/notifications', { params: filters })
    return response.data
  },

  getStats: async (): Promise<NotificationStats> => {
    const response = await api.get('/notifications/stats')
    return response.data.data
  },

  getUnread: async (limit = 10, options?: { silent?: boolean }): Promise<{ unread_count: number; data: NotificationItem[] }> => {
    const response = await api.get('/notifications/unread', { params: { limit }, ...(options?.silent ? { silent: true } : {}) } as any)
    return response.data
  },

  getNotificationById: async (id: number): Promise<NotificationItem> => {
    const response = await api.get(`/notifications/${id}`)
    return response.data.data
  },

  getNotificationLogs: async (id: number): Promise<NotificationLogsResponse> => {
    const response = await api.get(`/notifications/${id}/logs`)
    return response.data.data
  },

  duplicateNotification: async (id: number): Promise<NotificationItem> => {
    const response = await api.post(`/notifications/${id}/duplicate`)
    return response.data.data
  },

  createNotification: async (payload: Partial<NotificationItem> & { user_ids?: number[]; role?: string; permission?: string; template_code?: string; template_data?: Record<string, any>; channels?: string[] }): Promise<NotificationItem> => {
    const response = await api.post('/notifications', payload)
    return response.data.data
  },

  updateNotification: async (id: number, payload: Partial<NotificationItem>): Promise<NotificationItem> => {
    const response = await api.put(`/notifications/${id}`, payload)
    return response.data.data
  },

  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}`)
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/notifications/${id}/read`)
  },

  markAllAsRead: async (): Promise<number> => {
    const response = await api.put('/notifications/read-all')
    return response.data.data?.marked_count || 0
  },

  bulkAction: async (ids: number[], action: 'read' | 'archive' | 'delete'): Promise<number> => {
    const response = await api.post('/notifications/bulk', { ids, action })
    return response.data.data?.affected || 0
  },

  clearAll: async (): Promise<void> => {
    await api.delete('/notifications/clear')
  },

  // Templates
  getTemplates: async (params: { search?: string; type?: string; is_active?: boolean; page?: number; per_page?: number } = {}): Promise<PaginatedResponse<NotificationTemplateItem>> => {
    const response = await api.get('/notification-templates', { params })
    return response.data
  },

  getTemplateById: async (id: number): Promise<NotificationTemplateItem> => {
    const response = await api.get(`/notification-templates/${id}`)
    return response.data.data
  },

  createTemplate: async (payload: Partial<NotificationTemplateItem>): Promise<NotificationTemplateItem> => {
    const response = await api.post('/notification-templates', payload)
    return response.data.data
  },

  updateTemplate: async (id: number, payload: Partial<NotificationTemplateItem>): Promise<NotificationTemplateItem> => {
    const response = await api.put(`/notification-templates/${id}`, payload)
    return response.data.data
  },

  duplicateTemplate: async (id: number): Promise<NotificationTemplateItem> => {
    const response = await api.post(`/notification-templates/${id}/duplicate`)
    return response.data.data
  },

  toggleTemplateStatus: async (id: number): Promise<NotificationTemplateItem> => {
    const response = await api.put(`/notification-templates/${id}/toggle-status`)
    return response.data.data
  },

  deleteTemplate: async (id: number): Promise<void> => {
    await api.delete(`/notification-templates/${id}`)
  },

  // Settings
  getSettings: async (): Promise<NotificationSettings> => {
    const response = await api.get('/notification-settings')
    return response.data.data
  },

  updateSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    const response = await api.put('/notification-settings', settings)
    return response.data.data
  },

  testEmail: async (): Promise<{ message: string }> => {
    const response = await api.post('/notification-settings/test-email')
    return response.data
  },

  testTelegram: async (): Promise<{ message: string }> => {
    const response = await api.post('/notification-settings/test-telegram')
    return response.data
  },

  testSms: async (): Promise<{ message: string }> => {
    const response = await api.post('/notification-settings/test-sms')
    return response.data
  },

  testPush: async (): Promise<{ message: string }> => {
    const response = await api.post('/notification-settings/test-push')
    return response.data
  },

  testChannel: async (channel: string): Promise<{ message: string }> => {
    const response = await api.post('/notification-settings/test-channel', { channel })
    return response.data
  },

  exportNotifications: async (filters: NotificationFilters = {}): Promise<any> => {
    const response = await api.get('/notifications/export', { params: filters })
    return response.data
  },

  exportTemplates: async (): Promise<any> => {
    const response = await api.get('/notification-templates/export')
    return response.data
  },

  importTemplates: async (templates: Partial<NotificationTemplateItem>[]): Promise<any> => {
    const response = await api.post('/notification-templates/import', { templates })
    return response.data
  },
}

export default notificationService
