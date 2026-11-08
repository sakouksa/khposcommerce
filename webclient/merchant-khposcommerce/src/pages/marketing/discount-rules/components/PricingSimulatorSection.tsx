import React, { useState, useEffect } from 'react'
import {
  Calculator,
  RefreshCw,
  Store,
  Globe,
  Smartphone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Ticket,
  Trash2,
  ShieldCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { marketingService } from '@/services/marketingService'
import type { CartItemInput, PricingEngineResult } from '../../promotions/types'

const DEFAULT_SAMPLE_ITEMS: CartItemInput[] = [
  { product_id: 1, name: 'Apple iPhone 15 Pro Max', sku: 'SKU-APL-IP15PM', unit_price: 1199.00, quantity: 1 },
  { product_id: 2, name: 'Samsung Galaxy S24 Ultra', sku: 'SKU-SAM-S24U', unit_price: 1099.00, quantity: 1 },
  { product_id: 3, name: 'Magnetic Silicone Case (Accessory)', sku: 'SKU-ACC-CASE', unit_price: 25.00, quantity: 2 },
]

export const PricingSimulatorSection: React.FC = () => {
  const { t, i18n } = useTranslation(['marketing', 'common'])
  const isKm = i18n.language === 'km' || i18n.language?.startsWith('km')

  const [branchId, setBranchId] = useState<number>(1) // 1: Phnom Penh, 2: Tbong Khmum, 3: Siem Reap
  const [channel, setChannel] = useState<'pos' | 'web' | 'mobile'>('pos')
  const [couponCode, setCouponCode] = useState<string>('KHNY2026')
  const [cartItems, setCartItems] = useState<CartItemInput[]>(DEFAULT_SAMPLE_ITEMS)
  const [pricingResult, setPricingResult] = useState<PricingEngineResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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

  useEffect(() => {
    runSimulation()
  }, [branchId, channel, couponCode, cartItems])

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

  return (
    <div className="space-y-4">
      <div className="bg-card p-4 rounded-2xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Calculator size={16} className="text-primary" />
            <span>
              {t('marketing.sandboxTitle', 'Central Laravel Pricing Engine Interactive Sandbox')}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground">
            {t(
              'marketing.sandboxSubtitle',
              'Test cart payloads with company & branch data isolation, channel validation, and stacking rules in real-time.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={runSimulation}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs self-start md:self-auto"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>{isLoading ? t('marketing.simulating', 'Simulating...') : t('marketing.reEvaluateCart', 'Re-evaluate Cart')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Cart & Scope Setup */}
        <div className="lg:col-span-7 space-y-4">
          {/* Branch & Channel Scope Switcher */}
          <div className="bg-card p-4 rounded-2xl border border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MapPin size={13} className="text-primary" />
              <span>1. {t('marketing.branchTarget', 'Branch Target')} & {t('marketing.channelScope', 'Channel Scope')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  {isKm ? 'សាខាអនុវត្ត (Branch Scope):' : 'Location (Branch Scope):'}
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(Number(e.target.value))}
                  className="input w-full py-1.5 text-xs rounded-xl"
                >
                  <option value={1}>
                    {isKm ? 'NexTech ភ្នំពេញ (HQ) [អនុញ្ញាតសម្រាប់ KHNY2026 & PPVIP]' : 'NexTech Phnom Penh (HQ) [Authorized for KHNY2026 & PPVIP]'}
                  </option>
                  <option value={3}>
                    {isKm ? 'NexTech សៀមរាប [អនុញ្ញាតសម្រាប់ KHNY2026]' : 'NexTech Siem Reap [Authorized for KHNY2026]'}
                  </option>
                  <option value={2}>
                    {isKm ? 'NexTech កំពង់ចាម [មិនស្ថិតក្នុងយុទ្ធនាការ]' : 'NexTech Kampong Cham [EXCLUDED from Campaigns]'}
                  </option>
                </select>
                {branchId === 2 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    <span>
                      {isKm
                        ? 'កំពង់ចាមត្រូវបានដកចេញ៖ ប្រព័ន្ធនឹងវាយតម្លៃបញ្ចុះតម្លៃ $0.00!'
                        : 'Kampong Cham is isolated: Campaigns will evaluate to $0.00 discount!'}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  {t('marketing.channelScope', 'Sales Channel')}:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['pos', 'web', 'mobile'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChannel(ch)}
                      className={`py-1.5 rounded-xl font-bold uppercase text-[11px] flex items-center justify-center gap-1 transition-all ${
                        channel === ch
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {ch === 'pos' && <Store size={11} />}
                      {ch === 'web' && <Globe size={11} />}
                      {ch === 'mobile' && <Smartphone size={11} />}
                      <span>{ch}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-border/50">
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                {t('marketing.couponVoucherCode', 'Coupon / Promo Code')}:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. KHNY2026, VIPHQ15"
                    className="input w-full pl-8 py-1.5 font-mono font-bold text-xs rounded-xl"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setCouponCode('KHNY2026')}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors"
                >
                  Use KHNY2026
                </button>
                <button
                  type="button"
                  onClick={() => setCouponCode('VIPHQ15')}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors"
                >
                  Use VIPHQ15
                </button>
              </div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="bg-card p-4 rounded-2xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Tag size={13} className="text-primary" />
                <span>2. {t('marketing.cartItems', 'Cart Line Items')} ({cartItems.length})</span>
              </h4>
            </div>

            <div className="divide-y divide-border/60">
              {cartItems.map((item) => (
                <div key={item.product_id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground block">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      SKU: {item.sku} | Base: ${item.unit_price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product_id, -1)}
                        className="px-2 py-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        -
                      </button>
                      <span className="px-2 font-mono font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product_id, 1)}
                        className="px-2 py-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-mono font-bold text-foreground w-16 text-right">
                      ${(item.unit_price * item.quantity).toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeItem(item.product_id)}
                      className="text-muted-foreground hover:text-rose-500 p-1 rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Engine Real-time Calculation */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-b from-card to-muted/20 p-5 rounded-2xl border border-primary/20 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span>{t('marketing.pricingResults', 'Engine Calculation Breakdown')}</span>
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">Tenant Scoped</span>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                <RefreshCw size={24} className="animate-spin mx-auto text-primary" />
                <p>{isKm ? 'កំពុងគណនាការបញ្ចុះតម្លៃតាម PricingEngineService...' : 'Computing discounts through PricingEngineService...'}</p>
              </div>
            ) : errorMsg ? (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                {errorMsg}
              </div>
            ) : pricingResult ? (
              <div className="space-y-4">
                {/* Summary Figures */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{t('marketing.subtotal', 'Base Subtotal')}:</span>
                    <strong className="font-mono text-foreground">${pricingResult.summary.subtotal.toFixed(2)}</strong>
                  </div>

                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>{t('marketing.promotionDiscount', 'Total Discount Savings')}:</span>
                    <strong className="font-mono">-${pricingResult.summary.total_discount.toFixed(2)}</strong>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border font-extrabold text-sm text-foreground">
                    <span>{t('marketing.finalPayable', 'Final Grand Total')}:</span>
                    <strong className="font-mono text-primary text-base">
                      ${pricingResult.summary.grand_total.toFixed(2)}
                    </strong>
                  </div>
                </div>

                {/* Applied Promotions Breakdown */}
                <div className="pt-3 border-t border-border space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t('marketing.activeRulesApplied', 'Applied Promotions')} ({pricingResult.applied_promotions.length})
                  </h5>

                  {pricingResult.applied_promotions.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      {isKm
                        ? 'មិនមានវិធានប្រូម៉ូសិនត្រូវគ្នានឹងកន្ត្រក ទីតាំង ឬបណ្តាញនេះទេ។'
                        : 'No promotion rules matched this cart, location, or channel scope.'}
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {pricingResult.applied_promotions.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-card border border-border/80 text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-foreground block">{p.rule_name || p.campaign_name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{p.rule_type}</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            -${Number(p.discount_amount).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Line Snapshot Notice */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-[11px] text-muted-foreground space-y-1">
                  <div className="font-bold text-foreground flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>{isKm ? 'ការធានាតម្លៃគោលមិនផ្លាស់ប្តូរ' : 'Non-Mutating Base Price Guarantee'}</span>
                  </div>
                  <p>
                    {isKm
                      ? 'តម្លៃកាតាឡុកមិនមានការប្រែប្រួលឡើយ។ ទំនិញក្នុងវិក្កយបត្រនឹងត្រូវបានរក្សាទុកជាមួយនឹងទិន្នន័យ Snapshot (final_unit_price, discount_amount, promotion_id)។'
                      : 'The catalog price remains unchanged. Final line items will be recorded with snapshot fields (`final_unit_price`, `discount_amount`, `promotion_id`).'}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingSimulatorSection
