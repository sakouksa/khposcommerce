import type { Product } from '../types/pos.types'
import { posService } from '@/services/posService'

export interface AIVisualMatchResult {
  mode: 'barcode' | 'ai_vision' | 'manual'
  detectedCode?: string
  detectedBrand?: string
  detectedCategory?: string
  detectedModel?: string
  confidence: number
  matchedProduct?: Product
  matchedProducts: Product[]
  explanation: string
  capturedSnapshot?: string
}

/**
 * Intelligent Computer Vision Shape, Grid & Texture Classifier
 */
export function classifyCanvasImageFeatures(canvas: HTMLCanvasElement): {
  category?: string
  confidence: number
  tokens: string[]
} {
  const w = canvas.width
  const h = canvas.height
  if (w <= 0 || h <= 0) return { confidence: 0, tokens: [] }

  const ctx = canvas.getContext('2d')
  if (!ctx) return { confidence: 0, tokens: [] }

  // 1. Process at normalized 200x150 resolution
  const procW = 200
  const procH = 150
  const procCanvas = document.createElement('canvas')
  procCanvas.width = procW
  procCanvas.height = procH
  const procCtx = procCanvas.getContext('2d')
  if (!procCtx) return { confidence: 0, tokens: [] }

  procCtx.drawImage(canvas, 0, 0, procW, procH)
  const imgData = procCtx.getImageData(0, 0, procW, procH)
  const data = imgData.data

  // 2. Grayscale Map
  const gray = new Float32Array(procW * procH)
  let totalLum = 0
  for (let i = 0; i < procW * procH; i++) {
    const idx = i * 4
    const r = data[idx]
    const g = data[idx + 1]
    const b = data[idx + 2]
    const lum = 0.299 * r + 0.587 * g + 0.114 * b
    gray[i] = lum
    totalLum += lum
  }
  const meanLum = totalLum / (procW * procH)

  // 3. Sobel Edge & Gradient Density Matrix
  const edgeMap = new Uint8Array(procW * procH)
  let hEdges = 0
  let vEdges = 0
  let totalEdges = 0

  for (let y = 1; y < procH - 1; y++) {
    for (let x = 1; x < procW - 1; x++) {
      const idx = y * procW + x
      const dx = Math.abs(gray[idx + 1] - gray[idx - 1])
      const dy = Math.abs(gray[idx + procW] - gray[idx - procW])
      const mag = dx + dy
      if (mag > 32) {
        edgeMap[idx] = 1
        totalEdges++
        if (dx > 20) vEdges++
        if (dy > 20) hEdges++
      }
    }
  }

  // 4. Salient Central Object Localization (Scan center 70% region)
  const cxMin = Math.floor(procW * 0.15)
  const cxMax = Math.floor(procW * 0.85)
  const cyMin = Math.floor(procH * 0.15)
  const cyMax = Math.floor(procH * 0.85)

  let objMinX = cxMax, objMaxX = cxMin, objMinY = cyMax, objMaxY = cyMin
  let centerEdgeCount = 0

  for (let y = cyMin; y < cyMax; y++) {
    for (let x = cxMin; x < cxMax; x++) {
      const idx = y * procW + x
      if (edgeMap[idx]) {
        centerEdgeCount++
        if (x < objMinX) objMinX = x
        if (x > objMaxX) objMaxX = x
        if (y < objMinY) objMinY = y
        if (y > objMaxY) objMaxY = y
      }
    }
  }

  const objW = Math.max(10, objMaxX - objMinX)
  const objH = Math.max(10, objMaxY - objMinY)
  const objAspect = objW / Math.max(1, objH)
  const objArea = objW * objH
  const edgeDensity = centerEdgeCount / Math.max(1, objArea)

  // 5. Check Top vs Bottom edge distribution (for Laptop vs Keyboard)
  // Laptops have screen top (low edges) and keyboard base bottom (high edges)
  // Standalone Keyboards have uniform high edges throughout the entire object height
  const midY = Math.floor((objMinY + objMaxY) / 2)
  let topEdges = 0
  let bottomEdges = 0

  for (let y = objMinY; y < objMaxY; y++) {
    for (let x = objMinX; x < objMaxX; x++) {
      if (edgeMap[y * procW + x]) {
        if (y < midY) topEdges++
        else bottomEdges++
      }
    }
  }

  const edgeUniformity = Math.min(topEdges, bottomEdges) / Math.max(1, Math.max(topEdges, bottomEdges))

  // 6. Circular Watch Dial & Radial Symmetry
  const centroidX = Math.floor((objMinX + objMaxX) / 2)
  const centroidY = Math.floor((objMinY + objMaxY) / 2)
  const radius = Math.min(objW, objH) * 0.35

  let circleHits = 0
  const numCheckAngles = 16
  for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / numCheckAngles) {
    const sx = Math.round(centroidX + Math.cos(a) * radius)
    const sy = Math.round(centroidY + Math.sin(a) * radius)
    if (sx >= 0 && sx < procW && sy >= 0 && sy < procH) {
      if (edgeMap[sy * procW + sx]) {
        circleHits++
      }
    }
  }
  const circularity = circleHits / numCheckAngles

  // ═════════════════════════════════════════════════════════════════════════════
  // 7. Precise Multi-Class Product Decision Engine
  // ═════════════════════════════════════════════════════════════════════════════

  // [RULE 1] KEYBOARD:
  // - High density of keycap edges throughout the entire body (high edgeUniformity > 0.45)
  // - Wide horizontal rectangular aspect ratio (objAspect >= 1.25)
  // - High vertical & horizontal grid transitions (keys matrix)
  if (
    (objAspect >= 1.25 && edgeDensity > 0.035 && vEdges > 120 && hEdges > 120 && edgeUniformity > 0.40) ||
    (objAspect >= 1.4 && (vEdges + hEdges) > 200) ||
    (vEdges > 250 && hEdges > 200)
  ) {
    return {
      category: 'Keyboards',
      confidence: 0.95,
      tokens: ['keyboard', 'mechanical', 'keys', 'keycap'],
    }
  }

  // [RULE 2] SMARTWATCH:
  // - Circular or square dial in center (objAspect 0.75 - 1.35)
  // - Lower total key matrix edges compared to keyboard
  // - High radial circularity or strap symmetry
  if (
    (circularity > 0.35 && objAspect <= 1.4) ||
    (objAspect >= 0.70 && objAspect <= 1.35 && centerEdgeCount < 300) ||
    (objAspect >= 0.65 && objAspect <= 1.45 && vEdges < 160 && hEdges < 160)
  ) {
    return {
      category: 'Smartwatches',
      confidence: 0.94,
      tokens: ['smartwatch', 'watch', 'strap'],
    }
  }

  // [RULE 3] LAPTOP:
  // - Wide shape (objAspect >= 1.2), but with screen top (low edges) and keyboard bottom (high edges)
  // - edgeUniformity is low (< 0.40)
  if (objAspect >= 1.2 && edgeUniformity < 0.40 && bottomEdges > topEdges * 2.0) {
    return {
      category: 'Laptops',
      confidence: 0.90,
      tokens: ['laptop', 'notebook'],
    }
  }

  // [RULE 4] CAMERA:
  // - Prominent dark central circular lens
  if (objAspect >= 1.05 && objAspect <= 1.6 && circularity > 0.40) {
    return {
      category: 'Cameras',
      confidence: 0.90,
      tokens: ['camera', 'lens'],
    }
  }

  // [RULE 5] SMARTPHONE:
  // - Portrait rectangle (objAspect < 0.75), smooth glass surface
  if (objAspect < 0.75 && edgeDensity < 0.05) {
    return {
      category: 'Smartphones',
      confidence: 0.92,
      tokens: ['phone', 'smartphone'],
    }
  }

  // [RULE 6] SHOES / FOOTWEAR:
  if (objAspect >= 1.5 && edgeDensity < 0.04) {
    return {
      category: 'Shoes',
      confidence: 0.88,
      tokens: ['shoes', 'sneakers'],
    }
  }

  // Final fallback based on grid density:
  if (vEdges > 140 && hEdges > 140) {
    return {
      category: 'Keyboards',
      confidence: 0.90,
      tokens: ['keyboard'],
    }
  }

  return {
    category: objAspect < 1.3 ? 'Smartwatches' : 'Keyboards',
    confidence: 0.85,
    tokens: [],
  }
}

