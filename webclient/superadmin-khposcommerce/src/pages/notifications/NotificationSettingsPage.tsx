import React, { useState, useEffect } from 'react'
import {
  Bell, Mail, MessageSquare, Smartphone, Clock, Shield,
  DollarSign, AlertTriangle, Settings, RotateCcw, Save, Send, Eye, Globe,
  Sliders, CheckCircle2, Lock, RefreshCw, Users, FileText, Database,
  Zap, LogIn, LogOut, CreditCard,
  HardDrive, AlertCircle, ChevronRight, Server, ChevronDown,
  Building2, UserCheck, XCircle, RefreshCcw, Wifi, Star
} from 'lucide-react'
import { EnterpriseTimePicker } from '@/components/common'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import notificationService from '@/services/notificationService'
import type { NotificationSettings } from './types/notification.types'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import Breadcrumb from '@/components/common/Breadcrumb'
import PageHeader from '@/components/common/PageHeader'
import { useThemeStore } from '@/stores/themeStore'

interface EventSettingItem {
  id: string
  name: string
  desc: string
  icon: any
  iconColor: string
  iconBg: string
}

// Ultra-Modern Custom Toggle Switch Component with Custom Theme Color Support
interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, disabled, size = 'md' }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          sound.playClick()
          onChange(!checked)
        }
      }}
      className={`relative inline-flex shrink-0 cursor-pointer rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed select-none ${
        size === 'sm' ? 'h-5 w-9' : size === 'lg' ? 'h-7 w-13' : 'h-6 w-11'
      } ${
        checked
          ? 'bg-primary shadow-sm shadow-primary/30 ring-1 ring-primary/40'
          : 'bg-muted-foreground/25 hover:bg-muted-foreground/35 border border-border/40'
      }`}
    >
      <span
        className={`pointer-events-none inline-block transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
          size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
        } ${
          checked
            ? size === 'sm' ? 'translate-x-4' : size === 'lg' ? 'translate-x-6' : 'translate-x-5'
            : 'translate-x-0.5'
        } mt-0.5`}
      >
        {checked && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
      </span>
    </button>
  )
}

// ─── Generic Simple Dropdown ─────────────────────────────────────────────────

interface SimpleDropdownOption {
  value: string
  label: string
}

