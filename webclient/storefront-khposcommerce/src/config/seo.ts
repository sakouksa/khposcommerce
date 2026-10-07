/**
 * ─── OptaPOS Customer Website — Central SEO Configuration ────────────────────
 * Single source of truth for all SEO parameters, metadata defaults, social
 * sharing tags, structured data entities, and crawler instructions.
 */

export interface SEOConfig {
  siteUrl: string
  siteName: string
  defaultTitle: string
  titleTemplate: (pageTitle?: string) => string
  defaultDescription: string
  defaultOgImage: string
  defaultLocale: string
  supportedLocales: Record<string, string>
  sitemapUrl: string
  robotsUrl: string
  themeColor: string
  twitterHandle: string
  organization: {
    name: string
    legalName: string
    url: string
    logo: string
    telephone: string
    email: string
    address: {
      street: string
      city: string
      region: string
      postalCode: string
      country: string
    }
    geo: {
      latitude: number
      longitude: number
    }
    priceRange: string
    currenciesAccepted: string[]
    paymentAccepted: string[]
    openingHours: string[]
  }
}

export const getSiteUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'https://storefrontkhposcommerce.vercel.app'
}

const siteUrl = getSiteUrl()
const siteName = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_NAME) || 'OptaPOS Store'

export const SEO_CONFIG: SEOConfig = {
  siteUrl,
  siteName,
  defaultTitle: `${siteName} — Official E-Commerce & Retail Technology Cambodia`,
  titleTemplate: (pageTitle?: string) => {
    if (!pageTitle || !pageTitle.trim()) {
      return `${siteName} — Official E-Commerce & Retail Technology Cambodia`
    }
    const cleanTitle = pageTitle.trim()
    if (cleanTitle.includes(siteName)) {
      return cleanTitle
    }
    return `${cleanTitle} | ${siteName}`
  },
  defaultDescription:
    'Shop authentic electronics, computers, smartphones, gaming gear, and enterprise POS hardware with fast nationwide delivery in Cambodia.',
  defaultOgImage: `${siteUrl}/logo.png`,
  defaultLocale: 'km_KH',
  supportedLocales: {
    km: 'km_KH',
    en: 'en_US',
    th: 'th_TH',
    vi: 'vi_VN',
    zh: 'zh_CN',
  },
  sitemapUrl: `${siteUrl}/sitemap.xml`,
  robotsUrl: `${siteUrl}/robots.txt`,
  themeColor: '#0066FF',
  twitterHandle: '@OptaPOS',
  organization: {
    name: siteName,
    legalName: 'OptaPOS Retail & Technology Co., Ltd.',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    telephone: '+855 12 220 152',
    email: 'support@optapos.com',
    address: {
      street: 'Russian Federation Blvd (110)',
      city: 'Phnom Penh',
      region: 'Phnom Penh',
      postalCode: '12000',
      country: 'KH',
    },
    geo: {
      latitude: 11.5564,
      longitude: 104.9282,
    },
    priceRange: '$$',
    currenciesAccepted: ['USD', 'KHR'],
    paymentAccepted: ['Cash', 'Credit Card', 'Bakong KHQR', 'Bank Transfer'],
    openingHours: ['Mo-Su 08:00-20:00'],
  },
}

export const SITE_NAME = SEO_CONFIG.siteName
export const SITE_URL = SEO_CONFIG.siteUrl
export const DEFAULT_IMG = SEO_CONFIG.defaultOgImage

export default SEO_CONFIG

