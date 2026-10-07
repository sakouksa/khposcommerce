/**
 * Helper utilities for formatting and translating shift information across HRMS & Attendance
 */

// Mapping dictionary for standard shift names
const KM_TO_EN_SHIFTS: Record<string, string> = {
  'វេនព្រឹក': 'Morning Shift',
  'វេនពេលព្រឹក': 'Morning Shift',
  'វេនរសៀល': 'Afternoon Shift',
  'វេនពេលរសៀល': 'Afternoon Shift',
  'វេនល្ងាច': 'Evening Shift',
  'វេនពេលល្ងាច': 'Evening Shift',
  'វេនរសៀល/ល្ងាច': 'Evening Shift',
  'វេនពេញម៉ោង': 'Full-Time Shift',
  'វេនយប់': 'Night Shift',
  'វេនពេលយប់': 'Night Shift',
  'វេនបត់បែន': 'Flexible Shift',
  'វេនធម្មតា': 'Regular Shift',
}

const EN_TO_KM_SHIFTS: Record<string, string> = {
  'morning shift': 'វេនព្រឹក',
  'morning': 'វេនព្រឹក',
  'afternoon shift': 'វេនរសៀល',
  'afternoon': 'វេនរសៀល',
  'evening shift': 'វេនរសៀល/ល្ងាច',
  'evening': 'វេនរសៀល/ល្ងាច',
  'full-time shift': 'វេនពេញម៉ោង',
  'full time shift': 'វេនពេញម៉ោង',
  'full time': 'វេនពេញម៉ោង',
  'fulltime': 'វេនពេញម៉ោង',
  'night shift': 'វេនយប់',
  'night': 'វេនយប់',
  'flexible shift': 'វេនបត់បែន',
  'flexible': 'វេនបត់បែន',
  'regular shift': 'វេនធម្មតា',
  'regular': 'វេនធម្មតា',
}

/**
 * Format and extract shift name based on active language (Khmer vs English)
 * Examples:
 * - "វេនរសៀល/ល្ងាច (Evening Shift)" -> km: "វេនរសៀល/ល្ងាច", en: "Evening Shift"
 * - "Morning Shift" -> km: "វេនព្រឹក", en: "Morning Shift"
 * - "វេនពេញម៉ោង" -> km: "វេនពេញម៉ោង", en: "Full-Time Shift"
 */
export const formatShiftName = (name?: string, isKm = true): string => {
  if (!name) return isKm ? 'វេនធម្មតា' : 'Regular Shift'

  const trimmed = name.trim()

  // Case 1: Bilingual format with parentheses, e.g. "វេនរសៀល/ល្ងាច (Evening Shift)" or "Morning Shift (វេនព្រឹក)"
  const match = trimmed.match(/^(.*?)\s*\((.*?)\)$/)
  if (match) {
    const p1 = match[1].trim()
    const p2 = match[2].trim()
    const hasKmP1 = /[\u1780-\u17FF]/.test(p1)
    const hasKmP2 = /[\u1780-\u17FF]/.test(p2)

    if (isKm) {
      if (hasKmP1) return p1
      if (hasKmP2) return p2
      return EN_TO_KM_SHIFTS[p1.toLowerCase()] || EN_TO_KM_SHIFTS[p2.toLowerCase()] || p1
    } else {
      if (!hasKmP1) return p1
      if (!hasKmP2) return p2
      return KM_TO_EN_SHIFTS[p1] || KM_TO_EN_SHIFTS[p2] || p2
    }
  }

  // Case 2: Pure string matching
  if (isKm) {
    const lower = trimmed.toLowerCase()
    if (EN_TO_KM_SHIFTS[lower]) return EN_TO_KM_SHIFTS[lower]
    return trimmed
  } else {
    if (KM_TO_EN_SHIFTS[trimmed]) return KM_TO_EN_SHIFTS[trimmed]
    // Strip any nested Khmer text in parentheses if any
    const stripped = trimmed.replace(/\([^)]*[\u1780-\u17FF][^)]*\)/g, '').trim()
    return stripped || trimmed
  }
}

/**
 * Robust day matching that checks whether a day key (e.g. 'Mon', 'Tue', 'Fri')
 * matches a working days array that may contain full names (e.g. 'Monday', 'Tuesday')
 * or abbreviations (e.g. 'Mon', 'Tue').
 */
export const matchesShiftDay = (workingDays: string[] | undefined | null, dayKey: string): boolean => {
  if (!workingDays || !Array.isArray(workingDays) || workingDays.length === 0) return false
  const target = dayKey.trim().toLowerCase()

  return workingDays.some((wd) => {
    if (!wd || typeof wd !== 'string') return false
    const lower = wd.trim().toLowerCase()
    return lower === target || lower.startsWith(target) || target.startsWith(lower)
  })
}