const SimpleDropdown: React.FC<{
  value: string
  onChange: (v: string) => void
  options: SimpleDropdownOption[]
}> = ({ value, onChange, options }) => {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const selected = options.find(o => o.value === value) || options[0]
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-[12px] bg-muted/30 border border-border/60 hover:border-primary/40 hover:bg-muted/50 transition-all text-xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span className="text-foreground font-medium truncate">{t(selected?.label || '', selected?.label)}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-1.5 left-0 right-0 z-50 bg-card border border-border/70 rounded-[14px] shadow-xl overflow-hidden py-1.5"
          >
            {options.map((opt) => {
              const isActive = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left transition-colors cursor-pointer text-xs ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/60 text-foreground'}`}
                >
                  <span className="truncate">{t(opt.label, opt.label)}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Language Options with Country Flags ─────────────────────────────────────

const LANGUAGE_OPTIONS = [
  {
    value: 'km',
    flag: '🇰🇭',
    flagCode: 'kh',
    name: 'Khmer',
    native: 'ភាសាខ្មែរ',
    country: 'Cambodia',
  },
  {
    value: 'en',
    flag: '🇺🇸',
    flagCode: 'us',
    name: 'English',
    native: 'English',
    country: 'United States',
  },
]

const PRIORITY_OPTIONS = [
  {
    value: 'low',
    label: 'Low',
    dot: 'bg-slate-400',
    labelColor: 'text-slate-500 dark:text-slate-400',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300/50 dark:border-slate-700/50',
    desc: 'Informational, non-urgent alerts',
  },
  {
    value: 'medium',
    label: 'Medium',
    dot: 'bg-blue-500',
    labelColor: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/50',
    desc: 'Standard operational notifications',
  },
  {
    value: 'high',
    label: 'High',
    dot: 'bg-amber-500',
    labelColor: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50',
    desc: 'Time-sensitive business alerts',
  },
  {
    value: 'critical',
    label: 'Critical',
    dot: 'bg-rose-500',
    labelColor: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50',
    desc: 'Emergency system-level failures',
  },
]

// Custom Language Dropdown Component
const LanguageDropdown: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const { t } = useTranslation(['notification', 'common'])
  const [open, setOpen] = React.useState(false)
  const selected = LANGUAGE_OPTIONS.find(o => o.value === value) || LANGUAGE_OPTIONS[0]
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-11 flex items-center justify-between gap-2 px-3 bg-transparent transition-all cursor-pointer focus:outline-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={`https://flagcdn.com/w28/${selected.flagCode}.png`}
            alt={selected.country}
            className="w-[22px] h-[15px] object-cover rounded-[3px] shadow-sm flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="min-w-0 text-left">
            <span className="font-semibold text-foreground text-[12px] block truncate leading-tight">{t(selected.name, selected.name)}</span>
            <span className="text-[10px] text-muted-foreground truncate leading-tight">{selected.native}</span>
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-1.5 left-0 min-w-[200px] z-[100] bg-card border border-border/70 rounded-[14px] shadow-xl overflow-hidden py-1.5"
          >
            {LANGUAGE_OPTIONS.map((opt) => {
              const isActive = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors cursor-pointer ${isActive ? 'bg-primary/10' : 'hover:bg-muted/60'}`}
                >
                  <img
                    src={`https://flagcdn.com/w28/${opt.flagCode}.png`}
                    alt={opt.country}
                    className="w-6 h-4 object-cover rounded-[3px] shadow-sm flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-semibold text-xs ${isActive ? 'text-primary' : 'text-foreground'}`}>{t(opt.name, opt.name)}</span>
                      <span className="text-[10px] text-muted-foreground">{opt.native}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60">{t(opt.country, opt.country)}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Custom Priority Dropdown Component
const PriorityDropdown: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const { t } = useTranslation(['notification', 'common'])
  const [open, setOpen] = React.useState(false)
  const selected = PRIORITY_OPTIONS.find(o => o.value === value) || PRIORITY_OPTIONS[2]
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-11 flex items-center justify-between gap-2 px-3 bg-transparent transition-all cursor-pointer focus:outline-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${selected.dot}`} />
          <div className="text-left min-w-0">
            <span className={`font-bold text-[12px] block leading-tight ${selected.labelColor}`}>
              {t(selected.label, selected.label)}
            </span>
            <span className="text-[10px] text-muted-foreground truncate leading-tight block max-w-[140px]">{t(selected.desc, selected.desc)}</span>
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-1.5 right-0 min-w-[220px] z-[100] bg-card border border-border/70 rounded-[14px] shadow-xl overflow-hidden py-1.5"
          >
            {PRIORITY_OPTIONS.map((opt) => {
              const isActive = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors cursor-pointer ${isActive ? 'bg-primary/10' : 'hover:bg-muted/60'}`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-[11px] px-1.5 py-0.5 rounded border ${opt.badge}`}>{t(opt.label, opt.label)}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/70">{t(opt.desc, opt.desc)}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const NotificationSettingsPage: React.FC = () => {

  const { t, i18n } = useTranslation(['notification', 'common'])
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewSample, setPreviewSample] = useState<'new_tenant' | 'subscription_renewed' | 'security_alert'>('new_tenant')
  const [testingChannel, setTestingChannel] = useState<boolean>(false)

  // Master Settings State
  const [generalSettings, setGeneralSettings] = useState({
    enable_notifications: true,
    enable_desktop: true,
    enable_sound: true,
    language: i18n.language || 'en',
    default_priority: 'high',
  })

  const [channels, setChannels] = useState({
    email: true,
    push: true,
    sms: false,
    telegram: true,
    whatsapp: false,
    slack: true,
    teams: false,
  })

  const [events, setEvents] = useState<Record<string, boolean>>({
    user_login: true,
    user_logout: false,
    new_tenant: true,
    tenant_suspended: true,
    tenant_deleted: true,
    subscription_renewed: true,
    subscription_expired: true,
    payment_failed: true,
    invoice_paid: true,
    new_reseller: true,
    api_limit_exceeded: true,
    platform_update: true,
    backup_completed: true,
    system_error: true,
    permission_changed: true,
    role_updated: true,
  })

  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start_time: '22:00',
    end_time: '07:00',
    timezone: 'Asia/Phnom_Penh',
    repeat: 'everyday',
  })

  const [emailPrefs, setEmailPrefs] = useState({
    daily_summary: true,
    weekly_report: true,
    monthly_report: true,
    marketing_email: false,
    security_alert: true,
    critical_alert: true,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const data = await notificationService.getSettings()
      if (data) {
        setGeneralSettings((prev) => ({
          ...prev,
          enable_notifications: data.enable_notifications ?? true,
          enable_desktop:       data.enable_desktop       ?? true,
          enable_sound:         data.enable_sound         ?? true,
          language:             data.language             || i18n.language || 'en',
          default_priority:     data.default_priority     || 'high',
        }))
        setChannels((prev) => ({
          ...prev,
          email:    data.email    ?? true,
          push:     data.push     ?? true,
          sms:      data.sms      ?? false,
          telegram: data.telegram ?? false,
          whatsapp: data.whatsapp ?? false,
          slack:    data.slack    ?? false,
          teams:    data.teams    ?? false,
        }))
        if (data.quiet_hours) {
          setQuietHours((prev) => ({ ...prev, ...data.quiet_hours }))
        }
        if (data.events) {
          setEvents((prev) => ({ ...prev, ...data.events }))
        }
        if (data.email_preferences) {
          setEmailPrefs((prev) => ({ ...prev, ...data.email_preferences }))
        }
      }
    } catch (e) {
      console.error('Failed to load notification settings:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = async (lang: string) => {
    setGeneralSettings((prev) => ({ ...prev, language: lang }))
    await useThemeStore.getState().setLanguage(lang as 'en' | 'km')
    toast.success(t('Language Updated', 'System language updated!'))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await notificationService.updateSettings({
        // General
        enable_notifications: generalSettings.enable_notifications,
        enable_desktop:       generalSettings.enable_desktop,
        enable_sound:         generalSettings.enable_sound,
        language:             generalSettings.language,
        default_priority:     generalSettings.default_priority,
        // Channels
        email:    channels.email,
        push:     channels.push,
        sms:      channels.sms,
        telegram: channels.telegram,
        whatsapp: channels.whatsapp,
        slack:    channels.slack,
        teams:    channels.teams,
        // Complex
        quiet_hours:        quietHours,
        events:             events,
        email_preferences:  emailPrefs,
      } as any)
      sound.playSuccess()
      toast.success(t('Settings Saved', 'Notification settings saved successfully!'))
    } catch (e) {
      sound.playError()
      toast.error(t('Save Error', 'Failed to save notification settings.'))
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    sound.playClick()
    setGeneralSettings({
      enable_notifications: true,
      enable_desktop: true,
      enable_sound: true,
      language: 'en',
      default_priority: 'high',
    })
    setChannels({
      email: true,
      push: true,
      sms: false,
      telegram: true,
      whatsapp: false,
      slack: true,
      teams: false,
    })
    setQuietHours({
      enabled: false,
      start_time: '22:00',
      end_time: '07:00',
      timezone: 'Asia/Phnom_Penh',
      repeat: 'everyday',
    })
    setEmailPrefs({
      daily_summary: true,
      weekly_report: true,
      monthly_report: true,
      marketing_email: false,
      security_alert: true,
      critical_alert: true,
    })
    toast.info(t('Reset Preferences', 'Reset all notification preferences to defaults'))
  }

  const handleTestNotification = async () => {
    setTestingChannel(true)
    try {
      sound.playNotification()
      await notificationService.testPush()
      toast.success(t('Test Ping Broadcasted', 'Test notification broadcasted successfully!'))
    } catch (e) {
      toast.error(t('Test Ping Error', 'Failed to send test notification.'))
    } finally {
      setTestingChannel(false)
    }
  }

  const enabledChannelsCount = Object.values(channels).filter(Boolean).length

  // Platform SaaS Event Definitions
  const eventList: EventSettingItem[] = [
    // — Identity & Access —
    { id: 'user_login', name: t('Admin Login', 'Admin Login'), desc: t('Admin Login Desc', 'Trigger alert when Super Admin or Staff logs into platform'), icon: LogIn, iconColor: 'text-blue-500', iconBg: 'bg-blue-500/10' },
    { id: 'user_logout', name: t('Admin Logout', 'Admin Session Terminated'), desc: t('Admin Logout Desc', 'Notify when admin session expires or is signed out'), icon: LogOut, iconColor: 'text-slate-500', iconBg: 'bg-slate-500/10' },
    // — Tenant / Shop Lifecycle —
    { id: 'new_tenant', name: t('New Tenant Registered', 'New Shop / Company Registered'), desc: t('New Tenant Desc', 'Alert when a new merchant shop or company is onboarded'), icon: Building2, iconColor: 'text-indigo-500', iconBg: 'bg-indigo-500/10' },
    { id: 'tenant_suspended', name: t('Tenant Suspended', 'Shop / Tenant Suspended'), desc: t('Tenant Suspended Desc', 'Notify when a tenant account is suspended due to non-payment or violation'), icon: XCircle, iconColor: 'text-amber-600', iconBg: 'bg-amber-600/10' },
    { id: 'tenant_deleted', name: t('Tenant Deleted', 'Shop / Tenant Account Deleted'), desc: t('Tenant Deleted Desc', 'Alert when a tenant account is permanently removed from platform'), icon: AlertTriangle, iconColor: 'text-rose-600', iconBg: 'bg-rose-600/10' },
    // — Billing & Subscription —
    { id: 'subscription_renewed', name: t('Subscription Renewed', 'SaaS Plan Subscription Renewed'), desc: t('Subscription Renewed Desc', 'Alert when a tenant successfully renews their subscription plan'), icon: RefreshCcw, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
    { id: 'subscription_expired', name: t('Subscription Expired', 'Subscription Plan Expired'), desc: t('Subscription Expired Desc', 'Notify when a tenant plan reaches its expiry date without renewal'), icon: AlertCircle, iconColor: 'text-orange-500', iconBg: 'bg-orange-500/10' },
    { id: 'payment_failed', name: t('Payment Failed', 'SaaS Invoice Payment Failed'), desc: t('Payment Failed Desc', 'Critical alert when a billing payment or auto-charge fails'), icon: CreditCard, iconColor: 'text-red-500', iconBg: 'bg-red-500/10' },
    { id: 'invoice_paid', name: t('Invoice Paid', 'SaaS Invoice Payment Received'), desc: t('Invoice Paid Desc', 'Confirmation when a tenant settles their SaaS billing invoice'), icon: CheckCircle2, iconColor: 'text-teal-500', iconBg: 'bg-teal-500/10' },
    // — Partners & Resellers —
    { id: 'new_reseller', name: t('New Reseller', 'New Reseller / Partner Joined'), desc: t('New Reseller Desc', 'Alert when a new distribution partner registers on the platform'), icon: UserCheck, iconColor: 'text-violet-500', iconBg: 'bg-violet-500/10' },
    // — Platform Infrastructure —
    { id: 'api_limit_exceeded', name: t('API Limit Exceeded', 'Tenant API Quota Exceeded'), desc: t('API Limit Exceeded Desc', 'Alert when a tenant exceeds their monthly API rate limit'), icon: Wifi, iconColor: 'text-cyan-500', iconBg: 'bg-cyan-500/10' },
    { id: 'platform_update', name: t('Platform Update', 'System Platform Version Updated'), desc: t('Platform Update Desc', 'Notify all stakeholders when a new platform version is deployed'), icon: Star, iconColor: 'text-yellow-500', iconBg: 'bg-yellow-500/10' },
    { id: 'backup_completed', name: t('Backup Completed', 'Database Backup Completed'), desc: t('Backup Completed Desc', 'Nightly automated cloud backup verification confirmation'), icon: HardDrive, iconColor: 'text-purple-500', iconBg: 'bg-purple-500/10' },
    { id: 'system_error', name: t('System Error', 'Critical System Diagnostic Error'), desc: t('System Error Desc', 'Critical 500 error, API gateway failure, or infrastructure outage'), icon: AlertTriangle, iconColor: 'text-red-600', iconBg: 'bg-red-600/10' },
    // — Security & Roles —
    { id: 'permission_changed', name: t('Permission Changed', 'Permission Matrix Updated'), desc: t('Permission Changed Desc', 'Security alert when platform user permission is modified'), icon: Shield, iconColor: 'text-slate-600', iconBg: 'bg-slate-600/10' },
    { id: 'role_updated', name: t('Role Updated', 'Staff Role Assignment Modified'), desc: t('Role Updated Desc', 'Notify when staff role or privileges are changed'), icon: Lock, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-600/10' },
  ]

  return (
    <div className="space-y-6 pb-28 max-w-[1600px] mx-auto">
      {/* 1. Breadcrumb: Dashboard > Notifications > Notification Settings */}
      <Breadcrumb
        items={[
          { label: t('Notifications', 'Notifications'), path: '/notifications' },
          { label: t('Notification Settings', 'Notification Settings') },
        ]}
      />

      <PageHeader
        icon={<Settings size={24} />}
        title={t('Notification Settings', 'Notification Settings')}
        subtitle={t('NotificationSettingsSubtitle', 'Configure dispatch channels, alert triggers, sound effects, and automated quiet hours')}
      />

      {/* 3. Top Summary Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Notification Channels */}
        <div className="bg-card border border-border/70 rounded-[18px] p-5 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground block">{t('Notification Channels', 'Notification Channels')}</span>
            <span className="text-lg font-bold text-foreground block">{enabledChannelsCount} {t('Channels Enabled', 'Channels Enabled')}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('Healthy', 'Healthy')}
            </span>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-[14px]">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Email Notifications */}
        <div className="bg-card border border-border/70 rounded-[18px] p-5 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground block">{t('Email Notifications', 'Email Notifications')}</span>
            <span className={`text-base font-bold block ${channels.email ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              {channels.email ? t('Enabled', 'Enabled') : t('Disabled', 'Disabled')}
            </span>
            <span className="text-[11px] text-muted-foreground block">{t('SMTP Gateway Active', 'SMTP Gateway Active')}</span>
          </div>
          <div className={`p-3 rounded-[14px] ${channels.email ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
            <Mail className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Push Notifications */}
        <div className="bg-card border border-border/70 rounded-[18px] p-5 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground block">{t('Push Notifications', 'Push Notifications')}</span>
            <span className={`text-base font-bold block ${channels.push ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              {channels.push ? t('Enabled', 'Enabled') : t('Disabled', 'Disabled')}
            </span>
            <span className="text-[11px] text-muted-foreground block">{t('FCM & Web Sockets', 'FCM & Web Sockets')}</span>
          </div>
          <div className={`p-3 rounded-[14px] ${channels.push ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
            <Smartphone className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: SMS Notifications */}
        <div className="bg-card border border-border/70 rounded-[18px] p-5 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground block">{t('SMS Notifications', 'SMS Notifications')}</span>
            <span className={`text-base font-bold block ${channels.sms ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              {channels.sms ? t('Enabled', 'Enabled') : t('Disabled', 'Disabled')}
            </span>
            <span className="text-[11px] text-muted-foreground block">{t('Twilio Cellular API', 'Twilio Cellular API')}</span>
          </div>
          <div className={`p-3 rounded-[14px] ${channels.sms ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Main 2-Column Layout: Left (70% = 7 cols) + Right (30% = 3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT COLUMN: Settings Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 1: General Settings */}
          <div className="bg-card border border-border/70 rounded-[18px] p-6 shadow-2xs space-y-5 overflow-visible">
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
              <Sliders className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {t('General Settings', 'General Settings')}
              </h2>
            </div>

            <div className="divide-y divide-border/60 text-xs">
              <div className="flex items-center justify-between py-3.5 first:pt-0">
                <div>
                  <span className="font-semibold text-foreground block text-xs">{t('Enable Notifications', 'Enable Notifications')}</span>
                  <span className="text-[11px] text-muted-foreground">{t('Master switch to toggle all system notification alerts', 'Master switch to toggle all system notification alerts')}</span>
                </div>
                <ToggleSwitch
                  checked={generalSettings.enable_notifications}
                  onChange={(v) => setGeneralSettings((p) => ({ ...p, enable_notifications: v }))}
                />
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div>
                  <span className="font-semibold text-foreground block text-xs">{t('Enable Desktop Notifications', 'Enable Desktop Notifications')}</span>
                  <span className="text-[11px] text-muted-foreground">{t('Display native OS browser popup alerts when active', 'Display native OS browser popup alerts when active')}</span>
                </div>
                <ToggleSwitch
                  checked={generalSettings.enable_desktop}
                  onChange={(v) => setGeneralSettings((p) => ({ ...p, enable_desktop: v }))}
                />
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div>
                  <span className="font-semibold text-foreground block text-xs">{t('Enable Sound', 'Enable Sound')}</span>
                  <span className="text-[11px] text-muted-foreground">{t('Play audio chime sound on incoming notification alert', 'Play audio chime sound on incoming notification alert')}</span>
                </div>
                <ToggleSwitch
                  checked={generalSettings.enable_sound}
                  onChange={(v) => setGeneralSettings((p) => ({ ...p, enable_sound: v }))}
                />
              </div>

              {/* Language + Priority — two clean inline selector blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                {/* Language Card */}
                <div className="rounded-xl border border-border/70 bg-muted/20 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-1.5 px-3.5 pt-2.5 pb-1">
                    <Globe className="w-3 h-3 text-muted-foreground/60" />
                    <label className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      {t('Notification Language', 'Notification Language')}
                    </label>
                  </div>
                  <LanguageDropdown
                    value={generalSettings.language}
                    onChange={handleLanguageChange}
                  />
                </div>

                {/* Priority Card */}
                <div className="rounded-xl border border-border/70 bg-muted/20 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-1.5 px-3.5 pt-2.5 pb-1">
                    <AlertCircle className="w-3 h-3 text-muted-foreground/60" />
                    <label className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      {t('Default Priority', 'Default Priority')}
                    </label>
                  </div>
                  <PriorityDropdown
                    value={generalSettings.default_priority}
                    onChange={(v) => setGeneralSettings((p) => ({ ...p, default_priority: v }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Notification Channels */}
          <div className="bg-card border border-border/70 rounded-[18px] p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
              <Send className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {t('Notification Channels', 'Notification Channels')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: 'email', title: t('Email', 'Email'), icon: Mail, desc: t('SMTP Transactional Emails', 'SMTP Transactional Emails') },
                { key: 'push', title: t('Push Notification', 'Push Notification'), icon: Smartphone, desc: t('Firebase FCM Push', 'Firebase FCM Push') },
                { key: 'sms', title: t('SMS', 'SMS'), icon: MessageSquare, desc: t('Twilio Cellular SMS', 'Twilio Cellular SMS') },
                { key: 'telegram', title: t('Telegram', 'Telegram'), icon: Send, desc: t('Telegram Bot API', 'Telegram Bot API') },
                { key: 'whatsapp', title: t('WhatsApp', 'WhatsApp'), icon: Globe, desc: t('WhatsApp Business API', 'WhatsApp Business API') },
                { key: 'slack', title: t('Slack', 'Slack'), icon: MessageSquare, desc: t('Slack Webhook Bot', 'Slack Webhook Bot') },
                { key: 'teams', title: t('Microsoft Teams', 'Microsoft Teams'), icon: Server, desc: t('Teams Webhook Automation', 'Teams Webhook Automation') },
              ].map((ch) => {
                const Icon = ch.icon
                const isEnabled = Boolean((channels as any)[ch.key])
                return (
                  <div
                    key={ch.key}
                    className="flex items-center justify-between p-3.5 rounded-[14px] bg-muted/20 border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground block">{ch.title}</span>
                        <span className="text-[10px] text-muted-foreground">{ch.desc}</span>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={isEnabled}
                      onChange={(v) => setChannels((prev) => ({ ...prev, [ch.key]: v }))}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* SECTION 3: Event Notifications (Checklist) */}
          <div className="bg-card border border-border/70 rounded-[18px] p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  {t('Event Notifications', 'Event Notifications')}
                </h2>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {Object.values(events).filter(Boolean).length} / {eventList.length} {t('Active', 'Active')}
              </span>
            </div>

            <div className="divide-y divide-border/60 text-xs">
              {eventList.map((evt) => {
                const Icon = evt.icon
                const isChecked = events[evt.id] ?? true
                return (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between py-3 hover:bg-muted/20 px-1.5 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${evt.iconBg} ${evt.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground block">{evt.name}</span>
                        <span className="text-[11px] text-muted-foreground">{evt.desc}</span>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={isChecked}
                      onChange={(v) => setEvents((prev) => ({ ...prev, [evt.id]: v }))}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* SECTION 4: Quiet Hours */}
          <div className="bg-card border border-border/70 rounded-[18px] p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
              <Clock className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {t('Quiet Hours Schedule', 'Quiet Hours Schedule')}
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-border/60">
                <div>
                  <span className="font-semibold text-foreground block text-xs">{t('Enable Quiet Hours', 'Enable Quiet Hours')}</span>
                  <span className="text-[11px] text-muted-foreground">{t('Mute audio chimes and non-critical push notifications during schedule', 'Mute audio chimes and non-critical push notifications during schedule')}</span>
                </div>
                <ToggleSwitch
                  checked={quietHours.enabled}
                  onChange={(v) => setQuietHours((p) => ({ ...p, enabled: v }))}
                />
              </div>

              {quietHours.enabled && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                  <div>
                    <EnterpriseTimePicker
                      label={t('Start Time', 'Start Time')}
                      value={quietHours.start_time}
                      onChange={(val) => setQuietHours((p) => ({ ...p, start_time: val || '22:00' }))}
                    />
                  </div>

                  <div>
                    <EnterpriseTimePicker
                      label={t('End Time', 'End Time')}
                      value={quietHours.end_time}
                      onChange={(val) => setQuietHours((p) => ({ ...p, end_time: val || '07:00' }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-xs text-foreground block">{t('Timezone', 'Timezone')}</label>
                    <SimpleDropdown
                      value={quietHours.timezone}
                      onChange={(v) => setQuietHours((p) => ({ ...p, timezone: v }))}
                      options={[
                        { value: 'Asia/Phnom_Penh', label: '(GMT+7) Phnom Penh' },
                        { value: 'Asia/Bangkok', label: '(GMT+7) Bangkok' },
                        { value: 'Asia/Ho_Chi_Minh', label: '(GMT+7) Ho Chi Minh' },
                        { value: 'Asia/Shanghai', label: '(GMT+8) Beijing / Shanghai' },
                        { value: 'UTC', label: '(UTC) Coordinated Universal Time' },
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-xs text-foreground block">{t('Repeat Schedule', 'Repeat Schedule')}</label>
                    <SimpleDropdown
                      value={quietHours.repeat}
                      onChange={(v) => setQuietHours((p) => ({ ...p, repeat: v }))}
                      options={[
                        { value: 'everyday', label: t('Everyday', 'Everyday') },
                        { value: 'weekdays', label: t('Weekdays', 'Weekdays (Mon-Fri)') },
                        { value: 'weekend', label: t('Weekend', 'Weekend (Sat-Sun)') },
                      ]}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* SECTION 5: Email Preferences */}
          <div className="bg-card border border-border/70 rounded-[18px] p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
              <Mail className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {t('Email Preferences', 'Email Preferences')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: 'daily_summary', title: t('Daily Summary', 'Daily Summary Digest'), desc: t('Daily Summary Desc', 'Receive morning email summary of yesterday operations') },
                { key: 'weekly_report', title: t('Weekly Report', 'Weekly Executive Report'), desc: t('Weekly Report Desc', 'Weekly sales, inventory & financial analytics PDF') },
                { key: 'monthly_report', title: t('Monthly Report', 'Monthly Finance Audit'), desc: t('Monthly Report Desc', 'End of month P&L statement & balance breakdown') },
                { key: 'marketing_email', title: t('Marketing Email', 'Marketing & Product Updates'), desc: t('Marketing Email Desc', 'Platform feature announcements & promotional tips') },
                { key: 'security_alert', title: t('Security Alert', 'Security & Login Alerts'), desc: t('Security Alert Desc', 'Immediate email on new IP login or password change') },
                { key: 'critical_alert', title: t('Critical Alert', 'Critical System Failure Alert'), desc: t('Critical Alert Desc', 'Urgent email when database or API service experiences outage') },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3.5 rounded-[14px] bg-muted/20 border border-border/50 hover:border-border transition-colors"
                >
                  <div>
                    <span className="font-semibold text-foreground block">{item.title}</span>
                    <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                  </div>
                  <ToggleSwitch
                    checked={Boolean((emailPrefs as any)[item.key])}
                    onChange={(v) => setEmailPrefs((p) => ({ ...p, [item.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview Card & Activity Summary (30% = 3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Live Alert Preview Card (Phone Mockup) */}
          <div className="bg-card border border-border/70 rounded-[18px] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-primary" />
                {t('Live Alert Preview', 'Live Alert Preview')}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {t('Real-time', 'Real-time')}
              </span>
            </div>

            {/* Preview Selector Segment */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/50 rounded-[12px]">
              <button
                type="button"
                onClick={() => setPreviewSample('new_tenant')}
                className={`py-1 text-[11px] font-semibold rounded-[8px] transition-colors ${previewSample === 'new_tenant' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground'}`}
              >
                {t('New Tenant', 'New Tenant')}
              </button>
              <button
                type="button"
                onClick={() => setPreviewSample('subscription_renewed')}
                className={`py-1 text-[11px] font-semibold rounded-[8px] transition-colors ${previewSample === 'subscription_renewed' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground'}`}
              >
                {t('Subscription', 'Subscription')}
              </button>
              <button
                type="button"
                onClick={() => setPreviewSample('security_alert')}
                className={`py-1 text-[11px] font-semibold rounded-[8px] transition-colors ${previewSample === 'security_alert' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground'}`}
              >
                {t('Security', 'Security')}
              </button>
            </div>

            {/* Phone Screen Mockup */}
            <div className="relative mx-auto w-full max-w-[280px] bg-slate-900 dark:bg-slate-950 rounded-[32px] p-3.5 shadow-xl border-4 border-slate-800">
              <div className="w-16 h-3 bg-slate-800 rounded-b-xl mx-auto mb-3 flex items-center justify-center">
                <div className="w-3 h-1 bg-slate-700 rounded-full" />
              </div>

              <AnimatePresence mode="wait">
                {previewSample === 'new_tenant' && (
                  <motion.div
                    key="new_tenant"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="bg-card/95 backdrop-blur-md rounded-[16px] p-3.5 shadow-md border border-indigo-500/30 text-left space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 bg-indigo-500/20 text-indigo-600 rounded-md">
                          <Building2 size={13} />
                        </div>
                        <span className="text-[11px] font-bold text-foreground">{t('New Tenant Registered', 'New Tenant Registered')}</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground">{t('Just now', 'Just now')}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      <strong>{t('KH Coffee Shop', 'KH Coffee Shop')}</strong> {t('has completed onboarding. Plan:', 'has completed onboarding. Plan:')} <strong>{t('Business Pro', 'Business Pro')}</strong>. {t('Region: Phnom Penh.', 'Region: Phnom Penh.')}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-primary font-semibold pt-1 border-t border-border/40">
                      <span>{t('View Tenant', 'View Tenant')}</span>
                      <ChevronRight size={10} />
                    </div>
                  </motion.div>
                )}

                {previewSample === 'subscription_renewed' && (
                  <motion.div
                    key="subscription_renewed"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="bg-card/95 backdrop-blur-md rounded-[16px] p-3.5 shadow-md border border-emerald-500/30 text-left space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 bg-emerald-500/20 text-emerald-600 rounded-md">
                          <RefreshCcw size={13} />
                        </div>
                        <span className="text-[11px] font-bold text-foreground">{t('Subscription Renewed', 'Subscription Renewed')}</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground">{t('5 min ago', '5 min ago')}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      <strong>{t('Sok Dara Restaurant', 'Sok Dara Restaurant')}</strong> {t('renewed', 'renewed')} <strong>{t('Business Pro', 'Business Pro')}</strong> {t('plan — $49/mo. Valid until Dec 2025.', 'plan — $49/mo. Valid until Dec 2025.')}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-primary font-semibold pt-1 border-t border-border/40">
                      <span>{t('View Invoice', 'View Invoice')}</span>
                      <ChevronRight size={10} />
                    </div>
                  </motion.div>
                )}

                {previewSample === 'security_alert' && (
                  <motion.div
                    key="security_alert"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="bg-card/95 backdrop-blur-md rounded-[16px] p-3.5 shadow-md border border-red-500/30 text-left space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 bg-red-500/20 text-red-600 rounded-md">
                          <Shield size={13} />
                        </div>
                        <span className="text-[11px] font-bold text-foreground">{t('Security Alert: New IP', 'Security Alert: New IP')}</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground">{t('10 min ago', '10 min ago')}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      {t('Successful Admin login detected from new IP Address', 'Successful Admin login detected from new IP Address')} <strong>192.168.1.105</strong> {t('(Phnom Penh Branch).', '(Phnom Penh Branch).')}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-primary font-semibold pt-1 border-t border-border/40">
                      <span>{t('Verify Session', 'Verify Session')}</span>
                      <ChevronRight size={10} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-16 h-1 bg-slate-700 rounded-full mx-auto mt-4 mb-0.5" />
            </div>
          </div>

          {/* Activity Summary Card */}
          <div className="bg-card border border-border/70 rounded-[18px] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-primary" />
                {t('Today Activity Summary', 'Today Activity Summary')}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">24h</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-muted/20 border border-border/50 rounded-[14px]">
                <span className="text-[10px] font-medium text-muted-foreground block">{t('Delivered', 'Delivered')}</span>
                <span className="text-base font-bold text-emerald-600">30</span>
              </div>

              <div className="p-3 bg-muted/20 border border-border/50 rounded-[14px]">
                <span className="text-[10px] font-medium text-muted-foreground block">{t('Pending', 'Pending')}</span>
                <span className="text-base font-bold text-amber-600">2</span>
              </div>

              <div className="p-3 bg-muted/20 border border-border/50 rounded-[14px]">
                <span className="text-[10px] font-medium text-muted-foreground block">{t('Failed', 'Failed')}</span>
                <span className="text-base font-bold text-rose-600">0</span>
              </div>

              <div className="p-3 bg-muted/20 border border-border/50 rounded-[14px]">
                <span className="text-[10px] font-medium text-muted-foreground block">{t('Total Today', 'Total Today')}</span>
                <span className="text-base font-bold text-foreground">32</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border/80 px-6 py-3.5 shadow-lg transition-all duration-300">

        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{t('System preferences auto-validated. Changes ready to apply.', 'System preferences auto-validated. Changes ready to apply.')}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleTestNotification}
              disabled={testingChannel}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-[14px] hover:bg-primary hover:text-white transition-all cursor-pointer disabled:opacity-50"
            >
              {testingChannel ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{t('Test Notification', 'Test Notification')}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-muted-foreground border border-border/80 rounded-[14px] hover:bg-muted transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('Reset', 'Reset')}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-primary rounded-[14px] hover:opacity-90 transition-opacity shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? t('Saving...', 'Saving...') : t('Save Changes', 'Save Changes')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationSettingsPage
