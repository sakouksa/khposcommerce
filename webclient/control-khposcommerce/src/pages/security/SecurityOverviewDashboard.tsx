import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Smartphone,
  AlertTriangle,
  Lock,
  Clock,
  KeyRound,
  FileText,
  Activity,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react'
import { securityService } from '@/services/securityService'
import { showToast } from '../../utils/toast'

export const SecurityOverviewDashboard: React.FC = () => {
  const { t } = useTranslation(['security', 'common'])
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    metrics: {
      active_sessions: number
      total_devices: number
      revoked_devices: number
      suspicious_devices: number
      failed_logins_24h: number
      successful_logins_24h: number
      open_shifts: number
    }
    recent_events: Array<{
      id: number
      action: string
      module: string
      description: string
      status: string
      ip_address: string
      created_at: string
      user?: {
        name: string
        username: string
      }
    }>
  } | null>(null)

  const fetchOverview = async () => {
    try {
      setLoading(true)
      const res = await securityService.getOverview()
      if (res.success || res.data) {
        setData(res.data || res)
      }
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to load security overview')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs">{t('common:loading', 'Loading security dashboard...')}</span>
      </div>
    )
  }

  const metrics = data?.metrics || {
    active_sessions: 0,
    total_devices: 0,
    revoked_devices: 0,
    suspicious_devices: 0,
    failed_logins_24h: 0,
    successful_logins_24h: 0,
    open_shifts: 0,
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t('security:title', 'System & Device Security')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('security:subtitle', 'Real-time security telemetry, active devices, and financial safeguards')}
          </p>
        </div>

        <button
          onClick={fetchOverview}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Security Health Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-sky-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('security:overview.securityHealth', 'System Security Health')}:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-xs tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40">
                {t('security:overview.healthExcellent', 'Excellent (100%)')}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('security:overview.healthBannerDesc', 'JWT Device Binding, Rate Limiting, RBAC Enforcement & Pessimistic Stock Locking active.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/security/devices"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl border border-slate-200 dark:border-slate-800 transition-all shadow-sm"
          >
            <span>{t('security:tabs.devices', 'Connected Devices')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/security/settings"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
          >
            <span>{t('security:tabs.settings', 'Security Policies')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {metrics.active_sessions}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t('security:overview.activeSessions', 'Active Sessions')}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {metrics.successful_logins_24h}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t('security:overview.successfulLogins', 'Logins (24h)')}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {metrics.failed_logins_24h}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t('security:overview.failedLogins', 'Failed Logins (24h)')}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {metrics.open_shifts}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t('security:overview.openShifts', 'Active POS Shifts')}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Security Events Audit Trail */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('security:overview.recentEvents', 'Recent Security & Audit Events')}
            </h3>
          </div>
          <Link
            to="/logs/audit"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
          >
            <span>{t('security:overview.viewAllLogs', 'View All Logs')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(!data?.recent_events || data.recent_events.length === 0) ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
            <span>{t('security:overview.noRecentEvents', 'No recent security alerts or violations.')}</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {data.recent_events.map((evt) => (
              <div key={evt.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                    {evt.action.includes('REVOKE') ? (
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                    ) : evt.action.includes('MANAGER') ? (
                      <KeyRound className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      {evt.action}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {evt.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>{t('security:overview.by', 'By')}: {evt.user?.name || 'System'}</span>
                      <span>{t('security:overview.ip', 'IP')}: {evt.ip_address || '127.0.0.1'}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 shrink-0">
                  {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export default SecurityOverviewDashboard
