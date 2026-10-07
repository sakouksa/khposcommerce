import type { Product } from '../types/pos.types'

export type SupportedLanguageCode = 'km-KH' | 'en-US'

export interface LanguageInfo {
  code: SupportedLanguageCode
  name: string
  nativeName: string
  flag: string
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguageCode, LanguageInfo> = {
  'km-KH': { code: 'km-KH', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', flag: '🇰🇭' },
  'en-US': { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
}

// Conversational filler phrases to strip across Khmer & English
const CONVERSATIONAL_STOP_WORDS: Record<SupportedLanguageCode, string[]> = {
  'km-KH': [
    'ចង់បាន', 'រកមើល', 'សូមស្វែងរក', 'ស្វែងរក', 'ទិញ', 'ចង់ទិញ', 'មានលក់', 'យក', 'ប្រាប់ពី', 'តម្លៃ', 'មួយ', 'ពីរ', 'បី', 'សូម', 'អោយ', 'ឱ្យ',
  ],
  'en-US': [
    'i want', 'look for', 'search for', 'find', 'buy', 'show me', 'need', 'get me', 'check', 'please', 'the', 'a', 'an', 'price of',
  ],
}

// 5-Language Comprehensive POS Concept Mapping Dictionary
export const SYNONYM_DICTIONARY: Record<string, string[]> = {
  keyboard: [
    // English
    'keyboard', 'keybord', 'keyboards', 'keys', 'typing', 'mechanical keyboard', 'rgb keyboard',
    // Khmer
    'ក្តារចុច', 'ក្ដារចុច', 'ឃីប៊ត', 'ឃីបត', 'ឃីប៊តហ្គេម', 'ក្ដារវាយអក្សរ',
    // Chinese
    '键盘', '机械键盘', '静音键盘',
    // Thai
    'คีย์บอร์ด', 'แป้นพิมพ์',
    // Vietnamese
    'bàn phím', 'bàn phím cơ',
  ],
  phone: [
    // English
    'phone', 'phones', 'smartphone', 'smartphones', 'iphone', 'cellular', 'mobile', 'cellphone',
    // Khmer
    'ទូរស័ព្ទ', 'ទូរសព្ទ', 'ទូរស័ព្ទដៃ', 'ទូរស័ព្ទស្មាតហ្វូន', 'អាយហ្វូន', 'ស្មាតហ្វូន',
    // Chinese
    '手机', '智能手机', '电话', '苹果手机',
    // Thai
    'โทรศัพท์', 'มือถือ', 'สมาร์ทโฟน',
    // Vietnamese
    'điện thoại', 'smartphone', 'điện thoại di động',
  ],
  laptop: [
    // English
    'laptop', 'laptops', 'computer', 'computers', 'notebook', 'macbook', 'pc', 'desktop',
    // Khmer
    'កុំព្យូទ័រ', 'កុំព្យូទ័រយួរដៃ', 'លែបថប', 'កុំព្យូទ័រលើតុ', 'ម៉ាក់ប៊ុក',
    // Chinese
    '笔记本', '电脑', '笔记本电脑', '手提电脑',
    // Thai
    'โน้ตบุ๊ก', 'แล็ปท็อป', 'คอมพิวเตอร์',
    // Vietnamese
    'máy tính xách tay', 'laptop', 'máy tính',
  ],
  camera: [
    // English
    'camera', 'cameras', 'lens', 'cam', 'webcam', 'dslr', 'action cam',
    // Khmer
    'កាមេរ៉ា', 'ម៉ាស៊ីនថត', 'ថតរូប', 'ម៉ាស៊ីនថតរូប', 'កាមេរ៉ាសុវត្ថិភាព',
    // Chinese
    '相机', '摄像机', '照相机', '单反',
    // Thai
    'กล้อง', 'กล้องถ่ายรูป', 'กล้องวิดีโอ',
    // Vietnamese
    'máy ảnh', 'máy quay phim', 'camera',
  ],
  shoes: [
    // English
    'shoes', 'shoe', 'sneakers', 'footwear', 'boots', 'sandals', 'running shoes',
    // Khmer
    'ស្បែកជើង', 'ស្បែកជើងប៉ាតា', 'ស្បែកជើងកីឡា', 'ស្បែកជើងស្បែក', 'ស្បែកជើងរត់',
    // Chinese
    '鞋子', '运动鞋', '球鞋', '跑鞋', '皮鞋',
    // Thai
    'รองเท้า', 'รองเท้าผ้าใบ', 'รองเท้ากีฬา',
    // Vietnamese
    'giày', 'giày thể thao', 'giày chạy bộ',
  ],
  charger: [
    // English
    'charger', 'chargers', 'adapter', 'cable', 'power', 'fast charger', 'power bank', 'charging',
    // Khmer
    'ឆ្នាំងសាក', 'ក្បាលសាក', 'ខ្សែសាក', 'ដុំសាក', 'ដុំសាកថ្ម', 'ឧបករណ៍សាកថ្ម',
    // Chinese
    '充电器', '充电头', '数据线', '快充', '充电宝',
    // Thai
    'ที่ชาร์จ', 'หัวชาร์จ', 'สายชาร์จ',
    // Vietnamese
    'củ sạc', 'sạc', 'dây sạc', 'cáp sạc',
  ],
  watch: [
    // English
    'watch', 'watches', 'smartwatch', 'smartwatches', 'wrist watch',
    // Khmer
    'នាឡិកា', 'នាឡិកាឆ្លាតវៃ', 'នាឡិកាដៃ',
    // Chinese
    '手表', '智能手表',
    // Thai
    'นาฬิกา', 'สมาร์ทวอทช์',
    // Vietnamese
    'đồng hồ', 'đồng hồ thông minh',
  ],
  audio: [
    // English
    'audio', 'speaker', 'speakers', 'sound', 'headphone', 'headphones', 'earphone', 'earphones', 'earbuds', 'mic',
    // Khmer
    'បាស', 'កាស', 'កាសត្រចៀក', 'ឧបករណ៍បំពងសំឡេង', 'សំឡេង', 'ស្ពីកគឺ',
    // Chinese
    '音响', '耳机', '蓝牙音箱', '喇叭',
    // Thai
    'ลำโพง', 'หูฟัง', 'เครื่องเสียง',
    // Vietnamese
    'loa', 'tai nghe', 'âm thanh',
  ],
  monitor: [
    // English
    'monitor', 'monitors', 'screen', 'display', 'lcd', 'led screen',
    // Khmer
    'ម៉ូនីទ័រ', 'អេក្រង់', 'កញ្ចក់', 'កញ្ចក់អេក្រង់',
    // Chinese
    '显示器', '屏幕',
    // Thai
    'จอมอนิเตอร์', 'หน้าจอ',
    // Vietnamese
    'màn hình', 'màn hình máy tính',
  ],
  apparel: [
    // English
    'apparel', 'clothes', 'clothing', 'shirt', 'shirts', 't-shirt', 'pants', 'dress',
    // Khmer
    'ខោអាវ', 'សម្លៀកបំពាក់', 'អាវ', 'ខោ', 'រ៉ូប', 'អាវយឺត',
    // Chinese
    '衣服', '服装', '上衣', '裤子',
    // Thai
    'เสื้อผ้า', 'เสื้อ', 'กางเกง',
    // Vietnamese
    'quần áo', 'áo', 'quần',
  ],
}

// 5-Language Known Brands Mapping
export const KNOWN_BRANDS: Record<string, string[]> = {
  Apple: ['apple', 'iphone', 'ipad', 'macbook', 'airpods', 'iwatch', 'អាប់ផល', '苹果', 'แอปเปิ้ล'],
  Xiaomi: ['xiaomi', 'redmi', 'poco', 'មី', 'សៀវមី', '小米', 'เสียวหมี่'],
  Dell: ['dell', 'alienware', 'ដេល', '戴尔', 'เดลล์'],
  Samsung: ['samsung', 'galaxy', 'សាំស៊ុង', '三星', 'ซัมซุง'],
  Sony: ['sony', 'playstation', 'bravia', 'សូនី', '索尼', 'โซนี่'],
  HP: ['hp', 'hewlett packard', 'អេចភី'],
  JBL: ['jbl', 'ជេប៊ីអិល'],
  Logitech: ['logitech', 'ឡូជីថិច', '罗技', 'โลจิเทค'],
  Asus: ['asus', 'rog', 'អេហ្ស៊ុស', '华硕'],
  Oppo: ['oppo', 'អូប៉ូ'],
  Nike: ['nike', 'ណៃគី', '耐克', 'ไนกี้'],
  Adidas: ['adidas', 'អាឌីដាស', '阿迪达斯', 'อาดิดาส'],
  Canon: ['canon', 'កាណុង', '佳能', 'แคนนอน'],
}

// Levenshtein distance calculation
function levenshteinDistance(a: string, b: string): number {
  const an = a.length
  const bn = b.length
  if (an === 0) return bn
  if (bn === 0) return an

  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0))
  for (let i = 0; i <= an; i++) matrix[0][i] = i
  for (let j = 0; j <= bn; j++) matrix[j][0] = j

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      )
    }
  }

  return matrix[bn][an]
}

// Normalized string similarity
export function stringSimilarity(s1: string, s2: string): number {
  const str1 = s1.toLowerCase().trim()
  const str2 = s2.toLowerCase().trim()

  if (str1 === str2) return 1.0
  if (str1.includes(str2) || str2.includes(str1)) return 0.88

  const maxLen = Math.max(str1.length, str2.length)
  if (maxLen === 0) return 1.0

  const dist = levenshteinDistance(str1, str2)
  return Math.max(0, 1 - dist / maxLen)
}

/**
 * 1. AI Language & Script Detector (Khmer & English)
 */
export function detectLanguageFromVoiceText(text: string): LanguageInfo {
  const trimmed = text.trim()
  if (!trimmed) return SUPPORTED_LANGUAGES['en-US']

  // Khmer Unicode Range: \u1780-\u17FF
  if (/[\u1780-\u17FF]/.test(trimmed)) {
    return SUPPORTED_LANGUAGES['km-KH']
  }

  return SUPPORTED_LANGUAGES['en-US']
}

export interface AISpeechAnalysis {
  detectedLanguage: LanguageInfo
  intentType: 'exact_product' | 'brand_and_category' | 'broad_category' | 'brand_only' | 'keyword' | 'greeting'
  extractedBrand?: string
  extractedCategory?: string
  extractedDigits?: string
  resolvedKeyword: string
  matchedProduct?: Product
  explanation: string
  originalSpokenText: string
}

