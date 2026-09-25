import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Activity, Clock } from 'lucide-react'

interface RecentActivitiesProps {
  activityLog?: any[]
  isLoading?: boolean
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ activityLog, isLoading }) => {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-24 bg-muted rounded-xl" />
      </div>
    )
  }

  const logs = activityLog && activityLog.length > 0 ? activityLog : []

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs">
      <h3 className="font-extrabold text-sm sm:text-base text-foreground mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        <span>{t('dashboard.activityTimeline')}</span>
      </h3>

      <div className="relative border-l border-border/60 ml-2.5 pl-4 sm:pl-5 space-y-4">
        {logs.map((act: any, idx: number) => (
          <motion.div
            key={act.id || idx}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="relative"
          >
            {/* Timeline Dot */}
            <span className="absolute -left-[23px] sm:-left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-primary/80 ring-4 ring-card" />

            {/* Content */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-foreground leading-snug truncate">{act.description || t('dashboard.systemEvent', 'System Event')}</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-0.5 shrink-0 font-mono">
                  <Clock className="w-2.5 h-2.5" />
                  {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('dashboard.justNow', 'Just now')}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                {t('dashboard.by', 'By')}: <span className="font-semibold text-foreground">{act.causer_name || t('dashboard.systemUser', 'System User')}</span>
              </p>
            </div>
          </motion.div>
        ))}

        {logs.length === 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground">
            {t('dashboard.noDataAvailable')}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentActivities
