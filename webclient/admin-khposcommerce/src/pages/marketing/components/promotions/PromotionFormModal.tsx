import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Loader2,
  Sparkles,
  Layers,
  Store,
  CreditCard,
  Users,
  ShieldCheck,
  Clock,
  Gift,
  Tag,
  DollarSign,
  Percent,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CAMBODIA_CAMPAIGN_PRESETS } from '../../constants/promoPresets'
import { EnterpriseDateTimePicker } from '@/components/common'
import type {
  Promotion,
  ChannelScope,
  PromotionDiscountType,
  TieredPriceBreak,
  CampaignPreset,
} from '../../types/promotion'

interface PromotionFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingPromo: Promotion | null
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  name: string
  setName: (val: string) => void
  description: string
  setDescription: (val: string) => void
  type: string
  setType: (val: string) => void
  channelScope: ChannelScope
  setChannelScope: (val: ChannelScope) => void
  branchIds: string
  setBranchIds: (val: string) => void
  startsAt: string
  setStartsAt: (val: string) => void
  endsAt: string
  setEndsAt: (val: string) => void
  priority: string
  setPriority: (val: string) => void
  isActive: boolean
  setIsActive: (val: boolean) => void

  // Visual Conditions
  minSpendUsd: string
  setMinSpendUsd: (val: string) => void
  minSpendKhr: string
  setMinSpendKhr: (val: string) => void
  minQuantity: string
  setMinQuantity: (val: string) => void
  paymentMethods: string[]
  setPaymentMethods: (val: string[]) => void
  customerGroups: string[]
  setCustomerGroups: (val: string[]) => void
  buyQuantity: string
  setBuyQuantity: (val: string) => void
  getQuantity: string
  setGetQuantity: (val: string) => void

  // Visual Rewards
  discountValue: string
  setDiscountValue: (val: string) => void
  maxDiscountCap: string
  setMaxDiscountCap: (val: string) => void
  currency: 'USD' | 'KHR'
  setCurrency: (val: 'USD' | 'KHR') => void
  freeGiftName: string
  setFreeGiftName: (val: string) => void

  // Budget & Stacking
  totalBudgetCap: string
  setTotalBudgetCap: (val: string) => void
  maxRedemptions: string
  setMaxRedemptions: (val: string) => void
  perCustomerLimit: string
  setPerCustomerLimit: (val: string) => void
  isStackable: boolean
  setIsStackable: (val: boolean) => void

  // Preset Applicator
  onApplyPreset?: (preset: CampaignPreset) => void
}

type ModalTab = 'basic' | 'discount' | 'conditions' | 'budget'

export const PromotionFormModal: React.FC<PromotionFormModalProps> = ({
  isOpen,
  onClose,
  editingPromo,
  onSubmit,
  isPending,
  name,
  setName,
  description,
  setDescription,
  type,
  setType,
  channelScope,
  setChannelScope,
  branchIds,
  setBranchIds,
  startsAt,
  setStartsAt,
  endsAt,
  setEndsAt,
  priority,
  setPriority,
  isActive,
  setIsActive,
  minSpendUsd,
  setMinSpendUsd,
  minSpendKhr,
  setMinSpendKhr,
  minQuantity,
  setMinQuantity,
  paymentMethods,
  setPaymentMethods,
  customerGroups,
  setCustomerGroups,
  buyQuantity,
  setBuyQuantity,
  getQuantity,
  setGetQuantity,
  discountValue,
  setDiscountValue,
  maxDiscountCap,
  setMaxDiscountCap,
  currency,
  setCurrency,
  freeGiftName,
  setFreeGiftName,
  totalBudgetCap,
  setTotalBudgetCap,
  maxRedemptions,
  setMaxRedemptions,
  perCustomerLimit,
  setPerCustomerLimit,
  isStackable,
  setIsStackable,
  onApplyPreset,
}) => {
  const { t } = useTranslation(['marketing', 'common'])
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

  const toggleCustomerGroup = (group: string) => {
    if (group === 'all') {
      setCustomerGroups(['all'])
      return
    }
    const current = customerGroups.filter((g) => g !== 'all')
    if (current.includes(group)) {
      const next = current.filter((g) => g !== group)
      setCustomerGroups(next.length === 0 ? ['all'] : next)
    } else {
      setCustomerGroups([...current, group])
    }
  }

  const handleSelectPreset = (preset: CampaignPreset) => {
    if (onApplyPreset) {
      onApplyPreset(preset)
    } else {
      setName(preset.nameKm)
      setDescription(preset.descriptionKm)
      setType(preset.type)
      setChannelScope(preset.channel_scope)
      setMinSpendUsd(preset.conditions.min_spend_usd?.toString() || '')
      setMinSpendKhr(preset.conditions.min_spend_khr?.toString() || '')
      setDiscountValue(preset.rewards.discount_value?.toString() || '')
      setMaxDiscountCap(preset.rewards.max_discount_cap?.toString() || '')
      setPaymentMethods(preset.conditions.payment_methods || ['all'])
      setCustomerGroups(preset.conditions.customer_groups || ['all'])
      setTotalBudgetCap(preset.total_budget_cap?.toString() || '')
      setMaxRedemptions(preset.max_redemptions?.toString() || '')
      setPerCustomerLimit(preset.per_customer_limit?.toString() || '1')
      setIsStackable(preset.is_stackable)
      setPriority(preset.priority?.toString() || '10')
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
                  {editingPromo ? 'Edit Promotion Campaign Rule' : 'Visual Promotion Rule Builder'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Enterprise Omni-Channel promotions, BOGO rules, KHQR discounts, and safety budget limits.
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
          {!editingPromo && (
            <div className="px-5 py-2.5 bg-gradient-to-r from-amber-500/10 via-primary/5 to-purple-500/10 border-b border-border flex items-center justify-between gap-2 overflow-x-auto text-xs">
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 shrink-0">
                <Zap size={14} />
                <span>1-Click Cambodia Presets:</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {CAMBODIA_CAMPAIGN_PRESETS.slice(0, 4).map((preset) => (
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
              <span>1. Basic & Omni-Channel</span>
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
              <span>2. Discount Action & Rewards</span>
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
              <span>3. Conditions & Payments</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('budget')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'budget'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShieldCheck size={14} />
              <span>4. Budget & Stacking Limits</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="label">Campaign Headline Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. 🌸 Khmer New Year Super Promo 15% OFF"
                    className="input w-full font-medium"
                  />
                </div>

                <div>
                  <label className="label">Campaign Description & Terms</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe how customers qualify for this promotion..."
                    className="input w-full min-h-[70px] text-xs"
                  />
                </div>

                {/* Omni-Channel Scope Selector */}
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

                {/* Branch Scope & Priority */}
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
                    <label className="label">Priority Weight (Higher applies first)</label>
                    <input
                      type="number"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      placeholder="10"
                      className="input w-full font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Schedule Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <EnterpriseDateTimePicker
                      label="Starts At"
                      value={startsAt}
                      onChange={setStartsAt}
                      outputFormat="YYYY-MM-DDTHH:mm"
                    />
                  </div>
                  <div>
                    <EnterpriseDateTimePicker
                      label="Ends At"
                      minDateTime={startsAt}
                      value={endsAt}
                      onChange={setEndsAt}
                      outputFormat="YYYY-MM-DDTHH:mm"
                    />
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-2xl border border-border">
                  <div>
                    <p className="text-xs font-bold text-foreground">Campaign Active Status</p>
                    <p className="text-[11px] text-muted-foreground">Enable or pause this promotion rule immediately</p>
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
                <div>
                  <label className="label">Promotion Model Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="input w-full font-medium"
                  >
                    <option value="percentage">Percentage Discount (% OFF)</option>
                    <option value="fixed_amount">Fixed Amount Discount ($ or ៛ OFF)</option>
                    <option value="bogo">Buy X Get Y Free (BOGO)</option>
                    <option value="bundle">Bundle / Combo Package Special</option>
                    <option value="tier_quantity">Tiered Quantity Volume Breaks</option>
                    <option value="free_gift">Free Gift with Purchase (GWP)</option>
                    <option value="free_shipping">Free Shipping Voucher</option>
                  </select>
                </div>

                {/* Percentage Discount Inputs */}
                {type === 'percentage' && (
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                    <div>
                      <label className="label">Discount Percentage (%) *</label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          placeholder="15"
                          className="input w-full pr-8 font-mono font-bold"
                        />
                        <Percent size={14} className="absolute right-3 top-3 text-muted-foreground" />
                      </div>
                    </div>

                    <div>
                      <label className="label">Max Discount Cap ($ USD)</label>
                      <input
                        type="number"
                        value={maxDiscountCap}
                        onChange={(e) => setMaxDiscountCap(e.target.value)}
                        placeholder="e.g. 15.00 (Leave empty for no limit)"
                        className="input w-full font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Fixed Amount Inputs */}
                {type === 'fixed_amount' && (
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                    <div>
                      <label className="label">Discount Amount *</label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          placeholder="5.00"
                          className="input w-full font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Currency</label>
                      <select
                        value={currency}
                        onChange={(e: any) => setCurrency(e.target.value)}
                        className="input w-full text-xs font-semibold"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="KHR">KHR (៛ ខ្មែរ)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* BOGO Inputs */}
                {type === 'bogo' && (
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                    <div>
                      <label className="label">Buy Quantity (X) *</label>
                      <input
                        type="number"
                        value={buyQuantity}
                        onChange={(e) => setBuyQuantity(e.target.value)}
                        placeholder="2"
                        className="input w-full font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="label">Get Free Quantity (Y) *</label>
                      <input
                        type="number"
                        value={getQuantity}
                        onChange={(e) => setGetQuantity(e.target.value)}
                        placeholder="1"
                        className="input w-full font-mono font-bold text-emerald-600"
                      />
                    </div>
                  </div>
                )}

                {/* Free Gift Inputs */}
                {type === 'free_gift' && (
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                    <div>
                      <label className="label">Free Gift Item Name *</label>
                      <input
                        type="text"
                        value={freeGiftName}
                        onChange={(e) => setFreeGiftName(e.target.value)}
                        placeholder="e.g. Premium Insulated Tumbler / Eco Tote Bag"
                        className="input w-full font-medium text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'conditions' && (
              <div className="space-y-4">
                {/* Spend Thresholds */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Minimum Cart Subtotal (USD $)</label>
                    <input
                      type="number"
                      value={minSpendUsd}
                      onChange={(e) => setMinSpendUsd(e.target.value)}
                      placeholder="e.g. 30.00"
                      className="input w-full font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="label">Minimum Cart Subtotal (KHR ៛)</label>
                    <input
                      type="number"
                      value={minSpendKhr}
                      onChange={(e) => setMinSpendKhr(e.target.value)}
                      placeholder="e.g. 120000"
                      className="input w-full font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Cambodia Payment Methods Trigger */}
                <div className="space-y-2">
                  <label className="label flex items-center justify-between">
                    <span>Cambodia Payment Method Triggers</span>
                    <span className="text-[10px] text-muted-foreground">Select multiple or All</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: '🌐 All Payment Methods' },
                      { id: 'khqr_bakong', label: '🇰🇭 Bakong KHQR' },
                      { id: 'aba_pay', label: '🔵 ABA PAY' },
                      { id: 'wing', label: '🟢 Wing Bank' },
                      { id: 'acleda', label: '🟡 ACLEDA Mobile' },
                      { id: 'cash', label: '💵 Cash Counter' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => togglePaymentMethod(method.id)}
                        className={`p-2.5 rounded-xl border text-xs text-left transition-colors ${
                          paymentMethods.includes(method.id)
                            ? 'border-primary bg-primary/10 text-primary font-bold'
                            : 'border-border bg-card text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Segmentation */}
                <div className="space-y-2">
                  <label className="label flex items-center justify-between">
                    <span>Customer Segmentation & Member Tiers</span>
                    <span className="text-[10px] text-muted-foreground">VIP Tiers & B2B</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: '👥 All Shoppers' },
                      { id: 'first_time', label: '✨ First-time Buyer' },
                      { id: 'vip_silver', label: '🥈 VIP Silver' },
                      { id: 'vip_gold', label: '🥇 VIP Gold' },
                      { id: 'vip_platinum', label: '💎 VIP Platinum' },
                      { id: 'wholesale', label: '🏢 B2B Wholesale' },
                    ].map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => toggleCustomerGroup(group.id)}
                        className={`p-2.5 rounded-xl border text-xs text-left transition-colors ${
                          customerGroups.includes(group.id)
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'border-border bg-card text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {group.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Total Budget Cap ($ USD)</label>
                    <input
                      type="number"
                      value={totalBudgetCap}
                      onChange={(e) => setTotalBudgetCap(e.target.value)}
                      placeholder="e.g. 2500"
                      className="input w-full font-mono text-xs"
                    />
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">Auto-pauses when reached</span>
                  </div>

                  <div>
                    <label className="label">Max Total Redemptions</label>
                    <input
                      type="number"
                      value={maxRedemptions}
                      onChange={(e) => setMaxRedemptions(e.target.value)}
                      placeholder="e.g. 500"
                      className="input w-full font-mono text-xs"
                    />
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">Total promo usages</span>
                  </div>

                  <div>
                    <label className="label">Per-Customer Limit</label>
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

                {/* Stacking Rule */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">Stackable with Vouchers & Coupons</p>
                      <p className="text-[11px] text-muted-foreground">
                        Allow customers to combine this promotion with checkout coupon codes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isStackable}
                        onChange={(e) => setIsStackable(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
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

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingPromo ? 'Save Rule Changes' : 'Create Promotion Campaign'}</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PromotionFormModal
