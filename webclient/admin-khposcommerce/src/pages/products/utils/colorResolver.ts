import { getAbsoluteImageUrl, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'

export const COLOR_MAP: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  silver: '#C0C0C0',
  'space gray': '#4B5563',
  'space grey': '#4B5563',
  gray: '#6B7280',
  grey: '#6B7280',
  red: '#EF4444',
  blue: '#3B82F6',
  gold: '#D97706',
  'rose gold': '#F472B6',
  green: '#10B981',
  yellow: '#EAB308',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  brown: '#78350F',
  midnight: '#1E293B',
  starlight: '#F1F5F9',
  titanium: '#94A3B8',
}

export const normalizeColorKey = (color: string): string => {
  const c = (color || '').trim().toLowerCase()
  if (c === 'ខ្មៅ' || c === 'black' || c === 'space black' || c === 'midnight') return 'Black'
  if (c === 'ស' || c === 'white' || c === 'starlight') return 'White'
  if (c === 'ប្រាក់' || c === 'silver' || c === 'natural titanium' || c === 'desert titanium') return 'Silver'
  if (c === 'ប្រផេះអវកាស' || c === 'ប្រផេះ' || c === 'space gray' || c === 'titanium gray' || c === 'gray' || c === 'grey') return 'Space Gray'
  if (c === 'មាស' || c === 'gold' || c === 'rose gold') return 'Gold'
  if (c === 'ក្រហម' || c === 'red') return 'Red'
  if (c === 'ខៀវ' || c === 'blue') return 'Blue'
  if (c === 'បៃតង' || c === 'green') return 'Green'
  if (c === 'ស្វាយ' || c === 'purple' || c === 'violet') return 'Purple'
  if (c === 'ផ្កាឈូក' || c === 'pink') return 'Pink'
  if (c === 'លឿង' || c === 'yellow') return 'Yellow'
  if (c === 'ទឹកក្រូច' || c === 'orange') return 'Orange'
  if (c === 'ត្នោត' || c === 'brown') return 'Brown'
  return color
}

export const normalizeColorName = (rawColor: string): string => {
  if (!rawColor) return ''
  const trimmed = rawColor.trim()
  const lower = trimmed.toLowerCase()
  const colorMap: Record<string, string> = {
    'ខ្មៅ': 'Black', 'black': 'Black',
    'ស': 'White', 'white': 'White',
    'ប្រាក់': 'Silver', 'silver': 'Silver',
    'ប្រផេះតាន': 'Space Gray', 'ប្រផេះ': 'Space Gray', 'space gray': 'Space Gray', 'space grey': 'Space Gray',
    'ក្រហម': 'Red', 'red': 'Red',
    'ខៀវ': 'Blue', 'blue': 'Blue',
    'មាស': 'Gold', 'gold': 'Gold',
    'បៃតង': 'Green', 'green': 'Green',
    'ស្វាយ': 'Purple', 'purple': 'Purple',
    'ផ្កាឈូក': 'Pink', 'pink': 'Pink',
    'natural titanium': 'Natural Titanium',
    'space black': 'Space Black',
    'titanium gray': 'Titanium Gray',
    'titanium grey': 'Titanium Gray',
    'midnight': 'Midnight',
    'starlight': 'Starlight',
    'rose gold': 'Rose Gold',
  }
  return colorMap[lower] || colorMap[trimmed] || trimmed
}

export const getDynamicColorMatchedImage = (
  colorName: string,
  categoryPreset?: string,
  productImages?: any[],
  colorImageMap?: Record<string, string>,
  productTitle?: string
): string => {
  const cleanColor = (colorName || '').trim()
  const normalizedColor = normalizeColorKey(cleanColor)

  // 1. Check explicit colorImageMap assignment
  if (cleanColor && colorImageMap && colorImageMap[cleanColor]) {
    return colorImageMap[cleanColor]
  }
  if (normalizedColor && colorImageMap && colorImageMap[normalizedColor]) {
    return colorImageMap[normalizedColor]
  }

  // 2. Check if product gallery has images matching color keyword in title or filename
  if (cleanColor && productImages && productImages.length > 0) {
    const matchedGalleryImg = productImages.find((img: any) => {
      const urlOrAlt = (img.url || img.image || img.alt || '').toLowerCase()
      return urlOrAlt.includes(cleanColor.toLowerCase()) || (normalizedColor && urlOrAlt.includes(normalizedColor.toLowerCase()))
    })
    if (matchedGalleryImg?.url || matchedGalleryImg?.image) {
      return getAbsoluteImageUrl(matchedGalleryImg.url || matchedGalleryImg.image)
    }
  }

  // 3. AI Category & Product Type Context Analyzer
  const titleLower = (productTitle || '').toLowerCase()
  const presetLower = (categoryPreset || '').toLowerCase()

  const isPhone = presetLower.includes('phone') || titleLower.includes('phone') || titleLower.includes('iphone') || titleLower.includes('galaxy') || titleLower.includes('mobile') || titleLower.includes('smartphone') || titleLower.includes('tablet') || titleLower.includes('ipad') || titleLower.includes('pro max')
  const isWatch = presetLower.includes('watch') || titleLower.includes('watch') || titleLower.includes('apple watch') || titleLower.includes('smartwatch')
  const isLaptop = presetLower.includes('tech_spec') || presetLower.includes('laptop') || titleLower.includes('macbook') || titleLower.includes('laptop') || titleLower.includes('notebook') || titleLower.includes('pc')
  const isShoe = presetLower.includes('shoe') || titleLower.includes('shoe') || titleLower.includes('sneaker') || titleLower.includes('nike') || titleLower.includes('footwear')
  const isKeyboard = presetLower.includes('keyboard') || titleLower.includes('keyboard') || titleLower.includes('keychron')
  const isApparel = presetLower.includes('apparel') || titleLower.includes('shirt') || titleLower.includes('clothing') || titleLower.includes('fashion')

  // Category specific color catalogs using REAL LOCAL PROJECT IMAGES
  const phoneCatalog: Record<string, string> = {
    'Black': '/api/v1/storage/products/smartphones/product_1_1.webp',
    'White': '/api/v1/storage/products/smartphones/product_1_2.webp',
    'Silver': '/api/v1/storage/products/smartphones/product_1_3.webp',
    'Space Gray': '/api/v1/storage/products/smartphones/product_1_4.webp',
    'Natural Titanium': '/api/v1/storage/products/smartphones/product_11_1.webp',
    'Desert Titanium': '/api/v1/storage/products/smartphones/product_11_2.webp',
    'Space Black': '/api/v1/storage/products/smartphones/product_11_3.webp',
    'Titanium Gray': '/api/v1/storage/products/smartphones/product_11_4.webp',
    'Midnight': '/api/v1/storage/products/smartphones/product_11_5.webp',
    'Starlight': '/api/v1/storage/products/smartphones/product_21_1.webp',
    'Rose Gold': '/api/v1/storage/products/smartphones/product_21_2.webp',
    'Red': '/api/v1/storage/products/smartphones/product_21_3.webp',
    'Blue': '/api/v1/storage/products/smartphones/product_21_4.webp',
    'Gold': '/api/v1/storage/products/smartphones/product_1_5.webp',
    'Green': '/api/v1/storage/products/smartphones/product_21_5.webp',
    'Purple': '/api/v1/storage/products/smartphones/product_31_1.webp',
    'Pink': '/api/v1/storage/products/smartphones/product_31_2.webp',
    'Yellow': '/api/v1/storage/products/smartphones/product_31_3.webp',
    'Orange': '/api/v1/storage/products/smartphones/product_31_4.webp',
  }

  const watchCatalog: Record<string, string> = {
    'Black': '/api/v1/storage/products/smartwatches/product_14_1.webp',
    'White': '/api/v1/storage/products/smartwatches/product_14_2.webp',
    'Silver': '/api/v1/storage/products/smartwatches/product_14_3.webp',
    'Midnight': '/api/v1/storage/products/smartwatches/product_14_4.webp',
    'Starlight': '/api/v1/storage/products/smartwatches/product_14_5.webp',
    'Rose Gold': '/api/v1/storage/products/smartwatches/product_24_1.webp',
    'Space Gray': '/api/v1/storage/products/smartwatches/product_24_2.webp',
  }

  const laptopCatalog: Record<string, string> = {
    'Black': '/api/v1/storage/products/laptops/product_12_1.webp',
    'Space Black': '/api/v1/storage/products/laptops/product_12_2.webp',
    'White': '/api/v1/storage/products/laptops/product_12_3.webp',
    'Silver': '/api/v1/storage/products/laptops/product_12_4.webp',
    'Space Gray': '/api/v1/storage/products/laptops/product_12_5.webp',
  }

  const shoeCatalog: Record<string, string> = {
    'Black': '/api/v1/storage/products/shoes/product_19_1.webp',
    'White': '/api/v1/storage/products/shoes/product_19_2.webp',
    'Silver': '/api/v1/storage/products/shoes/product_19_3.webp',
  }

  const keyboardCatalog: Record<string, string> = {
    'Black': '/api/v1/storage/products/keyboards/product_15_1.webp',
    'White': '/api/v1/storage/products/keyboards/product_15_2.webp',
  }

  const apparelCatalog: Record<string, string> = {
    'Black': '/api/v1/storage/products/apparel/product_100_1.webp',
    'White': '/api/v1/storage/products/apparel/product_100_2.webp',
    'Silver': '/api/v1/storage/products/apparel/product_100_3.webp',
  }

  const monitorCatalog: Record<string, string> = {
    'Black': '/api/v1/storage/products/monitors/product_13_1.webp',
    'White': '/api/v1/storage/products/monitors/product_13_2.webp',
    'Silver': '/api/v1/storage/products/monitors/product_13_3.webp',
    'Space Gray': '/api/v1/storage/products/monitors/product_13_4.webp',
  }

  let selectedCatalog = monitorCatalog
  if (isPhone) selectedCatalog = phoneCatalog
  else if (isWatch) selectedCatalog = watchCatalog
  else if (isLaptop) selectedCatalog = laptopCatalog
  else if (isShoe) selectedCatalog = shoeCatalog
  else if (isKeyboard) selectedCatalog = keyboardCatalog
  else if (isApparel) selectedCatalog = apparelCatalog

  if (normalizedColor && selectedCatalog[normalizedColor]) {
    return selectedCatalog[normalizedColor]
  }

  if (cleanColor && selectedCatalog[cleanColor]) {
    return selectedCatalog[cleanColor]
  }

  // 4. Primary image fallback or gallery first image
  const primaryImg = productImages?.find((img: any) => img.is_primary)?.url || productImages?.[0]?.url
  if (primaryImg) return getAbsoluteImageUrl(primaryImg)

  // 5. Default fallback to clean default product placeholder
  return DEFAULT_PRODUCT_IMAGE
}

export const COLOR_MATCHED_IMAGES: Record<string, Record<string, string>> = new Proxy(
  {},
  {
    get: (_, presetKey: string) => {
      return new Proxy(
        {},
        {
          get: (_, colorName: string) => {
            return getDynamicColorMatchedImage(colorName, presetKey)
          }
        }
      )
    }
  }
)

export const getVariantColorHex = (v: any): string | null => {
  if (!v) return null
  if (v.color_code) return v.color_code
  if (v.attributes && Array.isArray(v.attributes)) {
    for (const attr of v.attributes) {
      if (attr.color_code) return attr.color_code
      if (attr.attribute_name?.toLowerCase().includes('color') || attr.name?.toLowerCase().includes('color')) {
        const valLower = String(attr.value || '').toLowerCase()
        if (COLOR_MAP[valLower]) return COLOR_MAP[valLower]
      }
    }
  }
  const nameLower = String(v.name || '').toLowerCase()
  for (const [colorName, hex] of Object.entries(COLOR_MAP)) {
    if (nameLower.includes(colorName)) {
      return hex
    }
  }
  return null
}