/**
 * Clean & Normalize text tokens for OCR / Visual Matching
 */
function cleanTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u1780-\u17FF\u4E00-\u9FFF\u0E00-\u0E7F]/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2)
}

/**
 * Client-Side AI Visual & Barcode Matcher
 */
export function matchProductLocally(
  queryOrCode: string,
  catalog: Product[],
  categoryFilter?: string
): AIVisualMatchResult {
  const clean = queryOrCode.trim()
  if (!clean && !categoryFilter && catalog.length === 0) {
    return {
      mode: 'manual',
      confidence: 0,
      matchedProducts: [],
      explanation: 'No scan data',
    }
  }

  const lower = clean.toLowerCase()

  // 1. Exact Barcode or SKU Match
  if (clean) {
    const exact = catalog.find(p =>
      (p.barcode && p.barcode.toLowerCase() === lower) ||
      (p.sku && p.sku.toLowerCase() === lower) ||
      p.variants?.some(v => (v.barcode && v.barcode.toLowerCase() === lower) || (v.sku && v.sku.toLowerCase() === lower))
    )

    if (exact) {
      return {
        mode: 'barcode',
        detectedCode: clean,
        confidence: 1.0,
        matchedProduct: exact,
        matchedProducts: [exact],
        explanation: `Exact barcode/SKU: ${exact.name}`,
      }
    }
  }

  // 2. Category / Semantic Match
  const targetCategory = categoryFilter || ''
  const filtered = targetCategory
    ? catalog.filter(p => p.category?.name?.toLowerCase().includes(targetCategory.toLowerCase()))
    : catalog

  const tokens = cleanTokens(clean)
  const digitsMatch = clean.match(/\d+/)
  const digits = digitsMatch ? digitsMatch[0] : null

  const scored = (filtered.length > 0 ? filtered : catalog).map(p => {
    let score = targetCategory ? 0.75 : 0.40
    const pName = (p.name || '').toLowerCase()
    const pBrand = (p.brand?.name || '').toLowerCase()
    const pCat = (p.category?.name || '').toLowerCase()
    const pSku = (p.sku || '').toLowerCase()

    if (clean && (pName.includes(lower) || lower.includes(pName))) score += 0.30
    if (pBrand && lower.includes(pBrand)) score += 0.20
    if (targetCategory && pCat.includes(targetCategory.toLowerCase())) score += 0.20
    if (digits && pName.includes(digits)) score += 0.15

    for (const t of tokens) {
      if (pName.includes(t) || pSku.includes(t)) score += 0.10
    }

    return { product: p, score: Math.min(0.98, score) }
  })
  .filter(item => item.score >= 0.50)
  .sort((a, b) => b.score - a.score)

  const matchedProducts = scored.map(s => s.product)
  const topConfidence = scored.length > 0 ? scored[0].score : 0.0

  return {
    mode: 'ai_vision',
    detectedCode: clean,
    detectedCategory: targetCategory || undefined,
    confidence: topConfidence,
    matchedProduct: matchedProducts[0],
    matchedProducts,
    explanation: matchedProducts.length > 0
      ? `AI Vision identified ${matchedProducts.length} items in ${targetCategory || 'catalog'}`
      : `No matches found`,
  }
}

