import React from 'react'
import { Download, Users, BellRing } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const DashboardRow9: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Mobile App Downloads */}
      <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            {t('dashboard.appDownloads', 'App Downloads')}
          </span>
          <h4 className="text-lg sm:text-xl font-bold text-foreground mt-1">45,210</h4>
          <span className="text-[9px] text-green-500 font-bold mt-1 block">↑ +15.2% {t('dashboard.downloadGrowthThisWeek', 'download growth this week')}</span>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0">
          <Download className="w-5 sm:w-6 h-5 sm:h-6 text-blue-500" />
        </div>
      </div>

      {/* App Daily & Monthly Active Users */}
      <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            {t('dashboard.appActiveUsers', 'App Active Users')}
          </span>
          <h4 className="text-lg sm:text-xl font-bold text-foreground mt-1">12,450 DAU</h4>
          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">89,200 {t('dashboard.monthlyActiveUsers', 'Monthly Active Users (MAU)')}</p>
        </div>
        <div className="p-3 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
          <Users className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-500" />
        </div>
      </div>

      {/* Push Notifications Sent */}
      <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-4 md:col-span-2 lg:col-span-1">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            {t('dashboard.pushNotifications', 'Push Notifications')}
          </span>
          <h4 className="text-lg sm:text-xl font-bold text-foreground mt-1">12 {t('dashboard.campaigns', 'Campaigns')}</h4>
          <span className="text-[9px] text-purple-500 font-bold mt-1 block">98.4% {t('dashboard.deliverySuccessRate', 'delivery success rate')}</span>
        </div>
        <div className="p-3 bg-purple-500/10 rounded-2xl flex items-center justify-center shrink-0">
          <BellRing className="w-5 sm:w-6 h-5 sm:h-6 text-purple-500" />
        </div>
      </div>
    </div>
  )
}

export default DashboardRow9
