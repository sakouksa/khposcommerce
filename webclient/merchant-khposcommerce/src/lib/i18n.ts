import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Vite's dynamic import.meta.glob to load namespace JSONs lazily
const locales = import.meta.glob('../locales/*/*.json')

export const namespaces = [
  'common', 'buttons', 'button', 'validation', 'messages', 'dashboard', 'products', 'product',
  'inventory', 'customers', 'customer', 'suppliers', 'sales', 'purchases', 'purchase', 'employees', 'employee',
  'settings', 'setting', 'reports', 'report', 'auth', 'tables', 'table', 'forms', 'form', 'pagination', 'errors', 'empty',
  'confirm', 'deleteConfirm', 'finance', 'logs', 'marketing', 'mobile',
  'nav', 'pageContent', 'profile', 'reviews', 'toast', 'website', 'pos', 'orders', 'order', 'security', 'cms', 'shipping', 'returns',
  'users', 'user', 'policies', 'policy', 'expenses', 'expense'
]

// Expose runtime translation dictionaries for React.createElement interceptor
export let activeDict: Record<string, string> = {}
export let activeLowerDict: Record<string, string> = {}

function buildDictForNS(en: any, active: any) {
  if (typeof en === 'object' && en !== null && typeof active === 'object' && active !== null) {
    for (const key in en) {
      if (key in active) {
        const enVal = en[key]
        const activeVal = active[key]
        if (typeof enVal === 'string' && typeof activeVal === 'string') {
          const enTrimmed = enVal.trim()
          const keyTrimmed = key.trim()

          // Do not map pure numbers or error status codes (e.g. 500, 404) as text translations
          if (!/^\d+$/.test(enTrimmed)) {
            activeDict[enTrimmed] = activeVal
            activeLowerDict[enTrimmed.toLowerCase()] = activeVal
          }

          if (!/^\d+$/.test(keyTrimmed)) {
            activeDict[keyTrimmed] = activeVal
            activeLowerDict[keyTrimmed.toLowerCase()] = activeVal

            const spacedKey = keyTrimmed.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')
            activeLowerDict[spacedKey.toLowerCase()] = activeVal
          }
        } else if (typeof enVal === 'object' && typeof activeVal === 'object') {
          buildDictForNS(enVal, activeVal)
        }
      }
    }
  }
}

export function buildActiveDict() {
  const lng = i18n.language || 'en'
  activeDict = {}
  activeLowerDict = {}
  if (lng === 'en') return

  for (const ns of namespaces) {
    const enRes = i18n.getResourceBundle('en', ns) || {}
    const activeRes = i18n.getResourceBundle(lng, ns) || {}
    buildDictForNS(enRes, activeRes)
  }
}

