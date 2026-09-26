import React from 'react'
import { Tag, Share2, Megaphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const DashboardRow6: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Campaigns & Promotions */}
      <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Megaphone className="w-4 h-4 text-blue-500" />
          {t('dashboard.activeCampaigns', 'Active Campaigns')}
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">{t('dashboard.summerHotPromo', 'Summer Hot Promo')}</span>
            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full font-bold">
              {t('dashboard.active', 'Active')}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">{t('dashboard.flashSalePromo', 'Flash Sale 7.7')}</span>
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full font-bold">
              {t('dashboard.scheduled', 'Scheduled')}
            </span>
          </div>
        </div>
      </div>

      {/* Coupons & Discounts */}
      <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-emerald-500" />
          {t('dashboard.couponUsage', 'Coupon Usage')}
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">COUPON-WELCOME-10</span>
            <span className="text-muted-foreground font-mono">142 {t('dashboard.used', 'used')}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">COUPON-FREE-SHIP</span>
            <span className="text-muted-foreground font-mono">89 {t('dashboard.used', 'used')}</span>
          </div>
        </div>
      </div>

      {/* Referral & Affiliate */}
      <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs md:col-span-2 lg:col-span-1">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Share2 className="w-4 h-4 text-purple-500" />
          {t('dashboard.referralsAffiliates', 'Referrals & Affiliates')}
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">{t('dashboard.referralRegistrations', 'Referral Registrations')}</span>
            <span className="font-bold text-foreground">+24 {t('dashboard.today', 'today')}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">{t('dashboard.affiliateCommissions', 'Affiliate Commissions')}</span>
            <span className="font-bold text-foreground">$1,200</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardRow6
