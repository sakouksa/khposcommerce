import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Vite's dynamic eager import to load all namespace JSONs from src/locales/
const localeModules = import.meta.glob('../locales/*/*.json', { eager: true }) as Record<
  string,
  { default: Record<string, string> }
>

export const languages = ['en', 'km', 'th', 'vi', 'zh'] as const
export type SupportedLanguage = typeof languages[number]

export const languageNames: Record<
  SupportedLanguage,
  { name: string; nativeName: string; flag: string }
> = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  km: { name: 'Khmer', nativeName: 'ភាសាខ្មែរ', flag: '🇰🇭' },
  th: { name: 'Thai', nativeName: 'ภาษาไทย', flag: '🇹🇭' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
}

export const resources: Record<string, { translation: Record<string, string> }> = {
  en: { translation: {} },
  km: { translation: {} },
  th: { translation: {} },
  vi: { translation: {} },
  zh: { translation: {} },
}

// Assemble all JSON files into i18n resources
for (const path in localeModules) {
  const match = path.match(/\.\.\/locales\/([a-z]+)\/([^/]+)\.json$/)
  if (match) {
    const [, lang] = match
    if (resources[lang]) {
      const data = localeModules[path].default || {}
      Object.assign(resources[lang].translation, data)
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
