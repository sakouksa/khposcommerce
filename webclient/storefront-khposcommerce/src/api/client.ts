import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import i18n from '@/lib/i18n'

const getBaseURL = (): string => {
  if (import.meta.env.VITE_STORE_API_URL) {
    return import.meta.env.VITE_STORE_API_URL
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return `${import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')}/store`
  }
  if (import.meta.env.DEV) {
    return '/api/v1/store'
  }
  if (import.meta.env.PROD) {
    return 'https://enterprise-pos-api.onrender.com/api/v1/store'
  }
  const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1'
  return `http://${hostname}:8001/api/v1/store`
}

export const API_BASE_URL = getBaseURL()

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ─── Multi-Language Error Translation Dictionary ────────────────────────────
type Lang = 'en' | 'km' | 'th' | 'vi' | 'zh'

const getActiveLang = (): Lang => {
  if (typeof window === 'undefined') return 'en'
  const langFromI18n = i18n?.language as Lang
  if (langFromI18n === 'km' || langFromI18n === 'th' || langFromI18n === 'vi' || langFromI18n === 'zh' || langFromI18n === 'en') {
    return langFromI18n
  }
  const l = localStorage.getItem('language') as Lang
  if (l === 'km' || l === 'th' || l === 'vi' || l === 'zh' || l === 'en') return l
  return 'en'
}

export const ERROR_TRANSLATIONS: Record<string, Record<Lang, { title: string; message: string }>> = {
  offline: {
    en: { title: 'No Internet Connection', message: 'Please check your network connection and try again.' },
    km: { title: 'គ្មានការតភ្ជាប់អ៊ីនធឺណិត', message: 'សូមពិនិត្យមើលការតភ្ជាប់បណ្តាញរបស់អ្នក រួចព្យាយាមម្តងទៀត។' },
    th: { title: 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต', message: 'กรุณาตรวจสอบการเชื่อมต่อเครือข่ายของคุณแล้วลองใหม่อีกครั้ง' },
    vi: { title: 'Không có kết nối mạng', message: 'Vui lòng kiểm tra lại kết nối mạng và thử lại.' },
    zh: { title: '无网络连接', message: '请检查您的网络连接并重试。' },
  },
  timeout: {
    en: { title: 'Request Timeout', message: 'The server took too long to respond. Please try again.' },
    km: { title: 'សំណើលើសកំណត់ពេល', message: 'ម៉ាស៊ីនបម្រើចំណាយពេលយូរពេកក្នុងការឆ្លើយតប។ សូមព្យាយាមម្តងទៀត។' },
    th: { title: 'หมดเวลาการเชื่อมต่อ', message: 'เซิร์ฟเวอร์ใช้เวลาตอบสนองนานเกินไป กรุณาลองใหม่อีกครั้ง' },
    vi: { title: 'Hết thời gian yêu cầu', message: 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.' },
    zh: { title: '请求超时', message: '服务器响应超时，请重试。' },
  },
  server_connect: {
    en: { title: 'Server Connection Error', message: 'Unable to connect to the store backend server.' },
    km: { title: 'កំហុសតភ្ជាប់ម៉ាស៊ីនបម្រើ', message: 'មិនអាចតភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើហាងបានទេ។' },
    th: { title: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์', message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ร้านค้าได้' },
    vi: { title: 'Lỗi kết nối máy chủ', message: 'Không thể kết nối với máy chủ cửa hàng.' },
    zh: { title: '服务器连接错误', message: '无法连接到商城服务器，请稍后重试。' },
  },
}

function generateSessionId(): string {
  const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  localStorage.setItem('session_id', id)
  return id
}

// ─── Request Interceptor ─────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('customer_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Session ID for guest cart
  const sessionId = localStorage.getItem('session_id') || generateSessionId()
  config.headers['X-Session-ID'] = sessionId

  // Language & currency
  const lang = localStorage.getItem('language') || 'en'
  const currency = localStorage.getItem('currency') || 'USD'
  config.headers['Accept-Language'] = lang
  config.headers['X-Currency'] = currency

  return config
})

// ─── Response Interceptor ────────────────────────────────────────────────────

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('customer_token')
      localStorage.removeItem('customer_user')
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
    return Promise.reject(error)
  }
)

export default api
