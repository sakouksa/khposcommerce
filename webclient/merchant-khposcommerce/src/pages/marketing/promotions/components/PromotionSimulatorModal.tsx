import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  X,
  Plus,
  Trash2,
  Sparkles,
  ShoppingBag,
  Store,
  Globe,
  Smartphone,
  MapPin,
  Tag,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { marketingService } from '@/services/marketingService'
import type { PromotionCampaign, PricingEngineResult } from '../types'

interface PromotionSimulatorModalProps {
  isOpen: boolean
  onClose: () => void
  promotions: PromotionCampaign[]
}

interface CartItemInput {
  product_id: number
  name: string
  sku: string
  quantity: number
  unit_price: number
}

const DEFAULT_SAMPLE_ITEMS: CartItemInput[] = [
  { product_id: 1, name: 'Apple iPhone 15 Pro Max 256GB', sku: 'IPHONE-15PM', quantity: 1, unit_price: 1199.0 },
  { product_id: 2, name: 'Samsung Galaxy S24 Ultra Titanium', sku: 'SAMS-S24U', quantity: 1, unit_price: 1299.0 },
  { product_id: 3, name: 'Phone Protective Case Premium', sku: 'ACC-CASE-01', quantity: 2, unit_price: 25.0 },
  { product_id: 4, name: 'Tempered Glass Screen Protector', sku: 'ACC-SCREEN-01', quantity: 1, unit_price: 15.0 },
]

