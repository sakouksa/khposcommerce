/**
 * Multilingual URL Slug Generator with Khmer Transliteration,
 * Vietnamese Diacritics Normalization, and Clean ASCII Fallback.
 */

// Common Khmer business, retail, and CMS dictionary terms for SEO-friendly English slugs
const KHMER_SEO_DICTIONARY: Record<string, string> = {
  // Retail & Business
  'បច្ចេកវិទ្យា': 'technology',
  'ព័ត៌មាន': 'news',
  'ព័ត៌មានទាន់ហេតុការណ៍': 'breaking-news',
  'យុទ្ធសាស្ត្រ': 'strategies',
  'បង្កើនការលក់': 'boost-sales',
  'ការលក់': 'sales',
  'អតិថិជន': 'customers',
  'ភក្ដីភាព': 'loyalty',
  'អតិថិជនស្មោះត្រង់': 'customer-loyalty',
  'ហាងទំនិញ': 'retail-store',
  'ហាង': 'store',
  'ទំនិញ': 'products',
  'ផលិតផល': 'products',
  'ការគ្រប់គ្រង': 'management',
  'គ្រប់គ្រង': 'manage',
  'សារពើភ័ណ្ឌ': 'inventory',
  'ស្តុក': 'stock',
  'ឃ្លាំង': 'warehouse',
  'ផ្សព្វផ្សាយ': 'promotions',
  'ប្រូម៉ូសិន': 'promotions',
  'បញ្ចុះតម្លៃ': 'discounts',
  'ប្រព័ន្ធ': 'system',
  'ការទូទាត់': 'payments',
  'ទូទាត់': 'checkout',
  'របាយការណ៍': 'reports',
  'គន្លឹះ': 'tips',
  'មគ្គុទ្ទេសក៍': 'guides',
  'ការណែនាំ': 'tutorials',
  'សេវាកម្ម': 'services',
  'ជំនួយ': 'help-faq',
  'សំណួរញឹកញាប់': 'faqs',
  'សំណួរ': 'faq',
  'ចម្លើយ': 'answers',
  'ប័ណ្ណបញ្ចុះតម្លៃ': 'coupons',
  'បុគ្គលិក': 'employees',
  'ដឹកជញ្ជូន': 'shipping-delivery',
  'ទំព័រដើម': 'home',
  'អំពីយើង': 'about-us',
  'ទាក់ទង': 'contact',
  'លក្ខខណ្ឌ': 'terms-conditions',
  'ឯកជនភាព': 'privacy-policy',
  'ប្លុក': 'blog',
  'អត្ថបទ': 'articles',
  'ប្រភេទ': 'categories',
  'ស្លាក': 'tags',
  'កម្រិត': 'tiers',
  'រង្វាន់': 'rewards',
  'ចំណុច': 'points',
  'ពិន្ទុ': 'points',
  'ទំនើប': 'modern',
  'ស្វ័យប្រវត្តិ': 'automation',
  'បញ្ញាសិប្បនិម្មិត': 'ai',
  'បណ្តាញ': 'network',
}

// Khmer Consonants mapping for phonetic transliteration
const KHMER_CONSONANTS: Record<string, string> = {
  'ក': 'k', 'ខ': 'kh', 'គ': 'k', 'ឃ': 'kh', 'ង': 'ng',
  'ច': 'ch', 'ឆ': 'chh', 'ជ': 'ch', 'ឈ': 'chh', 'ញ': 'nh',
  'ដ': 'd', 'ឋ': 'th', 'ឌ': 'd', 'ឍ': 'th', 'ណ': 'n',
  'ត': 't', 'ថ': 'th', 'ទ': 't', 'ធ': 'th', 'ន': 'n',
  'ប': 'b', 'ផ': 'ph', 'ព': 'p', 'ភ': 'ph', 'ម': 'm',
  'យ': 'y', 'រ': 'r', 'ល': 'l', 'វ': 'v', 'ស': 's',
  'ហ': 'h', 'ឡ': 'l', 'អ': 'a',
}

// Khmer Dependent Vowels mapping
const KHMER_VOWELS: Record<string, string> = {
  'ា': 'a', 'ិ': 'e', 'ី': 'ey', 'ឹ': 'oe', 'ឺ': 'ue',
  'ុ': 'u', 'ូ': 'oo', 'ួ': 'uo', 'ើ': 'ae', 'ឿ': 'oea',
  'ៀ': 'ie', 'េ': 'e', 'ែ': 'ae', 'ៃ': 'ai', 'ោ': 'ao',
  'ៅ': 'ov', 'ុំ': 'om', 'ំ': 'om', 'ាំ': 'am', 'ះ': 'ah',
  'ុះ': 'uh', 'េះ': 'eh', 'ោះ': 'oh',
}

/**
 * Phonetically transliterate Khmer script into readable Latin characters
 */
function transliterateKhmer(text: string): string {
  let result = text

  // 1. Replace known dictionary phrases first
  for (const [km, en] of Object.entries(KHMER_SEO_DICTIONARY)) {
    result = result.split(km).join(` ${en} `)
  }

  // 2. Transliterate remaining Khmer characters
  let output = ''
  for (let i = 0; i < result.length; i++) {
    const char = result[i]
    if (KHMER_CONSONANTS[char]) {
      output += KHMER_CONSONANTS[char]
    } else if (KHMER_VOWELS[char]) {
      output += KHMER_VOWELS[char]
    } else if (/[\u1780-\u17FF]/.test(char)) {
      // Skip subscript signs / diacritics gracefully
      continue
    } else {
      output += char
    }
  }

  return output
}

/**
 * Remove Vietnamese and European diacritics
 */
function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
}

/**
 * Generates an SEO-friendly, clean, URL-safe slug from any language string.
 */
export function generateSlug(text: string): string {
  if (!text || typeof text !== 'string') return ''

  let processed = text.trim()

  // 1. Check if contains Khmer Unicode (U+1780 - U+17FF)
  if (/[\u1780-\u17FF]/.test(processed)) {
    processed = transliterateKhmer(processed)
  }

  // 2. Remove European & Vietnamese diacritics
  processed = removeDiacritics(processed)

  // 3. Convert to lowercase and clean symbols
  let slug = processed
    .toLowerCase()
    .replace(/&+/g, ' and ')
    .replace(/@+/g, ' at ')
    .replace(/[^a-z0-9\s-_]/g, '') // Keep standard alphanumeric, spaces, dashes
    .replace(/[\s_]+/g, '-')       // Replace spaces and underscores with -
    .replace(/-+/g, '-')          // Collapse multiple dashes
    .replace(/^-+|-+$/g, '')      // Trim leading and trailing dashes

  // 4. Fallback if empty (e.g. non-Latin languages without dictionary match)
  if (!slug) {
    // Generate fallback using clean hex timestamp
    slug = 'item-' + Date.now().toString(36)
  }

  return slug
}

export default generateSlug
