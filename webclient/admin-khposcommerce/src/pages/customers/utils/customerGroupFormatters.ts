/**
 * Localizes customer group names and descriptions dynamically across 2 languages (Khmer & English)
 * on the client-side without altering database records.
 */

const KM_GROUP_NAMES: Record<string, string> = {
  'general retail': 'លក់រាយទូទៅ',
  'vip platinum': 'វីអាយភី ផ្លាទីនីម (VIP Platinum)',
  'gold member': 'សមាជិកមាស (Gold Member)',
  'silver member': 'សមាជិកប្រាក់ (Silver Member)',
  'wholesale buyer': 'អ្នកទិញដុំ (Wholesale Buyer)',
  'company partner': 'ដៃគូក្រុមហ៊ុន (Company Partner)',
  'employee family': 'ក្រុមគ្រួសារបុគ្គលិក',
  'distributor tier 1': 'អ្នកចែកចាយកម្រិត ១',
  'distributor tier 2': 'អ្នកចែកចាយកម្រិត ២',
  'dropshipper': 'អ្នកលក់បន្ត (Dropshipper)',
  'general': 'ទូទៅ',
  'vip': 'វីអាយភី (VIP)',
  'wholesale': 'លក់ដុំ',
}

const KM_GROUP_DESCRIPTIONS: Record<string, string> = {
  'group for general retail': 'ក្រុមសម្រាប់អតិថិជនលក់រាយទូទៅ',
  'group for vip platinum': 'ក្រុមសម្រាប់អតិថិជន VIP ផ្លាទីនីម',
  'group for gold member': 'ក្រុមសម្រាប់សមាជិកមាស',
  'group for silver member': 'ក្រុមសម្រាប់សមាជិកប្រាក់',
  'group for wholesale buyer': 'ក្រុមសម្រាប់អ្នកទិញដុំ',
  'group for company partner': 'ក្រុមសម្រាប់ដៃគូក្រុមហ៊ុន',
  'group for employee family': 'ក្រុមសម្រាប់គ្រួសារបុគ្គលិក',
  'group for distributor tier 1': 'ក្រុមសម្រាប់អ្នកចែកចាយកម្រិត ១',
  'group for distributor tier 2': 'ក្រុមសម្រាប់អ្នកចែកចាយកម្រិត ២',
  'group for dropshipper': 'ក្រុមសម្រាប់អ្នកលក់បន្ត (Dropshipper)',
  'regular retail customers': 'អតិថិជនលក់រាយទូទៅជាប្រចាំ',
  'loyal vip customers': 'អតិថិជន VIP ស្មោះត្រង់',
  'bulk buying customers': 'អតិថិជនទិញដុំបរិមាណច្រើន',
}

export const getCustomerGroupDisplayName = (
  name?: string,
  t?: any,
  languageCode?: string
): string => {
  if (!name) return ''
  const lang = (languageCode || t?.language || (typeof t === 'function' ? t('common.currentLang', 'km') : 'km') || 'km').toLowerCase()
  const isKhmer = lang.startsWith('km')

  if (!isKhmer) return name

  const cleanKey = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  if (t) {
    const translated = t(`customers.groupNames.${cleanKey}`, '')
    if (translated && translated !== `customers.groupNames.${cleanKey}` && translated !== '') {
      return translated
    }
  }

  const normalized = name.toLowerCase().trim()
  if (KM_GROUP_NAMES[normalized]) {
    return KM_GROUP_NAMES[normalized]
  }

  return name
}

export const getCustomerGroupDisplayDescription = (
  description?: string,
  groupName?: string,
  t?: any,
  languageCode?: string
): string => {
  if (!description) return '—'
  const lang = (languageCode || t?.language || (typeof t === 'function' ? t('common.currentLang', 'km') : 'km') || 'km').toLowerCase()
  const isKhmer = lang.startsWith('km')

  if (!isKhmer) return description

  const cleanKey = description.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  if (t) {
    const translated = t(`customers.groupDescriptions.${cleanKey}`, '')
    if (translated && translated !== `customers.groupDescriptions.${cleanKey}` && translated !== '') {
      return translated
    }
  }

  const normalized = description.toLowerCase().trim()
  if (KM_GROUP_DESCRIPTIONS[normalized]) {
    return KM_GROUP_DESCRIPTIONS[normalized]
  }

  if (normalized.startsWith('group for ') && groupName) {
    const localizedGroupName = getCustomerGroupDisplayName(groupName, t, languageCode)
    return `ក្រុមសម្រាប់${localizedGroupName}`
  }

  return description
}
