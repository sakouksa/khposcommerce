import axios, { type AxiosRequestConfig } from 'axios'
import { toast } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'
import i18n, { translateString } from '@/lib/i18n'

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  if (import.meta.env.DEV) {
    return '/api/v1'
  }
  if (import.meta.env.PROD) {
    return 'https://enterprise-pos-api.onrender.com/api/v1'
  }
  const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1'
  return `http://${hostname}:8001/api/v1`
}

export const API_BASE_URL = getBaseURL()

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
  timeout: 30000,
})

// ─── Bilingual Error Translation Dictionary (en / km) ──────────────────────
type Lang = 'en' | 'km'

const getActiveLang = (): Lang => {
  if (typeof window === 'undefined') return 'en'
  const langFromI18n = i18n?.language
  if (langFromI18n === 'km' || langFromI18n === 'en') {
    return langFromI18n
  }
  const l = localStorage.getItem('enterprise-pos-lang')
  if (l === 'km' || l === 'en') return l as Lang
  return 'en'
}

const ERROR_TRANSLATIONS: Record<string, Record<Lang, { title: string; message: string }>> = {
  offline: {
    en: { title: 'No Internet Connection', message: 'Please check your network connection and try again.' },
    km: { title: 'គ្មានការតភ្ជាប់អ៊ីនធឺណិត', message: 'សូមពិនិត្យមើលការតភ្ជាប់បណ្តាញរបស់អ្នក រួចព្យាយាមម្តងទៀត។' },
  },
  timeout: {
    en: { title: 'Request Timeout', message: 'The server took too long to respond. Please try again.' },
    km: { title: 'សំណើលើសកំណត់ពេល', message: 'ម៉ាស៊ីនបម្រើចំណាយពេលយូរពេកក្នុងការឆ្លើយតប។ សូមព្យាយាមម្តងទៀត។' },
  },
  server_connect: {
    en: { title: 'Server Connection Error', message: 'Unable to connect to backend system server.' },
    km: { title: 'កំហុសតភ្ជាប់ម៉ាស៊ីនបម្រើ', message: 'មិនអាចតភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើបានទេ។ សូមផ្ទៀងផ្ទាត់ស្ថានភាពប្រព័ន្ធ។' },
  },
  session_expired: {
    en: { title: 'Session Expired', message: 'Your session has expired. Please sign in again.' },
    km: { title: 'ផុតកំណត់សម័យការ', message: 'សម័យការរបស់អ្នកបានផុតកំណត់ហើយ។ សូមចូលប្រើប្រព័ន្ធម្តងទៀត។' },
  },
  forbidden: {
    en: { title: 'Access Restricted', message: 'You do not have permission to perform this action or view this resource.' },
    km: { title: 'គ្មានសិទ្ធិចូលប្រើ', message: 'អ្នកមិនមានសិទ្ធិអនុញ្ញាតដើម្បីធ្វើសកម្មភាពនេះ ឬមើលទិន្នន័យនេះទេ។' },
  },
  too_many_requests: {
    en: { title: 'Too Many Requests', message: 'Too many requests sent in a short time. Please wait a moment.' },
    km: { title: 'សំណើច្រើនហួសកំណត់', message: 'អ្នកបានផ្ញើសំណើច្រើនដងពេក។ សូមរង់ចាំបន្តិចសិន។' },
  },
  server_error: {
    en: { title: 'Server Error', message: 'Unexpected server error encountered. Please try again.' },
    km: { title: 'កំហុសប្រព័ន្ធម៉ាស៊ីនបម្រើ', message: 'បានជួបប្រទះបញ្ហាម៉ាស៊ីនបម្រើដែលមិនរំពឹងទុក។ សូមព្យាយាមម្តងទៀត។' },
  },
  maintenance: {
    en: { title: 'System Maintenance', message: 'The system is currently undergoing scheduled maintenance.' },
    km: { title: 'ប្រព័ន្ធកំពុងថែទាំ', message: 'ប្រព័ន្ធកំពុងស្ថិតក្រោមការថែទាំតាមការកំណត់។' },
  },
  validation_error: {
    en: { title: 'Validation Error', message: 'Please review the highlighted fields and correct the errors.' },
    km: { title: 'ទិន្នន័យមិនត្រឹមត្រូវ', message: 'សូមពិនិត្យមើលទិន្នន័យក្នុងប្រអប់ដែលបានកំណត់ រួចកែតម្រូវឡើងវិញ។' },
  },
}

