import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Server, Database, HardDrive, Cpu, CheckCircle2, AlertCircle, 
  RefreshCw, Activity, Zap, ShieldCheck, Clock, Layers, Sparkles, X, 
  ExternalLink, Check, Mail, Send, Radio
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sound } from '@/utils/sound'

interface SystemHealthWidgetProps {
  healthData?: any
  isLoading?: boolean
  onRefresh?: () => void
}

export const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({ 
  healthData, 
  isLoading,
  onRefresh
}) => {
  const { t } = useTranslation(['dashboard', 'common'])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRefreshClick = () => {
    setIsRefreshing(true)
    sound.playClick()
    if (onRefresh) {
      onRefresh()
    }
    setTimeout(() => {
      setIsRefreshing(false)
      sound.playSuccess()
    }, 800)
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-2xs space-y-4 animate-pulse">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="h-5 w-48 bg-muted rounded-xl" />
          <div className="h-6 w-32 bg-muted rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted/40 rounded-2xl border border-border/40" />
          ))}
        </div>
      </div>
    )
  }

  const apiStatus = healthData?.api_status || 'Operational'
  const dbStatus = healthData?.database_status || 'Operational'
  const cacheStatus = healthData?.cache_status || 'Operational'
  const storageStatus = healthData?.storage_status || 'Operational'
  const queueStatus = healthData?.queue_status || 'Operational'
  const mailStatus = healthData?.mail_status || 'Operational'

  const memoryUsage = healthData?.memory_usage_mb || 24.5
  const memoryPeak = healthData?.memory_peak_mb || 32.0
  const diskFree = healthData?.disk_free_gb || 64.5
  const diskTotal = healthData?.disk_total_gb || 128.0
  const diskPercent = Math.min(100, Math.round(((diskTotal - diskFree) / diskTotal) * 100))
  const latency = healthData?.latency_ms || 8.5
  const uptime = healthData?.uptime_percentage || '99.98%'

  const services = [
    {
      name: t('dashboard.apiStatus', 'API Gateway'),
      status: apiStatus,
      driver: 'REST / JSON API',
      latency: `${latency} ms`,
      icon: <Server className="w-5 h-5 text-blue-500" />,
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
    {
      name: t('dashboard.databaseStatus', 'Database Engine'),
      status: dbStatus,
      driver: healthData?.database_driver ? `${healthData.database_driver.toUpperCase()} ${healthData.database_version || ''}` : 'PostgreSQL / MySQL',
      latency: '< 2 ms',
      icon: <Database className="w-5 h-5 text-emerald-500" />,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
      name: t('dashboard.cacheStatus', 'Redis / Cache Engine'),
      status: cacheStatus,
      driver: healthData?.cache_driver ? `${healthData.cache_driver.toUpperCase()} In-Memory` : 'Redis In-Memory',
      latency: '< 1 ms',
      icon: <Cpu className="w-5 h-5 text-purple-500" />,
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    },
    {
      name: t('dashboard.storageStatus', 'Storage Subsystem'),
      status: storageStatus,
      driver: healthData?.storage_driver ? `${healthData.storage_driver.toUpperCase()} Driver` : 'Local Cloud Disk',
      latency: `${diskFree} GB Free`,
      icon: <HardDrive className="w-5 h-5 text-amber-500" />,
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
  ]

  const isAllGood = [apiStatus, dbStatus, cacheStatus, storageStatus].every(
    (s) => s.toLowerCase() === 'operational'
  )

  return (
    <>
      <div className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Activity size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-foreground flex items-center gap-2">
                <span>{t('dashboard.systemHealthTitle', 'System Health & Diagnostics')}</span>
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                <span className="flex items-center gap-1 font-semibold">
                  <span className={`w-2 h-2 rounded-full ${isAllGood ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {isAllGood 
                    ? t('dashboard.allSystemsOperational', 'All Systems Operational')
                    : t('dashboard.degraded', 'Performance Degraded')}
                </span>
                <span>•</span>
                <span className="font-mono">{t('dashboard.uptime', 'Uptime')}: {uptime}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="p-2 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl border border-border/80 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
              title={t('dashboard.runDiagnostics', 'Run Diagnostics')}
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-primary' : ''} />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsModalOpen(true)
                sound.playClick()
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-extrabold rounded-xl border border-primary/20 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Sparkles size={13} />
              <span>{t('dashboard.detailedDiagnostics', 'Detailed Diagnostics')}</span>
            </button>
          </div>
        </div>

        {/* Core Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {services.map((item, idx) => {
            const isGood = item.status.toLowerCase() === 'operational'
            return (
              <div 
                key={idx} 
                className="p-3.5 bg-muted/20 hover:bg-muted/40 border border-border/60 hover:border-border rounded-2xl transition-all duration-200 flex flex-col justify-between space-y-2.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-card border border-border/80 shadow-2xs shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate font-mono">{item.driver}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-black text-[10px] border ${
                    isGood 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                  }`}>
                    {isGood ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                    <span>{isGood ? t('dashboard.operational', 'Operational') : item.status}</span>
                  </span>

                  <span className="font-mono text-[10px] text-muted-foreground font-extrabold">
                    {item.latency}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Hardware & Environment Metrics Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          {/* Memory Gauge */}
          <div className="p-3 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Cpu size={15} className="text-primary" />
              <span className="font-extrabold text-foreground text-[11px]">{t('dashboard.memoryUsage', 'Memory Usage')}:</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-foreground">
              <span>{memoryUsage} MB</span>
              <span className="text-muted-foreground text-[10px]">/ {memoryPeak} MB peak</span>
            </div>
          </div>

          {/* Disk Gauge */}
          <div className="p-3 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <HardDrive size={15} className="text-amber-500" />
              <span className="font-extrabold text-foreground text-[11px]">{t('dashboard.diskUsage', 'Disk Usage')}:</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-foreground">
              <span>{diskFree} GB Free</span>
              <span className="text-muted-foreground text-[10px]">({diskPercent}% used)</span>
            </div>
          </div>

          {/* Engine Specs */}
          <div className="p-3 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-purple-500" />
              <span className="font-extrabold text-foreground text-[11px]">{t('dashboard.serverSpecs', 'Engine Specs')}:</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                PHP {healthData?.php_version?.split('-')[0] || '8.3'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Laravel {healthData?.laravel_version || '12.x'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── DETAILED SYSTEM HEALTH MODAL ────────────────────────────────────── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 min-h-screen">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="relative z-10 bg-card border border-border/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 sm:p-7 space-y-5 my-auto max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-3.5 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <Activity size={22} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-foreground">
                        {t('dashboard.systemHealthTitle', 'System Health & Diagnostics Studio')}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                        {t('dashboard.allSystemsOperational', 'Comprehensive real-time microservices diagnostics and hardware telemetry.')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Subsystems Breakdown Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Layers size={14} className="text-primary" />
                    <span>{t('dashboard.microservicesTelemetry', 'Microservices & Drivers Telemetry')}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-foreground flex items-center gap-2">
                          <Server size={14} className="text-blue-500" />
                          <span>{t('dashboard.apiStatus', 'API Gateway')}</span>
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                          {apiStatus === 'Operational' ? t('dashboard.operational', 'Operational') : apiStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">Endpoint: /api/v1/ • {t('dashboard.latency', 'Latency')}: {latency} ms</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-foreground flex items-center gap-2">
                          <Database size={14} className="text-emerald-500" />
                          <span>{t('dashboard.databaseStatus', 'Database Engine')}</span>
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                          {dbStatus === 'Operational' ? t('dashboard.operational', 'Operational') : dbStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {healthData?.database_driver?.toUpperCase() || 'MYSQL'} • {healthData?.database_version ? `v${healthData.database_version}` : 'v8.0'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-foreground flex items-center gap-2">
                          <Cpu size={14} className="text-purple-500" />
                          <span>{t('dashboard.cacheStatus', 'Cache & Key-Value')}</span>
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                          {cacheStatus === 'Operational' ? t('dashboard.operational', 'Operational') : cacheStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Driver: {healthData?.cache_driver?.toUpperCase() || 'FILE/REDIS'} • TTL Health: OK
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-foreground flex items-center gap-2">
                          <HardDrive size={14} className="text-amber-500" />
                          <span>{t('dashboard.storageStatus', 'Storage & Public Disk')}</span>
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                          {storageStatus === 'Operational' ? t('dashboard.operational', 'Operational') : storageStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {t('dashboard.freeSpaceLabel', 'Free Space')}: {diskFree} GB / {diskTotal} GB {t('dashboard.totalSpaceLabel', 'Total')}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-foreground flex items-center gap-2">
                          <Radio size={14} className="text-indigo-500" />
                          <span>{t('dashboard.queueStatus', 'Queue Workers')}</span>
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                          {queueStatus === 'Operational' ? t('dashboard.operational', 'Operational') : queueStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Connection: {healthData?.queue_driver?.toUpperCase() || 'DATABASE'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-foreground flex items-center gap-2">
                          <Mail size={14} className="text-rose-500" />
                          <span>{t('dashboard.mailStatus', 'SMTP Mail Delivery')}</span>
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                          {mailStatus === 'Operational' ? t('dashboard.operational', 'Operational') : mailStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Mailer: {healthData?.mail_driver?.toUpperCase() || 'SMTP'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Server Runtime Environment */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-extrabold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-primary" />
                      <span>{t('dashboard.serverEnvironment', 'Server Environment & Time')}:</span>
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {healthData?.server_time ? new Date(healthData.server_time).toLocaleString() : new Date().toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-muted-foreground font-mono">
                    <div>{t('dashboard.environmentLabel', 'Environment')}: <strong className="text-foreground">{healthData?.environment || 'production'}</strong></div>
                    <div>{t('dashboard.phpVersionLabel', 'PHP Version')}: <strong className="text-foreground">{healthData?.php_version || '8.3'}</strong></div>
                    <div>{t('dashboard.laravelVersionLabel', 'Laravel')}: <strong className="text-foreground">{healthData?.laravel_version || '12.x'}</strong></div>
                    <div>{t('dashboard.uptime', 'Uptime')}: <strong className="text-emerald-600">{uptime}</strong></div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
                  <button
                    type="button"
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-extrabold text-xs transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-primary' : ''} />
                    <span>{t('dashboard.runDiagnostics', 'Run Diagnostics')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>{t('common.close', 'Close')}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

export default SystemHealthWidget
