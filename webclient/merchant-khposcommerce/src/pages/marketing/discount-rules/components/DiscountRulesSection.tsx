import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Tag,
  Sparkles,
  Layers,
  Gift,
  Percent,
  ArrowUpRight,
  ShoppingCart,
  Package,
  Zap,
} from 'lucide-react'
import { WorkspaceTabs } from '@/components/shared/WorkspaceTabs'
import type { PromotionCampaign, PromotionRule } from '../../promotions/types'

interface DiscountRulesSectionProps {
  campaigns: PromotionCampaign[]
  onOpenCampaign: (campaign: PromotionCampaign) => void
  onOpenSimulator: (campaign?: PromotionCampaign) => void
}

// ── Rule type config ──────────────────────────────────────────────────────────
const RULE_CONFIG: Record<
  string,
  { icon: React.ElementType; labelKey: string; fallback: string; color: string }
> = {
  product_discount:  { icon: Package,      labelKey: 'marketing.productDiscount',  fallback: 'Product Discount',  color: 'text-blue-500' },
  brand_discount:    { icon: Sparkles,     labelKey: 'marketing.brandDiscount',    fallback: 'Brand Discount',    color: 'text-purple-500' },
  category_discount: { icon: Layers,       labelKey: 'marketing.categoryDiscount', fallback: 'Category Discount', color: 'text-amber-500' },
  cart_discount:     { icon: ShoppingCart, labelKey: 'marketing.cartDiscount',     fallback: 'Cart Discount',     color: 'text-emerald-500' },
  buy_x_get_y:       { icon: Gift,         labelKey: 'marketing.buyXGetY',         fallback: 'Buy X Get Y',       color: 'text-rose-500' },
  free_shipping:     { icon: Zap,          labelKey: 'marketing.freeShipping',     fallback: 'Free Shipping',     color: 'text-cyan-500' },
}
const DEFAULT_CFG = { icon: Percent, labelKey: 'marketing.discount', fallback: 'Discount', color: 'text-primary' }

const RULE_TYPE_FILTERS = [
  { id: 'all',               labelKey: 'marketing.allRules',  fallback: 'All Rules',  icon: Layers },
  { id: 'product_discount',  labelKey: 'marketing.product',   fallback: 'Product',    icon: Package },
  { id: 'brand_discount',    labelKey: 'marketing.brand',     fallback: 'Brand',      icon: Sparkles },
  { id: 'category_discount', labelKey: 'marketing.category',  fallback: 'Category',   icon: Layers },
  { id: 'cart_discount',     labelKey: 'marketing.cart',      fallback: 'Cart',       icon: ShoppingCart },
  { id: 'buy_x_get_y',       labelKey: 'marketing.bogo',      fallback: 'BOGO',       icon: Gift },
]

function formatBadge(rule: PromotionRule): string {
  if (rule.discount_type === 'percentage') return `${rule.discount_value}% OFF`
  if (rule.discount_type === 'fixed_amount') return `$${Number(rule.discount_value).toFixed(0)} OFF`
  if (rule.discount_type === 'free_item') return 'FREE'
  return `${rule.discount_value}`
}

