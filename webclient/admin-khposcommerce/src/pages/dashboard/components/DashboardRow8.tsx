import React from 'react'
import { Globe2, Monitor, Smartphone, Tablet } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const DashboardRow8: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Traffic & Conversion Metrics */}
      <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Globe2 className="w-4 h-4 text-blue-500" />
          {t('dashboard.webConversionMetrics', 'Web Conversion Metrics')}
        </h4>
        <div className="space-y-4">
          <div>
            <span className="text-[11px] text-muted-foreground font-semibold">{t('dashboard.webConversionRate', 'Web Conversion Rate')}</span>
            <h5 className="font-bold text-sm text-foreground mt-1">3.45%</h5>
          </div>
          <div className="border-t border-border/20 pt-3">
            <span className="text-[11px] text-muted-foreground font-semibold">{t('dashboard.bounceRate', 'Bounce Rate')}</span>
            <h5 className="font-bold text-sm text-foreground mt-1">42.8%</h5>
          </div>
        </div>
      </div>

      {/* Top Visited Pages */}
      <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-3">
          {t('dashboard.topViewedPages', 'Top Viewed Pages')}
        </h4>
        <div className="space-y-2.5">
          {[
            { path: '/products/jbl-laptop-2', views: `2.5k ${t('dashboard.views', 'views')}` },
            { path: '/categories/laptops', views: `1.8k ${t('dashboard.views', 'views')}` },
            { path: '/special-promo-page', views: `950 ${t('dashboard.views', 'views')}` },
          ].map((page, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs border-b border-border/20 pb-2 last:border-0 last:pb-0">
              <span className="text-muted-foreground font-semibold truncate max-w-[165px]">{page.path}</span>
              <span className="font-bold text-foreground shrink-0">{page.views}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Device Breakdown */}
      <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs md:col-span-2 lg:col-span-1">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-4">
          {t('dashboard.visitorDevices', 'Visitor Devices')}
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5 font-semibold">
              <Smartphone className="w-3.5 h-3.5 text-blue-500" /> {t('dashboard.mobile', 'Mobile')}
            </span>
            <span className="font-bold text-foreground">65%</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5 font-semibold">
              <Monitor className="w-3.5 h-3.5 text-emerald-500" /> {t('dashboard.desktop', 'Desktop')}
            </span>
            <span className="font-bold text-foreground">28%</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5 font-semibold">
              <Tablet className="w-3.5 h-3.5 text-purple-500" /> {t('dashboard.tablet', 'Tablet')}
            </span>
            <span className="font-bold text-foreground">7%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardRow8
