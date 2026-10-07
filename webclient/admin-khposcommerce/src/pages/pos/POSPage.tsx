import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, ShoppingCart, Tag, Check, RefreshCw, Trash2, ArrowRight,
  Printer, UserPlus, CreditCard, Banknote, QrCode, PauseCircle, PlayCircle,
  Percent, DollarSign, Plus, Minus, User, Filter, SlidersHorizontal,
  Sparkles, Layers, ChevronDown, CheckCircle, Ticket, Building, ShieldCheck, Heart,
  Mic, Camera
} from 'lucide-react'
import { posService } from '@/services/posService'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { brandService } from '@/services/brandService'
import { customerService } from '@/services/customerService'
import { companyService } from '@/services/companyService'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/stores/authStore'

import { useTranslation } from 'react-i18next'
import { formatCurrency, GlobalFormat } from '@/utils/formatters'
import type { Category, Brand, Product, ProductVariant, CartItem, Customer, HeldCart, ReceiptData, CardPaymentDetails, TransferPaymentDetails } from './types/pos.types'
import { POSHeader } from './components/POSHeader'
import { POSTopCards } from './components/POSTopCards'
import { POSProductCard } from './components/POSProductCard'
import { POSProductDetailModal } from './components/POSProductDetailModal'
import { POSCustomerModal } from './components/POSCustomerModal'
import { POSHeldCartsModal } from './components/POSHeldCartsModal'
import { POSKHQRModal } from './components/POSKHQRModal'
import { POSCardPaymentModal } from './components/POSCardPaymentModal'
import { POSTransferPaymentModal } from './components/POSTransferPaymentModal'
import { POSReceiptModal } from './components/POSReceiptModal'
import { POSCameraScannerModal } from './components/POSCameraScannerModal'
import { POSVoiceSearchPopover } from './components/POSVoiceSearchPopover'
import { useVoiceSearch, type VoiceLanguageCode } from './hooks/useVoiceSearch'
import { matchProductsWithAI, analyzeVoiceSpeech } from './utils/aiProductMatcher'
import { ModernSelect } from './components/ModernSelect'
import { sound } from '@/utils/sound'
import { resolveProductPhoto, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'

const POSPage: React.FC = () => {
  const { t, i18n } = useTranslation(['pos', 'common'])
  const qc = useQueryClient()
  const toast = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const authUser = useAuthStore(s => s.user)

  // ── Terminal & Store Context (IDs for API, names for display) ─────────────
  const [selectedStoreId, setSelectedStoreId]         = useState<number | null>(null)
  const [selectedStoreName, setSelectedStoreName]     = useState('Main Store')
  const [selectedBranchId, setSelectedBranchId]       = useState<number | null>(null)
  const [selectedBranchName, setSelectedBranchName]   = useState('')
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null)
  const [selectedWarehouseName, setSelectedWarehouseName] = useState('')
  const [cashRegister, setCashRegister]               = useState('Register #01')
  const [currentShift, setCurrentShift]               = useState('Shift #A')

  // ── Filters & Search State ────────────────────────────────────────────────
  const [search, setSearch]                       = useState('')
  const [selectedCat, setSelectedCat]             = useState<number | null>(null)
  const [selectedBrand, setSelectedBrand]         = useState<number | null>(null)
  const [stockFilter, setStockFilter]             = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all')
  const [isFeaturedOnly, setIsFeaturedOnly]       = useState(false)
  const [sortOrder, setSortOrder]                 = useState<'name' | 'selling_price' | 'created_at'>('created_at')

  // ── Cart & Held State ─────────────────────────────────────────────────────
  const [cart, setCart]                           = useState<CartItem[]>([])
  const [heldCarts, setHeldCarts]                 = useState<HeldCart[]>([])
  const [isHeldModalOpen, setIsHeldModalOpen]     = useState(false)

  // ── Customer State ────────────────────────────────────────────────────────
  const [selectedCust, setSelectedCust]           = useState<Customer | null>(null) // null = walk-in
  const [isCustModalOpen, setIsCustModalOpen]     = useState(false)

  // ── Payment & Promo State ─────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod]         = useState<'cash' | 'khqr' | 'card' | 'bank' | 'split'>('cash')
  const [cashTendered, setCashTendered]             = useState<number>(0)
  const [couponCode, setCouponCode]               = useState('')
  const [couponDiscount, setCouponDiscount]       = useState(0)
  const [isCouponApplied, setIsCouponApplied]     = useState(false)

  // ── Modals & Favorites ────────────────────────────────────────────────────
  const [detailProduct, setDetailProduct]         = useState<Product | null>(null)
  const [receiptData, setReceiptData]             = useState<ReceiptData | null>(null)
  const [isKHQRModalOpen, setIsKHQRModalOpen]     = useState(false)
  const [isCardModalOpen, setIsCardModalOpen]     = useState(false)
  const [cardDetails, setCardDetails]             = useState<CardPaymentDetails | null>(null)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferDetails, setTransferDetails]     = useState<TransferPaymentDetails | null>(null)
  const [favorites, setFavorites]                 = useState<number[]>([])
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false)
  const [isVoiceModalOpen, setIsVoiceModalOpen]   = useState(false)

  // ── AI Voice Search Integration ───────────────────────────────────────────
  const {
    isListening,
    transcript,
    interimTranscript,
    detectedLangInfo,
    statusMessage,
    hasError: voiceHasError,
    selectedLang: voiceSelectedLang,
    setLanguage: setVoiceLanguage,
    availableLanguages: voiceAvailableLanguages,
    startListening: startVoiceListening,
    stopListening: stopVoiceListening,
    toggleListening: toggleVoiceListening,
    resetVoiceSearch,
  } = useVoiceSearch({
    initialLang: 'auto',
    onResult: async (spokenText) => {
      try {
        const res = await posService.voiceSearch({
          query: spokenText,
          branch_id: selectedBranchId ? Number(selectedBranchId) : undefined,
        })
        if (res && (res.success || res.query)) {
          const { query, total } = res.data || res
          if (query.intent === 'greeting') {
            sound.playSuccess()
            toast.info(t('voiceGreeting', '👋 Hello! Please speak the product name you\'d like to search.'))
            return
          }

          sound.playSuccess()
          setSearch(query.normalized)

          const flag = query.language_info?.flag || '⚡'
          const langNative = query.language_info?.native || 'AI'
          const langLabel = `${flag} ${langNative}`

          if (query.intent === 'exact_product') {
            toast.success(t('voiceExactFound', { lang: langLabel, query: query.normalized, defaultValue: `⚡ AI (${langLabel}): Model "${query.normalized}"` }))
          } else if (query.intent === 'brand_and_category') {
            toast.success(t('voiceBrandCategoryFiltered', { lang: langLabel, query: query.normalized, defaultValue: `⚡ AI (${langLabel}): Filtered "${query.normalized}"` }))
          } else if (query.intent === 'broad_category') {
            toast.success(t('voiceCategoryFound', { lang: langLabel, query: query.normalized, count: total, defaultValue: `⚡ AI (${langLabel}): Category "${query.normalized}" (${total} items found)` }))
          } else if (query.intent === 'brand_only') {
            toast.success(t('voiceBrandFound', { lang: langLabel, query: query.normalized, defaultValue: `⚡ AI (${langLabel}): Brand "${query.normalized}"` }))
          } else {
            toast.info(t('voiceKeywordFound', { lang: langLabel, query: query.normalized, defaultValue: `⚡ AI (${langLabel}): "${query.normalized}"` }))
          }

          setTimeout(() => {
            setIsVoiceModalOpen(false)
          }, 500)
          return
        }
      } catch {
        // Graceful fallback to client-side multi-lingual AI engine
      }

      // Client-side AI fallback
      const pool = allCatalogProducts || productsData || []
      const analysis = analyzeVoiceSpeech(spokenText, pool)

      if (analysis.intentType === 'greeting') {
        sound.playSuccess()
        toast.info(t('voiceGreeting', '👋 Hello! Please speak the product name you\'d like to search.'))
        return
      }

      sound.playSuccess()
      setSearch(analysis.resolvedKeyword)

      const flag = analysis.detectedLanguage.flag
      const langName = analysis.detectedLanguage.nativeName
      const langLabel = `${flag} ${langName}`

      if (analysis.intentType === 'exact_product') {
        toast.success(t('voiceExactFound', { lang: langLabel, query: analysis.resolvedKeyword, defaultValue: `⚡ AI (${langLabel}): Model "${analysis.resolvedKeyword}"` }))
      } else if (analysis.intentType === 'brand_and_category') {
        toast.success(t('voiceBrandCategoryFiltered', { lang: langLabel, query: analysis.resolvedKeyword, defaultValue: `⚡ AI (${langLabel}): Filtered "${analysis.resolvedKeyword}"` }))
      } else if (analysis.intentType === 'broad_category') {
        toast.success(t('voiceCategoryFound', { lang: langLabel, query: analysis.resolvedKeyword, count: pool.length, defaultValue: `⚡ AI (${langLabel}): Category "${analysis.resolvedKeyword}"` }))
      } else if (analysis.intentType === 'brand_only') {
        toast.success(t('voiceBrandFound', { lang: langLabel, query: analysis.resolvedKeyword, defaultValue: `⚡ AI (${langLabel}): Brand "${analysis.resolvedKeyword}"` }))
      } else {
        toast.info(t('voiceKeywordFound', { lang: langLabel, query: analysis.resolvedKeyword, defaultValue: `⚡ AI (${langLabel}): "${analysis.resolvedKeyword}"` }))
      }

      setTimeout(() => {
        setIsVoiceModalOpen(false)
      }, 500)
    },
  })

  // ── Camera Barcode Scanner Handler ─────────────────────────────────────────
  const handleCameraBarcodeScanned = async (scannedCode: string) => {
    const trimmed = scannedCode.trim().toLowerCase()
    if (!trimmed) return

    // 1. Check local catalog
    const fullList = allCatalogProducts?.length ? allCatalogProducts : (productsData ?? [])
    const localMatch = fullList.find(
      (p: Product) => (p.barcode && p.barcode.toLowerCase() === trimmed) || p.sku.toLowerCase() === trimmed
    )

    if (localMatch) {
      const matchStock = Number(localMatch.stock ?? 0)
      if (matchStock <= 0) {
        sound.playError()
        toast.error(t('productOutOfStock', `Product "${localMatch.name}" is out of stock!`))
        return
      }
      sound.playBarcode()
      addToCart(localMatch)
      toast.success(`${t('scannedMsg', 'Scanned:')} ${localMatch.name}`)
      return
    }

    // 2. Direct backend search for exact barcode match
    try {
      const res = await posService.productSearch({
        search: scannedCode.trim(),
        warehouse_id: selectedWarehouseId,
        branch_id: selectedBranchId,
      })
      const foundProducts = res.data?.data || res.data || res || []
      const exactApiMatch = foundProducts.find(
        (p: Product) => (p.barcode && p.barcode.toLowerCase() === trimmed) || p.sku.toLowerCase() === trimmed
      ) || foundProducts[0]

      if (exactApiMatch) {
        const stockVal = Number(exactApiMatch.stock ?? 0)
        if (stockVal <= 0) {
          sound.playError()
          toast.error(t('productOutOfStock', `Product "${exactApiMatch.name}" is out of stock!`))
          return
        }
        sound.playBarcode()
        addToCart(exactApiMatch)
        toast.success(`${t('scannedMsg', 'Scanned:')} ${exactApiMatch.name}`)
        return
      }
    } catch {
      // ignore
    }

    setSearch(scannedCode)
    toast.info(`${t('scannedMsg', 'Scanned:')} ${scannedCode}`)
  }

  // Load saved favorites & held carts
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('pos_favorites')
      if (savedFavs) setFavorites(JSON.parse(savedFavs))
      const savedHeld = localStorage.getItem('pos_held_carts')
      if (savedHeld) setHeldCarts(JSON.parse(savedHeld))
    } catch (e) {
      console.error(e)
    }
  }, [])

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem('pos_favorites', JSON.stringify(updated))
      return updated
    })
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data: allCatalogProducts } = useQuery({
    queryKey: ['pos-all-catalog-products'],
    queryFn: () => productService.list({ per_page: 200 }).then(r => r.data?.data ?? r.data ?? []),
    staleTime: 60000,
  })

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['pos-products', search, selectedCat, selectedBrand, stockFilter, isFeaturedOnly, sortOrder],
    queryFn: () => productService.list({
      search,
      category_id: selectedCat || undefined,
      brand_id: selectedBrand || undefined,
      inventory: stockFilter !== 'all' ? stockFilter : undefined,
      is_featured: isFeaturedOnly ? true : undefined,
      sort_by: sortOrder,
      per_page: 100,
    }).then(r => r.data?.data ?? r.data),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })

  const { data: categories } = useQuery({
    queryKey: ['pos-categories'],
    queryFn: () => categoryService.list().then(r => r.data?.data ?? r.data),
  })

  const { data: brands } = useQuery({
    queryKey: ['pos-brands'],
    queryFn: () => brandService.list().then(r => r.data?.data ?? r.data),
  })

  const { data: rawCustomers } = useQuery({
    queryKey: ['pos-customers'],
    queryFn: () => customerService.list({ per_page: 200 }).then(r => r.data?.data ?? r.data),
  })

  const customers: Customer[] = useMemo(() => {
    if (!rawCustomers) return []
    if (Array.isArray(rawCustomers)) return rawCustomers
    if (Array.isArray(rawCustomers.data)) return rawCustomers.data
    return []
  }, [rawCustomers])

  const customerOptions = useMemo(() => {
    const defaultWalkIn = {
      value: 'walkin',
      label: t('walkInCustomer', 'Walk-in Customer (Retail)'),
      badge: t('retail', 'Retail'),
    }

    const registeredCusts = customers
      .map((c: any) => ({
        value: c.id,
        label: `${c.name}${c.phone ? ` (${c.phone})` : ''}`,
        badge: typeof c.group === 'object' && c.group !== null
          ? (c.group.name || 'Member')
          : (typeof c.group === 'string' ? c.group : 'Member'),
      }))

    return [defaultWalkIn, ...registeredCusts]
  }, [customers, t])

  // ── Store / Branch / Warehouse context from API ─────────────────────────
  const { data: storesData } = useQuery({
    queryKey: ['pos-stores'],
    queryFn: () => companyService.getStores().then(r => r.data?.data ?? r.data ?? []),
    staleTime: 60000,
  })

  const { data: branchesData } = useQuery({
    queryKey: ['pos-branches'],
    queryFn: () => companyService.getBranches().then(r => r.data?.data ?? r.data ?? []),
    staleTime: 60000,
  })

  const { data: warehousesData } = useQuery({
    queryKey: ['pos-warehouses'],
    queryFn: () => companyService.getWarehouses().then(r => r.data?.data ?? r.data ?? []),
    staleTime: 60000,
  })

  // Auto-select first available store/branch/warehouse
  useEffect(() => {
    if (storesData && storesData.length > 0 && !selectedStoreId) {
      const firstStore = storesData[0]
      setSelectedStoreId(firstStore.id)
      setSelectedStoreName(firstStore.name)
    }
  }, [storesData, selectedStoreId])

  useEffect(() => {
    if (branchesData && branchesData.length > 0 && !selectedBranchId) {
      const firstBranch = branchesData[0]
      setSelectedBranchId(firstBranch.id)
      setSelectedBranchName(firstBranch.name)
    }
  }, [branchesData, selectedBranchId])

  useEffect(() => {
    if (warehousesData && warehousesData.length > 0 && !selectedWarehouseId) {
      const firstWarehouse = warehousesData[0]
      setSelectedWarehouseId(firstWarehouse.id)
      setSelectedWarehouseName(firstWarehouse.name)
    }
  }, [warehousesData, selectedWarehouseId])

  // ── Keyboard Barcode Scanner & Hotkeys ─────────────────────────────────────

  useEffect(() => {
    searchInputRef.current?.focus()

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      const trimmed = search.trim().toLowerCase()
      const match = (productsData ?? []).find(
        (p: Product) => (p.barcode && p.barcode.toLowerCase() === trimmed) || p.sku.toLowerCase() === trimmed
      )
      if (match) {
        const matchStock = Number(match.stock ?? 0)
        if (matchStock <= 0) {
          sound.playError()
          toast.error(t('productOutOfStock', `Product "${match.name}" is out of stock!`))
          return
        }
        sound.playBarcode()
        addToCart(match)
        setSearch('')
        toast.success(`Scanned: ${match.name}`)
        return
      }

      // AI Fuzzy & Semantic Match
      const pool = allCatalogProducts || productsData || []
      const fuzzy = matchProductsWithAI(search, pool, 0.4)
      if (fuzzy.length > 0 && fuzzy[0].score >= 0.6) {
        const best = fuzzy[0].product
        const bestStock = Number(best.stock ?? 0)
        if (bestStock <= 0) {
          sound.playError()
          toast.error(t('productOutOfStock', `Product "${best.name}" is out of stock!`))
          return
        }
        sound.playSuccess()
        addToCart(best)
        setSearch('')
        toast.success(`⚡ AI Matched: ${best.name}`)
        return
      } else {
        sound.playError()
      }
    }
  }

  // ── Cart Operations ───────────────────────────────────────────────────────

  const addToCart = (product: Product, variant?: ProductVariant, imei?: string) => {
    const availableStock = Number(variant ? (variant.stock ?? product.stock ?? 0) : (product.stock ?? 0))
    if (availableStock <= 0) {
      sound.playError()
      toast.error(t('productOutOfStock', `Product "${product.name}" is out of stock!`))
      return
    }

    const existingItem = cart.find(
      i => i.product.id === product.id && i.selectedVariant?.id === variant?.id && i.imei === imei
    )
    if (existingItem && existingItem.quantity >= availableStock) {
      sound.playError()
      toast.warning(t('exceedsStockLimit', `Cart quantity reached maximum available stock (${availableStock})`))
      return
    }

    sound.playSuccess()
    const unitPrice = variant ? variant.selling_price : product.selling_price
    const costPrice = variant ? (variant.cost_price ?? product.cost_price ?? 0) : (product.cost_price ?? 0)

    // ── Calculate tax from product's actual tax rate (defaults to 10% standard VAT) ──
    let taxRate = 0.10
    if (product.tax) {
      const type = product.tax.type || 'percentage'
      const rate = product.tax.rate !== undefined && product.tax.rate !== null ? Number(product.tax.rate) : 10
      taxRate = type === 'percentage' ? (rate / 100) : (unitPrice > 0 ? rate / unitPrice : 0)
    }
    const taxAmount = unitPrice * taxRate

    setCart(prev => {
      const existingIdx = prev.findIndex(
        i => i.product.id === product.id && i.selectedVariant?.id === variant?.id && i.imei === imei
      )
      if (existingIdx >= 0) {
        const copy = [...prev]
        copy[existingIdx].quantity += 1
        copy[existingIdx].total = copy[existingIdx].quantity * copy[existingIdx].unit_price
        return copy
      }
      return [
        ...prev,
        {
          product,
          selectedVariant: variant,
          imei,
          quantity: 1,
          unit_price: unitPrice,
          cost_price: costPrice,
          tax_rate: taxRate,
          discount_amount: 0,
          tax_amount: taxAmount,
          total: unitPrice,
        }
      ]
    })
  }

  const updateQty = (idx: number, qty: number) => {
    if (qty <= 0) {
      sound.playDelete()
      setCart(prev => prev.filter((_, i) => i !== idx))
      return
    }
    const item = cart[idx]
    if (item) {
      const availableStock = Number(
        item.selectedVariant ? (item.selectedVariant.stock ?? item.product.stock ?? 0) : (item.product.stock ?? 0)
      )
      if (qty > availableStock) {
        sound.playError()
        toast.warning(t('exceedsStockLimit', `Cart quantity cannot exceed available stock (${availableStock})!`))
        return
      }
    }
    sound.playClick()
    setCart(prev => prev.map((item, i) => i === idx ? {
      ...item,
      quantity: qty,
      total: qty * item.unit_price - item.discount_amount
    } : item))
  }

  const removeCartItem = (idx: number) => {
    sound.playDelete()
    setCart(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Calculations ──────────────────────────────────────────────────────────

  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  const lineDiscountTotal = cart.reduce((sum, item) => sum + item.discount_amount, 0)
  const totalDiscount = lineDiscountTotal + couponDiscount
  // ── Tax is now per-product from tax.rate, summed across all cart items ────
  const tax = Math.max(0, cart.reduce((sum, item) => {
    const lineSubtotal = (item.unit_price * item.quantity) - item.discount_amount
    return sum + (lineSubtotal * (item.tax_rate ?? 0))
  }, 0))
  const grandTotal = Math.max(0, subtotal - totalDiscount + tax)
  const changeDue = Math.max(0, cashTendered - grandTotal)

  // ── Coupon Application ────────────────────────────────────────────────────

  const handleApplyCoupon = async () => {
    const code = couponCode.trim()
    if (!code) return

    try {
      const res = await posService.validateCoupon({
        code: code,
        subtotal: subtotal,
      })

      const data = res.data?.data || res.data || res
      if (data && (data.discount !== undefined || data.discount_amount !== undefined)) {
        sound.playSuccess()
        const disc = Number(data.discount ?? data.discount_amount ?? 0)
        setCouponDiscount(disc)
        setIsCouponApplied(true)
        toast.success(`Coupon "${data.code || code}" applied! ($${disc.toFixed(2)} off)`)
        return
      }
    } catch (err: any) {
      sound.playError()
      const serverMsg = err?.response?.data?.message
      if (serverMsg) {
        toast.error(serverMsg)
        return
      }
    }

    if (code.toUpperCase() === 'VIP10' || code.toUpperCase() === 'SALE10') {
      sound.playSuccess()
      const disc = subtotal * 0.10
      setCouponDiscount(disc)
      setIsCouponApplied(true)
      toast.success(`${t('couponAppliedMsg', 'Coupon applied!')} ($${disc.toFixed(2)} off)`)
    } else {
      sound.playError()
      toast.error(t('invalidCouponMsg', 'Invalid or expired coupon code.'))
    }
  }

  // ── Suspend / Hold Sales ──────────────────────────────────────────────────

  const handleHoldCart = () => {
    if (cart.length === 0) {
      sound.playError()
      return
    }
    sound.playWarning()
    const id = `HOLD-${Date.now().toString().slice(-4)}`
    const newHeld: HeldCart = {
      id,
      name: `${selectedCust ? selectedCust.name : t('walkInCustomerShort', 'Walk-in Customer')} (${id})`,
      timestamp: new Date().toLocaleTimeString(),
      items: cart,
      customer: selectedCust,
    }
    const updated = [...heldCarts, newHeld]
    setHeldCarts(updated)
    localStorage.setItem('pos_held_carts', JSON.stringify(updated))
    setCart([])
    toast.info(`${t('saleSuspendedMsg', 'Sale suspended successfully')} (${id})`)
  }

  const handleResumeCart = (id: string) => {
    const target = heldCarts.find(h => h.id === id)
    if (target) {
      sound.playSuccess()
      setCart(target.items)
      setSelectedCust(target.customer)
      const updated = heldCarts.filter(h => h.id !== id)
      setHeldCarts(updated)
      localStorage.setItem('pos_held_carts', JSON.stringify(updated))
      toast.success(`${t('cartResumedMsg', 'Cart resumed successfully')} (${id})`)
    }
  }

  const handleDeleteHeldCart = (id: string) => {
    sound.playDelete()
    const updated = heldCarts.filter(h => h.id !== id)
    setHeldCarts(updated)
    localStorage.setItem('pos_held_carts', JSON.stringify(updated))
  }

  // ── Checkout Mutation ─────────────────────────────────────────────────────

  const checkoutMutation = useMutation({
    mutationFn: (payload: any) => posService.checkout(payload),
    onSuccess: (res, variables) => {
      sound.playCheckout()
      toast.success(t('saleCompletedMsg', 'Sale completed & invoice generated!'))
      // Backend generates invoice_number; use it from response
      const orderNo = res.data?.invoice_number || res.invoice_number || res.data?.sale?.invoice_number || 'POS-' + Math.floor(100000 + Math.random() * 900000)

      const payloadDetails = variables?.payment_details || cardDetails || transferDetails || undefined
      const cashierName = authUser?.name || 'Cashier'

      setReceiptData({
        order_number: orderNo,
        date: new Date().toLocaleString(),
        customer: res.data?.data?.customer || selectedCust || { name: t('walkInCustomerShort', 'Walk-in Customer'), group: 'Retail' },
        cashier_name: cashierName,
        store_name: selectedStoreName,
        branch_name: selectedBranchName,
        warehouse_name: selectedWarehouseName,
        items: cart,
        subtotal,
        discount_amount: totalDiscount,
        tax_amount: tax,
        grand_total: grandTotal,
        cash_tendered: paymentMethod === 'cash' ? (cashTendered || grandTotal) : grandTotal,
        change_due: paymentMethod === 'cash' ? changeDue : 0,
        payment_method: paymentMethod.toUpperCase(),
        payment_details: payloadDetails,
      })

      // Reset state
      setCart([])
      setCashTendered(0)
      setCouponDiscount(0)
      setIsCouponApplied(false)
      setCouponCode('')
      setCardDetails(null)
      setTransferDetails(null)
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['pos-products'] })
      qc.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || t('txnFailedStockMsg', 'Transaction failed. Please verify inventory stock.')
      toast.error(msg)
    },
  })

  const checkCartStock = (): boolean => {
    for (const item of cart) {
      const availableStock = Number(
        item.selectedVariant ? (item.selectedVariant.stock ?? item.product.stock ?? 0) : (item.product.stock ?? 0)
      )
      if (availableStock <= 0) {
        sound.playError()
        toast.error(t('productOutOfStock', `Product "${item.product.name}" is out of stock!`))
        return false
      }
      if (item.quantity > availableStock) {
        sound.playError()
        toast.error(t('exceedsStockLimit', `Item "${item.product.name}" quantity ${item.quantity} exceeds available stock of ${availableStock}!`))
        return false
      }
    }
    return true
  }

  const handleInitiateCheckout = () => {
    if (cart.length === 0) {
      toast.error(t('cartIsEmptyMsg', 'Cart is empty!'))
      return
    }

    if (!checkCartStock()) {
      return
    }

    if (paymentMethod === 'khqr') {
      setIsKHQRModalOpen(true)
      return
    }

    if (paymentMethod === 'card') {
      setIsCardModalOpen(true)
      return
    }

    if (paymentMethod === 'bank' || (paymentMethod as string) === 'transfer') {
      setIsTransferModalOpen(true)
      return
    }

    processFinalCheckout()
  }

  const processFinalCheckout = (paymentDetailsPayload?: any) => {
    if (!checkCartStock()) {
      return
    }
    const details = paymentDetailsPayload || cardDetails || transferDetails || undefined

    checkoutMutation.mutate({
      company_id: authUser?.company?.id ?? null,
      branch_id:  selectedBranchId,
      store_id:   selectedStoreId,
      warehouse_id: selectedWarehouseId,
      customer_id: selectedCust?.id ?? null,   // null = walk-in
      payment_method: paymentMethod,
      payment_details: details,
      coupon_code: isCouponApplied ? couponCode.trim() : null,
      subtotal:         Math.round(subtotal * 100) / 100,
      discount_amount:  Math.round(totalDiscount * 100) / 100,
      tax_amount:       Math.round(tax * 100) / 100,
      grand_total:      Math.round(grandTotal * 100) / 100,
      paid_amount:      paymentMethod === 'cash' ? (cashTendered || grandTotal) : grandTotal,
      change_amount:    paymentMethod === 'cash' ? Math.max(0, changeDue) : 0,
      notes: null,
      items: cart.map(i => {
        const lineSubtotal = (i.unit_price * i.quantity) - i.discount_amount
        const lineTaxRate = i.tax_rate ?? 0
        const lineTaxAmt  = Math.round(lineSubtotal * lineTaxRate * 100) / 100
        return {
          product_id:          i.product.id,
          product_variant_id:  i.selectedVariant?.id ?? null,
          quantity:            i.quantity,
          unit_price:          i.unit_price,
          cost_price:          i.cost_price ?? 0,
          discount_amount:     i.discount_amount,
          tax_percent:         lineTaxRate * 100,
          tax_amount:          lineTaxAmt,
        }
      })
    })
  }

  return (
    <div className="max-w-full 2xl:max-w-[1920px] mx-auto p-1.5 sm:p-3 md:p-5 space-y-3 sm:space-y-4 pb-24 lg:pb-6 min-w-0">

      {/* ── 1. Top Header & Meta Controls ──────────────────────────────────── */}
      <POSHeader
        selectedStoreId={selectedStoreId}
        selectedStoreName={selectedStoreName}
        selectedBranchId={selectedBranchId}
        selectedBranchName={selectedBranchName}
        selectedWarehouseId={selectedWarehouseId}
        selectedWarehouseName={selectedWarehouseName}
        stores={storesData ?? []}
        branches={branchesData ?? []}
        warehouses={warehousesData ?? []}
        onStoreChange={(id, name) => { setSelectedStoreId(id); setSelectedStoreName(name) }}
        onBranchChange={(id, name) => { setSelectedBranchId(id); setSelectedBranchName(name) }}
        onWarehouseChange={(id, name) => { setSelectedWarehouseId(id); setSelectedWarehouseName(name) }}
        cashRegister={cashRegister}
        currentShift={currentShift}
        cashierName={authUser?.name || 'Cashier'}
      />

      {/* ── 2. Top Summary Metrics Bar ────────────────────────────────────── */}
      <POSTopCards
        cartTotal={grandTotal}
        cartItemsCount={cart.reduce((s, i) => s + i.quantity, 0)}
        cartDiscount={totalDiscount}
        cartTax={tax}
      />

      {/* ── 3. Main POS Terminal Workspace ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 lg:gap-5 lg:h-[calc(100vh-13.5rem)] lg:min-h-0">

        {/* ── Left Column: Product Catalog & Filters (7 cols) ────────────── */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col space-y-3 lg:min-h-0 min-w-0">

          {/* Search Bar & Voice & Camera Scanner */}
          <div className="bg-card rounded-3xl border border-border/80 p-2.5 sm:p-3 flex items-center gap-2 sm:gap-2.5 shadow-2xs">
            <div className="relative flex-1 min-w-0 flex items-center">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={
                  isListening
                    ? t('listening', 'Listening for speech...')
                    : t('scanPlaceholder', 'Scan barcode/IMEI or search name/SKU... (Press Enter to scan, Ctrl+K to focus)')
                }
                className={`form-input pl-10 pr-20 text-xs py-2 sm:py-2.5 bg-muted/20 border-border/70 rounded-2xl focus:bg-card w-full transition-all ${
                  isListening ? 'ring-2 ring-primary/60 border-primary bg-primary/5' : ''
                }`}
              />

              {/* Action Buttons inside Input: Clear, Mic Voice Search, Camera Scanner */}
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('')
                      searchInputRef.current?.focus()
                    }}
                    className="w-5 h-5 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}

                {/* Voice Search Mic Button */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick()
                    const nextState = !isVoiceModalOpen
                    setIsVoiceModalOpen(nextState)
                    if (nextState) {
                      resetVoiceSearch()
                      startVoiceListening()
                    } else {
                      stopVoiceListening()
                    }
                  }}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    isListening || isVoiceModalOpen
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }`}
                  title={t('voiceSearch', 'Voice Search (AI Auto-Detect)')}
                >
                  <div className="relative flex items-center justify-center">
                    <Mic size={15} />
                    {isListening && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400 animate-ping" />
                    )}
                  </div>
                </button>

                {/* Camera Barcode / QR Scanner Button */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick()
                    setIsCameraScannerOpen(true)
                  }}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                  title={t('cameraBarcodeScanner', 'Camera Barcode / QR Scanner')}
                >
                  <Camera size={15} />
                </button>
              </div>

              {/* Floating AI Voice Search Popover (Anchored under Search Input) */}
              <POSVoiceSearchPopover
                isOpen={isVoiceModalOpen}
                onClose={() => {
                  stopVoiceListening()
                  setIsVoiceModalOpen(false)
                }}
                isListening={isListening}
                transcript={transcript}
                interimTranscript={interimTranscript}
                detectedLangInfo={detectedLangInfo}
                statusMessage={statusMessage}
                hasError={voiceHasError}
                products={allCatalogProducts || productsData || []}
                currentSearchValue={search}
                selectedLang={voiceSelectedLang}
                availableLanguages={voiceAvailableLanguages}
                onSelectLanguage={(lang) => {
                  setVoiceLanguage(lang)
                  resetVoiceSearch()
                  startVoiceListening(lang)
                }}
                onToggleListening={toggleVoiceListening}
                onStartListening={() => {
                  setSearch('')
                  resetVoiceSearch()
                  startVoiceListening()
                }}
                onClearSearch={() => {
                  setSearch('')
                  resetVoiceSearch()
                }}
                onSelectQuery={(queryText) => {
                  setSearch(queryText)
                  setIsVoiceModalOpen(false)
                }}
                onAddToCart={(product) => {
                  addToCart(product)
                  setIsVoiceModalOpen(false)
                }}
              />
            </div>

            {/* Held Cart Counter Button */}
            {heldCarts.length > 0 && (
              <button
                onClick={() => setIsHeldModalOpen(true)}
                className="btn-secondary text-xs py-2 px-3 rounded-2xl flex items-center gap-1.5 font-bold border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 shrink-0 cursor-pointer"
              >
                <PlayCircle size={15} />
                <span className="hidden xs:inline">{t('held', 'Held')}</span> ({heldCarts.length})
              </button>
            )}
          </div>

          {/* Multi-Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-card p-2 sm:p-2.5 rounded-3xl border border-border/80 text-xs shadow-2xs">
            {/* Category Quick Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full py-0.5">
              <button
                onClick={() => {
                  sound.playClick()
                  setSelectedCat(null)
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCat === null ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('allProducts', 'All Products')}</span>
              </button>
              {(categories ?? []).map((cat: Category) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    sound.playClick()
                    setSelectedCat(selectedCat === cat.id ? null : cat.id)
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCat === cat.id ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 opacity-70" />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <ModernSelect
                value={stockFilter}
                onChange={(val) => setStockFilter(val as any)}
                options={[
                  { value: 'all', label: t('allStock', 'All Stock') },
                  { value: 'in_stock', label: t('inStockOnly', 'In Stock Only') },
                  { value: 'low_stock', label: t('lowStock', 'Low Stock') },
                  { value: 'out_of_stock', label: t('outOfStock', 'Out of Stock') },
                ]}
                buttonClassName="bg-muted/40 border-border/70 text-xs py-1.5 font-semibold rounded-xl"
              />

              <button
                onClick={() => {
                  sound.playClick()
                  setIsFeaturedOnly(!isFeaturedOnly)
                }}
                className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isFeaturedOnly ? 'bg-amber-500 text-white' : 'bg-muted/40 text-muted-foreground hover:bg-muted'
                }`}
              >
                <Sparkles size={12} /> {t('featured', 'Featured')}
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="flex-1 overflow-y-auto lg:min-h-0 pr-1 max-h-[550px] lg:max-h-none">
            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="skeleton h-44 rounded-3xl" />
                ))}
              </div>
            ) : (productsData ?? []).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-16">
                <Search size={40} className="mb-2 opacity-20" />
                <p className="text-xs font-medium">{t('noProductsFound', 'No products found matching your search filter.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
                {(productsData ?? []).map((p: Product) => (
                  <POSProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={(prod) => addToCart(prod)}
                    onOpenDetails={(prod) => setDetailProduct(prod)}
                    isFavorite={favorites.includes(p.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Active Terminal Cart (5 cols) ───────────────── */}
        <div id="pos-cart-panel" className="lg:col-span-5 xl:col-span-5 bg-card rounded-3xl border border-border/80 flex flex-col overflow-hidden shadow-2xs lg:h-full min-w-0">

          {/* Customer & Cart Action Header */}
          <div className="p-3 sm:p-3.5 border-b border-border/70 flex items-center justify-between gap-2 bg-muted/20">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <User size={16} className="text-primary shrink-0" />
              <ModernSelect
                value={selectedCust?.id ?? 'walkin'}
                onChange={(val) => {
                  if (!val || val === 'walkin') {
                    setSelectedCust(null)
                  } else {
                    const c = customers.find((cust: any) => String(cust.id) === String(val))
                    setSelectedCust(c ?? null)
                  }
                }}
                options={customerOptions}
                buttonClassName="border-none bg-transparent p-0 shadow-none text-xs font-bold text-foreground hover:bg-transparent"
                className="flex-1 min-w-0"
              />
              <button
                onClick={() => setIsCustModalOpen(true)}
                className="p-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0 cursor-pointer"
                title={t('addNewCustomer', 'Add New Customer')}
              >
                <UserPlus size={14} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleHoldCart}
                disabled={cart.length === 0}
                className="btn-secondary text-xs py-1.5 px-2.5 rounded-xl flex items-center gap-1 font-bold disabled:opacity-40 cursor-pointer"
                title={t('suspendSale', 'Suspend Sale')}
              >
                <PauseCircle size={14} /> <span className="hidden xs:inline">{t('hold', 'Hold')}</span>
              </button>
              <button
                onClick={() => setCart([])}
                disabled={cart.length === 0}
                className="btn-danger text-xs py-1.5 px-2 rounded-xl flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                title={t('clearCart', 'Clear Cart')}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Cart Item Table */}
          <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2 max-h-[350px] lg:max-h-none">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                <ShoppingCart size={44} className="mb-2 opacity-20" />
                <p className="text-xs font-bold text-foreground">{t('terminalReady', 'Terminal Ready')}</p>
                <p className="text-[11px] text-muted-foreground">{t('scanOrSelectToStart', 'Scan barcode or select products to start sale')}</p>
              </div>
            ) : (
              cart.map((item, idx) => {
                const fallbackUrl = DEFAULT_PRODUCT_IMAGE
                const itemImg = resolveProductPhoto(
                  item.product.primary_image,
                  item.product.images,
                  item.product.category?.name,
                  item.product.name
                ) || fallbackUrl

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-2xl bg-card border border-border/70 text-xs hover:border-primary/40 shadow-2xs hover:shadow-md transition-all group"
                  >
                    {/* Product Image Thumbnail */}
                    <div className="relative w-10 sm:w-12 h-10 sm:h-12 rounded-xl overflow-hidden bg-muted/30 shrink-0 border border-border/60">
                      <img
                        src={itemImg}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).src = fallbackUrl }}
                      />
                    </div>

                    {/* Product Meta */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="font-extrabold text-foreground truncate tracking-tight">{item.product.name}</div>
                      
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        {item.selectedVariant && (
                          <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                            {item.selectedVariant.sku}
                          </span>
                        )}
                        {item.imei && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-mono font-bold border border-amber-500/20">
                            S/N: {item.imei}
                          </span>
                        )}
                        <span className="text-muted-foreground font-semibold">
                          {formatCurrency(item.unit_price)} / unit
                        </span>
                      </div>
                    </div>

                    {/* Quantity Modifier Controls & Total Price */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <div className="flex items-center border border-border/80 rounded-xl bg-muted/30 shadow-2xs overflow-hidden">
                        <button
                          onClick={() => updateQty(idx, item.quantity - 1)}
                          className="p-1 sm:p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title={t('decreaseQuantity', 'Decrease Quantity')}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-5 sm:w-6 text-center font-black text-foreground text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(idx, item.quantity + 1)}
                          className="p-1 sm:p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title={t('increaseQuantity', 'Increase Quantity')}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="font-black text-foreground text-xs min-w-[50px] sm:min-w-[55px] text-right">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </div>

                      <button
                        onClick={() => removeCartItem(idx)}
                        className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 p-1 sm:p-1.5 rounded-lg transition-all cursor-pointer"
                        title={t('removeItem', 'Remove item')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Coupon Input & Payment Controls */}
          <div className="p-3 sm:p-3.5 bg-muted/30 border-t border-border/80 space-y-2.5 sm:space-y-3 text-xs">

            {/* Coupon Code Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Ticket size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder={t('couponPlaceholder', 'Coupon / Promo Code (e.g. VIP10)')}
                  className="form-input text-xs pl-8 py-1.5 uppercase font-sans rounded-xl w-full"
                />
              </div>
              <button
                onClick={handleApplyCoupon}
                className="btn-secondary text-xs py-1.5 px-3 rounded-xl font-bold cursor-pointer"
              >
                {t('apply', 'Apply')}
              </button>
            </div>

            {/* Payment Method Switcher Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {([
                { id: 'cash', label: t('cash', 'Cash'), icon: Banknote },
                { id: 'khqr', label: t('khqr', 'KHQR'), icon: QrCode },
                { id: 'card', label: t('card', 'Card'), icon: CreditCard },
                { id: 'bank', label: t('transfer', 'Transfer'), icon: Building },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id)}
                  className={`py-2 rounded-xl font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs ${
                    paymentMethod === id
                      ? 'bg-primary text-primary-foreground shadow-xs ring-1 ring-primary/30'
                      : 'bg-card border border-border/70 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon size={14} /> <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Quick Cash Buttons */}
            {paymentMethod === 'cash' && (
              <div className="space-y-1.5 bg-card p-2 sm:p-2.5 rounded-2xl border border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px] font-medium">{t('cashTendered', 'Cash Tendered:')}</span>
                  <input
                    type="number"
                    value={cashTendered || ''}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    placeholder={`$${grandTotal.toFixed(2)}`}
                    className="form-input text-xs py-1 px-2 w-28 font-bold text-right text-primary rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                  {[5, 10, 20, 50, 100, 500, 1000].map(val => (
                    <button
                      key={val}
                      onClick={() => setCashTendered(val)}
                      className={`px-1.5 py-1 rounded-xl border font-bold text-[11px] text-center transition-all cursor-pointer
                        ${cashTendered === val
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/50 dark:bg-muted/20 text-foreground dark:text-foreground border-border hover:bg-primary/15 hover:text-primary hover:border-primary/40'
                        }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calculation Breakdown */}
            <div className="space-y-1 pt-1.5 border-t border-border/60">
              <div className="flex justify-between text-muted-foreground">
                <span>{t('subtotal', 'Subtotal')}</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>{t('totalDiscount', 'Total Discount')}</span>
                  <span className="font-mono">-{formatCurrency(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>{t('vatTax10', 'VAT Tax (10%)')}</span>
                <span className="font-mono">{formatCurrency(tax)}</span>
              </div>
              {paymentMethod === 'cash' && cashTendered > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                  <span>{t('changeDue', 'Change Due')}</span>
                  <span className="font-mono">{formatCurrency(changeDue)}</span>
                </div>
              )}
              <div className="flex justify-between text-foreground font-black text-sm sm:text-base pt-2 border-t border-border">
                <span>{t('grandTotal', 'Grand Total')}</span>
                <span className="text-primary font-mono">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Complete Transaction Action */}
            <button
              onClick={handleInitiateCheckout}
              disabled={cart.length === 0 || checkoutMutation.isPending}
              className="w-full py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 disabled:opacity-40 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              {checkoutMutation.isPending ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> {t('processingSale', 'Processing Sale...')}
                </>
              ) : (
                <>
                  {t('completeAndPay', 'Complete & Pay')} ({formatCurrency(grandTotal)})
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Floating Quick Cart Action Bar (screens < lg) ────────────── */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-40 bg-indigo-950/95 dark:bg-slate-900/95 text-white backdrop-blur-md p-3 sm:p-3.5 rounded-3xl shadow-2xl border border-indigo-500/30 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-inner">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] text-indigo-200 font-medium">{t('cartTotal', 'Cart Total')}</div>
              <div className="font-mono font-black text-sm sm:text-base text-white">{formatCurrency(grandTotal)}</div>
            </div>
          </div>
          <button
            onClick={() => {
              const panel = document.getElementById('pos-cart-panel')
              if (panel) panel.scrollIntoView({ behavior: 'smooth' })
            }}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all shrink-0 active:scale-95"
          >
            <ShoppingCart size={15} />
            <span>{t('viewCart', 'View Cart & Checkout')}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── 4. Modals ────────────────────────────────────────────────────── */}
      <POSProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCart={(p, v, imei) => addToCart(p, v, imei)}
      />

      <POSCustomerModal
        isOpen={isCustModalOpen}
        onClose={() => setIsCustModalOpen(false)}
        onAddCustomer={(newCust) => {
          setSelectedCust(newCust)
          toast.success(`Customer ${newCust.name} selected!`)
        }}
      />

      <POSHeldCartsModal
        isOpen={isHeldModalOpen}
        onClose={() => setIsHeldModalOpen(false)}
        heldCarts={heldCarts}
        onResumeCart={handleResumeCart}
        onDeleteHeldCart={handleDeleteHeldCart}
      />

      <POSKHQRModal
        isOpen={isKHQRModalOpen}
        onClose={() => setIsKHQRModalOpen(false)}
        amount={grandTotal}
        referenceNo={`KHQR-${Date.now().toString().slice(-6)}`}
        onPaymentSuccess={() => {
          setIsKHQRModalOpen(false)
          processFinalCheckout()
        }}
      />

      <POSCardPaymentModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        amount={grandTotal}
        onConfirmPayment={(details) => {
          setIsCardModalOpen(false)
          setCardDetails(details)
          processFinalCheckout(details)
        }}
      />

      <POSTransferPaymentModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        amount={grandTotal}
        onConfirmPayment={(details) => {
          setIsTransferModalOpen(false)
          setTransferDetails(details)
          processFinalCheckout(details)
        }}
      />

      <POSReceiptModal
        receipt={receiptData}
        onClose={() => setReceiptData(null)}
      />

      <POSCameraScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScan={handleCameraBarcodeScanned}
        onAddToCart={(product) => addToCart(product)}
        onSelectQuery={(queryText) => setSearch(queryText)}
        products={allCatalogProducts || productsData || []}
        selectedWarehouseId={selectedWarehouseId}
        selectedBranchId={selectedBranchId}
        companyId={(authUser as any)?.company_id ?? authUser?.company?.id ?? 1}
      />

    </div>
  )
}

export default POSPage
