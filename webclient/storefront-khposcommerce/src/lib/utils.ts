import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  const symbols: Record<string, string> = {
    USD: '$', KHR: '៛', THB: '฿', VND: '₫', CNY: '¥',
  }
  const symbol = symbols[currency] ?? '$'
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currency === 'USD' ? 2 : 0,
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(amount)
  return `${symbol}${formatted}`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatDate(date: string | Date): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(date: string | Date): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: string | Date): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const diffInSeconds = Math.floor((Date.now() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(d)
}

export function truncate(str: string, n: number): string {
  if (!str) return ''
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

export function slugify(str: string): string {
  if (!str) return ''
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

export function calculateDiscountPercent(price: number, comparePrice?: number): number {
  if (!comparePrice || comparePrice <= price) return 0
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

export type MediaFallbackType = 'product' | 'avatar' | 'brand' | 'category' | 'banner' | 'company' | 'general'

export const DEFAULT_FALLBACKS: Record<MediaFallbackType, string> = {
  product: '/images/default-product.svg',
  avatar: '/images/default-avatar.svg',
  brand: '/logo.png',
  category: '/images/default-product.svg',
  banner: '/api/v1/storage/banners/banner_hero_1.webp',
  company: '/logo.png',
  general: '/images/default-product.svg',
}

export function getImageUrl(path?: any): string {
  if (!path) return ''

  let str = ''
  if (typeof path === 'string') {
    str = path.trim()
  } else if (typeof path === 'object' && path !== null) {
    str = (path.url || path.image || path.image_path || path.photo || path.avatar || path.path || '').trim()
  }

  if (!str || str === '[]' || str === '""' || str === 'null') return ''

  // If data URI or blob
  if (str.startsWith('data:') || str.startsWith('blob:')) return str

  // Intercept any leftover Unsplash URLs and redirect to real local assets
  if (str.includes('unsplash.com')) {
    const p = str.toLowerCase()
    if (p.includes('avatar') || p.includes('photo-1534528') || p.includes('photo-1507003') || p.includes('photo-1494790')) {
      return '/api/v1/storage/customers/avatar_01.png'
    }
    if (p.includes('banner') || p.includes('photo-1607082') || p.includes('photo-1513151') || p.includes('photo-1542838')) {
      return '/api/v1/storage/banners/banner_hero_1.webp'
    }
    return '/api/v1/storage/products/smartphones/product_1_1.webp'
  }

  // Local frontend public directory assets
  if (
    str === '/logo.svg' ||
    str === '/logo.png' ||
    str === '/favicon.svg' ||
    str === '/favicon.ico' ||
    str === '/icons.svg' ||
    str === '/apple-touch-icon.png' ||
    str.startsWith('/images/') ||
    str.startsWith('/assets/')
  ) {
    return str
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://enterprise-pos-api.onrender.com/api/v1' : '')
  const origin = apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '').replace(/\/+$/, '')

  // If already an absolute URL
  if (str.startsWith('http://') || str.startsWith('https://')) {
    const isLocalhost = /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/i.test(str)
    if (isLocalhost) {
      const cleanPath = str
        .replace(/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\/?/, '')
        .replace(/^(api\/v1\/)?storage\//, '')
      return origin ? `${origin}/api/v1/storage/${cleanPath}` : `/api/v1/storage/${cleanPath}`
    }
    return str.replace(/^http:\/\/enterprise-pos-api\.onrender\.com/, 'https://enterprise-pos-api.onrender.com')
  }

  // Clean relative path
  const clean = str.replace(/^\/?(api\/v1\/storage\/|storage\/)/, '').replace(/^\//, '')

  if (origin) {
    return `${origin}/api/v1/storage/${clean}`
  }

  return `/api/v1/storage/${clean}`
}

export function resolveMediaUrl(path?: any, fallbackType?: MediaFallbackType): string {
  const url = getImageUrl(path)
  if (url) return url
  if (fallbackType && DEFAULT_FALLBACKS[fallbackType]) {
    return DEFAULT_FALLBACKS[fallbackType]
  }
  return DEFAULT_FALLBACKS.product
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
