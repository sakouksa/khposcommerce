import api from '@/api/client'

export const securityService = {
  getOverview: () =>
    api.get('/security/overview').then((r) => r.data),

  getDevices: () =>
    api.get('/devices').then((r) => r.data),

  revokeDevice: (id: number | string) =>
    api.post(`/devices/${id}/revoke`).then((r) => r.data),

  revokeAllOtherDevices: () =>
    api.post('/devices/revoke-others').then((r) => r.data),

  verifyManagerPin: (payload: {
    pin: string
    manager_username?: string
    action: string
    notes?: string
    payload?: any
  }) => api.post('/security/verify-manager-pin', payload).then((r) => r.data),

  getSettings: () =>
    api.get('/security/settings').then((r) => r.data),

  updateSettings: (settings: Record<string, any>) =>
    api.put('/security/settings', settings).then((r) => r.data),

  setManagerPin: (payload: {
    current_password?: string
    pin: string
    pin_confirmation: string
  }) => api.post('/security/set-manager-pin', payload).then((r) => r.data),
}

export default securityService