/**
 * Resolves error title and description from local errors.json (en / km) with graceful fallback
 */
const getErrorItem = (key: keyof typeof ERROR_TRANSLATIONS): { title: string; message: string } => {
  const lang = getActiveLang()
  const fallback = ERROR_TRANSLATIONS[key]?.[lang] || ERROR_TRANSLATIONS[key]?.en || {
    title: 'Server Error',
    message: 'Unexpected server error encountered. Please try again.',
  }

  const i18nKeyMap: Record<string, { title: string; desc: string }> = {
    offline: { title: 'errors.networkErrorTitle', desc: 'errors.networkErrorDesc' },
    timeout: { title: 'errors.timeoutTitle', desc: 'errors.timeoutDesc' },
    server_connect: { title: 'errors.serverConnectTitle', desc: 'errors.serverConnectDesc' },
    session_expired: { title: 'errors.sessionExpiredTitle', desc: 'errors.sessionExpiredDesc' },
    forbidden: { title: 'errors.accessDeniedTitle', desc: 'errors.accessDeniedDesc' },
    too_many_requests: { title: 'errors.tooManyRequestsTitle', desc: 'errors.tooManyRequestsDesc' },
    server_error: { title: 'errors.serverErrorTitle', desc: 'errors.serverErrorDesc' },
    maintenance: { title: 'errors.maintenanceTitle', desc: 'errors.maintenanceDesc' },
    validation_error: { title: 'errors.validationErrorTitle', desc: 'errors.validationErrorDesc' },
  }

  const mapping = i18nKeyMap[key]
  if (mapping && i18n?.isInitialized) {
    const tTitle = i18n.t(mapping.title, { defaultValue: fallback.title })
    const tMessage = i18n.t(mapping.desc, { defaultValue: fallback.message })
    return { title: tTitle, message: tMessage }
  }

  return fallback
}

// Global debouncing mechanism
const recentNotifications = new Map<string, number>()
const DEBOUNCE_WINDOW_MS = 2500

function notifyOnce(
  key: string,
  type: 'error' | 'warning' | 'info' | 'success',
  title: string,
  message: string,
  code?: string | number,
  details?: any
) {
  const now = Date.now()
  const lastTime = recentNotifications.get(key) || 0
  if (now - lastTime < DEBOUNCE_WINDOW_MS) {
    return
  }
  recentNotifications.set(key, now)

  toast.custom({
    type,
    title: translateString(title),
    message: translateString(message),
    code,
    details,
    duration: 5000,
  })
}

// Keep track of ongoing refresh to prevent duplicate refresh calls
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Helper to get or generate persistent device id
export const getDeviceId = (): string => {
  if (typeof window === 'undefined') return 'server'
  let id = localStorage.getItem('enterprise_pos_device_id')
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36)
    localStorage.setItem('enterprise_pos_device_id', id)
  }
  return id
}

export const getDeviceInfo = () => {
  if (typeof window === 'undefined') {
    return { name: 'Server', type: 'web', os: 'Unknown', browser: 'Unknown' }
  }
  const ua = navigator.userAgent
  let os = 'Unknown OS'
  if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Win')) os = 'Windows'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

  let browser = 'Chrome'
  if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
  else if (ua.includes('Edg')) browser = 'Edge'

  const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua)
  return {
    name: `${browser} on ${os}`,
    type: isMobile ? (ua.includes('iPad') ? 'tablet' : 'mobile') : 'web',
    os,
    browser
  }
}