export const PromotionSimulatorModal: React.FC<PromotionSimulatorModalProps> = ({
  isOpen,
  onClose,
  promotions,
}) => {
  const { t } = useTranslation(['marketing', 'common'])

  // Simulation Context
  const [branchId, setBranchId] = useState<number>(1) // 1: Phnom Penh, 2: Tbong Khmum, 3: Siem Reap
  const [channel, setChannel] = useState<'pos' | 'web' | 'mobile'>('pos')
  const [couponCode, setCouponCode] = useState<string>('KHNY2026')

  // Cart Items
  const [cartItems, setCartItems] = useState<CartItemInput[]>(DEFAULT_SAMPLE_ITEMS)
  const [newProdName, setNewProdName] = useState('')
  const [newProdPrice, setNewProdPrice] = useState('50')
  const [newProdQty, setNewProdQty] = useState('1')

  // Pricing Engine API Result State
  const [pricingResult, setPricingResult] = useState<PricingEngineResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Trigger calculation against Laravel Pricing Engine
  const runSimulation = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const response = await marketingService.calculatePricing({
        company_id: 1,
        branch_id: branchId,
        channel: channel,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        coupon_code: couponCode.trim() || undefined,
        tax_rate: 0.0,
      })

      if (response && response.summary) {
        setPricingResult(response)
      } else {
        setPricingResult(null)
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Pricing Engine evaluation error')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-calculate on changes
  useEffect(() => {
    if (isOpen) {
      runSimulation()
    }
  }, [isOpen, branchId, channel, couponCode, cartItems])

  const updateQuantity = (productId: number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product_id === productId) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) }
        }
        return item
      })
    )
  }

  const removeItem = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.product_id !== productId))
  }

  const addCustomItem = () => {
    if (!newProdName.trim()) return
    const newItem: CartItemInput = {
      product_id: 100 + cartItems.length,
      name: newProdName.trim(),
      sku: `PROD-${100 + cartItems.length}`,
      unit_price: parseFloat(newProdPrice) || 10,
      quantity: parseInt(newProdQty) || 1,
    }
    setCartItems([...cartItems, newItem])
    setNewProdName('')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="bg-card w-full max-w-5xl rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-border bg-gradient-to-r from-primary/10 via-amber-500/10 to-purple-500/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                <Calculator size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <span>{t('marketing.simulatorTitle', 'Central Laravel Pricing Engine Simulator')}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                    {t('marketing.liveEngine', 'Live Engine')}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t('marketing.simulatorSubtitle', 'Simulate cart discounts across Branch Scopes, Channels, Stacking Rules & Snapshots.')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Simulator Body */}
          <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Scope & Cart Builder (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Context Selector: Branch & Channel */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-primary" />
                  <span>{t('marketing.branchScopeChannelEnv')}</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-foreground mb-1 block">
                      {t('marketing.storeBranch')}
                    </label>
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(Number(e.target.value))}
                      className="w-full text-xs font-semibold rounded-xl bg-card border border-border p-2.5 focus:outline-hidden focus:ring-2 focus:ring-primary"
                    >
                      <option value={1}>Phnom Penh HQ (Eligible for KHNY2026 & VIP)</option>
                      <option value={3}>Siem Reap Branch (Eligible for KHNY2026)</option>
                      <option value={2}>Tbong Khmum Branch (Excluded Branch Scope)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-foreground mb-1 block">
                      {t('marketing.salesChannel')}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 bg-card p-1 rounded-xl border border-border">
                      <button
                        type="button"
                        onClick={() => setChannel('pos')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          channel === 'pos' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Store size={12} /> POS
                      </button>
                      <button
                        type="button"
                        onClick={() => setChannel('web')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          channel === 'web' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Globe size={12} /> Web
                      </button>
                      <button
                        type="button"
                        onClick={() => setChannel('mobile')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          channel === 'mobile' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Smartphone size={12} /> App
                      </button>
                    </div>
                  </div>
                </div>

                {/* Coupon Code Input */}
                <div>
                  <label className="text-[11px] font-bold text-foreground mb-1 block flex items-center justify-between">
                    <span>{t('marketing.couponPromoCode')}</span>
                    <span className="text-[10px] text-muted-foreground">Try: KHNY2026 or VIPHQ15</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={13} className="absolute left-3 top-3 text-muted-foreground" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder={t('marketing.enterCouponCode')}
                        className="w-full text-xs font-mono font-bold rounded-xl bg-card border border-border pl-8 pr-3 py-2 uppercase"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={runSimulation}
                      className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                      {t('marketing.verify')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag size={14} className="text-primary" />
                    <span>{t('marketing.cartItems')} ({cartItems.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCartItems(DEFAULT_SAMPLE_ITEMS)}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    {t('marketing.resetDefaults')}
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.product_id}
                      className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-foreground truncate">{item.name}</p>
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          ${item.unit_price.toFixed(2)} × {item.quantity} = ${(item.unit_price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-muted/60 rounded-lg p-0.5 border border-border">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs hover:bg-card"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-mono font-bold text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs hover:bg-card"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product_id)}
                          className="text-muted-foreground hover:text-rose-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Add Custom Product */}
                <div className="p-3 rounded-2xl bg-muted/20 border border-border/80 flex items-center gap-2">
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder={t('marketing.addCustomItemPlaceholder2')}
                    className="flex-1 text-xs rounded-xl bg-card border border-border px-3 py-1.5"
                  />
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder={t('marketing.unitPrice')}
                    className="w-20 text-xs rounded-xl bg-card border border-border px-2 py-1.5 font-mono"
                  />
                  <button
                    type="button"
                    onClick={addCustomItem}
                    className="btn btn-primary text-xs px-3 py-1.5 font-bold flex items-center gap-1"
                  >
                    <Plus size={13} /> {t('common.add', 'Add')}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Calculation Breakdown & Discount Snapshots (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-3xl bg-muted/30 border border-border space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>{t('marketing.pricingResults')}</span>
                  </h4>
                  {isLoading && <RefreshCw size={13} className="animate-spin text-primary" />}
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {pricingResult ? (
                  <div className="space-y-4">
                    {/* Financial Summary */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>{t('marketing.subtotal')}:</span>
                        <span className="font-mono font-bold text-foreground">
                          ${pricingResult.summary.subtotal.toFixed(2)}
                        </span>
                      </div>

                      {pricingResult.summary.items_discount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span>Product / Brand Rules:</span>
                          <span className="font-mono font-bold">
                            -${pricingResult.summary.items_discount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {pricingResult.summary.cart_discount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span>Cart-Level Discount:</span>
                          <span className="font-mono font-bold">
                            -${pricingResult.summary.cart_discount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {pricingResult.summary.coupon_discount > 0 && (
                        <div className="flex justify-between text-purple-600 dark:text-purple-400 font-bold">
                          <span>Coupon Discount ({couponCode}):</span>
                          <span className="font-mono">
                            -${pricingResult.summary.coupon_discount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-xs font-bold pt-2 border-t border-border">
                        <span className="text-emerald-600 dark:text-emerald-400">{t('marketing.totalSavingsLabel')}:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          -${pricingResult.summary.total_discount.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between text-base font-extrabold pt-2 border-t border-border text-foreground">
                        <span>{t('marketing.finalPayable')}:</span>
                        <span className="font-mono text-primary text-xl">
                          ${pricingResult.summary.grand_total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Applied Promotion Rules List */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        {t('marketing.activeRulesApplied')} ({pricingResult.applied_promotions.length})
                      </p>

                      {pricingResult.applied_promotions.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic p-2 rounded-xl bg-card border text-center">
                          {t('marketing.noPromotionsEligible')}
                        </p>
                      ) : (
                        <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                          {pricingResult.applied_promotions.map((ap, i) => (
                            <div
                              key={i}
                              className="p-2.5 rounded-xl bg-card border border-border text-xs flex items-center justify-between"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-bold text-foreground truncate">{ap.rule_name}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{ap.campaign_name}</p>
                              </div>
                              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                                -${ap.discount_amount.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Order / Sale Snapshot Verification Notice */}
                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 text-[11px] space-y-1 text-muted-foreground">
                      <p className="font-bold text-foreground flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-primary" />
                        <span>{t('marketing.snapshotNotice')}</span>
                      </p>
                      <p>
                        When converted to a Sale or Order, lines preserve{' '}
                        <code className="text-primary font-mono text-[10px]">final_unit_price</code>,{' '}
                        <code className="text-primary font-mono text-[10px]">promotion_id</code>, and{' '}
                        <code className="text-primary font-mono text-[10px]">discount_type</code> permanently.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    {t('marketing.calculatingBreakdown')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
export default PromotionSimulatorModal
