import api from '@/api/client'

export interface LoginPayload {
  username?: string
  email?: string
  password: string
  remember?: boolean
  device_id?: string
  device_name?: string
  device_type?: string
  browser?: string
  ip?: string
  user_agent?: string
}

export interface ForgotPasswordPayload {
  identifier: string
}

export interface ResetPasswordPayload {
  identifier: string
  reset_token: string
  password: string
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post('/auth/login', payload),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me').then((r) => r.data),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post('/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    api.post('/auth/reset-password', payload),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),
}

export default authService
