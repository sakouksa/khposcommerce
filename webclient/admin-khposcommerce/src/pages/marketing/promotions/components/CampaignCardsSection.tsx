import React from 'react'
import {
  Tag,
  Sparkles,
  Layers,
  Gift,
  Percent,
  MapPin,
  Calendar,
  Edit,
  Pause,
  Play,
  Trash2,
  ArrowRight,
  Ticket,
  Copy,
  Globe,
  ShoppingCart,
  Zap,
  Store,
  Smartphone,
  Check,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/useToast'
import type { PromotionCampaign, PromotionRule } from '../types'

interface CampaignCardsSectionProps {
  campaigns: PromotionCampaign[]
  isLoading: boolean
  getPromoStatus: (p: PromotionCampaign) => 'running' | 'scheduled' | 'expired' | 'paused' | 'draft'
  setDetailDrawerPromo: (p: PromotionCampaign) => void
  openEditModal: (p: PromotionCampaign) => void
  handleDuplicate?: (p: PromotionCampaign) => void
  setDeleteTarget: (p: PromotionCampaign) => void
  toggleStatusMutation: any
  onOpenSimulator?: (p?: PromotionCampaign) => void
}

const STATUS_CONFIG: Record<string, { key: string; fallback: string }> = {
  running:   { key: 'marketing.statusActive',    fallback: 'Active' },
  scheduled: { key: 'marketing.statusScheduled', fallback: 'Scheduled' },
  paused:    { key: 'marketing.statusPaused',    fallback: 'Paused' },
  expired:   { key: 'marketing.statusExpired',   fallback: 'Expired' },
  draft:     { key: 'marketing.statusDraft',     fallback: 'Draft' },
}

const STATUS_STYLES: Record<string, {
  stripe: string
  badge: string
  dot: string
  pulse?: boolean
}> = {
  running: {
    stripe: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
    pulse: true,
  },
  scheduled: {
    stripe: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
    dot: 'bg-blue-500',
  },
  paused: {
    stripe: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
  },
  expired: {
    stripe: 'bg-muted-foreground/30',
    badge: 'bg-muted/70 text-muted-foreground border-border',
    dot: 'bg-muted-foreground/40',
  },
  draft: {
    stripe: 'bg-muted-foreground/30',
    badge: 'bg-muted/70 text-muted-foreground border-border',
    dot: 'bg-muted-foreground/30',
  },
}

const RULE_STYLE_CONFIG: Record<
  string,
  {
    icon: React.ElementType
    pillClass: string
    badgeClass: string
  }
> = {
  product_discount: {
    icon: Tag,
    pillClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60',
    badgeClass: 'bg-blue-600 text-white dark:bg-blue-500',
  },
  brand_discount: {
    icon: Sparkles,
    pillClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60',
    badgeClass: 'bg-purple-600 text-white dark:bg-purple-500',
  },
  category_discount: {
    icon: Layers,
    pillClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
    badgeClass: 'bg-indigo-600 text-white dark:bg-indigo-500',
  },
  cart_discount: {
    icon: ShoppingCart,
    pillClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
    badgeClass: 'bg-emerald-600 text-white dark:bg-emerald-500',
  },
  buy_x_get_y: {
    icon: Gift,
    pillClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
    badgeClass: 'bg-rose-600 text-white dark:bg-rose-500',
  },
  free_shipping: {
    icon: Zap,
    pillClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
    badgeClass: 'bg-amber-600 text-white dark:bg-amber-500',
  },
}

function formatBadge(rule: PromotionRule): string {
  if (rule.discount_type === 'percentage') return `${rule.discount_value}% OFF`
  if (rule.discount_type === 'fixed_amount') return `$${Number(rule.discount_value).toFixed(0)} OFF`
  if (rule.discount_type === 'free_item') return 'FREE'
  return `${rule.discount_value}`
}

function getRemainingDays(endAt?: string | null): { text: string; isEndingSoon: boolean } | null {
  if (!endAt) return null
  const end = new Date(endAt)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  if (diffTime <= 0) return { text: 'Expired', isEndingSoon: false }
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return {
    text: `${days}d left`,
    isEndingSoon: days <= 7,
  }
}

function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-3 w-1/4 bg-muted rounded" />
          <div className="h-5 w-2/3 bg-muted rounded" />
          <div className="h-3 w-1/2 bg-muted rounded" />
        </div>
        <div className="flex gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-muted" />
          <div className="w-8 h-8 rounded-lg bg-muted" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-28 rounded-md bg-muted" />
        <div className="h-6 w-24 rounded-md bg-muted" />
      </div>
      <div className="h-px bg-muted" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-8 bg-muted rounded" />
        <div className="h-8 bg-muted rounded" />
        <div className="h-8 bg-muted rounded" />
      </div>
    </div>
  )
}

export const CampaignCardsSection: React.FC<CampaignCardsSectionProps> = ({
  campaigns = [],
  isLoading,
  getPromoStatus,
  setDetailDrawerPromo,
  openEditModal,
  setDeleteTarget,
  toggleStatusMutation,
}) => {
  const { t, i18n } = useTranslation(['marketing', 'common', 'buttons'])
  const toast = useToast()
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null)

  const copyToClipboard = (code: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(t('marketing.copiedCode', 'Copied: {{code}}', { code }))
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-card/40">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          <Layers size={22} />
        </div>
        <p className="text-base font-bold text-foreground">
          {t('marketing.noCampaignsYet', 'No campaigns yet')}
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
          {t('marketing.createFirstCampaign', 'Create your first promotion campaign to start offering discounts.')}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {campaigns.map((campaign) => {
        const status = getPromoStatus(campaign)
        const statusCfg = STATUS_CONFIG[status] ?? { key: '', fallback: status }
        const statusText = statusCfg.key ? t(statusCfg.key, statusCfg.fallback) : status
        const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.draft

        const rules = campaign.rules || []
        const branches = campaign.branches || []
        const usageCount = campaign.usage_count || campaign.usages_count || 0
        const usageLimit = campaign.usage_limit
        const usagePct = usageLimit ? Math.min(100, Math.round((usageCount / usageLimit) * 100)) : null
        const remainingDays = getRemainingDays(campaign.end_at || campaign.ends_at)

        return (
          <div
            key={campaign.id}
            className="group relative bg-card rounded-2xl border border-border/80 hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
          >
            {/* ── Left Accent Stripe ── */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusStyle.stripe}`} />

            {/* ── Card Main Content ── */}
            <div className="p-5 pl-6 space-y-4 flex-1">
              {/* Header Row: Status, Code & Top-Right Actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0 flex-1">
                  {/* Status Badge + Code Chip */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle.badge}`}
                    >
                      <span className="relative flex h-2 w-2">
                        {statusStyle.pulse && (
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusStyle.dot}`} />
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${statusStyle.dot}`} />
                      </span>
                      {statusText}
                    </span>

                    {campaign.code && (
                      <button
                        type="button"
                        onClick={(e) => copyToClipboard(campaign.code, e)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-muted/80 text-foreground border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer shadow-2xs"
                        title={t('marketing.copyCode', 'Copy code')}
                      >
                        <Ticket size={11} className="text-primary/70" />
                        <span>{campaign.code}</span>
                        {copiedCode === campaign.code ? (
                          <Check size={11} className="text-emerald-500" />
                        ) : (
                          <Copy size={10} className="opacity-50 group-hover/btn:opacity-100" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Campaign Name */}
                  <h3
                    onClick={() => setDetailDrawerPromo(campaign)}
                    className="text-base font-bold text-foreground leading-snug tracking-tight hover:text-primary transition-colors cursor-pointer pt-0.5"
                    title={campaign.name}
                  >
                    {campaign.name}
                  </h3>

                  {/* Description */}
                  {campaign.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {campaign.description}
                    </p>
                  )}
                </div>

                {/* Always Accessible Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 pt-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openEditModal(campaign)}
                    className="w-8 h-8 rounded-lg border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-2xs"
                    title={t('buttons.edit', 'Edit')}
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      toggleStatusMutation.mutate({ id: campaign.id, is_active: !campaign.is_active })
                    }
                    className={`w-8 h-8 rounded-lg border border-border/80 bg-background transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-2xs ${
                      campaign.is_active
                        ? 'hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:border-amber-200'
                        : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:border-emerald-200'
                    }`}
                    title={campaign.is_active ? t('marketing.statusPaused', 'Pause') : t('marketing.statusActive', 'Activate')}
                  >
                    {campaign.is_active ? <Pause size={13} /> : <Play size={13} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(campaign)}
                    className="w-8 h-8 rounded-lg border border-border/80 bg-background hover:bg-red-50 dark:hover:bg-rose-500/10 hover:border-rose-300 dark:hover:border-rose-500/30 text-muted-foreground hover:text-rose-600 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-2xs"
                    title={t('buttons.delete', 'Delete')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Color-Coded Rules Badges */}
              {rules.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rules.map((rule: PromotionRule) => {
                    const ruleCfg = RULE_STYLE_CONFIG[rule.rule_type] ?? {
                      icon: Percent,
                      pillClass: 'bg-primary/10 text-primary border-primary/20',
                      badgeClass: 'bg-primary text-primary-foreground',
                    }
                    const RIcon = ruleCfg.icon
                    const badge = formatBadge(rule)

                    return (
                      <span
                        key={rule.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shadow-2xs transition-all ${ruleCfg.pillClass}`}
                      >
                        <RIcon size={11} className="shrink-0" />
                        <span className="truncate max-w-[150px] font-medium" title={rule.name}>
                          {rule.name}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none shadow-2xs ${ruleCfg.badgeClass}`}>
                          {badge}
                        </span>
                      </span>
                    )
                  })}
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-border/60" />

              {/* Scope & Schedule Info Strip */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                {/* Branches */}
                <div className="bg-muted/30 rounded-xl p-2.5 border border-border/40">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                    <MapPin size={10} className="text-primary/70 shrink-0" />
                    <span>{t('marketing.branch', 'Branch')}</span>
                  </p>
                  <p className="font-semibold text-foreground truncate text-xs">
                    {branches.length === 0
                      ? t('marketing.allBranches', 'All Branches')
                      : t('marketing.branchesCount', '{{count}} branches', { count: branches.length })}
                  </p>
                </div>

                {/* Period & Remaining Days */}
                <div className="bg-muted/30 rounded-xl p-2.5 border border-border/40">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground flex items-center gap-1">
                      <Calendar size={10} className="text-primary/70 shrink-0" />
                      <span>{t('marketing.period', 'Period')}</span>
                    </p>
                    {remainingDays && (
                      <span
                        className={`text-[9px] font-bold px-1 rounded ${
                          remainingDays.isEndingSoon
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {remainingDays.text}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-foreground text-xs truncate">
                    {campaign.start_at
                      ? new Date(campaign.start_at).toLocaleDateString(i18n.language?.startsWith('km') ? 'km-KH' : 'en-US', { month: 'short', day: 'numeric' })
                      : t('marketing.now', 'Now')}{' '}
                    →{' '}
                    {campaign.end_at
                      ? new Date(campaign.end_at).toLocaleDateString(i18n.language?.startsWith('km') ? 'km-KH' : 'en-US', { month: 'short', day: 'numeric', year: '2-digit' })
                      : '∞'}
                  </p>
                </div>

                {/* Channels */}
                <div className="bg-muted/30 rounded-xl p-2.5 border border-border/40">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                    <Globe size={10} className="text-primary/70 shrink-0" />
                    <span>{t('marketing.channel', 'Channel')}</span>
                  </p>
                  <p className="font-semibold text-foreground truncate text-xs flex items-center gap-1">
                    {(campaign.channels || []).length === 0 ||
                    (campaign.channels || []).some((c: any) => c.channel === 'all') ? (
                      <span className="truncate">{t('marketing.allChannels', 'All Channels')}</span>
                    ) : (
                      (campaign.channels || []).map((c: any) => (
                        <span key={c.channel} className="uppercase inline-flex items-center gap-0.5">
                          {c.channel === 'pos' && <Store size={10} className="text-blue-500" />}
                          {c.channel === 'web' && <Globe size={10} className="text-emerald-500" />}
                          {c.channel === 'mobile' && <Smartphone size={10} className="text-purple-500" />}
                          <span>{c.channel}</span>
                        </span>
                      ))
                    )}
                  </p>
                </div>
              </div>

              {/* Usage / Redemptions Bar */}
              {usageLimit ? (
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {t('marketing.redemptions', 'Redemptions')}
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {usageCount.toLocaleString()} / {usageLimit.toLocaleString()}{' '}
                      <span className="text-muted-foreground font-normal text-[11px]">
                        ({usagePct}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        (usagePct ?? 0) > 85 ? 'bg-rose-500' : 'bg-primary'
                      }`}
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>{t('marketing.redemptions', 'Redemptions')}</span>
                  <span className="font-semibold text-foreground">
                    {t('marketing.usedTimes', 'Used {{count}}× (Unlimited)', { count: usageCount })}
                  </span>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="px-5 pl-6 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1 font-medium text-foreground text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/70" />
                  <strong>{rules.length}</strong>{' '}
                  {t('marketing.rulesCount', '{{count}} rules', { count: rules.length })}
                </span>

                {campaign.priority !== undefined && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted font-mono font-medium text-muted-foreground border border-border/60">
                    P-{campaign.priority}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setDetailDrawerPromo(campaign)}
                className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80 transition-colors text-xs group/link cursor-pointer"
              >
                <span>{t('marketing.viewDetails', 'View Details')}</span>
                <ArrowRight size={12} className="transition-transform group-hover/link:translate-x-0.5" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CampaignCardsSection
