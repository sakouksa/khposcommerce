import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Zap, X, Plus, Trash2, Search, Store, Globe, Smartphone, Sparkles, Clock, AlertTriangle, ShieldCheck, DollarSign, Package, Layers, Info, Check, RefreshCw
} from 'lucide-react'
import { productService } from '@/services/productService'
import { CAMBODIA_FLASH_SALE_PRESETS, FLASH_SALE_TIME_SESSIONS } from '../../constants/flashSalePresets'
import type { FlashSale, FlashSaleProductItem, ChannelScope, FlashSalePreset, TimeSlotSession } from '../../types/flashSale'
import { formatDateTimeLocal } from '@/utils/formatters'
import { EnterpriseDateTimePicker } from '@/components/common'

interface FlashSaleFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingSale: FlashSale | null
  onSubmit: (payload: any) => void
  isSubmitting: boolean
}

export const FlashSaleFormModal: React.FC<FlashSaleFormModalProps> = ({
  isOpen,
  onClose,
  editingSale,
  onSubmit,
  isSubmitting,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'products' | 'pos_rules'>('basic')

  // Form State - Tab 1: General & Schedule
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState<string>('')
  const [selectedSessionId, setSelectedSessionId] = useState<string>('prime_evening')
  const [channelScope, setChannelScope] = useState<ChannelScope>('all')
  const [branchIds, setBranchIds] = useState<string>('all')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Form State - Tab 2: Products & Quota
  const [selectedProducts, setSelectedProducts] = useState<FlashSaleProductItem[]>([])
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [searchedProductList, setSearchedProductList] = useState<any[]>([])
  const [isSearchingProducts, setIsSearchingProducts] = useState(false)

  // Form State - Tab 3: POS & Payment Rules
  const [posQuickCode, setPosQuickCode] = useState('FLASH-POS-2026')
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['all'])
  const [perCustomerLimit, setPerCustomerLimit] = useState<number>(2)
  const [autoStockRollback, setAutoStockRollback] = useState(true)
  const [priority, setPriority] = useState<number>(10)

  // Initialize or Reset Form
  useEffect(() => {
    if (editingSale) {
      setName(editingSale.name || '')
      setDescription(editingSale.description || '')
      setStartsAt(formatDateTimeLocal(editingSale.starts_at) || '')
      setEndsAt(formatDateTimeLocal(editingSale.ends_at) || '')
      setIsActive(editingSale.is_active ?? true)
      setChannelScope(editingSale.channel_scope || 'all')
      setBranchIds(Array.isArray(editingSale.branch_ids) ? editingSale.branch_ids.join(',') : 'all')

      // Load products
      if (editingSale.products && editingSale.products.length > 0) {
        setSelectedProducts(
          editingSale.products.map((p: any) => ({
            id: p.id,
            product_id: p.product_id || p.product?.id,
            product_name: p.product?.name || p.product_name || `Product #${p.product_id}`,
            product_sku: p.product?.sku || p.product_sku || 'SKU-FLASH',
            product_image: p.product?.image_url || p.product_image || '',
            original_price: Number(p.product?.selling_price || p.original_price || 25),
            flash_price: Number(p.flash_price || 15),
            flash_price_khr: Number(p.flash_price || 15) * 4100,
            discount_percent: Number(p.discount_percent || 40),
            quota: Number(p.quota || 50),
            sold_count: Number(p.sold_count || 0),
            per_customer_limit: Number(p.per_customer_limit || 2),
            product_variant_id: p.product_variant_id || null,
          }))
        )
      } else {
        // Fallback placeholder products for preview
        setSelectedProducts([
          {
            product_id: 1,
            product_name: 'Wireless Noise Canceling Earbuds Pro',
            product_sku: 'AUD-EAR-001',
            original_price: 59.00,
            flash_price: 29.50,
            flash_price_khr: 120950,
            discount_percent: 50,
            quota: 50,
            sold_count: 12,
            per_customer_limit: 2,
          },
          {
            product_id: 2,
            product_name: 'Fast Charging Power Bank 20000mAh',
            product_sku: 'PWR-BNK-002',
            original_price: 35.00,
            flash_price: 19.99,
            flash_price_khr: 81950,
            discount_percent: 43,
            quota: 40,
            sold_count: 8,
            per_customer_limit: 2,
          },
        ])
      }
    } else {
      // Default new form state
      const now = new Date()
      const startIso = new Date(now.getTime() + 10 * 60 * 1000)
      const endIso = new Date(now.getTime() + 4 * 60 * 60 * 1000)

      setName('')
      setDescription('')
      setSelectedPresetId('')
      setSelectedSessionId('prime_evening')
      setChannelScope('all')
      setBranchIds('all')
      setStartsAt(formatDateTimeLocal(startIso.toISOString()))
      setEndsAt(formatDateTimeLocal(endIso.toISOString()))
      setIsActive(true)
      setPosQuickCode(`FLASH-${Math.floor(1000 + Math.random() * 9000)}`)
      setPaymentMethods(['all'])
      setPerCustomerLimit(2)
      setAutoStockRollback(true)
      setPriority(10)

      // Initialize with sample items
      setSelectedProducts([
        {
          product_id: 1,
          product_name: 'Smart Fitness Tracker Band 8',
          product_sku: 'WTR-FIT-008',
          original_price: 45.00,
          flash_price: 22.50,
          flash_price_khr: 92250,
          discount_percent: 50,
          quota: 50,
          sold_count: 0,
          per_customer_limit: 2,
        },
      ])
    }
  }, [editingSale, isOpen])

  // Search Products from API
  useEffect(() => {
    let active = true
    const fetchProducts = async () => {
      setIsSearchingProducts(true)
      try {
        const res = await productService.list({ search: productSearchQuery, per_page: 8 })
        if (active) {
          setSearchedProductList(res?.data || [])
        }
      } catch {
        if (active) setSearchedProductList([])
      } finally {
        if (active) setIsSearchingProducts(false)
      }
    }

    const timer = setTimeout(fetchProducts, 300)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [productSearchQuery])

  // Handle Preset Selection
  const handleApplyPreset = (preset: FlashSalePreset) => {
    setSelectedPresetId(preset.id)
    setName(preset.nameKm)
    setDescription(preset.descriptionKm)
    setChannelScope(preset.channel_scope)
    setPerCustomerLimit(preset.per_customer_limit)

    // Calculate dates based on default duration
    const now = new Date()
    const startIso = new Date(now.getTime() + 15 * 60 * 1000)
    const endIso = new Date(now.getTime() + (preset.default_duration_hours || 3) * 60 * 60 * 1000)
    setStartsAt(formatDateTimeLocal(startIso.toISOString()))
    setEndsAt(formatDateTimeLocal(endIso.toISOString()))

    // Adjust selected products' discount
    setSelectedProducts((prev) =>
      prev.map((p) => {
        const flashPrice = Number((p.original_price * (1 - preset.discount_percent / 100)).toFixed(2))
        return {
          ...p,
          discount_percent: preset.discount_percent,
          flash_price: flashPrice,
          flash_price_khr: Math.round(flashPrice * 4100),
          quota: preset.quota_per_product,
          per_customer_limit: preset.per_customer_limit,
        }
      })
    )
  }

  // Handle Session Time Slot Selection
  const handleApplySession = (session: TimeSlotSession) => {
    setSelectedSessionId(session.id)
    if (session.id === 'custom_session') return

    const now = new Date()
    const start = new Date(now)
    start.setHours(session.startHour, 0, 0, 0)
    if (start < now) {
      start.setDate(start.getDate() + 1)
    }

    const end = new Date(start)
    end.setHours(session.endHour, 0, 0, 0)

    setStartsAt(formatDateTimeLocal(start.toISOString()))
    setEndsAt(formatDateTimeLocal(end.toISOString()))
  }

  // Add Product to Flash Sale List
  const handleAddProduct = (prod: any) => {
    if (selectedProducts.some((p) => p.product_id === prod.id)) return

    const origPrice = Number(prod.selling_price || 20)
    const discPct = 30
    const flashPrice = Number((origPrice * (1 - discPct / 100)).toFixed(2))

    setSelectedProducts((prev) => [
      ...prev,
      {
        product_id: prod.id,
        product_name: prod.name,
        product_sku: prod.sku || `SKU-${prod.id}`,
        product_image: prod.image_url || '',
        product_category: prod.category?.name || 'General',
        product_brand: prod.brand?.name || '',
        original_price: origPrice,
        flash_price: flashPrice,
        flash_price_khr: Math.round(flashPrice * 4100),
        discount_percent: discPct,
        quota: 50,
        sold_count: 0,
        per_customer_limit: perCustomerLimit,
      },
    ])
  }

  // Update Product Price / Quota in Table
  const handleProductChange = (index: number, field: keyof FlashSaleProductItem, value: any) => {
    setSelectedProducts((prev) => {
      const copy = [...prev]
      const item = { ...copy[index], [field]: value }

      if (field === 'flash_price') {
        const numVal = Number(value) || 0
        item.flash_price = numVal
        item.flash_price_khr = Math.round(numVal * 4100)
        item.discount_percent = item.original_price > 0
          ? Math.max(0, Math.round(((item.original_price - numVal) / item.original_price) * 100))
          : 0
      } else if (field === 'discount_percent') {
        const pct = Math.min(Math.max(Number(value) || 0, 0), 100)
        item.discount_percent = pct
        const calculatedPrice = Number((item.original_price * (1 - pct / 100)).toFixed(2))
        item.flash_price = calculatedPrice
        item.flash_price_khr = Math.round(calculatedPrice * 4100)
      }

      copy[index] = item
      return copy
    })
  }

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle Form Submission
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !startsAt || !endsAt) return

    const payload = {
      name,
      description,
      channel_scope: channelScope,
      branch_ids: branchIds === 'all' ? 'all' : branchIds.split(',').map((id) => Number(id.trim())).filter(Boolean),
      starts_at: startsAt,
      ends_at: endsAt,
      is_active: isActive,
      time_slot_name: FLASH_SALE_TIME_SESSIONS.find((s) => s.id === selectedSessionId)?.labelEn || 'Custom Slot',
      products: selectedProducts.map((p) => ({
        product_id: p.product_id,
        product_variant_id: p.product_variant_id || null,
        flash_price: p.flash_price,
        discount_percent: p.discount_percent,
        quota: p.quota,
        sold_count: p.sold_count || 0,
      })),
      conditions: {
        pos_quick_code: posQuickCode,
        payment_methods: paymentMethods,
        per_customer_limit: perCustomerLimit,
        auto_stock_rollback: autoStockRollback,
        priority,
      },
    }

    onSubmit(payload)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-[28px] shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/15 text-amber-500">
              <Zap className="h-5 w-5 fill-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {editingSale ? 'Edit Flash Sale Campaign' : 'Create Enterprise Flash Sale'}
              </h3>
              <p className="text-xs text-muted-foreground">
                Configure limited-time rush offers, quota allocations, and omnichannel POS sync.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-border px-6 bg-muted/10 gap-2 pt-2">
          {[
            { id: 'basic', label: '1. General & Schedule', icon: Clock },
            { id: 'products', label: `2. Products & Quotas (${selectedProducts.length})`, icon: Package },
            { id: 'pos_rules', label: '3. POS & Omnichannel Rules', icon: Store },
          ].map((tab) => {
            const Icon = tab.icon
            const isCur = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  isCur
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* ── TAB 1: GENERAL & SCHEDULE ────────────────────────────────────── */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              {/* Presets Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>Cambodia Festival & Campaign Presets</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {CAMBODIA_FLASH_SALE_PRESETS.slice(0, 6).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedPresetId === preset.id
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                          : 'border-border bg-card hover:bg-muted/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                          {preset.badge}
                        </span>
                        <span className="text-xs font-bold text-emerald-600">{preset.discount_percent}% OFF</span>
                      </div>
                      <div className="font-bold text-xs text-foreground mt-1 truncate">{preset.nameKm}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{preset.time_slot_name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaign Title & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🌸 មហោស្រពចូលឆ្នាំខ្មែរ Flash 50% OFF"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Description / Banner Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="Short description for storefront countdown..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              {/* Time Slot Sessions */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Flash Rush Sessions (Pre-scheduled Time Slots)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {FLASH_SALE_TIME_SESSIONS.map((sess) => (
                    <button
                      key={sess.id}
                      type="button"
                      onClick={() => handleApplySession(sess)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedSessionId === sess.id
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="text-[11px] font-semibold truncate">{sess.badge}</div>
                      <div className="text-[10px] text-muted-foreground">{sess.timeRange}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start & End Datetimes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <EnterpriseDateTimePicker
                    label="Starts At"
                    required
                    value={startsAt}
                    onChange={setStartsAt}
                    outputFormat="YYYY-MM-DDTHH:mm"
                  />
                </div>
                <div>
                  <EnterpriseDateTimePicker
                    label="Ends At"
                    required
                    minDateTime={startsAt}
                    value={endsAt}
                    onChange={setEndsAt}
                    outputFormat="YYYY-MM-DDTHH:mm"
                  />
                </div>
              </div>

              {/* Channel Scope Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Channel Scope (Where is this Flash Sale Active?)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'All Channels (Omni)', icon: Store },
                    { id: 'pos_only', label: 'Retail POS Branches', icon: Store },
                    { id: 'storefront_only', label: 'E-Commerce Website', icon: Globe },
                    { id: 'app_only', label: 'Mobile App Only', icon: Smartphone },
                  ].map((ch) => {
                    const Icon = ch.icon
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setChannelScope(ch.id as any)}
                        className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                          channelScope === ch.id
                            ? 'border-primary bg-primary text-white shadow-2xs'
                            : 'border-border bg-card text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon size={14} />
                        <span>{ch.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveFlashSale"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-primary focus:ring-primary cursor-pointer h-4 w-4"
                />
                <label htmlFor="isActiveFlashSale" className="text-xs font-medium text-foreground cursor-pointer">
                  Campaign Enabled & Ready for Countdown
                </label>
              </div>
            </div>
          )}

          {/* ── TAB 2: PRODUCTS & QUOTA MATRIX ───────────────────────────────── */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Product Search & Picker Bar */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Add Products to Flash Sale</span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Search from inventory catalogue
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-muted-foreground" size={14} />
                  <input
                    type="text"
                    placeholder="Search products by title, SKU, or category..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Searched Items Dropdown Results */}
                {searchedProductList.length > 0 && (
                  <div className="max-h-40 overflow-y-auto divide-y divide-border/60 bg-card rounded-xl border border-border/70 shadow-sm mt-1">
                    {searchedProductList.map((p) => {
                      const isAdded = selectedProducts.some((sp) => sp.product_id === p.id)
                      return (
                        <div
                          key={p.id}
                          className="p-2.5 flex items-center justify-between hover:bg-muted/50 text-xs transition-colors"
                        >
                          <div>
                            <span className="font-bold text-foreground">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground ml-2">SKU: {p.sku || p.id}</span>
                            <span className="text-xs font-semibold text-emerald-600 ml-2">
                              ${Number(p.selling_price || 0).toFixed(2)}
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={isAdded}
                            onClick={() => handleAddProduct(p)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                              isAdded
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-primary text-white hover:opacity-90'
                            }`}
                          >
                            {isAdded ? 'Added' : '+ Add Item'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Selected Products Table */}
              <div className="border border-border rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/50 border-b border-border font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                    <tr>
                      <th className="p-3 pl-4">Product Details</th>
                      <th className="p-3">Regular Price</th>
                      <th className="p-3">Flash Price ($)</th>
                      <th className="p-3">Flash Price (KHR ៛)</th>
                      <th className="p-3">Discount %</th>
                      <th className="p-3">Stock Quota</th>
                      <th className="p-3 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 font-medium">
                    {selectedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          No products added yet. Use the search bar above to include products in this flash sale.
                        </td>
                      </tr>
                    ) : (
                      selectedProducts.map((p, idx) => (
                        <tr key={idx} className="hover:bg-muted/30">
                          <td className="p-3 pl-4">
                            <div className="font-bold text-foreground text-xs">{p.product_name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{p.product_sku}</div>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            ${p.original_price.toFixed(2)}
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={p.flash_price}
                              onChange={(e) => handleProductChange(idx, 'flash_price', e.target.value)}
                              className="w-20 p-1.5 rounded-lg border border-border bg-card text-foreground font-bold text-xs"
                            />
                          </td>
                          <td className="p-3 font-mono text-xs text-muted-foreground">
                            {p.flash_price_khr?.toLocaleString() || (p.flash_price * 4100).toLocaleString()} ៛
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                max="99"
                                value={p.discount_percent}
                                onChange={(e) => handleProductChange(idx, 'discount_percent', e.target.value)}
                                className="w-14 p-1.5 rounded-lg border border-border bg-card text-foreground font-bold text-xs"
                              />
                              <span className="text-muted-foreground font-bold">%</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="1"
                              value={p.quota}
                              onChange={(e) => handleProductChange(idx, 'quota', Number(e.target.value))}
                              className="w-16 p-1.5 rounded-lg border border-border bg-card text-foreground font-bold text-xs"
                            />
                          </td>
                          <td className="p-3 text-right pr-4">
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(idx)}
                              className="p-1 hover:bg-rose-500/10 rounded-lg text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Stats Banner */}
              {selectedProducts.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-amber-600" size={16} />
                    <span className="text-muted-foreground">Total Quota Allocated:</span>
                    <span className="font-bold text-foreground">
                      {selectedProducts.reduce((acc, p) => acc + (p.quota || 0), 0)} Units
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    Protected from whole inventory clearance
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: POS & PAYMENT RULES ───────────────────────────────────── */}
          {activeTab === 'pos_rules' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* POS Quick Barcode / SKU Scan Code */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    POS Quick Barcode Scan Code
                  </label>
                  <input
                    type="text"
                    value={posQuickCode}
                    onChange={(e) => setPosQuickCode(e.target.value)}
                    placeholder="e.g. FLASH-KNY-2026"
                    className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Cashiers can scan or key in this code to trigger instant flash pricing.
                  </span>
                </div>

                {/* Per-Customer Purchase Limit */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Per-Customer Purchase Limit (Anti-Scalping)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={perCustomerLimit}
                    onChange={(e) => setPerCustomerLimit(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-bold"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Max quantity allowed per single customer order.
                  </span>
                </div>
              </div>

              {/* Multi-Branch Assignment */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Retail Branch Assignment
                </label>
                <select
                  value={branchIds}
                  onChange={(e) => setBranchIds(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-medium"
                >
                  <option value="all">All Physical Branches & Outlets (Phnom Penh, Siem Reap, Battambang)</option>
                  <option value="1">Phnom Penh Flagship HQ Only</option>
                  <option value="2">Siem Reap Heritage Outlet Only</option>
                  <option value="3">Battambang Retail Hub Only</option>
                </select>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Eligible Payment Methods
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'all', label: 'All Payments' },
                    { id: 'khqr_bakong', label: '🇰🇭 Bakong KHQR' },
                    { id: 'aba_pay', label: 'ABA PAY' },
                    { id: 'cash', label: '💵 Cash at POS' },
                  ].map((pm) => {
                    const isSel = paymentMethods.includes(pm.id)
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => {
                          if (pm.id === 'all') {
                            setPaymentMethods(['all'])
                          } else {
                            const withoutAll = paymentMethods.filter((p) => p !== 'all')
                            if (isSel) {
                              const remaining = withoutAll.filter((p) => p !== pm.id)
                              setPaymentMethods(remaining.length === 0 ? ['all'] : remaining)
                            } else {
                              setPaymentMethods([...withoutAll, pm.id])
                            }
                          }
                        }}
                        className={`p-2.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                          isSel
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'border-border bg-card text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {pm.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Auto Stock Rollback Toggle */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoStockRollback"
                    checked={autoStockRollback}
                    onChange={(e) => setAutoStockRollback(e.target.checked)}
                    className="rounded text-primary focus:ring-primary cursor-pointer h-4 w-4"
                  />
                  <label htmlFor="autoStockRollback" className="text-xs font-bold text-foreground cursor-pointer">
                    Auto-Stock Rollback on Session Expiration
                  </label>
                </div>
                <p className="text-[11px] text-muted-foreground pl-6">
                  When this flash sale campaign expires or reaches quota, unsold stock automatically reverts to standard retail pricing without manual intervention.
                </p>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-muted-foreground hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'pos_rules' ? 'products' : 'basic')}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border text-foreground hover:bg-muted cursor-pointer"
                >
                  Previous
                </button>
              )}
              {activeTab !== 'pos_rules' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'basic' ? 'products' : 'pos_rules')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:opacity-90 cursor-pointer shadow-sm"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:opacity-90 flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting && <RefreshCw className="animate-spin" size={14} />}
                  <span>Save Flash Sale</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