// ─── Request Interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const lang = getActiveLang()
    config.headers['Accept-Language'] = lang
    config.headers['X-Locale'] = lang

    // Device telemetry headers for enterprise session binding
    const deviceId = getDeviceId()
    const info = getDeviceInfo()
    config.headers['X-Device-Id'] = deviceId
    config.headers['X-Device-Name'] = info.name
    config.headers['X-Device-Type'] = info.type
    config.headers['X-OS-Name'] = info.os
    config.headers['X-Browser-Name'] = info.browser

    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ──────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.error_code) {
      const code = response.data.error_code
      const msg = response.data.message || 'An error occurred'

      if (code === 'DATABASE_OFFLINE') {
        const item = getErrorItem('server_connect')
        notifyOnce('db_offline', 'error', item.title, item.message, 'DB_OFFLINE')
      } else if (code === 'DATABASE_TIMEOUT') {
        const item = getErrorItem('timeout')
        notifyOnce('db_timeout', 'warning', item.title, item.message, 'TIMEOUT')
      } else if (code === 'SCHEMA_MISMATCH') {
        notifyOnce('schema_mismatch', 'warning', 'Schema Mismatch', msg, 'MIGRATION_REQUIRED')
      }
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Handle Network / Connection Errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        const item = getErrorItem('timeout')
        notifyOnce('network_timeout', 'error', item.title, item.message, 'TIMEOUT')
      } else if (!navigator.onLine) {
        const item = getErrorItem('offline')
        notifyOnce('network_offline', 'error', item.title, item.message, 'OFFLINE')
      } else {
        const item = getErrorItem('server_connect')
        notifyOnce('server_connect', 'error', item.title, item.message, 'ERR_CONNECT')
      }
      return Promise.reject(error)
    }

    const status = error.response.status

    // Handle 401 Unauthorized with token refresh flow
    if (status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        useAuthStore.getState().logout()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
              Accept: 'application/json',
            },
          }
        )

        const { access_token } = res.data.data
        if (access_token) {
          useAuthStore.getState().setTokens(access_token)
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`
          }
        }

        processQueue(null, access_token)
        isRefreshing = false

        return api(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        isRefreshing = false
        useAuthStore.getState().logout()

        const item = getErrorItem('session_expired')
        notifyOnce('session', 'error', item.title, item.message, 401)

        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshErr)
      }
    }

    // Handle 403 Forbidden with debounced notification
    if (status === 403) {
      const item = getErrorItem('forbidden')
      const serverMsg = error.response?.data?.message || item.message
      notifyOnce('403', 'warning', item.title, serverMsg, 403, {
        endpoint: originalRequest.url,
        method: originalRequest.method?.toUpperCase(),
      })
    }

    // Handle 422 Validation Errors
    if (status === 422) {
      const item = getErrorItem('validation_error')
      const rawErrors = error.response?.data?.errors
      const serverMsg = error.response?.data?.message || item.message
      let detailsText: string | undefined = undefined
      if (rawErrors && typeof rawErrors === 'object') {
        detailsText = Object.entries(rawErrors)
          .map(([field, msgs]) => `• ${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n')
      }
      notifyOnce('422', 'warning', item.title, serverMsg, 422, detailsText || rawErrors)
    }

    // Handle 429 Too Many Requests
    if (status === 429) {
      const item = getErrorItem('too_many_requests')
      notifyOnce('429', 'warning', item.title, item.message, 429)
    }

    // Handle 5xx Server Error
    if (status >= 500) {
      if (status === 503) {
        const item = getErrorItem('maintenance')
        notifyOnce('503', 'info', item.title, item.message, 503)
      } else {
        const item = getErrorItem('server_error')
        const rawServerMsg = error.response?.data?.message
        const isGenericMsg = !rawServerMsg || rawServerMsg === 'Server Error' || rawServerMsg.includes('Unexpected server error')
        const displayMsg = isGenericMsg ? item.message : translateString(rawServerMsg)

        const debugInfo = {
          endpoint: originalRequest.url,
          method: originalRequest.method?.toUpperCase(),
          status: status,
          statusText: error.response?.statusText,
          serverMessage: rawServerMsg,
          timestamp: new Date().toISOString(),
        }

        notifyOnce('500', 'error', item.title, displayMsg, status, debugInfo)
      }
    }

    return Promise.reject(error)
  }
)

export default api
