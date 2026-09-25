import React from 'react'
import { Helmet } from 'react-helmet-async'
import i18n from '@/lib/i18n'
import { SEO_CONFIG } from '@/config/seo'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface SEOHeadProps {
  // Core
  title?: string
  description?: string
  canonical?: string
  robots?: string
  keywords?: string

  // Open Graph
  ogType?: 'website' | 'product' | 'article'
  ogImage?: string
  ogLocale?: string

  // Article-specific
  publishedTime?: string
  modifiedTime?: string
  author?: string

  // Structured data (JSON-LD)
  schema?: Record<string, any> | Record<string, any>[]

  // Breadcrumbs (auto-generates BreadcrumbList schema)
  breadcrumbs?: BreadcrumbItem[]
}

// ─── Re-export config constants for backwards compatibility ───────────────────
export const SITE_NAME = SEO_CONFIG.siteName
export const SITE_URL = SEO_CONFIG.siteUrl
export const DEFAULT_IMG = SEO_CONFIG.defaultOgImage
export { getSiteUrl } from '@/config/seo'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html?: string | null): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function truncateDesc(str?: string | null, max = 160): string {
  if (!str) return ''
  const cleaned = str.trim()
  return cleaned.length > max ? cleaned.slice(0, max - 1) + '…' : cleaned
}

// ─── Main SEOHead Component ───────────────────────────────────────────────────

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonical,
  robots = 'index, follow',
  keywords,
  ogType = 'website',
  ogImage,
  ogLocale,
  publishedTime,
  modifiedTime,
  author,
  schema,
  breadcrumbs,
}) => {
  const currentLang = i18n.language || 'km'
  const activeLocale = ogLocale || SEO_CONFIG.supportedLocales[currentLang] || SEO_CONFIG.defaultLocale

  // ── 1. Title composition with anti-duplicate logic ──────────────────────────
  const fullTitle = SEO_CONFIG.titleTemplate(title)

  // ── 2. Description cleanup with fallback ────────────────────────────────────
  const cleanDesc =
    truncateDesc(stripHtml(description)) || SEO_CONFIG.defaultDescription

  // ── 3. Canonical URL Normalization ──────────────────────────────────────────
  let canonicalUrl = SEO_CONFIG.siteUrl
  if (canonical) {
    canonicalUrl = canonical.startsWith('http')
      ? canonical
      : `${SEO_CONFIG.siteUrl}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
  } else if (typeof window !== 'undefined' && window.location?.pathname) {
    canonicalUrl = `${SEO_CONFIG.siteUrl}${window.location.pathname}`
  }

  // Strip trailing slash if not root
  if (canonicalUrl.length > SEO_CONFIG.siteUrl.length && canonicalUrl.endsWith('/')) {
    canonicalUrl = canonicalUrl.slice(0, -1)
  }

  // ── 4. OG Image with fallback ───────────────────────────────────────────────
  const ogImg = ogImage || SEO_CONFIG.defaultOgImage

  // ── 5. Breadcrumb structured data ───────────────────────────────────────────
  const breadcrumbSchema =
    breadcrumbs && breadcrumbs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: item.name,
            item: item.url.startsWith('http')
              ? item.url
              : `${SEO_CONFIG.siteUrl}${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
          })),
        }
      : null

  // ── 6. Schema output collection ─────────────────────────────────────────────
  const schemaItems: Record<string, any>[] = []
  if (breadcrumbSchema) schemaItems.push(breadcrumbSchema)
  if (schema) {
    if (Array.isArray(schema)) schemaItems.push(...schema)
    else schemaItems.push(schema)
  }

  return (
    <Helmet>
      {/* HTML Lang sync */}
      <html lang={currentLang} />

      {/* Core Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={cleanDesc} />
      <meta name="robots" content={robots} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Favicons & App Icons */}
      <link rel="icon" type="image/png" href="/logo.png" />
      <link rel="apple-touch-icon" href="/logo.png" />
      <meta name="theme-color" content={SEO_CONFIG.themeColor} />

      {/* Open Graph / Facebook / Messenger / Telegram */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={cleanDesc} />
      <meta property="og:image" content={ogImg} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={activeLocale} />

      {/* Article-specific Open Graph */}
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SEO_CONFIG.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={cleanDesc} />
      <meta name="twitter:image" content={ogImg} />

      {/* Structured Data (JSON-LD) */}
      {schemaItems.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(schemaItems.length === 1 ? schemaItems[0] : schemaItems)}
        </script>
      )}
    </Helmet>
  )
}

// ─── Global Schemas for Storefront Root ───────────────────────────────────────

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SEO_CONFIG.siteName,
  url: SEO_CONFIG.siteUrl,
  inLanguage: ['km', 'en', 'th', 'vi', 'zh'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SEO_CONFIG.siteUrl}/products?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SEO_CONFIG.organization.name,
  legalName: SEO_CONFIG.organization.legalName,
  url: SEO_CONFIG.organization.url,
  logo: {
    '@type': 'ImageObject',
    url: SEO_CONFIG.organization.logo,
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    areaServed: 'KH',
    telephone: SEO_CONFIG.organization.telephone,
    email: SEO_CONFIG.organization.email,
    availableLanguage: ['Khmer', 'English', 'Thai', 'Vietnamese', 'Chinese'],
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: SEO_CONFIG.organization.address.street,
    addressLocality: SEO_CONFIG.organization.address.city,
    addressRegion: SEO_CONFIG.organization.address.region,
    postalCode: SEO_CONFIG.organization.address.postalCode,
    addressCountry: SEO_CONFIG.organization.address.country,
  },
}

export const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: SEO_CONFIG.organization.name,
  image: SEO_CONFIG.organization.logo,
  url: SEO_CONFIG.organization.url,
  telephone: SEO_CONFIG.organization.telephone,
  priceRange: SEO_CONFIG.organization.priceRange,
  currenciesAccepted: SEO_CONFIG.organization.currenciesAccepted.join(', '),
  paymentAccepted: SEO_CONFIG.organization.paymentAccepted.join(', '),
  address: {
    '@type': 'PostalAddress',
    streetAddress: SEO_CONFIG.organization.address.street,
    addressLocality: SEO_CONFIG.organization.address.city,
    addressRegion: SEO_CONFIG.organization.address.region,
    postalCode: SEO_CONFIG.organization.address.postalCode,
    addressCountry: SEO_CONFIG.organization.address.country,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: SEO_CONFIG.organization.geo.latitude,
    longitude: SEO_CONFIG.organization.geo.longitude,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '20:00',
    },
  ],
}

export default SEOHead
