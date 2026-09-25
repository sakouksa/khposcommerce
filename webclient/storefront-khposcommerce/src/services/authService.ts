import api from '@/api'

export const authService = {
  /**
   * Customer Login
   */
  async login(credentials: { email: string; password: string }): Promise<any> {
    const res = await api.post('/auth/login', credentials)
    return res.data || {}
  },

  /**
   * Customer Login with Google
   */
  async loginWithGoogle(payload: {
    email: string
    name: string
    avatar?: string
    google_id?: string
    access_token?: string
    credential?: string
  }): Promise<any> {
    const res = await api.post('/auth/google', payload)
    return res.data || {}
  },

  /**
   * Customer Registration
   */
  async register(data: any): Promise<any> {
    const res = await api.post('/auth/register', data)
    return res.data || {}
  },

  /**
   * Customer Logout
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore
    }
  },

  /**
   * Get Current Customer Profile
   */
  async getProfile(): Promise<any> {
    const res = await api.get('/auth/me')
    return res.data?.data || null
  },
}

export default authService