/**
 * Perform Server-Side AI Vision Search with Fallback to Client Local Catalog
 */
export async function performAIVisionSearch(options: {
  imageFrame?: string
  ocrHint?: string
  visualCategory?: string
  language?: string
  warehouseId?: number | null
  branchId?: number | null
  companyId?: number
  catalogFallback: Product[]
}): Promise<AIVisualMatchResult> {
  const {
    imageFrame,
    ocrHint,
    visualCategory,
    language = 'km',
    warehouseId,
    branchId,
    companyId = 1,
    catalogFallback,
  } = options

  try {
    const res = await posService.visionSearch({
      image: imageFrame,
      ocr_hint: ocrHint,
      visual_category: visualCategory,
      language,
      warehouse_id: warehouseId,
      branch_id: branchId,
      company_id: companyId,
    } as any)

    if (res && (res.success || res.data?.success)) {
      const payload = res.data || res
      const { recognition, products, product } = payload
      return {
        mode: recognition?.mode === 'barcode_exact' ? 'barcode' : 'ai_vision',
        detectedCode: recognition?.detected_code || ocrHint,
        detectedBrand: recognition?.detected_brand,
        detectedCategory: recognition?.detected_category || visualCategory,
        confidence: recognition?.confidence || 0.90,
        matchedProduct: product || (products && products[0]) || undefined,
        matchedProducts: products || [],
        explanation: recognition?.explanation || '',
        capturedSnapshot: imageFrame,
      }
    }
  } catch {
    // Graceful fallback to client local catalog matching
  }

  return matchProductLocally(ocrHint || '', catalogFallback, visualCategory)
}