export const GREETINGS_MAP: Record<string, string[]> = {
  km: ['សួរស្តី', 'សួស្ដី', 'ជំរាបសួរ', 'ជំរាបសួរលោកអ្នក', 'សួរស្តីបង', 'សួស្ដីបង', 'សុខសប្បាយ', 'សុខសប្បាយជាទេ'],
  phonetic_km: ['so tod y', 'so todey', 'suosdei', 'suosdey', 'sousdey', 'susdey', 'soursdey', 'sou sdey', 'sour sdey', 'so tedy'],
  en: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'welcome'],
  zh: ['你好', '您好', '早上好', '下午好', '晚上好'],
  th: ['สวัสดี', 'สวัสดีครับ', 'สวัสดีค่ะ', 'หวัดดี'],
  vi: ['xin chào', 'chào bạn', 'chào buổi sáng'],
}

/**
 * 2. Deep AI Speech & Intent Analysis Engine
 * Analyzes audio transcripts across 5 languages, extracts semantic tokens,
 * strips conversational fluff, and matches against POS products.
 */
export function analyzeVoiceSpeech(
  spokenText: string,
  products: Product[] = []
): AISpeechAnalysis {
  const cleanInput = spokenText.trim()
  if (!cleanInput) {
    return {
      detectedLanguage: SUPPORTED_LANGUAGES['en-US'],
      intentType: 'keyword',
      resolvedKeyword: '',
      explanation: 'No speech input provided',
      originalSpokenText: spokenText,
    }
  }

  const rawLower = cleanInput.toLowerCase()

  // 1. Detect Greetings (Khmer 'សួរស្តី', English 'hello', phonetic 'so tod y', etc.)
  const isKhmerGreeting = GREETINGS_MAP.km.some(g => rawLower === g || rawLower.includes(g)) ||
    GREETINGS_MAP.phonetic_km.some(g => rawLower === g || rawLower.includes(g))

  const isOtherGreeting = [...GREETINGS_MAP.en, ...GREETINGS_MAP.zh, ...GREETINGS_MAP.th, ...GREETINGS_MAP.vi].some(
    g => rawLower === g.toLowerCase() || rawLower.includes(g.toLowerCase())
  )

  if (isKhmerGreeting || isOtherGreeting) {
    return {
      detectedLanguage: isKhmerGreeting ? SUPPORTED_LANGUAGES['km-KH'] : detectLanguageFromVoiceText(cleanInput),
      intentType: 'greeting',
      resolvedKeyword: '',
      explanation: '👋 សួរស្តី! សូមនិយាយឈ្មោះទំនិញដែលអ្នកចង់ស្វែងរក (ឧទាហរណ៍៖ "Apple Keyboard 75" ឬ "កាមេរ៉ា Dell")',
      originalSpokenText: spokenText,
    }
  }

  // 2. Detect language
  const detectedLang = detectLanguageFromVoiceText(cleanInput)

  // 3. Strip conversational stopwords
  let sanitizedText = cleanInput.toLowerCase()
  const stopWords = CONVERSATIONAL_STOP_WORDS[detectedLang.code] || []
  for (const sw of stopWords) {
    sanitizedText = sanitizedText.replace(new RegExp(`\\b${sw}\\b`, 'gi'), '').replace(new RegExp(`${sw}`, 'gi'), ' ')
  }
  sanitizedText = sanitizedText.replace(/\s+/g, ' ').trim() || cleanInput.toLowerCase()

  const tokens = sanitizedText.split(/[\s,+/_-]+/).filter(Boolean)
  const digitsMatch = cleanInput.match(/\d+/)
  const extractedDigits = digitsMatch ? digitsMatch[0] : undefined

  // 3. Extract Brand
  let extractedBrand: string | undefined
  for (const [brandName, brandAliases] of Object.entries(KNOWN_BRANDS)) {
    const isBrandMatch = tokens.some(tok =>
      brandName.toLowerCase() === tok ||
      brandAliases.some(alias => alias.toLowerCase() === tok || stringSimilarity(tok, alias.toLowerCase()) >= 0.85)
    )
    if (isBrandMatch) {
      extractedBrand = brandName
      break
    }
  }

  // 4. Extract Category / Concept
  let extractedCategory: string | undefined
  let conceptKeyFound: string | undefined
  for (const [conceptKey, synonyms] of Object.entries(SYNONYM_DICTIONARY)) {
    const isConceptMatch = tokens.some(tok =>
      conceptKey === tok ||
      conceptKey.startsWith(tok) ||
      stringSimilarity(tok, conceptKey) >= 0.78 ||
      synonyms.some(syn => syn.toLowerCase() === tok || stringSimilarity(tok, syn.toLowerCase()) >= 0.82)
    )
    if (isConceptMatch) {
      conceptKeyFound = conceptKey
      extractedCategory = conceptKey.charAt(0).toUpperCase() + conceptKey.slice(1)
      break
    }
  }

  // 5. Match Exact Product if present in Catalog
  if (products.length > 0) {
    for (const p of products) {
      const pName = (p.name || '').toLowerCase()
      const pSku = (p.sku || '').toLowerCase()
      const pBarcode = (p.barcode || '').toLowerCase()

      // Exact barcode or SKU
      if (pBarcode && pBarcode === sanitizedText) {
        return {
          detectedLanguage: detectedLang,
          intentType: 'exact_product',
          extractedBrand: p.brand?.name || extractedBrand,
          extractedCategory: p.category?.name || extractedCategory,
          extractedDigits,
          resolvedKeyword: p.name,
          matchedProduct: p,
          explanation: `Exact Barcode: ${p.barcode}`,
          originalSpokenText: spokenText,
        }
      }

      if (pSku && (pSku === sanitizedText || sanitizedText.includes(pSku))) {
        return {
          detectedLanguage: detectedLang,
          intentType: 'exact_product',
          extractedBrand: p.brand?.name || extractedBrand,
          extractedCategory: p.category?.name || extractedCategory,
          extractedDigits,
          resolvedKeyword: p.name,
          matchedProduct: p,
          explanation: `Exact SKU: ${p.sku}`,
          originalSpokenText: spokenText,
        }
      }

      // Check full name match
      if (pName === sanitizedText || stringSimilarity(sanitizedText, pName) >= 0.88) {
        return {
          detectedLanguage: detectedLang,
          intentType: 'exact_product',
          extractedBrand: p.brand?.name || extractedBrand,
          extractedCategory: p.category?.name || extractedCategory,
          extractedDigits,
          resolvedKeyword: p.name,
          matchedProduct: p,
          explanation: `Direct Name Match: ${p.name}`,
          originalSpokenText: spokenText,
        }
      }

      // Brand + Category + Model digits (e.g. "Apple Keyboard 75")
      if (extractedBrand && extractedCategory && extractedDigits) {
        if (
          pName.includes(extractedBrand.toLowerCase()) &&
          pName.includes(conceptKeyFound || extractedCategory.toLowerCase()) &&
          pName.includes(extractedDigits)
        ) {
          return {
            detectedLanguage: detectedLang,
            intentType: 'exact_product',
            extractedBrand,
            extractedCategory,
            extractedDigits,
            resolvedKeyword: p.name,
            matchedProduct: p,
            explanation: `AI Identified Model: ${p.name}`,
            originalSpokenText: spokenText,
          }
        }
      }
    }
  }

  // 6. Determine Classification Hierarchy:

  // A. Model with digits specified (e.g. "Keyboard 75", "Dell 97")
  if (extractedDigits) {
    const parts = [extractedBrand, extractedCategory, extractedDigits].filter(Boolean)
    const resolved = parts.length > 0 ? parts.join(' ') : cleanInput
    return {
      detectedLanguage: detectedLang,
      intentType: 'exact_product',
      extractedBrand,
      extractedCategory,
      extractedDigits,
      resolvedKeyword: resolved,
      explanation: `Specific Model: ${resolved}`,
      originalSpokenText: spokenText,
    }
  }

  // B. Brand + Category combined (e.g. "Apple Keyboard", "Dell Camera", "Xiaomi Laptop")
  if (extractedBrand && extractedCategory) {
    const resolved = `${extractedBrand} ${extractedCategory}`
    return {
      detectedLanguage: detectedLang,
      intentType: 'brand_and_category',
      extractedBrand,
      extractedCategory,
      resolvedKeyword: resolved,
      explanation: `Brand + Category: ${resolved}`,
      originalSpokenText: spokenText,
    }
  }

  // C. Broad Category (e.g. "Keyboard", "ក្តារចុច", "Camera", "Shoes", "Phone")
  if (extractedCategory) {
    return {
      detectedLanguage: detectedLang,
      intentType: 'broad_category',
      extractedCategory,
      resolvedKeyword: extractedCategory,
      explanation: `Category Filter: All ${extractedCategory} products`,
      originalSpokenText: spokenText,
    }
  }

  // D. Brand Only (e.g. "Apple", "Dell", "Xiaomi")
  if (extractedBrand) {
    return {
      detectedLanguage: detectedLang,
      intentType: 'brand_only',
      extractedBrand,
      resolvedKeyword: extractedBrand,
      explanation: `Brand Filter: All ${extractedBrand} products`,
      originalSpokenText: spokenText,
    }
  }

  // E. Fallback clean keyword
  return {
    detectedLanguage: detectedLang,
    intentType: 'keyword',
    resolvedKeyword: sanitizedText || cleanInput,
    explanation: `Keyword Search: "${sanitizedText || cleanInput}"`,
    originalSpokenText: spokenText,
  }
}