export function translateString(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return text

  // NEVER translate pure numbers, currency values, percentages, or numeric codes (e.g. 500, 750, 1,000, 250)
  if (/^[\d,.\s%$#+\-/:()]+$/.test(trimmed) && /\d/.test(trimmed)) {
    return text
  }
  if (!isNaN(Number(trimmed.replace(/[,\s]/g, '')))) {
    return text
  }

  if (activeDict[trimmed]) {
    const lead = text.match(/^\s*/)?.[0] || ''
    const trail = text.match(/\s*$/)?.[0] || ''
    return lead + activeDict[trimmed] + trail
  }

  const lowerTrimmed = trimmed.toLowerCase()
  if (activeLowerDict[lowerTrimmed]) {
    const lead = text.match(/^\s*/)?.[0] || ''
    const trail = text.match(/\s*$/)?.[0] || ''
    return lead + activeLowerDict[lowerTrimmed] + trail
  }

  // Handle dotted keys like 'common.reset', 'button.add', 'table.id', 'pageContent.name'
  if (trimmed.includes('.') && !trimmed.includes(' ')) {
    const parts = trimmed.split('.').filter(Boolean)
    const lastPart = parts[parts.length - 1]
    if (lastPart && activeDict[lastPart]) {
      const lead = text.match(/^\s*/)?.[0] || ''
      const trail = text.match(/\s*$/)?.[0] || ''
      return lead + activeDict[lastPart] + trail
    }
    if (lastPart && activeLowerDict[lastPart.toLowerCase()]) {
      const lead = text.match(/^\s*/)?.[0] || ''
      const trail = text.match(/\s*$/)?.[0] || ''
      return lead + activeLowerDict[lastPart.toLowerCase()] + trail
    }
  }

  // ─── Pattern translation for standard database actions ───
  const actionPatterns = [
    {
      regex: /^(Selected\s+)?(.+?)\s+created\s+successfully\.?$/i,
      key: 'created'
    },
    {
      regex: /^(Selected\s+)?(.+?)\s+updated\s+successfully\.?$/i,
      key: 'updated'
    },
    {
      regex: /^(Selected\s+)?(.+?)\s+deleted\s+successfully\.?$/i,
      key: 'deleted'
    },
    {
      regex: /^(Selected\s+)?(.+?)\s+restored\s+successfully\.?$/i,
      key: 'restored'
    },
    {
      regex: /^(Selected\s+)?(.+?)\s+permanently\s+deleted(?:\s+successfully)?\.?$/i,
      key: 'permanentlyDeleted'
    }
  ]

  const currentLang = localStorage.getItem('enterprise-pos-lang') || 'en'

  for (const p of actionPatterns) {
    const match = trimmed.match(p.regex)
    if (match) {
      const isSelected = !!match[1]
      const entityName = match[2].trim()

      // Normalize entityName: if it is "CustomerAddress", split to "Customer Address"
      const normalizedEntity = entityName.replace(/([a-z])([A-Z])/g, '$1 $2')

      // Translate the normalized entity name using i18n
      let translatedEntity = translateString(normalizedEntity)

      // If it's a multiple selection, apply language-specific modifier rules
      if (isSelected) {
        if (currentLang === 'km') {
          translatedEntity = `${translatedEntity}ដែលបានជ្រើសរើស`
        } else if (currentLang === 'th') {
          translatedEntity = `${translatedEntity}ที่เลือก`
        } else if (currentLang === 'vi') {
          translatedEntity = `Các ${translatedEntity.toLowerCase()} đã chọn`
        } else if (currentLang === 'zh') {
          translatedEntity = `已选${translatedEntity}`
        } else {
          translatedEntity = `Selected ${translatedEntity}`
        }
      }

      // Check if we have the template in messages namespace
      const template = i18n.t(`messages.${p.key}`, { item: translatedEntity })
      if (template && template !== `messages.${p.key}`) {
        const lead = text.match(/^\s*/)?.[0] || ''
        const trail = text.match(/\s*$/)?.[0] || ''
        return lead + template + trail
      }
    }
  }

  const matchPunct = trimmed.match(/^([\w\s\-&/\(\)\+]+)([:\?\.\!]+)$/)
  if (matchPunct) {
    const base = matchPunct[1].trim()
    const punct = matchPunct[2]
    if (activeDict[base]) {
      const lead = text.match(/^\s*/)?.[0] || ''
      const trail = text.match(/\s*$/)?.[0] || ''
      return lead + activeDict[base] + punct + trail
    }
    const lowerBase = base.toLowerCase()
    if (activeLowerDict[lowerBase]) {
      const lead = text.match(/^\s*/)?.[0] || ''
      const trail = text.match(/\s*$/)?.[0] || ''
      return lead + activeLowerDict[lowerBase] + punct + trail
    }
  }

  return text
}

const namespaceAliases: Record<string, string> = {
  button: 'buttons',
  table: 'tables',
  form: 'forms',
  purchase: 'purchases',
  product: 'products',
  customer: 'customers',
  employee: 'employees',
  report: 'reports',
  setting: 'settings',
  users: 'settings',
  user: 'settings',
  policies: 'returns',
  policy: 'returns',
  expenses: 'finance',
  expense: 'finance',
}

export async function ensureLanguageLoaded(lng: string) {
  // Always load fallback language (en) as reference, plus requested language
  const langsToLoad = lng === 'en' ? ['en'] : ['en', lng]
  
  await Promise.all(
    langsToLoad.map(async (l) => {
      await Promise.all(
        namespaces.map(async (ns) => {
          if (i18n.hasResourceBundle(l, ns)) return
          const targetNs = namespaceAliases[ns] || ns
          const key = `../locales/${l}/${targetNs}.json`
          if (locales[key]) {
            try {
              const mod = await locales[key]() as { default: Record<string, any> }
              i18n.addResourceBundle(l, ns, mod.default, true, true)
              // If plural namespace is loaded, also alias the singular namespace bundle
              for (const [sing, plur] of Object.entries(namespaceAliases)) {
                if (plur === ns) {
                  i18n.addResourceBundle(l, sing, mod.default, true, true)
                }
              }
            } catch (err) {
              console.error(`Failed to load locale file: ${key}`, err)
            }
          }
        })
      )
    })
  )
}

const savedLanguage = localStorage.getItem('enterprise-pos-lang') || 'km'

i18n
  .use(initReactI18next)
  .init({
    resources: {},
    lng: savedLanguage,
    fallbackLng: 'en',
    ns: namespaces,
    defaultNS: 'common',
    nsSeparator: '.',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    parseMissingKeyHandler: (key: string, defaultValue?: string) => {
      if (defaultValue) return defaultValue
      if (!key) return key
      if (activeDict[key]) return activeDict[key]
      const parts = key.split('.').filter(Boolean)
      const lastPart = parts[parts.length - 1] || key
      if (activeDict[lastPart]) return activeDict[lastPart]
      const rawTerm = lastPart.replace(/_/g, ' ')
      const formattedTerm = rawTerm.charAt(0).toUpperCase() + rawTerm.slice(1)
      return translateString(formattedTerm)
    },
  })

const origT = i18n.t.bind(i18n)
i18n.t = ((key: any, ...args: any[]) => {
  if (typeof key === 'string' && key.includes(':')) {
    key = key.replace(':', '.')
  }
  return (origT as any)(key, ...args)
}) as typeof i18n.t

export default i18n

