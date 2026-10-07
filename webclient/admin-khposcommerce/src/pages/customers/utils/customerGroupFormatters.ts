import i18n from '@/lib/i18n'

/**
 * Localizes customer group names and descriptions dynamically across 2 languages (Khmer & English)
 * utilizing standard translation resources (locales/en/customers.json & locales/km/customers.json).
 */

const toCleanKey = (str: string): string =>
  str.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')

/**
 * Resolve translated customer group display name using i18n locale resources
 * Supports multiple call patterns:
 * - getCustomerGroupDisplayName(name, t, languageCode)
 * - getCustomerGroupDisplayName(name, languageCode)
 * - getCustomerGroupDisplayName(name, t)
 * - getCustomerGroupDisplayName(name)
 */
export const getCustomerGroupDisplayName = (
  name?: string,
  tOrLang?: ((key: string, defaultVal?: string) => string) | string | any,
  languageCode?: string
): string => {
  if (!name) return ''

  let tFn: ((key: string, defaultVal?: string) => string) | null = null
  let lang = i18n.language || 'km'

  if (typeof tOrLang === 'function') {
    tFn = tOrLang
    lang = (languageCode || tOrLang?.language || i18n.language || 'km').toLowerCase()
  } else if (typeof tOrLang === 'string') {
    lang = tOrLang.toLowerCase()
  } else if (languageCode && typeof languageCode === 'string') {
    lang = languageCode.toLowerCase()
  }

  const isKhmer = lang.startsWith('km')
  const cleanKey = toCleanKey(name)

  const translate = (key: string, fallback?: string): string => {
    if (typeof tFn === 'function') {
      try {
        const res = tFn(key, fallback || '')
        if (res && res !== key && !res.includes('.')) return res
      } catch {
        // ignore
      }
    }
    try {
      const res = i18n.t(key, { lng: isKhmer ? 'km' : 'en', defaultValue: fallback || '' })
      if (res && res !== key && !res.includes('.')) return res
    } catch {
      // ignore
    }
    return ''
  }

  if (!isKhmer) {
    // English mode: fetch from locales/en/customers.json
    const enVal =
      translate(`customers.groupNames.${cleanKey}`) ||
      translate(`groupNames.${cleanKey}`)
    return enVal || name
  }

  // Khmer mode: fetch from locales/km/customers.json
  const kmVal =
    translate(`customers.groupNames.${cleanKey}`) ||
    translate(`groupNames.${cleanKey}`) ||
    translate(`customers.${cleanKey}`) ||
    translate(`customers.${name}`)

  return kmVal || name
}

/**
 * Resolve translated customer group display description using i18n locale resources
 * Supports multiple call patterns:
 * - getCustomerGroupDisplayDescription(description, groupName, t, languageCode)
 * - getCustomerGroupDisplayDescription(description, groupName, languageCode)
 * - getCustomerGroupDisplayDescription(description, groupName, t)
 */
export const getCustomerGroupDisplayDescription = (
  description?: string,
  groupName?: string,
  tOrLang?: ((key: string, defaultVal?: string) => string) | string | any,
  languageCode?: string
): string => {
  if (!description) return '—'

  let tFn: ((key: string, defaultVal?: string) => string) | null = null
  let lang = i18n.language || 'km'

  if (typeof tOrLang === 'function') {
    tFn = tOrLang
    lang = (languageCode || tOrLang?.language || i18n.language || 'km').toLowerCase()
  } else if (typeof tOrLang === 'string') {
    lang = tOrLang.toLowerCase()
  } else if (languageCode && typeof languageCode === 'string') {
    lang = languageCode.toLowerCase()
  }

  const isKhmer = lang.startsWith('km')
  const cleanKey = toCleanKey(description)

  const translate = (key: string, fallback?: string): string => {
    if (typeof tFn === 'function') {
      try {
        const res = tFn(key, fallback || '')
        if (res && res !== key && !res.includes('.')) return res
      } catch {
        // ignore
      }
    }
    try {
      const res = i18n.t(key, { lng: isKhmer ? 'km' : 'en', defaultValue: fallback || '' })
      if (res && res !== key && !res.includes('.')) return res
    } catch {
      // ignore
    }
    return ''
  }

  if (!isKhmer) {
    // English mode: fetch from locales/en/customers.json
    const enVal =
      translate(`customers.groupDescriptions.${cleanKey}`) ||
      translate(`groupDescriptions.${cleanKey}`)
    return enVal || description
  }

  // Khmer mode: fetch from locales/km/customers.json
  const kmVal =
    translate(`customers.groupDescriptions.${cleanKey}`) ||
    translate(`groupDescriptions.${cleanKey}`)

  if (kmVal) return kmVal

  // Dynamic fallback for "group for [Group Name]" -> "ក្រុមសម្រាប់[Group Name]"
  if (description.toLowerCase().trim().startsWith('group for ') && groupName) {
    const localizedGroupName = getCustomerGroupDisplayName(groupName, tFn ?? lang, lang)
    const template = translate('customers.groupFor') || translate('groupFor') || 'ក្រុមសម្រាប់{{name}}'
    return template.replace('{{name}}', localizedGroupName)
  }

  return description
}
