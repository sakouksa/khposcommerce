import api from '@/api/client'

export interface UserProfile {
  id: number
  name: string
  email: string
  phone: string | null
  avatar: string | null
  gender: string | null
  date_of_birth: string | null
  address: string | null
  country: string | null
  province: string | null
  city: string | null
  timezone: string
  language: string
  email_notify?: boolean
  push_notify?: boolean
  sms_notify?: boolean
  is_active: boolean
  last_login_at: string | null
  created_at: string
  roles?: string[]
  permissions?: string[]
  company?: {
    id: number
    name: string
    logo: string | null
    address: string | null
    phone?: string | null
    email?: string | null
    website?: string | null
    tax_number?: string | null
    city: string | null
    province: string | null
    country: string | null
  } | null
  branch?: {
    id: number
    name: string
    address: string | null
  } | null
  employee?: {
    id: number
    code: string
    position: string | null
    department: string | null
  } | null
}

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    const res = await api.get('/profile')
    return res.data.data
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await api.put('/profile', data)
    return res.data.data
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data.data.avatar_url
  },

  removeAvatar: async (): Promise<void> => {
    await api.delete('/profile/avatar')
  },

  changePassword: async (data: any): Promise<void> => {
    await api.post('/profile/change-password', data)
  },

  getPermissions: async (): Promise<any> => {
    const res = await api.get('/profile/permissions')
    return res.data
  },

  getActivityLogs: async (params?: { page?: number; per_page?: number; search?: string }): Promise<any> => {
    const res = await api.get('/profile/activity-logs', { params })
    return res.data
  },

  getLoginHistory: async (params?: { page?: number; per_page?: number; search?: string }): Promise<any> => {
    const res = await api.get('/profile/login-history', { params })
    return res.data
  },

  logoutOtherDevices: async (): Promise<void> => {
    await api.post('/profile/logout-devices')
  },
}

export default profileService
