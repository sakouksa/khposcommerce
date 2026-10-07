import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Copy,
  Calculator,
  Store,
  Globe,
  Layers,
  CreditCard,
  Users,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'
import { formatJsonValue, type Promotion } from '../../types/promotion'
import { CloseButton, ActionButton } from '@/components/common'

interface PromotionDetailDrawerProps {
  promo: Promotion | null
  onClose: () => void
  handleDuplicate: (p: Promotion) => void
  openEditModal: (p: Promotion) => void
  onOpenSimulator?: (p: Promotion) => void
}

export const PromotionDetailDrawer: React.FC<PromotionDetailDrawerProps> = ({
  promo,
  onClose,
  handleDuplicate,
  openEditModal,
  onOpenSimulator,
}) => {
  if (!promo) return null

  const conditions = promo.conditions || {}
  const rewards = promo.rewards || {}
  const maxCap = promo.total_budget_cap || 2000
  const spent = promo.total_budget_spent || promo.discount_amount || 320
  const budgetPercent = Math.min(100, Math.round((spent / maxCap) * 100))

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 z-50 flex justify-end print:static print:bg-transparent">
        <div className="absolute inset-0 print:hidden" onClick={onClose} />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.25 }}
          className="bg-card w-full max-w-xl h-full shadow-2xl relative z-10 p-6 flex flex-col justify-between overflow-y-auto print:static print:w-full print:p-0 print:shadow-none"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3 print:hidden">
              <h3 className="text-lg font-bold text-foreground">
                Promotion Campaign Details
              </h3>
              <CloseButton onClose={onClose} size="md" color="rose" />
            </div>

            {/* Profile Card Header */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-primary/5 to-purple-500/10 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>{promo.type?.replace('_', ' ') || 'Discount'}</span>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    promo.is_active
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  }`}
                >
                  {promo.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-foreground">{promo.name}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {promo.description || 'Enterprise promotional campaign rule.'}
                </p>
              </div>
            </div>

            {/* Scope & Targeting Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b pb-1">
                Omni-Channel & Location Scope
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <p className="text-[11px] text-muted-foreground font-semibold">Channel Scope</p>
                  <p className="text-xs font-bold text-foreground mt-0.5 flex items-center gap-1">
                    {promo.channel_scope === 'pos_only'
                      ? '🔵 POS Cashier Only'
                      : promo.channel_scope === 'storefront_only'
                      ? '🟣 Online Storefront Only'
                      : '🟢 Omni-Channel (Both)'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <p className="text-[11px] text-muted-foreground font-semibold">Branch Target</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">
                    {promo.branch_ids === 'all' || !promo.branch_ids
                      ? '🏢 All Branches Nationwide'
                      : '📍 Specific Branches'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rule & Rewards Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b pb-1">
                Discount & Rule Triggers
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-muted/20 border border-border">
                  <span className="text-muted-foreground">Min Cart Subtotal</span>
                  <span className="font-bold text-foreground font-mono">
                    {conditions.min_spend_usd ? `$${conditions.min_spend_usd}` : 'No minimum'}
                  </span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-muted/20 border border-border">
                  <span className="text-muted-foreground">Payment Trigger</span>
                  <span className="font-bold text-foreground">
                    {conditions.payment_methods?.includes('khqr_bakong')
                      ? '🇰🇭 Bakong KHQR (QR Scan)'
                      : '🌐 All Payment Methods'}
                  </span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-muted/20 border border-border">
                  <span className="text-muted-foreground">Stacking with Coupons</span>
                  <span className="font-bold text-foreground">
                    {promo.is_stackable ? '✅ Stackable' : '🔒 Exclusive (Cannot Combine)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Budget Cap Utilization Bar */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-foreground">Campaign Budget Utilization</span>
                <span className="font-mono text-muted-foreground">
                  ${spent.toFixed(2)} / ${maxCap.toFixed(2)} ({budgetPercent}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Campaign auto-pauses when total discount reaches ${maxCap.toLocaleString()}.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
              <ActionButton
                variant="soft"
                size="sm"
                icon={<Calculator size={14} />}
                label="Test Simulator"
                onClick={() => {
                  onClose()
                  onOpenSimulator && onOpenSimulator(promo)
                }}
              />

              <ActionButton
                variant="outline"
                size="sm"
                icon={<Copy size={14} />}
                label="Duplicate"
                onClick={() => {
                  onClose()
                  handleDuplicate(promo)
                }}
              />

              <ActionButton
                variant="secondary"
                size="sm"
                label="Close"
                onClick={onClose}
              />

              <ActionButton
                variant="primary"
                size="sm"
                label="Edit Rule"
                onClick={() => {
                  onClose()
                  openEditModal(promo)
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PromotionDetailDrawer
