import { create } from 'zustand'
import type { NotificationItem, NotificationFilters } from '@/pages/notifications/types/notification.types'
import notificationService from '@/services/notificationService'
import { sound } from '@/utils/sound'


interface NotificationState {
  notifications: NotificationItem[]
  unreadCount: number
  isLoading: boolean
  total: number
  currentPage: number
  lastPage: number
  filters: NotificationFilters
  
  // Actions
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  bulkAction: (ids: number[], action: 'read' | 'archive' | 'delete') => Promise<void>
  clearAll: () => Promise<void>
  setFilters: (newFilters: Partial<NotificationFilters>) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  total: 0,
  currentPage: 1,
  lastPage: 1,
  filters: {
    tab: 'all',
    page: 1,
    per_page: 15,
  },

  fetchNotifications: async (overrideFilters) => {
    set({ isLoading: true })
    try {
      const activeFilters = { ...get().filters, ...overrideFilters }
      const res = await notificationService.getNotifications(activeFilters)
      set({
        notifications: res.data || [],
        currentPage: res.current_page || 1,
        lastPage: res.last_page || 1,
        total: res.total || 0,
        isLoading: false,
      })
      // Sync unread count
      get().fetchUnreadCount()
    } catch (error) {
      set({ isLoading: false })
      console.error('Failed to fetch notifications:', error)
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await notificationService.getUnread(10, { silent: true })
      const prevCount = get().unreadCount
      const newCount = res?.unread_count || 0
      
      // Play sound alert if new unread notification received
      if (newCount > prevCount && prevCount >= 0) {
        sound.playNotification()
      }

      set({ unreadCount: newCount })
    } catch (error: any) {
      if (error?.code === 'ERR_NETWORK' || !error?.response) {
        console.warn('Failed to fetch unread count: Backend server unavailable or network disconnected.')
      } else {
        console.error('Failed to fetch unread count:', error?.message || error)
      }
    }
  },

  markAsRead: async (id: number) => {
    try {
      await notificationService.markAsRead(id)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead()
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        })),
        unreadCount: 0,
      }))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  },

  bulkAction: async (ids: number[], action: 'read' | 'archive' | 'delete') => {
    try {
      await notificationService.bulkAction(ids, action)
      get().fetchNotifications()
    } catch (error) {
      console.error(`Failed to execute bulk ${action}:`, error)
    }
  },

  clearAll: async () => {
    try {
      await notificationService.clearAll()
      set({ notifications: [], unreadCount: 0, total: 0 })
    } catch (error) {
      console.error('Failed to clear notifications:', error)
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
    get().fetchNotifications()
  },
}))
