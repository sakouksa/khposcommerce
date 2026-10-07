import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Sparkles,
  Loader2,
  Store,
  CreditCard,
  Users,
  ShieldCheck,
  Tag,
  Percent,
  Zap,
} from 'lucide-react'
import { CAMBODIA_COUPON_PRESETS } from '../../constants/couponPresets'
import type { Coupon, CouponChannelScope, VoucherPreset } from '../../types/coupon'
import { EnterpriseDateTimePicker } from '@/components/common'

interface CouponFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingCoupon: Coupon | null
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  name: string
  setName: (val: string) => void
  code: string
  setCode: (val: string) => void
  type: 'fixed' | 'percentage' | 'free_shipping'
  setType: (val: 'fixed' | 'percentage' | 'free_shipping') => void
  value: number
  setValue: (val: number) => void
  currency: 'USD' | 'KHR'
  setCurrency: (val: 'USD' | 'KHR') => void
  maxDiscountCap: string
  setMaxDiscountCap: (val: string) => void
  minimumAmount: number | ''
  setMinimumAmount: (val: number | '') => void
  minimumAmountKhr: string
  setMinimumAmountKhr: (val: string) => void
  channelScope: CouponChannelScope
  setChannelScope: (val: CouponChannelScope) => void
  branchIds: string
  setBranchIds: (val: string) => void
  paymentMethods: string[]
  setPaymentMethods: (val: string[]) => void
  customerTargetType: 'all' | 'new_customer_only' | 'vip_tiers' | 'specific_customer'
  setCustomerTargetType: (val: 'all' | 'new_customer_only' | 'vip_tiers' | 'specific_customer') => void
  customerPhone: string
  setCustomerPhone: (val: string) => void
  usageLimit: number | ''
  setUsageLimit: (val: number | '') => void
  perCustomerLimit: string
  setPerCustomerLimit: (val: string) => void
  startsAt: string
  setStartsAt: (val: string) => void
  expiresAt: string
  setExpiresAt: (val: string) => void
  isActive: boolean
  setIsActive: (val: boolean) => void
  generating: boolean
  handleGenerateCode: () => void
  onApplyPreset?: (preset: VoucherPreset) => void
}

type ModalTab = 'basic' | 'discount' | 'conditions' | 'limits'

