import React, { useMemo } from 'react'
import { Ticket, Copy, Calendar, CheckCircle2, AlertCircle, ArrowUpRight, Plus } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import type { PromotionCampaign, PromotionCoupon } from '../types'

interface CouponsSectionProps {
  campaigns: PromotionCampaign[]
  onOpenCampaign: (campaign: PromotionCampaign) => void
  onOpenCreateModal: () => void
}

export const CouponsSection: React.FC<CouponsSectionProps> = ({
  campaigns,
  onOpenCampaign,
  onOpenCreateModal,
}) => {
  const toast = useToast()

  const allCoupons = useMemo(() => {
    const list: Array<PromotionCoupon & { campaign: PromotionCampaign }> = []
    campaigns.forEach((camp) => {
      ;(camp.coupons || []).forEach((c) => {
        list.push({
          ...c,
          campaign: camp,
        })
      })
    })
    return list
  }, [campaigns])

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied promo code "${code}"!`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Active Promo Codes & Vouchers</h3>
          <p className="text-xs text-muted-foreground">
            Customer-facing coupon codes that trigger automated campaign rules upon checkout.
          </p>
        </div>
      </div>

      {allCoupons.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <Ticket size={28} className="mx-auto text-primary/60" />
          <h4 className="text-sm font-bold text-foreground">No Coupons Generated</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Attached coupon promo codes allow customers and cashiers to redeem campaign offers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allCoupons.map((coupon) => {
            const usedCount = coupon.used_count || 0
            const limit = coupon.usage_limit
            const pct = limit ? Math.min(100, Math.round((usedCount / limit) * 100)) : null

            return (
              <div
                key={coupon.id}
                className="bg-card rounded-2xl border border-border hover:border-primary/40 p-4 shadow-xs space-y-3 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => copyCode(coupon.code)}
                      className="px-3 py-1.5 rounded-xl font-mono text-sm font-black bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 flex items-center gap-2 transition-colors"
                    >
                      <Ticket size={14} />
                      <span>{coupon.code}</span>
                      <Copy size={12} className="opacity-70" />
                    </button>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Linked Campaign:</span>
                    <strong className="text-xs text-foreground">{coupon.campaign.name}</strong>
                  </div>

                  {/* Usage Progress */}
                  <div className="space-y-1 text-xs bg-muted/20 p-2.5 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Redemptions:</span>
                      <strong className="text-foreground font-mono">
                        {usedCount} {limit ? `/ ${limit}` : ''}
                      </strong>
                    </div>

                    {limit && (
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-muted-foreground pt-1 text-[11px]">
                      <span>Per Customer Limit:</span>
                      <strong className="text-foreground">{coupon.usage_per_customer || 1} use</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar size={11} />
                    <span>
                      {coupon.expires_at ? `Exp: ${new Date(coupon.expires_at).toLocaleDateString()}` : 'No Expiry'}
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={() => onOpenCampaign(coupon.campaign)}
                    className="inline-flex items-center gap-1 font-bold text-primary hover:underline text-xs"
                  >
                    <span>View Campaign</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