export interface AIMatchResult {
  product: Product
  score: number
  matchedReason: string
}

/**
 * Intelligent AI Fuzzy & Semantic Product Matcher
 * Returns candidate list scored by multi-lingual semantic relevance.
 */
export function matchProductsWithAI(
  query: string,
  products: Product[],
  threshold = 0.25
): AIMatchResult[] {
  const cleanQuery = query.toLowerCase().trim()
  if (!cleanQuery) return []

  const queryWords = cleanQuery.split(/[\s,+/_-]+/).filter(Boolean)

  // Expand query words with 5-language semantic synonyms
  const expandedConcepts: string[] = [...queryWords]
  for (const [conceptKey, synonyms] of Object.entries(SYNONYM_DICTIONARY)) {
    const matchesConcept = queryWords.some(qw =>
      conceptKey.includes(qw) ||
      qw.includes(conceptKey) ||
      stringSimilarity(qw, conceptKey) >= 0.75 ||
      synonyms.some(syn => syn.toLowerCase().includes(qw) || qw.includes(syn.toLowerCase()) || stringSimilarity(qw, syn.toLowerCase()) >= 0.8)
    )
    if (matchesConcept) {
      expandedConcepts.push(conceptKey, ...synonyms)
    }
  }

  const results: AIMatchResult[] = []

  for (const product of products) {
    let maxScore = 0
    let bestReason = ''

    const productName = (product.name || '').toLowerCase()
    const productSku = (product.sku || '').toLowerCase()
    const productBarcode = (product.barcode || '').toLowerCase()
    const categoryName = (product.category?.name || '').toLowerCase()
    const brandName = (product.brand?.name || '').toLowerCase()

    // 1. Exact Barcode or SKU match (Highest priority)
    if (productBarcode && (productBarcode === cleanQuery || cleanQuery.includes(productBarcode))) {
      maxScore = 1.0
      bestReason = `Exact Barcode: ${product.barcode}`
    } else if (productSku === cleanQuery || cleanQuery.includes(productSku)) {
      maxScore = 0.98
      bestReason = `Exact SKU: ${product.sku}`
    }

    // 2. Direct Name Match / Substring
    if (productName.includes(cleanQuery)) {
      const directScore = 0.95
      if (directScore > maxScore) {
        maxScore = directScore
        bestReason = `Name Match`
      }
    }

    // 3. Name Similarity
    const nameSim = stringSimilarity(cleanQuery, productName)
    if (nameSim > maxScore) {
      maxScore = nameSim
      bestReason = `Name Match (${Math.round(nameSim * 100)}%)`
    }

    // 4. Word-by-word fuzzy match with product name and brand
    const productTokens = `${productName} ${categoryName} ${brandName}`.split(/[\s,+/_-]+/)

    for (const qWord of queryWords) {
      if (qWord.length < 2) continue

      for (const pToken of productTokens) {
        if (pToken.length < 2) continue

        const tokenSim = stringSimilarity(qWord, pToken)
        if (tokenSim >= 0.75) {
          const scoreBoost = tokenSim * 0.9
          if (scoreBoost > maxScore) {
            maxScore = scoreBoost
            bestReason = `Fuzzy Match: "${qWord}" ≈ "${pToken}"`
          }
        }
      }
    }

    // 5. Semantic Concept / Cross-lingual match (e.g. keyboard, phone, shoes, camera)
    for (const concept of expandedConcepts) {
      if (concept.length < 2) continue
      if (productName.includes(concept) || categoryName.includes(concept) || brandName.includes(concept)) {
        const conceptScore = 0.88
        if (conceptScore > maxScore) {
          maxScore = conceptScore
          bestReason = `Category: ${product.category?.name || concept}`
        }
      }
    }

    if (maxScore >= threshold) {
      results.push({
        product,
        score: maxScore,
        matchedReason: bestReason,
      })
    }
  }

  // Sort by highest score first
  return results.sort((a, b) => b.score - a.score)
}