// ── Rule Card ─────────────────────────────────────────────────────────────────
function RuleCard({
  rule,
  onOpenCampaign,
}: {
  rule: PromotionRule & { campaign: PromotionCampaign }
  onOpenCampaign: (c: PromotionCampaign) => void
}) {
  const { t } = useTranslation(['marketing', 'common'])
  const cfg = RULE_CONFIG[rule.rule_type] ?? DEFAULT_CFG
  const Icon = cfg.icon

  const ruleName = rule.name
  const campaignName = rule.campaign?.name
  const badge = formatBadge(rule)
  const ruleTypeLabel = t(cfg.labelKey, cfg.fallback)

  const targets = [
    ...(rule.products?.map((p) => p.name) ?? []),
    ...(rule.brands?.map((b) => b.name) ?? []),
    ...(rule.categories?.map((c: any) => c.name) ?? []),
  ]

  return (
    <div className="bg-card rounded-xl border border-border hover:border-border/80 hover:shadow-sm transition-all duration-150 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Icon size={15} className={cfg.color} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide leading-none mb-0.5">
              {ruleTypeLabel}
            </p>
            <h4 className="text-sm font-semibold text-foreground leading-tight truncate" title={ruleName}>
              {ruleName}
            </h4>
          </div>
        </div>

        {/* Badge */}
        <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-md bg-muted text-foreground border border-border">
          {badge}
        </span>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-border/60" />

      {/* Body */}
      <div className="p-4 space-y-2 flex-1 text-xs text-muted-foreground">
        {/* Campaign */}
        <div className="flex items-center gap-1.5">
          <Tag size={11} className="shrink-0" />
          <span className="truncate">{campaignName}</span>
        </div>

        {/* Targets */}
        {targets.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {targets.slice(0, 3).map((targetName, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-muted rounded text-[11px] text-foreground font-medium">
                {targetName}
              </span>
            ))}
            {targets.length > 3 && (
              <span className="px-1.5 py-0.5 text-[11px] text-muted-foreground">
                +{targets.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Min / Max */}
        <div className="flex items-center gap-4">
          {rule.min_subtotal && (
            <div>
              <span className="text-[10px] uppercase tracking-wide font-semibold block">
                {t('marketing.minPurchase', 'Min. Purchase')}
              </span>
              <span className="font-mono font-bold text-foreground">
                ${Number(rule.min_subtotal).toFixed(0)}
              </span>
            </div>
          )}
          {rule.max_discount_amount && (
            <div>
              <span className="text-[10px] uppercase tracking-wide font-semibold block">
                {t('marketing.maximumCap', 'Maximum Cap')}
              </span>
              <span className="font-mono font-bold text-foreground">
                ${Number(rule.max_discount_amount).toFixed(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-border/60" />

      {/* Footer */}
      <div className="px-4 py-2.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {t('marketing.priority', 'Priority')}{' '}
          <span className="font-semibold text-foreground">{rule.priority ?? '—'}</span>
        </span>
        <button
          type="button"
          onClick={() => onOpenCampaign(rule.campaign)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-2"
        >
          {t('marketing.manageInCampaign', 'Manage in Campaign')}
          <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export const DiscountRulesSection: React.FC<DiscountRulesSectionProps> = ({
  campaigns,
  onOpenCampaign,
}) => {
  const { t } = useTranslation(['marketing', 'common'])
  const [selectedType, setSelectedType] = useState<string>('all')

  const allRules = useMemo(() => {
    const list: Array<PromotionRule & { campaign: PromotionCampaign }> = []
    campaigns.forEach((camp) => {
      ;(camp.rules || []).forEach((rule) => {
        list.push({ ...rule, campaign: camp })
      })
    })
    return list
  }, [campaigns])

  const filtered = useMemo(() => {
    if (selectedType === 'all') return allRules
    return allRules.filter((r) => r.rule_type === selectedType)
  }, [allRules, selectedType])

  const countOf = (id: string) =>
    id === 'all' ? allRules.length : allRules.filter((r) => r.rule_type === id).length

  return (
    <div className="space-y-5">
      {/* Sub-tab Navigation */}
      <WorkspaceTabs
        tabs={RULE_TYPE_FILTERS.map((tItem) => ({
          id: tItem.id,
          label: t(tItem.labelKey, tItem.fallback),
          icon: tItem.icon,
          count: countOf(tItem.id),
        }))}
        activeTab={selectedType}
        onChange={setSelectedType}
        variant="underline"
        showIcons={false}
        size="sm"
      />

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center rounded-xl border border-dashed border-border">
          <Percent size={20} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">
            {t('marketing.noRulesFound', 'No rules found')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('marketing.noRulesDesc', 'Try a different filter or create a campaign.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((rule) => (
            <RuleCard key={rule.id} rule={rule} onOpenCampaign={onOpenCampaign} />
          ))}
        </div>
      )}
    </div>
  )
}

export default DiscountRulesSection
