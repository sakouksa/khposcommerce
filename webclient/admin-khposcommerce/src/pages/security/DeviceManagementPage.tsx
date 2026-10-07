import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  ShieldCheck,
  LogOut,
  Search,
  RefreshCw,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Loader2
} from 'lucide-react'
import { getDeviceId } from '../../api/client'
import { securityService } from '@/services/securityService'
import { showToast } from '../../utils/toast'
import { SensitiveActionModal } from './components/SensitiveActionModal'

interface DeviceItem {
  id: number
  device_id: string
  device_name: string
  device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown' | string
  browser: string
  platform: string
  os: string
  ip_address: string
  location: string
  last_activity_at: string
  last_active_at?: string
  created_at: string
  is_current: boolean
  is_current_device?: boolean
  status?: string
  revoked_at: string | null
  [key: string]: any
}

export const DeviceManagementPage: React.FC = () => {
  const { t } = useTranslation(['security', 'common'])
  const [devices, setDevices] = useState<DeviceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all')

  // Modal states
  const [selectedDevice, setSelectedDevice] = useState<DeviceItem | null>(null)
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false)
  const [isRevokeAllModalOpen, setIsRevokeAllModalOpen] = useState(false)
  const currentLocalDeviceId = getDeviceId()

  const fetchDevices = async () => {
    try {
      setLoading(true)
      const res = await securityService.getDevices()
      if (res.success || res.data) {
        setDevices(res.data || res || [])
      }
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to load devices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  const handleRevokeSingle = async () => {
    if (!selectedDevice) return
    try {
      const res = await securityService.revokeDevice(selectedDevice.id)
      if (res.success || res) {
        showToast.success(t('security:devices.revokeSuccess', 'Device session revoked successfully'))
        fetchDevices()
      }
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to revoke device')
    } finally {
      setSelectedDevice(null)
      setIsRevokeModalOpen(false)
    }
  }

  const handleRevokeAllOthers = async () => {
    try {
      const res = await securityService.revokeAllOtherDevices()
      if (res.success || res) {
        showToast.success(t('security:devices.revokeAllSuccess', 'Signed out of all other devices successfully'))
        fetchDevices()
      }
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to sign out other devices')
    } finally {
      setIsRevokeAllModalOpen(false)
    }
  }

  const getDeviceIcon = (type: string, os?: string | null) => {
    const lowerType = (type || '').toLowerCase()
    const lowerOs = (os || '').toLowerCase()

    if (lowerType === 'mobile' || lowerOs.includes('android') || lowerOs.includes('ios')) {
      return <Smartphone className="w-5 h-5 text-indigo-500" />
    }
    if (lowerType === 'tablet' || lowerOs.includes('ipad')) {
      return <Tablet className="w-5 h-5 text-purple-500" />
    }
    if (lowerOs.includes('mac') || lowerOs.includes('win') || lowerOs.includes('linux')) {
      return <Laptop className="w-5 h-5 text-emerald-500" />
    }
    return <Globe className="w-5 h-5 text-sky-500" />
  }

  const filteredDevices = devices.filter((d) => {
    const isCurrent = d.is_current_device || d.device_id === currentLocalDeviceId
    if (statusFilter === 'active' && d.status !== 'active') return false
    if (statusFilter === 'revoked' && d.status !== 'revoked') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = d.device_name?.toLowerCase().includes(q)
      const matchIp = d.ip_address?.toLowerCase().includes(q)
      const matchBrowser = d.browser?.toLowerCase().includes(q)
      const matchOs = d.os?.toLowerCase().includes(q)
      return matchName || matchIp || matchBrowser || matchOs
    }
    return true
  })

  const activeCount = devices.filter((d) => d.status === 'active').length
  const revokedCount = devices.filter((d) => d.status === 'revoked').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t('security:devices.title', 'Connected Devices')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('security:devices.subtitle', 'Monitor and manage all active devices accessing your account')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDevices}
            disabled={loading}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsRevokeAllModalOpen(true)}
            disabled={activeCount <= 1}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('security:devices.revokeAllBtn', 'Sign Out All Other Devices')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{activeCount}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('security:devices.active', 'Active Sessions')}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{revokedCount}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('security:devices.revoked', 'Revoked Devices')}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{devices.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('security:devices.filterAll', 'Total Devices')}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {(['all', 'active', 'revoked'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all capitalize whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {status === 'all' && t('security:devices.filterAll', 'All Devices')}
              {status === 'active' && t('security:devices.filterActive', 'Active')}
              {status === 'revoked' && t('security:devices.filterRevoked', 'Revoked')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('security:devices.searchPlaceholder', 'Search device, IP, browser...')}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white outline-none transition-all"
          />
        </div>
      </div>

      {/* Device List */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <span className="text-xs">{t('common:loading', 'Loading devices...')}</span>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-400">
          <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('security:devices.noDevicesFound', 'No devices found')}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {t('security:devices.noDevicesFilterDesc', 'Try adjusting your search query or filter criteria.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((device) => {
            const isCurrent = device.is_current_device || device.device_id === currentLocalDeviceId
            const isActive = device.status === 'active'

            return (
              <div
                key={device.id}
                className={`relative p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 flex flex-col justify-between ${
                  isCurrent
                    ? 'border-emerald-500/50 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/30'
                    : 'border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top line with Device Icon & Badges */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50">
                        {getDeviceIcon(device.device_type, device.os)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{device.device_name || 'Web Browser'}</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {device.browser ? `${device.browser} • ` : ''}{device.platform || device.os || 'Unknown OS'}
                        </p>
                      </div>
                    </div>

                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {t('security:devices.currentDevice', 'Current')}
                      </span>
                    ) : isActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                        {t('security:devices.active', 'Active')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {t('security:devices.revoked', 'Revoked')}
                      </span>
                    )}
                  </div>

                  {/* Metadata fields */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {t('security:devices.ipAddress', 'IP Address')}:
                      </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                        {device.ip_address || '127.0.0.1'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {t('security:devices.lastActive', 'Last Active')}:
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {device.last_active_at ? new Date(device.last_active_at).toLocaleString() : 'Just now'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
                  {isCurrent ? (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {t('security:devices.activeInThisBrowser', '✓ Active in this browser')}
                    </span>
                  ) : isActive ? (
                    <button
                      onClick={() => {
                        setSelectedDevice(device)
                        setIsRevokeModalOpen(true)
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('security:devices.revokeBtn', 'Revoke Device')}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {t('security:devices.revokedOn', 'Revoked on')}{' '}
                      {device.created_at ? new Date(device.created_at).toLocaleDateString() : ''}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Revoke Single Device Modal */}
      <SensitiveActionModal
        isOpen={isRevokeModalOpen}
        onClose={() => {
          setSelectedDevice(null)
          setIsRevokeModalOpen(false)
        }}
        onSuccess={handleRevokeSingle}
        level="confirm"
        isDestructive={true}
        title={t('security:devices.revokeConfirmTitle', 'Revoke Device Session?')}
        subtitle={t(
          'security:devices.revokeConfirmDesc',
          'This device will be immediately signed out and must authenticate again.'
        )}
        actionName="device_revoke"
        confirmButtonText={t('security:devices.revokeBtn', 'Revoke Device')}
      />

      {/* Revoke All Others Modal */}
      <SensitiveActionModal
        isOpen={isRevokeAllModalOpen}
        onClose={() => setIsRevokeAllModalOpen(false)}
        onSuccess={handleRevokeAllOthers}
        level="confirm"
        isDestructive={true}
        title={t('security:devices.revokeAllConfirmTitle', 'Sign out all other devices?')}
        subtitle={t(
          'security:devices.revokeAllConfirmDesc',
          'All active sessions except your current browser will be terminated immediately.'
        )}
        actionName="revoke_all_other_devices"
        confirmButtonText={t('security:devices.revokeAllBtn', 'Sign Out All Others')}
      />
    </div>
  )
}
export default DeviceManagementPage
