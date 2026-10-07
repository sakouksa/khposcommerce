import React from 'react'
import { motion } from 'framer-motion'
import { Edit2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { CloseButton, ActionButton } from '@/components/common'
import { GlobalFormat } from '@/utils/formatters'
import type { ReturnPolicy } from '@/types/orderReturn.types'
import {
  getLocalizedPolicyName,
  getConditionBadge,
  getCategoryDisplayName,
} from '../ReturnPoliciesPage'

interface ReturnPolicyDetailDrawerProps {
  policy: ReturnPolicy | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (policy: ReturnPolicy) => void
}

export const ReturnPolicyDetailDrawer: React.FC<ReturnPolicyDetailDrawerProps> = ({
  policy,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { t, i18n } = useTranslation(['returns', 'nav', 'sales', 'common'])
  const { language } = useThemeStore()
  const currentLang = i18n.language || language || 'km'
  const isKhmer = currentLang.startsWith('km')

  if (!isOpen || !policy) return null

  const localizedName = getLocalizedPolicyName(policy.name, isKhmer)
  const isStorewide = !policy.category_id && !policy.category
  const isNonReturnable = !policy.is_returnable
  const restockingPct = Number(policy.restocking_fee_percentage || 0)
  const customerShipping = Number(policy.customer_fault_shipping_fee || 0)
  const storeShipping = Number(policy.store_fault_shipping_fee || 0)

  // Deduplicate conditions list
  const conditionList = Array.isArray(policy.conditions_accepted) ? policy.conditions_accepted : []
  const filteredConditions = conditionList.filter(
    (c) => !(c === 'has_receipt' && policy.requires_receipt) && !(c === 'original_packaging' && policy.requires_original_packaging)
  )

  // Simulation calculation
  const simItemPrice = 100
  const simRestockingAmount = (simItemPrice * restockingPct) / 100
  const simNetRefund = Math.max(0, simItemPrice - simRestockingAmount - customerShipping)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
      />

      {/* Slide-over Drawer Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="relative w-full max-w-xl sm:max-w-2xl bg-card border-l border-border shadow-2xl flex flex-col h-full overflow-hidden z-10"
      >
        {/* ── 1. DRAWER TOP HEADER (CLEAN MINIMAL TEXT) ────────────────── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/80 bg-card/90 backdrop-blur-md shrink-0">
          <div className="min-w-0 flex-1 pr-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate">
                {localizedName.primary}
              </h2>
              {policy.is_default && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {t('policies.defaultBadge', 'Default')}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium flex items-center gap-2 truncate">
              <span className="font-mono">
                {t('policies.policyPrefix', 'Policy')} #{policy.id}
              </span>
              <span>•</span>
              <span>
                {isStorewide
                  ? t('policies.tabs.storewide', 'Store-Wide Standard')
                  : `${t('policies.categoryLabel', 'Category')}: ${getCategoryDisplayName(policy.category?.name, t)}`}
              </span>
              {localizedName.secondary && (
                <>
                  <span>•</span>
                  <span className="italic opacity-80">{localizedName.secondary}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <CloseButton onClose={onClose} size="md" color="rose" />
          </div>
        </div>

        {/* ── 2. SCROLLABLE BODY ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">

          {/* ── 2.1 APPLICATION SCOPE & ELIGIBILITY STATUS ─────────────── */}
          <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  {t('policies.ruleScope', 'Application Scope')}
                </span>
                <span className="text-sm font-bold text-foreground mt-1 block">
                  {isStorewide
                    ? t('policies.storewideBaseline', 'Store-Wide Standard Baseline')
                    : getCategoryDisplayName(policy.category?.name, t)}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                {isNonReturnable ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    {t('policies.finalSaleBadge', 'Final Sale / Non-Returnable')}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {t('policies.returnAllowedBadge', 'Return & Refund Allowed')}
                  </span>
                )}

                {policy.allow_exchange ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {t('policies.exchangeAllowed', 'Exchange Allowed')}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/60">
                    {t('policies.noExchange', 'No Exchange')}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {isStorewide
                ? t(
                    'policies.storewidePolicyNote',
                    'This baseline policy automatically governs all retail products and customer orders unless an explicit category policy overrides it.'
                  )
                : t(
                    'policies.categoryPolicyNote',
                    'This dedicated policy overrides storewide defaults for all items categorized under this specific catalog group.'
                  )}
            </p>
          </div>

          {/* ── 2.2 KEY PARAMETERS (CLEAN TILES, NO ICONS) ────────────── */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-0.5 block">
              {t('policies.financialMatrixTitle', 'Key Financial & Duration Parameters')}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Return Window */}
              <div className="p-3 bg-card rounded-xl border border-border/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  {t('policies.columns.window', 'Window')}
                </span>
                <span className="text-base font-bold font-mono text-foreground block">
                  {GlobalFormat.number(policy.return_window_days)}{' '}
                  <span className="text-xs font-normal text-muted-foreground font-sans">
                    {t('policies.days', 'Days')}
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {t('policies.fromOrderDate', 'From delivery')}
                </span>
              </div>

              {/* Restocking Fee */}
              <div className="p-3 bg-card rounded-xl border border-border/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  {t('policies.columns.restocking', 'Restocking')}
                </span>
                <span
                  className={`text-base font-bold font-mono block ${
                    restockingPct === 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-foreground'
                  }`}
                >
                  {GlobalFormat.percent(restockingPct, 0)}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {restockingPct === 0
                    ? t('policies.freeRestock', '0% (Free)')
                    : t('policies.deductedFromRefund', 'Deducted from refund')}
                </span>
              </div>

              {/* Customer Shipping */}
              <div className="p-3 bg-card rounded-xl border border-border/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  {t('policies.customerShippingShort', 'Cust. Shipping')}
                </span>
                <span className="text-base font-bold font-mono text-foreground block">
                  {GlobalFormat.currency(customerShipping)}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {customerShipping > 0
                    ? t('policies.buyerFault', 'Customer mind-change')
                    : t('policies.freeShipping', 'Free ($0)')}
                </span>
              </div>

              {/* Store Shipping */}
              <div className="p-3 bg-card rounded-xl border border-border/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  {t('policies.storeShippingShort', 'Store Shipping')}
                </span>
                <span className="text-base font-bold font-mono text-foreground block">
                  {storeShipping > 0 ? GlobalFormat.currency(storeShipping) : GlobalFormat.currency(0)}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {storeShipping > 0
                    ? t('policies.storeReimbursed', 'Store covered')
                    : t('policies.freeShipping', 'Free ($0)')}
                </span>
              </div>
            </div>
          </div>

          {/* ── 2.3 CALCULATION SIMULATION (CLEAN NEUTRAL CARD) ───────── */}
          <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-foreground">
                {t(
                  'policies.preview.simulationTitle',
                  'Financial Simulation: Customer returning a $100 product (Changed Mind)'
                )}
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                {t('policies.preview.simulationBadge', 'Simulation')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5 text-xs">
              <div className="p-2.5 rounded-xl bg-card border border-border/70 space-y-0.5">
                <span className="text-[10px] text-muted-foreground block">
                  {t('policies.preview.itemPrice', 'Original Item Value')}
                </span>
                <span className="text-sm font-mono font-bold text-foreground">
                  {GlobalFormat.currency(simItemPrice)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-card border border-border/70 space-y-0.5">
                <span className="text-[10px] text-muted-foreground block">
                  {t('policies.preview.restockingDeduction', 'Restocking Fee')} ({GlobalFormat.percent(restockingPct, 0)})
                </span>
                <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">
                  -{GlobalFormat.currency(simRestockingAmount)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-card border border-border/70 space-y-0.5">
                <span className="text-[10px] text-muted-foreground block">
                  {t('policies.preview.shippingDeduction', 'Return Shipping Fee')}
                </span>
                <span className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">
                  -{GlobalFormat.currency(customerShipping)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
              <span className="text-xs font-bold text-foreground">
                {t('policies.preview.estimatedRefund', 'Estimated Net Refund to Customer')}:
              </span>
              <span className="text-base font-bold font-mono text-primary">
                {GlobalFormat.currency(simNetRefund)}
              </span>
            </div>
          </div>

          {/* ── 2.4 MANDATORY PREREQUISITES (CLEAN BADGES) ────────────── */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
              {t('policies.preview.ruleRequirements', 'Mandatory Prerequisites')}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-muted/20 border border-border/60 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">
                    {t('policies.preview.requireReceipt', 'Original Receipt / Invoice')}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      policy.requires_receipt
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border-border/60'
                    }`}
                  >
                    {policy.requires_receipt ? t('policies.required', 'Required') : t('policies.optional', 'Optional')}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground leading-relaxed block">
                  {policy.requires_receipt
                    ? t('policies.receiptStrictDesc', 'Customer must present invoice or order number before refund.')
                    : t('policies.receiptOptionalDesc', 'Returns allowed without physical receipt with system lookup.')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-muted/20 border border-border/60 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">
                    {t('policies.preview.requirePackaging', 'Original Packaging')}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      policy.requires_original_packaging
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border-border/60'
                    }`}
                  >
                    {policy.requires_original_packaging
                      ? t('policies.required', 'Required')
                      : t('policies.optional', 'Optional')}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground leading-relaxed block">
                  {policy.requires_original_packaging
                    ? t('policies.packagingStrictDesc', 'Factory box, seals, and bundled accessories must be intact.')
                    : t('policies.packagingFlexibleDesc', 'Open-box or repacked items accepted with standard grading.')}
                </span>
              </div>
            </div>
          </div>

          {/* ── 2.5 QUALITY INSPECTION (QC) (CLEAN TEXT PILLS) ───────── */}
          {filteredConditions.length > 0 && (
            <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  {t('policies.qcChecklistTitle', 'Quality Inspection Checklist (QC)')}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {filteredConditions.length} {t('policies.conditionsCount', 'criteria')}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {filteredConditions.map((cond) => {
                  const { label } = getConditionBadge(cond, t)
                  return (
                    <span
                      key={cond}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 text-foreground border border-border/60"
                    >
                      {label}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── 2.6 AUDIT META (CLEAN & SUBTLE) ──────────────────────── */}
          <div className="px-1 py-1 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>
              {t('policies.recordCreated', 'Created')}:{' '}
              <span className="font-mono text-foreground font-semibold">
                {policy.created_at
                  ? GlobalFormat.displayDate(policy.created_at)
                  : '—'}
              </span>
            </span>
            {policy.updated_at && (
              <span>
                {t('policies.lastUpdated', 'Updated')}:{' '}
                <span className="font-mono text-foreground font-semibold">
                  {GlobalFormat.displayDate(policy.updated_at)}
                </span>
              </span>
            )}
          </div>

        </div>

        {/* ── 3. DRAWER FOOTER ACTIONS ── */}
        <div className="px-6 py-4 border-t border-border/80 bg-card/95 backdrop-blur-md flex items-center justify-end gap-3 shrink-0 z-20">
          <ActionButton
            variant="secondary"
            label={t('common.close', 'Close')}
            onClick={onClose}
          />
          {onEdit && (
            <ActionButton
              variant="primary"
              icon={<Edit2 size={14} />}
              label={t('policies.editPolicy', 'Edit Return Policy')}
              onClick={() => {
                onClose()
                onEdit(policy)
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ReturnPolicyDetailDrawer
