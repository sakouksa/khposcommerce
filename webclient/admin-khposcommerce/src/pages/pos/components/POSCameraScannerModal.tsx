import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  X,
  RefreshCw,
  Zap,
  ZapOff,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Keyboard,
  Sparkles,
  Barcode,
  Eye,
  ShoppingCart,
  Search,
  Layers,
  ArrowRight,
  RotateCcw,
  Check,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sound } from '../../../utils/sound'
import type { Product } from '../types/pos.types'
import {
  performAIVisionSearch,
  classifyCanvasImageFeatures,
  type AIVisualMatchResult,
} from '../utils/aiVisualMatcher'
import {
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  HTMLCanvasElementLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
  GlobalHistogramBinarizer,
  InvertedLuminanceSource,
} from '@zxing/library'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { posService } from '@/services/posService'

const getProductImageUrl = (product?: Product | null): string => {
  if (!product) return ''
  if (typeof product.primary_image === 'string') return product.primary_image
  if (product.primary_image && typeof product.primary_image === 'object') {
    return (product.primary_image as any).url || (product.primary_image as any).image || ''
  }
  if (product.images && product.images.length > 0) {
    const first = product.images[0] as any
    return typeof first === 'string' ? first : first.url || first.image || ''
  }
  return ''
}

const barcodeHints = new Map<DecodeHintType, any>()
barcodeHints.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.CODE_128,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.QR_CODE,
])
barcodeHints.set(DecodeHintType.TRY_HARDER, true)

const sharedZxingReader = new MultiFormatReader()
sharedZxingReader.setHints(barcodeHints)

/**
 * Ultra-Fast Multi-Binarizer Barcode Decoder for Video Frames & Canvases
 */
async function decodeBarcodeFromVideoOrCanvas(
  source: HTMLVideoElement | HTMLCanvasElement,
  offscreenCanvas: HTMLCanvasElement
): Promise<string | null> {
  // 1. Hardware Accelerated Native BarcodeDetector (Zero Latency GPU Decoder)
  const win = window as any
  if (win.BarcodeDetector) {
    try {
      const nativeDetector = new win.BarcodeDetector({
        formats: [
          'code_128',
          'ean_13',
          'ean_8',
          'upc_a',
          'upc_e',
          'code_39',
          'code_93',
          'qr_code',
        ],
      })
      const barcodes = await nativeDetector.detect(source)
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        return barcodes[0].rawValue.trim()
      }
    } catch {
      // fallback
    }
  }

  // 2. High-Performance Multi-Pass ZXing Decoder
  const ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  const isVideo = source instanceof HTMLVideoElement
  const sw = isVideo ? (source as HTMLVideoElement).videoWidth : (source as HTMLCanvasElement).width
  const sh = isVideo ? (source as HTMLVideoElement).videoHeight : (source as HTMLCanvasElement).height
  if (!sw || !sh || sw <= 0 || sh <= 0) return null

  offscreenCanvas.width = sw
  offscreenCanvas.height = sh
  ctx.drawImage(source, 0, 0, sw, sh)

  // Pass 2A: HybridBinarizer on Full Frame
  try {
    const lumSource = new HTMLCanvasElementLuminanceSource(offscreenCanvas)
    const bitmap = new BinaryBitmap(new HybridBinarizer(lumSource))
    const res = sharedZxingReader.decode(bitmap)
    if (res && res.getText()) return res.getText().trim()
  } catch {
    // try next pass
  }

  // Pass 2B: GlobalHistogramBinarizer (Crucial for phone screens with reflection & glare)
  try {
    const lumSource = new HTMLCanvasElementLuminanceSource(offscreenCanvas)
    const bitmap = new BinaryBitmap(new GlobalHistogramBinarizer(lumSource))
    const res = sharedZxingReader.decode(bitmap)
    if (res && res.getText()) return res.getText().trim()
  } catch {
    // try next pass
  }

  // Pass 2C: Zoomed Center 60% Crop (where users target the barcode)
  try {
    const cropW = Math.floor(sw * 0.70)
    const cropH = Math.floor(sh * 0.50)
    const cropX = Math.floor((sw - cropW) / 2)
    const cropY = Math.floor((sh - cropH) / 2)

    const cropCanvas = document.createElement('canvas')
    cropCanvas.width = cropW
    cropCanvas.height = cropH
    const cropCtx = cropCanvas.getContext('2d')
    if (cropCtx) {
      cropCtx.drawImage(offscreenCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)

      // Try Hybrid on crop
      try {
        const cropLum = new HTMLCanvasElementLuminanceSource(cropCanvas)
        const cropBitmap = new BinaryBitmap(new HybridBinarizer(cropLum))
        const cropRes = sharedZxingReader.decode(cropBitmap)
        if (cropRes && cropRes.getText()) return cropRes.getText().trim()
      } catch {
        // try Global on crop
      }

      // Try GlobalHistogram on crop
      try {
        const cropLum = new HTMLCanvasElementLuminanceSource(cropCanvas)
        const cropBitmap = new BinaryBitmap(new GlobalHistogramBinarizer(cropLum))
        const cropRes = sharedZxingReader.decode(cropBitmap)
        if (cropRes && cropRes.getText()) return cropRes.getText().trim()
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }

  // Pass 2D: Inverted Luminance (for dark mode or negative barcodes)
  try {
    const lumSource = new HTMLCanvasElementLuminanceSource(offscreenCanvas)
    const bitmap = new BinaryBitmap(new HybridBinarizer(new InvertedLuminanceSource(lumSource)))
    const res = sharedZxingReader.decode(bitmap)
    if (res && res.getText()) return res.getText().trim()
  } catch {
    // ignore
  }

  return null
}
barcodeHints.set(DecodeHintType.TRY_HARDER, true)

const supportedBarcodeFormats = [
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.CODE_93,
  Html5QrcodeSupportedFormats.QR_CODE,
]

type ScannerMode = 'barcode' | 'vision' | 'manual'

interface POSCameraScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScan: (code: string) => void
  onAddToCart?: (product: Product) => void
  onSelectQuery?: (query: string) => void
  products?: Product[]
  selectedWarehouseId?: number | null
  selectedBranchId?: number | null
  companyId?: number
}

