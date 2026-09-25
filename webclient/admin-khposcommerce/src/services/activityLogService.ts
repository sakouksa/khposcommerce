import api from '@/api/client'

export interface ActivityLogUser {
  id: number
  name: string
  email: string
  avatar?: string | null
}

export interface ActivityLog {
  id: number
  log_name: string
  description: string
  subject_type?: string | null
  subject_id?: number | string | null
  causer_type?: string | null
  causer_id?: number | string | null
  properties?: {
    ip?: string
    user_agent?: string
    old?: Record<string, any>
    attributes?: Record<string, any>
    [key: string]: any
  } | null
  batch_uuid?: string | null
  event?: 'created' | 'updated' | 'deleted' | 'restored' | 'login' | 'logout' | string | null
  created_at: string
  updated_at?: string
  causer?: ActivityLogUser | null
  subject?: any
}

export interface ActivityLogDashboardStats {
  totalActivities: number
  successActions: number
  failedActions: number
  todayActivities: number
  activeUsers: number
  averageActionsPerUser: number
  loginSessions: number
  loginAttempts: number
  failedLogin: number
  securityAlerts: number
  apiActions: number
  databaseChanges: number
  fileOperations: number
  averageResponseTime: number
  todayLogin: number
  newUsers: number
  passwordChanges: number
  permissionChanges: number
  dataExport: number
  dataImport: number
}

export interface ActivityLogsFilterParams {
  page?: number
  per_page?: number
  search?: string
  causer_type?: string
  log_name?: string
  date_from?: string
  date_to?: string
}

export const activityLogService = {
  getLogs: async (params?: ActivityLogsFilterParams) => {
    const res = await api.get('/activity-logs', { params })
    return res.data
  },

  getLogById: async (id: number | string): Promise<ActivityLog> => {
    const res = await api.get(`/activity-logs/${id}`)
    return res.data.data
  },

  deleteLog: async (id: number | string) => {
    const res = await api.delete(`/activity-logs/${id}`)
    return res.data
  },

  getDashboardStats: async (): Promise<ActivityLogDashboardStats> => {
    const res = await api.get('/activity-logs/dashboard')
    return res.data.data
  },
}

export default activityLogService
