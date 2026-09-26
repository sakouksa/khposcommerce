import React from 'react'
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

interface BusinessAlertsWidgetProps {
  alerts: any[]
  isLoading?: boolean
}

export const BusinessAlertsWidget: React.FC<BusinessAlertsWidgetProps> = ({ alerts, isLoading }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-12 bg-muted rounded-xl" />
      </div>
    )
  }

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-3.5 border-b border-border/40 pb-3">
        <h3 className="font-extrabold text-sm sm:text-base text-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>{t('dashboard.businessAlerts')}</span>
        </h3>
        <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20">
          {alerts?.length || 0} {t('dashboard.active', 'Active')}
        </span>
      </div>

      <div className="space-y-3">
        {alerts && alerts.length > 0 ? (
          alerts.map((alert: any) => {
            const isDanger = alert.type === 'danger'
            const isWarning = alert.type === 'warning'
            return (
              <div
                key={alert.id}
                onClick={() => alert.action_url && navigate(alert.action_url)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isDanger
                    ? 'bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-400 hover:bg-rose-500/10'
                    : isWarning
                    ? 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10'
                    : 'bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10'
                }`}
              >
                {isDanger ? (
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-xs">{alert.title}</h5>
                  <p className="text-[11px] opacity-90 mt-0.5 line-clamp-2">{alert.message}</p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {t('dashboard.allSystemsHealthy', 'All systems & business metrics are healthy')}
          </div>
        )}
      </div>
    </div>
  )
}

export default BusinessAlertsWidget