export const POSCameraScannerModal: React.FC<POSCameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  onAddToCart,
  onSelectQuery,
  products = [],
  selectedWarehouseId,
  selectedBranchId,
  companyId = 1,
}) => {
  const { t, i18n } = useTranslation('pos')
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null)
  const isStartingRef = useRef(false)
  const lastScannedTimeRef = useRef<number>(0)

  const [activeMode, setActiveMode] = useState<ScannerMode>('barcode')
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [hasTorch, setHasTorch] = useState(false)
  const [isTorchOn, setIsTorchOn] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  // AI Vision Snapshot & Preview states
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false)
  const [visionMatches, setVisionMatches] = useState<AIVisualMatchResult | null>(null)

  // Barcode & Product Found states
  const [isSearchingProduct, setIsSearchingProduct] = useState(false)
  const [scannedProductFound, setScannedProductFound] = useState<{
    product: Product
    code: string
    confidence: number
  } | null>(null)
  const [barcodeNotFoundCode, setBarcodeNotFoundCode] = useState<string | null>(null)

  const [manualCode, setManualCode] = useState('')
  const [continuousMode, setContinuousMode] = useState(false)

  // Stop camera and release all hardware streams cleanly
  const stopScanner = useCallback(async () => {
    if (scannerInstanceRef.current) {
      try {
        if (scannerInstanceRef.current.isScanning) {
          await scannerInstanceRef.current.stop()
        }
        scannerInstanceRef.current.clear()
      } catch (err) {
        console.warn('Scanner stop error:', err)
      }
      scannerInstanceRef.current = null
    }

    // Also stop any remaining media stream tracks directly
    const container = document.getElementById('pos-barcode-viewfinder')
    const video = container?.querySelector('video')
    if (video && video.srcObject) {
      try {
        const stream = video.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        video.srcObject = null
      } catch {
        // ignore
      }
    }

    setIsScanning(false)
    setIsTorchOn(false)
  }, [])

  // Lookup barcode from real database via backend API or local catalog
  const lookupBarcodeInDatabase = useCallback(
    async (code: string) => {
      const cleanCode = code.trim()
      if (!cleanCode) return

      setIsSearchingProduct(true)
      setBarcodeNotFoundCode(null)

      // 1. Check local catalog first
      const localMatch = products.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === cleanCode.toLowerCase()) ||
          p.sku.toLowerCase() === cleanCode.toLowerCase()
      )

      if (localMatch) {
        setIsSearchingProduct(false)
        setScannedProductFound({
          product: localMatch,
          code: cleanCode,
          confidence: 1.0,
        })
        onScan(cleanCode)

        if (continuousMode && onAddToCart && Number(localMatch.stock ?? 0) > 0) {
          onAddToCart(localMatch)
        }
        return
      }

      // 2. Query Backend Exact Barcode Lookup
      try {
        const res = await posService.barcodeLookup(cleanCode, {
          warehouse_id: selectedWarehouseId,
          branch_id: selectedBranchId,
          company_id: companyId,
        })

        if (res && (res.success || res.product) && (res.product || res.data)) {
          const foundProduct: Product = res.product || res.data
          setScannedProductFound({
            product: foundProduct,
            code: cleanCode,
            confidence: 1.0,
          })
          onScan(cleanCode)

          if (continuousMode && onAddToCart && Number(foundProduct.stock ?? 0) > 0) {
            onAddToCart(foundProduct)
          }
        } else {
          setScannedProductFound(null)
          setBarcodeNotFoundCode(cleanCode)
          sound.playWarning()
        }
      } catch {
        // 3. Fallback: Search general product search endpoint
        try {
          const searchRes = await posService.productSearch({
            search: cleanCode,
            warehouse_id: selectedWarehouseId,
            branch_id: selectedBranchId,
          })
          const items: Product[] = searchRes.data?.data || searchRes.data || searchRes || []
          const exact = items.find(
            (p) =>
              (p.barcode && p.barcode.toLowerCase() === cleanCode.toLowerCase()) ||
              p.sku.toLowerCase() === cleanCode.toLowerCase()
          ) || items[0]

          if (exact) {
            setScannedProductFound({
              product: exact,
              code: cleanCode,
              confidence: 0.95,
            })
            onScan(cleanCode)
            if (continuousMode && onAddToCart && Number(exact.stock ?? 0) > 0) {
              onAddToCart(exact)
            }
          } else {
            setScannedProductFound(null)
            setBarcodeNotFoundCode(cleanCode)
            sound.playWarning()
          }
        } catch {
          setScannedProductFound(null)
          setBarcodeNotFoundCode(cleanCode)
          sound.playWarning()
        }
      } finally {
        setIsSearchingProduct(false)
      }
    },
    [products, selectedWarehouseId, selectedBranchId, companyId, onScan, continuousMode, onAddToCart]
  )

  // Handle scanned barcode with debounce lock
  const handleBarcodeScanned = useCallback(
    (code: string) => {
      const cleanCode = code.trim()
      if (!cleanCode) return

      const now = Date.now()
      if (now - lastScannedTimeRef.current < 1500) return
      lastScannedTimeRef.current = now

      sound.playBarcode()
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(80)
        } catch {
          // ignore
        }
      }

      lookupBarcodeInDatabase(cleanCode)
    },
    [lookupBarcodeInDatabase]
  )

  // Start Camera with Html5Qrcode engine & full-frame decoding
  const startScanner = useCallback(async () => {
    if (isStartingRef.current) return
    isStartingRef.current = true
    setCameraError(null)

    await stopScanner()

    const container = document.getElementById('pos-barcode-viewfinder')
    if (!container) {
      isStartingRef.current = false
      return
    }

    try {
      const scanner = new Html5Qrcode('pos-barcode-viewfinder', {
        formatsToSupport: supportedBarcodeFormats,
        verbose: false,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      } as any)
      scannerInstanceRef.current = scanner

      await scanner.start(
        { facingMode },
        {
          fps: 20,
          aspectRatio: 1.333334,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => ({
            width: viewfinderWidth,
            height: viewfinderHeight,
          }),
        },
        (decodedText: string) => {
          handleBarcodeScanned(decodedText)
        },
        () => {
          // ignore empty frames
        }
      )

      setIsScanning(true)

      // Check for torch capability
      try {
        const capabilities = scanner.getRunningTrackCameraCapabilities?.()
        if (capabilities && (capabilities as any).torchFeature?.().isSupported?.()) {
          setHasTorch(true)
        }
      } catch {
        // ignore
      }
    } catch (err: any) {
      console.error('Failed to start camera scanner:', err)
      let msg = t('scanner.cameraPermissionDenied', 'Camera permission is required to scan products.')
      if (typeof err === 'string') {
        if (err.includes('NotAllowedError') || err.includes('Permission')) {
          msg = t('scanner.cameraPermissionDenied', 'Camera permission was denied. Please allow camera access in browser settings.')
        } else if (err.includes('NotFound') || err.includes('DevicesNotFoundError')) {
          msg = t('scanner.cameraUnavailable', 'Camera is unavailable on this device.')
        } else if (err.includes('secure') || err.includes('HTTPS')) {
          msg = t('scanner.secureContextRequired', 'Camera access requires a secure connection (HTTPS or localhost).')
        }
      }
      setCameraError(msg)
      setIsScanning(false)
    } finally {
      isStartingRef.current = false
    }
  }, [facingMode, handleBarcodeScanned, stopScanner, t])

  // Lifecycle: start / stop scanner on modal open / mode change
  useEffect(() => {
    if (!isOpen || activeMode === 'manual' || capturedPhoto) {
      stopScanner()
      if (!isOpen) {
        setCapturedPhoto(null)
        setVisionMatches(null)
        setScannedProductFound(null)
        setBarcodeNotFoundCode(null)
      }
      return
    }

    const timer = setTimeout(() => {
      startScanner()
    }, 150)

    // Turbo Quad-Engine Video Frame Analyzer
    let isZxingMounted = true
    const offscreenLiveCanvas = document.createElement('canvas')

    const zxingInterval = setInterval(async () => {
      if (!isZxingMounted || activeMode !== 'barcode' || capturedPhoto) return
      const container = document.getElementById('pos-barcode-viewfinder')
      const video = container?.querySelector('video')
      if (!video || video.readyState < 2) return

      const now = Date.now()
      if (now - lastScannedTimeRef.current < 1200) return

      try {
        const decoded = await decodeBarcodeFromVideoOrCanvas(video, offscreenLiveCanvas)
        if (decoded && isZxingMounted) {
          handleBarcodeScanned(decoded)
        }
      } catch {
        // ignore frame decode
      }
    }, 120)

    return () => {
      isZxingMounted = false
      clearTimeout(timer)
      clearInterval(zxingInterval)
      stopScanner()
    }
  }, [isOpen, activeMode, capturedPhoto, startScanner, stopScanner, handleBarcodeScanned])

  // Capture High-Res Snapshot for Photo Preview
  const handleCapturePhoto = useCallback(() => {
    const container = document.getElementById('pos-barcode-viewfinder')
    const video = container?.querySelector('video')
    if (!video) return

    sound.playClick()
    const canvas = document.createElement('canvas')
    canvas.width = Math.min(video.videoWidth || 1280, 1280)
    canvas.height = Math.min(video.videoHeight || 720, 720)
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
      setCapturedPhoto(dataUrl)
      setVisionMatches(null)
      stopScanner()
    }
  }, [stopScanner])

  // Retake Photo: Return to live camera
  const handleRetakePhoto = useCallback(() => {
    sound.playClick()
    setCapturedPhoto(null)
    setVisionMatches(null)
    setScannedProductFound(null)
    setBarcodeNotFoundCode(null)
  }, [])

  // Analyze Captured Photo with Backend AI Vision Search & OCR
  const handleAnalyzePhoto = useCallback(async () => {
    if (!capturedPhoto || isAnalyzingVision) return

    setIsAnalyzingVision(true)
    sound.playClick()

    try {
      // 1. Try decoding barcode/QR directly from captured snapshot canvas
      const img = new Image()
      img.src = capturedPhoto
      await new Promise((resolve) => {
        img.onload = resolve
      })

      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      let detectedCodeFromSnapshot = ''
      let visualCat: string | undefined

      if (ctx) {
        ctx.drawImage(img, 0, 0)
        const visualFeatures = classifyCanvasImageFeatures(canvas)
        visualCat = visualFeatures.category

        const snapshotOffscreen = document.createElement('canvas')
        const barcodeDecoded = await decodeBarcodeFromVideoOrCanvas(canvas, snapshotOffscreen)
        if (barcodeDecoded) {
          detectedCodeFromSnapshot = barcodeDecoded
        }
      }

      const activeLang = i18n.language ? i18n.language.split('-')[0] : 'km'
      const visionResult = await performAIVisionSearch({
        imageFrame: capturedPhoto,
        ocrHint: detectedCodeFromSnapshot || undefined,
        visualCategory: visualCat,
        language: activeLang,
        warehouseId: selectedWarehouseId,
        branchId: selectedBranchId,
        companyId,
        catalogFallback: products,
      })

      setVisionMatches(visionResult)

      if (visionResult.matchedProduct || (visionResult.matchedProducts && visionResult.matchedProducts.length > 0)) {
        sound.playSuccess()
      } else {
        sound.playWarning()
      }
    } catch (e) {
      console.error('AI Vision analysis error:', e)
      sound.playWarning()
    } finally {
      setIsAnalyzingVision(false)
    }
  }, [capturedPhoto, isAnalyzingVision, i18n.language, selectedWarehouseId, selectedBranchId, companyId, products])

  // Toggle Torch
  const toggleTorch = async () => {
    if (!scannerInstanceRef.current) return
    try {
      const targetState = !isTorchOn
      await (scannerInstanceRef.current as any).applyVideoConstraints({
        advanced: [{ torch: targetState }],
      })
      setIsTorchOn(targetState)
      sound.playClick()
    } catch (err) {
      console.warn('Could not toggle torch:', err)
    }
  }

  // Switch Camera Front / Back
  const switchCamera = () => {
    sound.playClick()
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  // Manual SKU Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      lookupBarcodeInDatabase(manualCode.trim())
      setManualCode('')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-black/30 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header Bar */}
          <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent dark:from-pink-500/15 dark:via-purple-500/15 dark:to-transparent shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
                {activeMode === 'vision' ? <Sparkles size={19} /> : <Camera size={19} />}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {activeMode === 'vision'
                    ? t('aiVisionTitle', 'AI Visual Product Recognition')
                    : t('cameraBarcodeScanner', 'Barcode & QR Scanner')}
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {activeMode === 'vision'
                    ? t('aiVisionSubtitle', 'Point camera at product, box, or label — AI matches real stock')
                    : t('pointAtBarcodeOrProduct', 'Point camera at product barcode or QR code')}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mode Switcher Tabs (Barcode | AI Vision | Manual SKU) */}
          <div className="px-5 pt-3 pb-2 flex items-center justify-center gap-2 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick()
                setActiveMode('barcode')
                setCapturedPhoto(null)
                setVisionMatches(null)
                setScannedProductFound(null)
                setBarcodeNotFoundCode(null)
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'barcode'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20'
                  : 'bg-white hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
              }`}
            >
              <Barcode size={14} />
              <span>{t('scannerModeBarcode', 'Barcode & QR')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick()
                setActiveMode('vision')
                setScannedProductFound(null)
                setBarcodeNotFoundCode(null)
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'vision'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20'
                  : 'bg-white hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
              }`}
            >
              <Sparkles size={14} />
              <span>{t('scannerModeAIVision', 'AI Vision')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick()
                setActiveMode('manual')
                setCapturedPhoto(null)
                setVisionMatches(null)
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'manual'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20'
                  : 'bg-white hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
              }`}
            >
              <Keyboard size={14} />
              <span>{t('scannerModeManual', 'Manual SKU')}</span>
            </button>
          </div>

          {/* Scrollable Viewport & Action Panel */}
          <div className="p-4 flex flex-col items-center overflow-y-auto max-h-[calc(92vh-140px)]">
            {activeMode !== 'manual' ? (
              <div className="relative w-full aspect-4/3 max-h-[290px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner">
                {/* Live Camera Viewfinder or Frozen Snapshot Preview */}
                {capturedPhoto ? (
                  <img
                    src={capturedPhoto}
                    alt="Captured Snapshot"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div
                    id="pos-barcode-viewfinder"
                    className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_video]:rounded-2xl"
                  />
                )}

                {/* Live Laser & HUD Targeting Box (Only in Live Mode) */}
                {isScanning && !cameraError && !capturedPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                    <div
                      className={`relative w-[88%] max-w-[340px] h-[60%] max-h-[190px] rounded-2xl border-2 border-dashed transition-colors flex items-center justify-center ${
                        activeMode === 'vision'
                          ? 'border-purple-400/90 bg-purple-500/10 shadow-[0_0_25px_rgba(168,85,247,0.35)]'
                          : 'border-emerald-400/90 bg-emerald-500/10 shadow-[0_0_25px_rgba(52,211,153,0.35)]'
                      }`}
                    >
                      {/* Corner Targeting Accents */}
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-emerald-400 rounded-br-lg" />

                      {/* Moving Laser */}
                      <motion.div
                        animate={{ y: [-42, 42, -42], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        className={`w-[94%] h-0.5 ${
                          activeMode === 'vision'
                            ? 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee]'
                            : 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399]'
                        }`}
                      />

                      <div className="absolute bottom-2 text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-black/80 text-white backdrop-blur-xs flex items-center gap-1.5 border border-white/15">
                        {activeMode === 'vision' ? (
                          <>
                            <Eye size={11} className="text-cyan-400 animate-pulse" />
                            <span>{t('scanner.scanning', 'AI Vision Ready')}</span>
                          </>
                        ) : (
                          <>
                            <ScanLine size={11} className="text-emerald-400 animate-pulse" />
                            <span>{t('scanner.scanning', 'Scanning Barcode...')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Searching Product Backend Loader Overlay */}
                {isSearchingProduct && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-20">
                    <div className="w-10 h-10 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <span className="text-xs font-bold text-white tracking-wide">
                      {t('scanner.searching', 'Searching inventory...')}
                    </span>
                  </div>
                )}

                {/* Camera Hardware Error Overlay */}
                {cameraError && (
                  <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
                    <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-3">
                      <AlertCircle size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      {t('scanner.cameraUnavailable', 'Camera Unavailable')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs">{cameraError}</p>
                    <button
                      onClick={startScanner}
                      className="bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold cursor-pointer shadow-md"
                    >
                      <RefreshCw size={14} />
                      {t('scanner.tryAgain', 'Try Again')}
                    </button>
                  </div>
                )}

                {/* Top Controls Overlay (Torch & Camera Switch) */}
                {isScanning && !cameraError && !capturedPhoto && (
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                    {hasTorch && (
                      <button
                        onClick={toggleTorch}
                        className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                          isTorchOn
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                            : 'bg-black/50 hover:bg-black/70 text-white'
                        }`}
                        title="Flashlight"
                      >
                        {isTorchOn ? <Zap size={16} /> : <ZapOff size={16} />}
                      </button>
                    )}

                    <button
                      onClick={switchCamera}
                      className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all cursor-pointer"
                      title="Switch Camera"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full py-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-3">
                  <Keyboard size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {t('scannerModeManual', 'Manual SKU Search')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs text-center">
                  {t('manualBarcodeInput', 'Type barcode or SKU and press Enter to find products instantly.')}
                </p>
              </div>
            )}

            {/* AI Vision Action Controls: [📸 Capture Photo] or [🔄 Retake] / [✨ Analyze] */}
            {activeMode === 'vision' && (
              <div className="mt-3 w-full">
                {!capturedPhoto ? (
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    disabled={!isScanning}
                    className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Camera size={16} />
                    <span>{t('scanner.capturePhoto', 'Capture Photo for AI Analysis')}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRetakePhoto}
                      disabled={isAnalyzingVision}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw size={14} />
                      <span>{t('scanner.retakePhoto', 'Retake Photo')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAnalyzePhoto}
                      disabled={isAnalyzingVision}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/25 hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles size={14} className={isAnalyzingVision ? 'animate-spin' : ''} />
                      <span>
                        {isAnalyzingVision
                          ? t('scanner.aiAnalyzing', 'Analyzing Product...')
                          : t('scanner.analyzePhoto', 'Analyze & Match')}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mode A Result: Product Found HUD Card */}
            {scannedProductFound && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="mt-3.5 w-full p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex flex-col gap-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {getProductImageUrl(scannedProductFound.product) ? (
                      <img
                        src={getProductImageUrl(scannedProductFound.product)}
                        alt={scannedProductFound.product.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {scannedProductFound.product.name}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        <span>SKU: {scannedProductFound.product.sku}</span>
                        {scannedProductFound.product.barcode && (
                          <span>• Barcode: {scannedProductFound.product.barcode}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0 flex items-center gap-1">
                    <Check size={11} />
                    {t('scanner.productFound', 'Product Found')}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-pink-600 dark:text-pink-400 text-sm">
                      ${Number(scannedProductFound.product.selling_price || 0).toFixed(2)}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        Number(scannedProductFound.product.stock ?? 0) > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-destructive font-bold'
                      }`}
                    >
                      {Number(scannedProductFound.product.stock ?? 0) > 0
                        ? `${scannedProductFound.product.stock} ${t('scanner.inStock', 'in stock')}`
                        : t('scanner.outOfStock', 'Out of Stock')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onSelectQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick()
                          onSelectQuery(scannedProductFound.product.name)
                          onClose()
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Search size={12} />
                        <span>{t('filterPosGrid', 'Filter')}</span>
                      </button>
                    )}

                    {onAddToCart && (
                      <button
                        type="button"
                        disabled={Number(scannedProductFound.product.stock ?? 0) <= 0}
                        onClick={() => {
                          sound.playSuccess()
                          onAddToCart(scannedProductFound.product)
                          if (!continuousMode) onClose()
                        }}
                        className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        <ShoppingCart size={13} />
                        <span>{t('scanner.addToCart', 'Add to Cart')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Barcode Not Found Warning Card */}
            {barcodeNotFoundCode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3.5 w-full p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2.5 text-xs shadow-xs"
              >
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{t('scanner.noProductFound', 'Barcode not found in your inventory.')}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Scanned Code: <code className="font-mono font-bold text-slate-900 dark:text-white">{barcodeNotFoundCode}</code>
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick()
                      setActiveMode('vision')
                      setBarcodeNotFoundCode(null)
                    }}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Sparkles size={12} />
                    <span>{t('scanner.tryAISearch', 'Try AI Camera Search')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick()
                      setBarcodeNotFoundCode(null)
                      startScanner()
                    }}
                    className="py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw size={12} />
                    <span>{t('scanner.tryAgain', 'Scan Again')}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Mode B Result: AI Vision Product Candidates */}
            {visionMatches && (
              <div className="mt-3.5 w-full flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles size={13} className="text-pink-500" />
                    <span>{t('aiFuzzyMatches', 'AI Matched Products')}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {visionMatches.matchedProducts.length} {t('itemsFound', 'items found')}
                  </span>
                </div>

                {visionMatches.matchedProducts.length > 0 ? (
                  <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {visionMatches.matchedProducts.map((p, idx) => {
                      const confidence = (p as any).confidence || Math.max(0.65, Number(visionMatches.confidence || 0.90) - idx * 0.04)
                      return (
                        <div
                          key={p.id || idx}
                          className="p-2.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/80 transition-all flex items-center justify-between gap-2 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {getProductImageUrl(p) ? (
                              <img
                                src={getProductImageUrl(p)}
                                alt={p.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                                <Barcode size={16} />
                              </div>
                            )}

                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{p.name}</span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                <span>SKU: {p.sku}</span>
                                <span className="text-pink-600 dark:text-pink-400 font-bold">
                                  ${Number(p.selling_price || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400">
                              {Math.round(confidence * 100)}%
                            </span>

                            {onAddToCart && (
                              <button
                                type="button"
                                disabled={Number(p.stock ?? 0) <= 0}
                                onClick={() => {
                                  sound.playSuccess()
                                  onAddToCart(p)
                                  if (!continuousMode) onClose()
                                }}
                                className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
                              >
                                <ShoppingCart size={12} />
                                <span>{t('scanner.addToCart', 'Add')}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center flex flex-col items-center justify-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {t('scanner.noConfidentMatch', 'No confident product match found.')}
                    </p>
                    <button
                      type="button"
                      onClick={handleRetakePhoto}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>{t('scanner.retakePhoto', 'Retake Photo')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Manual Input Bar */}
            <div className="mt-3.5 w-full">
              <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Keyboard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder={t('manualBarcodeInput', 'Or type barcode/SKU and press Enter...')}
                    className="w-full pl-9 pr-3 text-xs py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!manualCode.trim() || isSearchingProduct}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs py-2 px-3.5 rounded-xl font-bold shrink-0 disabled:opacity-50 cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <span>{t('submit', 'Submit')}</span>
                  <ArrowRight size={13} />
                </button>
              </form>
            </div>

            {/* Continuous Scan Toggle & 5-Language Indicator */}
            <div className="mt-3 w-full flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <input
                  type="checkbox"
                  checked={continuousMode}
                  onChange={(e) => setContinuousMode(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-pink-600 focus:ring-pink-500 h-3.5 w-3.5"
                />
                <span>{t('continuousScanning', 'Continuous scanning mode')}</span>
              </label>

              <span className="text-[10px] text-pink-600 dark:text-pink-400 flex items-center gap-1 font-semibold">
                <Layers size={11} />
                <span>5 Languages AI</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