export const CouponFormModal: React.FC<CouponFormModalProps> = ({
  isOpen,
  onClose,
  editingCoupon,
  onSubmit,
  isPending,
  name,
  setName,
  code,
  setCode,
  type,
  setType,
  value,
  setValue,
  currency,
  setCurrency,
  maxDiscountCap,
  setMaxDiscountCap,
  minimumAmount,
  setMinimumAmount,
  minimumAmountKhr,
  setMinimumAmountKhr,
  channelScope,
  setChannelScope,
  branchIds,
  setBranchIds,
  paymentMethods,
  setPaymentMethods,
  customerTargetType,
  setCustomerTargetType,
  customerPhone,
  setCustomerPhone,
  usageLimit,
  setUsageLimit,
  perCustomerLimit,
  setPerCustomerLimit,
  startsAt,
  setStartsAt,
  expiresAt,
  setExpiresAt,
  isActive,
  setIsActive,
  generating,
  handleGenerateCode,
  onApplyPreset,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('basic')

  const togglePaymentMethod = (method: string) => {
    if (method === 'all') {
      setPaymentMethods(['all'])
      return
    }
    const current = paymentMethods.filter((m) => m !== 'all')
    if (current.includes(method)) {
      const next = current.filter((m) => m !== method)
      setPaymentMethods(next.length === 0 ? ['all'] : next)
    } else {
      setPaymentMethods([...current, method])
    }
  }

  const handleSelectPreset = (preset: VoucherPreset) => {
    if (onApplyPreset) {
      onApplyPreset(preset)
    } else {
      setName(preset.nameKm)
      setCode(`${preset.codePrefix}${Math.floor(1000 + Math.random() * 9000)}`)
      setType(preset.type)
      setValue(preset.value)
      setCurrency(preset.currency)
      setMaxDiscountCap(preset.max_discount_cap?.toString() || '')
      setMinimumAmount(preset.minimum_amount)
      setMinimumAmountKhr(preset.minimum_amount_khr?.toString() || '')
      setChannelScope(preset.channel_scope)
      setPaymentMethods(preset.payment_methods || ['all'])
      setCustomerTargetType(preset.customer_target_type || 'all')
      setUsageLimit(preset.usage_limit)
      setPerCustomerLimit(preset.per_customer_limit.toString())
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="bg-card border border-border rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {editingCoupon ? 'Edit Discount Voucher' : 'Visual Voucher & Coupon Builder'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Create single codes, configure Omni-Channel POS scopes, Bakong KHQR triggers, and safety caps.
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

          {/* 1-Click Cambodia Presets Quick Bar */}
          {!editingCoupon && (
            <div className="px-5 py-2.5 bg-gradient-to-r from-amber-500/10 via-primary/5 to-purple-500/10 border-b border-border flex items-center justify-between gap-2 overflow-x-auto text-xs">
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 shrink-0">
                <Zap size={14} />
                <span>1-Click Cambodia Presets:</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {CAMBODIA_COUPON_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="px-2.5 py-1 rounded-lg bg-card/80 hover:bg-card border border-border text-[11px] font-semibold text-foreground hover:border-primary/40 transition-colors"
                  >
                    {preset.badge}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center px-5 border-b border-border bg-muted/10 gap-2 text-xs font-semibold overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'basic'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Store size={14} />
              <span>1. Basic & Channel</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('discount')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'discount'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Tag size={14} />
              <span>2. Discount & Currency</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('conditions')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'conditions'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <CreditCard size={14} />
              <span>3. Target & Payments</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('limits')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'limits'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShieldCheck size={14} />
              <span>4. Usage Limits</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="label">Voucher / Campaign Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. 🎁 Welcome New Customer $3 OFF"
                    className="input w-full font-medium"
                  />
                </div>

                <div>
                  <label className="label">Coupon Code *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="WELCOME3"
                      className="input w-full font-mono uppercase font-bold text-sm tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      disabled={generating}
                      className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5"
                    >
                      {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      <span>Auto Gen</span>
                    </button>
                  </div>
                </div>

                {/* Channel Scope Selector */}
                <div>
                  <label className="label">Sales Channel Scope *</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setChannelScope('all')}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        channelScope === 'all'
                          ? 'border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary'
                          : 'border-border bg-card text-muted-foreground hover:border-muted-foreground'
                      }`}
                    >
                      <span className="text-xs font-bold text-foreground">🟢 Omni-Channel</span>
                      <span className="text-[10px] mt-1">Both POS Register & Storefront</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChannelScope('pos_only')}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        channelScope === 'pos_only'
                          ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold ring-1 ring-blue-500'
                          : 'border-border bg-card text-muted-foreground hover:border-muted-foreground'
                      }`}
                    >
                      <span className="text-xs font-bold text-foreground">🔵 POS Only</span>
                      <span className="text-[10px] mt-1">In-store Cashier Registers</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChannelScope('storefront_only')}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        channelScope === 'storefront_only'
                          ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold ring-1 ring-purple-500'
                          : 'border-border bg-card text-muted-foreground hover:border-muted-foreground'
                      }`}
                    >
                      <span className="text-xs font-bold text-foreground">🟣 Storefront Only</span>
                      <span className="text-[10px] mt-1">Online E-Commerce Website</span>
                    </button>
                  </div>
                </div>

                {/* Branch Scope & Schedule */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Target Branches</label>
                    <select
                      value={branchIds}
                      onChange={(e) => setBranchIds(e.target.value)}
                      className="input w-full text-xs"
                    >
                      <option value="all">🏢 All Branches Nationwide</option>
                      <option value="1">Phnom Penh Main HQ</option>
                      <option value="2">Toul Kork Branch</option>
                      <option value="3">Siem Reap City Branch</option>
                      <option value="4">Battambang Branch</option>
                    </select>
                  </div>

                  <div>
                    <EnterpriseDateTimePicker
                      label="Expiry Date & Time"
                      value={expiresAt}
                      onChange={setExpiresAt}
                      outputFormat="YYYY-MM-DDTHH:mm"
                    />
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-2xl border border-border">
                  <div>
                    <p className="text-xs font-bold text-foreground">Voucher Active Status</p>
                    <p className="text-[11px] text-muted-foreground">Enable or pause voucher redemption</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'discount' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Discount Type *</label>
                    <select
                      value={type}
                      onChange={(e: any) => setType(e.target.value)}
                      className="input w-full font-medium"
                    >
                      <option value="fixed">Fixed Amount Discount ($ or ៛)</option>
                      <option value="percentage">Percentage Discount (% OFF)</option>
                      <option value="free_shipping">Free Shipping Voucher</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Currency Format</label>
                    <select
                      value={currency}
                      onChange={(e: any) => setCurrency(e.target.value)}
                      className="input w-full font-medium"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="KHR">KHR (៛ ខ្មែរ)</option>
                    </select>
                  </div>
                </div>

                {/* Discount Value Inputs */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                  <div>
                    <label className="label">
                      {type === 'percentage' ? 'Discount Percentage (%) *' : 'Discount Amount Value *'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={value}
                        onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                        placeholder="5"
                        className="input w-full font-mono font-bold text-sm"
                      />
                      {type === 'percentage' && (
                        <Percent size={14} className="absolute right-3 top-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {type === 'percentage' && (
                    <div>
                      <label className="label">Max Discount Cap ($ USD)</label>
                      <input
                        type="number"
                        value={maxDiscountCap}
                        onChange={(e) => setMaxDiscountCap(e.target.value)}
                        placeholder="e.g. 10.00 (Safety cap)"
                        className="input w-full font-mono text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'conditions' && (
              <div className="space-y-4">
                {/* Spend Thresholds */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Minimum Purchase Spend ($ USD)</label>
                    <input
                      type="number"
                      value={minimumAmount}
                      onChange={(e) => setMinimumAmount(e.target.value ? parseFloat(e.target.value) : '')}
                      placeholder="e.g. 15.00"
                      className="input w-full font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="label">Minimum Purchase Spend (KHR ៛)</label>
                    <input
                      type="number"
                      value={minimumAmountKhr}
                      onChange={(e) => setMinimumAmountKhr(e.target.value)}
                      placeholder="e.g. 60000"
                      className="input w-full font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Customer Target Type */}
                <div>
                  <label className="label">Target Customer Group</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: '👥 All Shoppers' },
                      { id: 'new_customer_only', label: '✨ 1st Order Welcome Only' },
                      { id: 'vip_tiers', label: '💎 VIP Members Only' },
                    ].map((target) => (
                      <button
                        key={target.id}
                        type="button"
                        onClick={() => setCustomerTargetType(target.id as any)}
                        className={`p-2.5 rounded-xl border text-xs text-left transition-colors ${
                          customerTargetType === target.id
                            ? 'border-primary bg-primary/10 text-primary font-bold'
                            : 'border-border bg-card text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {target.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cambodia Payment Methods */}
                <div className="space-y-2">
                  <label className="label flex items-center justify-between">
                    <span>Payment Method Restriction</span>
                    <span className="text-[10px] text-muted-foreground">Optional requirement</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: '🌐 All Payment Methods' },
                      { id: 'khqr_bakong', label: '🇰🇭 Bakong KHQR Only' },
                      { id: 'aba_pay', label: '🔵 ABA PAY Only' },
                      { id: 'wing', label: '🟢 Wing Bank' },
                      { id: 'cash', label: '💵 Cash Counter Only' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => togglePaymentMethod(method.id)}
                        className={`p-2.5 rounded-xl border text-xs text-left transition-colors ${
                          paymentMethods.includes(method.id)
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'border-border bg-card text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'limits' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Total Redemption Usage Limit</label>
                    <input
                      type="number"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="e.g. 500 (Leave blank for unlimited)"
                      className="input w-full font-mono text-xs"
                    />
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">Total max code uses</span>
                  </div>

                  <div>
                    <label className="label">Limit per Customer</label>
                    <input
                      type="number"
                      value={perCustomerLimit}
                      onChange={(e) => setPerCustomerLimit(e.target.value)}
                      placeholder="1"
                      className="input w-full font-mono text-xs"
                    />
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">Max times per user/phone</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Form Actions */}
            <div className="border-t border-border pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                <span>{editingCoupon ? 'Save Voucher Changes' : 'Create Voucher'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CouponFormModal
