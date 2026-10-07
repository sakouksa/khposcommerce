import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check } from 'lucide-react'
import type { PromotionCampaign } from '../types'
import {
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerTabNav,
  DetailDrawerBody,
  DetailDrawerFooter,
  DetailDrawerCard,
  DetailDrawerRow,
  StatusBadge,
  ActionButton,
} from '@/components/common'

interface PromotionDetailDrawerProps {
  promo: PromotionCampaign | null
  onClose: () => void
  handleDuplicate: (p: PromotionCampaign) => void
  openEditModal: (p: PromotionCampaign) => void
  onOpenSimulator?: (p: PromotionCampaign) => void
}

type TabKey = 'overview' | 'rules' | 'coupons'

export const PromotionDetailDrawer: React.FC<PromotionDetailDrawerProps> = ({
  promo,
  onClose,
  handleDuplicate,
  openEditModal,
  onOpenSimulator,
}) => {
  const { t } = useTranslation(['marketing', 'common'])
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  if (!promo) return null

  const rules = promo.rules || []
  const branches = promo.branches || []
  const channels = promo.channels?.map((c) => c.channel) || []
  const coupons = promo.coupons || []
  const usedCount = promo.usage_count || promo.usages_count || 0
  const maxUses = promo.usage_limit || null
  const usagePercent = maxUses ? Math.min(100, Math.round((usedCount / maxUses) * 100)) : 0

  const startDateStr = promo.start_at || promo.starts_at
  const endDateStr = promo.end_at || promo.ends_at

  const getPromoStatus = (p: PromotionCampaign): 'running' | 'scheduled' | 'expired' | 'paused' | 'draft' => {
    if (!p.is_active) return 'paused'
    const now = new Date()
    const start = p.start_at || p.starts_at
    const end = p.end_at || p.ends_at
    if (start && new Date(start) > now) return 'scheduled'
    if (end && new Date(end) < now) return 'expired'
    if (p.priority < 0) return 'draft'
    return 'running'
  }

  const promoStatus = getPromoStatus(promo)

  const handleCopy = (text: string, key: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const tabs = [
    {
      key: 'overview',
      label: t('marketing.tabOverview', 'Overview & Scope'),
    },
    {
      key: 'rules',
      label: t('marketing.tabRules', 'Discount Rules'),
      badge: rules.length,
    },
    {
      key: 'coupons',
      label: t('marketing.tabCoupons', 'Coupons'),
      badge: coupons.length > 0 ? coupons.length : undefined,
    },
  ]

  return (
    <DetailDrawer
      isOpen={Boolean(promo)}
      onClose={onClose}
      size="2xl"
    >
      {/* ─── GLOBAL DRAWER HEADER ─── */}
      <DetailDrawerHeader
        title={promo.name}
        subtitle={
          promo.code ? (
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground font-mono">
              <span>{promo.code}</span>
              <button
                type="button"
                onClick={() => handleCopy(promo.code, 'code')}
                className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title={t('common.copy', 'Copy')}
              >
                {copiedKey === 'code' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
            </div>
          ) : (
            t('marketing.campaignDetails', 'Promotion Campaign')
          )
        }
        badge={<StatusBadge status={promoStatus} />}
        onClose={onClose}
      />

      {/* ─── GLOBAL DRAWER TAB NAV ─── */}
      <DetailDrawerTabNav
        tabs={tabs}
        activeTab={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
      />

      {/* ─── GLOBAL DRAWER BODY ─── */}
      <DetailDrawerBody>
        {/* TAB 1: OVERVIEW & SCOPE */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* HERO SUMMARY CARD */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-purple-500/5 border border-primary/20 shadow-2xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-primary tracking-wider">
                    {t('marketing.priority', 'Priority')} {promo.priority || 0}
                  </span>
                  {promo.is_stackable && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {t('marketing.stackable', 'Stackable')}
                    </span>
                  )}
                </div>
                <StatusBadge status={promoStatus} />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-foreground">{promo.name}</h3>
                {promo.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{promo.description}</p>
                )}
              </div>
            </div>

            {/* BRANCH SCOPE & CHANNELS */}
            <DetailDrawerCard
              title={t('marketing.branchScopeChannels', 'Branch Scope & Channels')}
            >
              <DetailDrawerRow
                label={t('marketing.branchScope', 'Branch Scope')}
                value={
                  branches.length === 0 ? (
                    <span className="text-foreground font-semibold">
                      {t('marketing.allBranchesCompany', 'All Branches (Company-wide)')}
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1 justify-end max-w-[320px]">
                      {branches.map((b) => (
                        <span key={b.id} className="font-medium px-1.5 py-0.5 rounded bg-muted/60 text-[11px]">
                          {b.name}
                        </span>
                      ))}
                    </div>
                  )
                }
              />
              <DetailDrawerRow
                label={t('marketing.channels', 'Channels')}
                value={
                  channels.length === 0 || channels.includes('all') ? (
                    <span className="text-foreground font-semibold">
                      {t('marketing.allChannelsFull', 'All Channels (POS, Web, App)')}
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {channels.map((ch) => (
                        <span key={ch} className="font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-muted/60 text-[11px]">
                          {ch}
                        </span>
                      ))}
                    </div>
                  )
                }
              />
            </DetailDrawerCard>

            {/* SCHEDULE & USAGE */}
            <DetailDrawerCard
              title={t('marketing.scheduleDates', 'Schedule & Usage')}
            >
              <DetailDrawerRow
                label={t('marketing.startsAt', 'Starts At')}
                value={startDateStr ? new Date(startDateStr).toLocaleDateString() : t('marketing.dateImmediate', 'Immediate')}
              />
              <DetailDrawerRow
                label={t('marketing.endsAt', 'Ends At')}
                value={endDateStr ? new Date(endDateStr).toLocaleDateString() : t('marketing.dateNever', 'Never')}
              />
              <DetailDrawerRow
                label={t('marketing.usageLimitRedemptions', 'Usage Limit & Redemptions')}
                value={
                  <span className="font-mono">
                    {usedCount} {maxUses ? `/ ${maxUses} (${usagePercent}%)` : `(${t('marketing.unlimited', 'Unlimited')})`}
                  </span>
                }
              />
              {maxUses && (
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{t('marketing.redemptionProgress', 'Redemption Progress')}</span>
                    <span className="font-mono font-bold text-foreground">{usagePercent}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              )}
            </DetailDrawerCard>
          </div>
        )}

        {/* TAB 2: DISCOUNT RULES */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-muted-foreground uppercase tracking-wider">
                {t('marketing.discountRulesTitle', 'Discount Rules')} ({rules.length})
              </span>
              <span className="text-[11px] text-primary font-bold">
                {t('marketing.evaluatedByPriority', 'Evaluated by Priority')}
              </span>
            </div>

            {rules.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border/80 bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  {t('marketing.noDiscountRulesYet', 'No discount rules configured for this campaign yet.')}
                </p>
              </div>
            ) : (
              rules.map((rule, idx) => (
                <DetailDrawerCard
                  key={rule.id || idx}
                  title={
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-mono text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-sm text-foreground">{rule.name}</span>
                    </div>
                  }
                  badge={
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary text-primary-foreground font-mono">
                      {rule.discount_type === 'percentage'
                        ? `${rule.discount_value}% OFF`
                        : rule.discount_type === 'fixed_amount'
                        ? `$${rule.discount_value} OFF`
                        : rule.discount_type === 'free_item'
                        ? t('marketing.freeItem', 'FREE ITEM')
                        : `$${rule.discount_value}`}
                    </span>
                  }
                >
                  <DetailDrawerRow
                    label={t('marketing.ruleType', 'Rule Type')}
                    value={rule.rule_type?.replace(/_/g, ' ')}
                  />
                  <DetailDrawerRow
                    label={t('marketing.priority', 'Priority')}
                    value={
                      <span>
                        {rule.priority}
                        {rule.is_stackable && (
                          <span className="ml-1 text-emerald-600 font-bold">
                            ({t('marketing.stackable', 'Stackable')})
                          </span>
                        )}
                      </span>
                    }
                  />
                  {rule.min_subtotal && (
                    <DetailDrawerRow
                      label={t('marketing.minSubtotal', 'Min Subtotal')}
                      value={`$${rule.min_subtotal}`}
                    />
                  )}
                  {rule.products && rule.products.length > 0 && (
                    <DetailDrawerRow
                      label={t('marketing.targetProducts', 'Target Products')}
                      value={
                        <div className="flex flex-wrap gap-1 justify-end max-w-[280px]">
                          {rule.products.map((p) => (
                            <span key={p.id} className="px-1.5 py-0.2 rounded bg-muted text-[10px] font-medium">
                              {p.name}
                            </span>
                          ))}
                        </div>
                      }
                    />
                  )}
                  {rule.brands && rule.brands.length > 0 && (
                    <DetailDrawerRow
                      label={t('marketing.targetBrands', 'Target Brands')}
                      value={
                        <div className="flex flex-wrap gap-1 justify-end max-w-[280px]">
                          {rule.brands.map((b) => (
                            <span key={b.id} className="px-1.5 py-0.2 rounded bg-muted text-[10px] font-medium">
                              {b.name}
                            </span>
                          ))}
                        </div>
                      }
                    />
                  )}
                  {rule.categories && rule.categories.length > 0 && (
                    <DetailDrawerRow
                      label={t('marketing.targetCategories', 'Target Categories')}
                      value={
                        <div className="flex flex-wrap gap-1 justify-end max-w-[280px]">
                          {rule.categories.map((c: any) => (
                            <span key={c.id} className="px-1.5 py-0.2 rounded bg-muted text-[10px] font-medium">
                              {c.name}
                            </span>
                          ))}
                        </div>
                      }
                    />
                  )}
                </DetailDrawerCard>
              ))
            )}
          </div>
        )}

        {/* TAB 3: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            {coupons.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border/80 bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  {t('marketing.noCouponsYet', 'No coupons attached to this campaign.')}
                </p>
              </div>
            ) : (
              coupons.map((c) => (
                <DetailDrawerCard
                  key={c.id || c.code}
                  title={
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-primary">{c.code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(c.code, c.code)}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title={t('common.copy', 'Copy')}
                      >
                        {copiedKey === c.code ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  }
                >
                  <DetailDrawerRow
                    label={t('marketing.usageLimitRedemptions', 'Usage Limit & Redemptions')}
                    value={`${c.used_count || 0} ${t('marketing.used', 'used')} ${c.usage_limit ? `/ ${c.usage_limit}` : ''}`}
                  />
                </DetailDrawerCard>
              ))
            )}
          </div>
        )}
      </DetailDrawerBody>

      {/* ─── GLOBAL DRAWER STICKY FOOTER ─── */}
      <DetailDrawerFooter
        leftActions={
          <ActionButton
            onClick={onClose}
            label={t('common.close', 'Close')}
            variant="secondary"
          />
        }
        rightActions={
          <div className="flex items-center gap-2">
            <ActionButton
              onClick={() => handleDuplicate(promo)}
              label={t('marketing.duplicate', 'Duplicate')}
              variant="secondary"
            />
            <ActionButton
              onClick={() => openEditModal(promo)}
              label={t('marketing.editCampaign', 'Edit Campaign')}
              variant="primary"
            />
          </div>
        }
      />
    </DetailDrawer>
  )
}

export default PromotionDetailDrawer
