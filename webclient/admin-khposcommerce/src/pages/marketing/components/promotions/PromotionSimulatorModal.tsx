import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  X,
  Plus,
  Trash2,
  Sparkles,
  ShoppingBag,
  Store,
  CreditCard,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Promotion, SimulatorCartItem } from '../../types/promotion'

interface PromotionSimulatorModalProps {
  isOpen: boolean
  onClose: () => void
  promotions: Promotion[]
}

const DEFAULT_SAMPLE_PRODUCTS: SimulatorCartItem[] = [
  { id: 101, name: 'Wireless Bluetooth Earbuds Pro', sku: 'AUDIO-01', category_id: 1, unit_price: 35.0, quantity: 1 },
  { id: 102, name: 'Cambodia Jasmine Rice 5kg', sku: 'GROC-05', category_id: 2, unit_price: 12.5, quantity: 2 },
  { id: 103, name: 'Cotton Casual T-Shirt (Khmer Art)', sku: 'APPAREL-02', category_id: 3, unit_price: 18.0, quantity: 1 },
]

export const PromotionSimulatorModal: React.FC<PromotionSimulatorModalProps> = ({
  isOpen,
  onClose,
  promotions,
}) => {
  const { t } = useTranslation(['marketing', 'common'])

  // Simulation Context
  const [channel, setChannel] = useState<'all' | 'pos_only' | 'storefront_only'>('all')
  const [branch, setBranch] = useState<string>('Phnom Penh HQ')
  const [customerGroup, setCustomerGroup] = useState<string>('retail')
  const [paymentMethod, setPaymentMethod] = useState<string>('khqr_bakong')

  // Cart Items
  const [cartItems, setCartItems] = useState<SimulatorCartItem[]>(DEFAULT_SAMPLE_PRODUCTS)
  const [customItemName, setCustomItemName] = useState('')
  const [customItemPrice, setCustomItemPrice] = useState('25')
  const [customItemQty, setCustomItemQty] = useState('1')

  const addItemToCart = () => {
    if (!customItemName.trim()) return
    const newItem: SimulatorCartItem = {
      id: Date.now(),
      name: customItemName.trim(),
      sku: `CUSTOM-${Math.floor(Math.random() * 1000)}`,
      category_id: 1,
      unit_price: parseFloat(customItemPrice) || 10,
      quantity: parseInt(customItemQty) || 1,
    }
    setCartItems([...cartItems, newItem])
    setCustomItemName('')
  }

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = Math.max(1, item.quantity + delta)
            return { ...item, quantity: nextQty }
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const resetCart = () => {
    setCartItems(DEFAULT_SAMPLE_PRODUCTS)
  }

  // Simulation Calculation Engine
  const simulationResult = useMemo(() => {
    const rawSubtotal = cartItems.reduce((acc, item) => acc + item.unit_price * item.quantity, 0)
    const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0)

    let totalDiscount = 0
    const appliedPromos: Array<{ promo: Promotion; discountAmount: number; reason: string }> = []

    // Sort promotions by priority descending
    const activePromos = promotions
      .filter((p) => p.is_active)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))

    for (const p of activePromos) {
      // 1. Channel match
      if (p.channel_scope && p.channel_scope !== 'all' && channel !== 'all' && p.channel_scope !== channel) {
        continue
      }

      // 2. Conditions check
      const cond = p.conditions || {}
      const rewards = p.rewards || {}

      // Min spend
      if (cond.min_spend_usd && rawSubtotal < cond.min_spend_usd) {
        continue
      }

      // Min qty
      if (cond.min_quantity && totalQuantity < cond.min_quantity) {
        continue
      }

      // Payment method match
      if (
        cond.payment_methods &&
        !cond.payment_methods.includes('all') &&
        !cond.payment_methods.includes(paymentMethod)
      ) {
        continue
      }

      // Customer tier match
      if (
        cond.customer_groups &&
        !cond.customer_groups.includes('all') &&
        !cond.customer_groups.includes(customerGroup)
      ) {
        continue
      }

      // Calculate discount
      let promoDiscount = 0
      const discountType = rewards.discount_type || p.type || 'percentage'
      const discountVal = Number(rewards.discount_value) || 10

      if (discountType === 'percentage') {
        promoDiscount = (rawSubtotal * discountVal) / 100
        if (rewards.max_discount_cap && promoDiscount > rewards.max_discount_cap) {
          promoDiscount = Number(rewards.max_discount_cap)
        }
      } else if (discountType === 'fixed_amount') {
        promoDiscount = Math.min(rawSubtotal, discountVal)
      } else if (discountType === 'bogo') {
        // Find qualifying item and give 1 free
        if (cartItems.length > 0) {
          const cheapest = [...cartItems].sort((a, b) => a.unit_price - b.unit_price)[0]
          promoDiscount = cheapest.unit_price
        }
      } else if (discountType === 'free_shipping') {
        promoDiscount = 2.5 // Estimated standard Cambodia shipping
      }

      if (promoDiscount > 0) {
        totalDiscount += promoDiscount
        appliedPromos.push({
          promo: p,
          discountAmount: promoDiscount,
          reason: `Matched ${p.name} (${discountType.toUpperCase()})`,
        })

        // If not stackable, stop applying further promotions
        if (p.is_stackable === false) {
          break
        }
      }
    }

    const finalPayable = Math.max(0, rawSubtotal - totalDiscount)
    const discountRate = rawSubtotal > 0 ? (totalDiscount / rawSubtotal) * 100 : 0
    const estimatedCost = rawSubtotal * 0.6 // Assuming 40% gross margin baseline
    const grossProfit = finalPayable - estimatedCost
    const estimatedProfitMargin = finalPayable > 0 ? (grossProfit / finalPayable) * 100 : 0

    return {
      rawSubtotal,
      totalQuantity,
      totalDiscount,
      finalPayable,
      discountRate,
      appliedPromos,
      estimatedProfitMargin,
      isMarginSafe: estimatedProfitMargin >= 18,
    }
  }, [cartItems, channel, branch, customerGroup, paymentMethod, promotions])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-card border border-border rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
                <Calculator size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Promotion Test Simulator & Cart Calculator</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Live Engine
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Simulate cart orders, verify discount stacking, and inspect profit margin safety in real-time.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
            {/* Left Column: Cart & Channel Controls (7 cols) */}
            <div className="lg:col-span-7 p-6 border-r border-border space-y-5">
              {/* Simulation Environment Settings */}
              <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Store size={14} />
                  <span>1. Simulation Context</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Sales Channel</label>
                    <select
                      value={channel}
                      onChange={(e: any) => setChannel(e.target.value)}
                      className="input w-full text-xs py-1.5"
                    >
                      <option value="all">🟢 Omni-Channel (Both)</option>
                      <option value="pos_only">🔵 In-Store POS Register</option>
                      <option value="storefront_only">🟣 Online Storefront</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Target Branch</label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="input w-full text-xs py-1.5"
                    >
                      <option value="Phnom Penh HQ">Phnom Penh HQ</option>
                      <option value="Toul Kork Branch">Toul Kork Branch</option>
                      <option value="Siem Reap Branch">Siem Reap Branch</option>
                      <option value="Battambang Branch">Battambang Branch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Customer Tier</label>
                    <select
                      value={customerGroup}
                      onChange={(e) => setCustomerGroup(e.target.value)}
                      className="input w-full text-xs py-1.5"
                    >
                      <option value="retail">General Retail Shopper</option>
                      <option value="first_time">✨ First-time Buyer</option>
                      <option value="vip_silver">🥈 VIP Silver Member</option>
                      <option value="vip_gold">🥇 VIP Gold Member</option>
                      <option value="vip_platinum">💎 VIP Platinum Member</option>
                      <option value="wholesale">🏢 Wholesale / B2B Partner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="input w-full text-xs py-1.5"
                    >
                      <option value="khqr_bakong">🇰🇭 Bakong KHQR (QR Scan)</option>
                      <option value="aba_pay">ABA PAY / Card</option>
                      <option value="wing">Wing Bank / WingPay</option>
                      <option value="acleda">ACLEDA Mobile</option>
                      <option value="cash">💵 Cash / Counter Payment</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag size={14} />
                    <span>2. Test Cart Items ({simulationResult.totalQuantity} items)</span>
                  </h4>
                  <button
                    onClick={resetCart}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={11} />
                    <span>Reset Sample</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-card border border-border flex items-center justify-between shadow-2xs hover:border-primary/40 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          ${item.unit_price.toFixed(2)} × {item.quantity} = ${(item.unit_price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-border rounded-lg overflow-hidden bg-muted/30">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2 py-0.5 text-xs hover:bg-muted font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold font-mono">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2 py-0.5 text-xs hover:bg-muted font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Custom Item Row */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Custom product name..."
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    className="input flex-1 text-xs py-1.5"
                    onKeyDown={(e) => e.key === 'Enter' && addItemToCart()}
                  />
                  <input
                    type="number"
                    placeholder="Price $"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(e.target.value)}
                    className="input w-20 text-xs py-1.5 font-mono"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(e.target.value)}
                    className="input w-16 text-xs py-1.5 font-mono"
                  />
                  <button
                    onClick={addItemToCart}
                    className="px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Real-time Calculation Breakdown (5 cols) */}
            <div className="lg:col-span-5 p-6 bg-muted/10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>3. Applied Discount Breakdown</span>
                </h4>

                {/* Applied Promotions List */}
                <div className="space-y-2">
                  {simulationResult.appliedPromos.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-muted/40 border border-dashed border-border text-center">
                      <p className="text-xs text-muted-foreground">
                        No active promotion matched current cart conditions.
                      </p>
                    </div>
                  ) : (
                    simulationResult.appliedPromos.map(({ promo, discountAmount, reason }, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground truncate">{promo.name}</span>
                          <span className="text-xs font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                            -${discountAmount.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{reason}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Calculation Summary Card */}
                <div className="p-4 rounded-2xl bg-card border border-border space-y-2.5 shadow-xs">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Original Subtotal</span>
                    <span className="font-mono font-semibold">${simulationResult.rawSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Total Promo Discounts</span>
                    <span className="font-mono">-${simulationResult.totalDiscount.toFixed(2)} ({simulationResult.discountRate.toFixed(1)}%)</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-extrabold text-foreground">Estimated Net Payable</span>
                    <span className="text-xl font-extrabold text-primary font-mono">
                      ${simulationResult.finalPayable.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono text-right">
                    ~{(simulationResult.finalPayable * 4100).toLocaleString()} KHR
                  </div>
                </div>

                {/* Profit Margin Health Guard */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                    simulationResult.isMarginSafe
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {simulationResult.isMarginSafe ? (
                    <ShieldCheck size={20} className="shrink-0 text-emerald-500" />
                  ) : (
                    <AlertTriangle size={20} className="shrink-0 text-amber-500" />
                  )}
                  <div className="text-xs">
                    <p className="font-bold">
                      {simulationResult.isMarginSafe ? 'Healthy Margin Safe' : 'Low Profit Margin Warning'}
                    </p>
                    <p className="text-[11px] opacity-90">
                      Estimated profit margin after discounts: <b>{simulationResult.estimatedProfitMargin.toFixed(1)}%</b>
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Action */}
              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Done Testing
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PromotionSimulatorModal
