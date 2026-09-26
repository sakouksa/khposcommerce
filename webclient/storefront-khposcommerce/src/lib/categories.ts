import type { TFunction } from 'i18next'
import type { Category } from '@/types/store'

/**
 * Normalizes a category slug to a clean translation key format (e.g. 'pos-hardware' -> 'pos_hardware')
 */
export const normalizeCategorySlug = (slug?: string): string => {
  if (!slug) return ''
  return slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_')
}

/**
 * Returns the localized category name across all 5 supported languages (KM, EN, TH, VI, ZH).
 * Falls back cleanly to category.name or slug if no translation key is defined.
 */
export const getCategoryLocalizedName = (
  category?: Category | string | null,
  t?: TFunction
): string => {
  if (!category) return ''

  const slug = typeof category === 'string' ? category : category.slug
  const originalName = typeof category === 'string' ? category : category.name || category.slug

  if (!t || !slug) return originalName || ''

  const key1 = `category.${normalizeCategorySlug(slug)}`
  const key2 = `category.${slug.toLowerCase()}`

  // Check if translation exists and isn't just returning the key itself
  const translated1 = t(key1)
  if (translated1 && translated1 !== key1) return translated1

  const translated2 = t(key2)
  if (translated2 && translated2 !== key2) return translated2

  return originalName || ''
}

/**
 * Returns the localized category description.
 */
export const getCategoryLocalizedDescription = (
  category?: Category | string | null,
  t?: TFunction
): string => {
  if (!category) return ''

  const slug = typeof category === 'string' ? category : category.slug
  const originalDesc = typeof category === 'string' ? '' : category.description

  if (!t || !slug) return originalDesc || ''

  const key1 = `category.desc_${normalizeCategorySlug(slug)}`
  const key2 = `category.desc_${slug.toLowerCase()}`

  const translated1 = t(key1)
  if (translated1 && translated1 !== key1) return translated1

  const translated2 = t(key2)
  if (translated2 && translated2 !== key2) return translated2

  return originalDesc || t('category.desc_default', '100% Genuine Tech with Official Warranty')
}
