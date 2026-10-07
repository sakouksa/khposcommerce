import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Save,
  CheckCircle,
  Loader2,
  Palette,
  Mail,
  Phone,
  Building2,
  Check,
  Sparkles,
  Upload,
  Camera,
  QrCode,
  Layers,
  Bot,
  Eye,
  EyeOff,
  Server,
  AlertTriangle,
  Sliders,
  DollarSign,
  Clock,
  Trash2,
  ShieldCheck,
  MessageSquare
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { settingsService } from '@/services/settingsService'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/useToast'
import { useCompanyStore } from '@/stores/companyStore'
import BrandLogo from '@/components/common/BrandLogo'
import AppearanceSettings from './AppearanceSettings'
import BakongSettings from './BakongSettings'
import { usePageTab } from '@/hooks/usePageTab'
import { usePermission } from '@/hooks/usePermission'

interface SettingItem {
  id: number
  key: string
  value: string
  type?: string
}

type MainTab = 'store' | 'payments' | 'appearance'

const SettingsPage: React.FC = () => {
  const { t } = useTranslation(['settings', 'common'])
  const toast = useToast()
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const { hasPermission } = usePermission()

  const canUpdateSetting = hasPermission(['setting.update', 'setting.manage'])

  const [activeTab, setActiveTabRaw] = usePageTab<MainTab>({
    storageKey: 'settings_active_tab',
    defaultTab: 'store',
    validTabs: ['store', 'payments', 'appearance'],
  })

  const setActiveTab = (tab: MainTab) => {
    setActiveTabRaw(tab)
    setSearchParams(prev => {
      const updated = new URLSearchParams(prev)
      updated.set('tab', tab)
      return updated
    }, { replace: true })
  }

  const { branding, fetchBranding, updateBranding } = useCompanyStore()

  // Form State
  const [success, setSuccess] = useState(false)
  const [siteName, setSiteName] = useState('')
  const [siteEmail, setSiteEmail] = useState('')
  const [sitePhone, setSitePhone] = useState('')
  const [siteLogo, setSiteLogo] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [timezone, setTimezone] = useState('Asia/Phnom_Penh')

  // SaaS Operations & System Settings
  const [freeTrialDays, setFreeTrialDays] = useState('14')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('ប្រព័ន្ធកំពុងដំណើរការថែទាំ និងអាប់ដេតមុខងារថ្មី។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។')
  const [telegramBotToken, setTelegramBotToken] = useState('')
  const [telegramChatId, setTelegramChatId] = useState('')
  const [showBotToken, setShowBotToken] = useState(false)

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const isInitialized = useRef(false)

  // Load Settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
    enabled: activeTab === 'store',
  })

  useEffect(() => {
    fetchBranding()
  }, [fetchBranding])

  useEffect(() => {
    if (settingsData && !isInitialized.current) {
      const getVal = (key: string) => settingsData.find((s: SettingItem) => s.key === key)?.value ?? ''
      setSiteName(getVal('site_name') || branding.brand_name || 'NexTech Cambodia')
      setSiteEmail(getVal('site_email') || branding.email || 'info@nextech-cambodia.com')
      setSitePhone(getVal('site_phone') || '071 888 999')
      setSiteLogo(getVal('site_logo') || branding.logo || '/logo.svg')
      setCurrency(getVal('currency') || 'USD')
      setTimezone(getVal('timezone') || 'Asia/Phnom_Penh')

      setFreeTrialDays(getVal('free_trial_days') || '14')
      setMaintenanceMode(getVal('maintenance_mode') === '1' || getVal('maintenance_mode') === 'true')
      if (getVal('maintenance_message')) {
        setMaintenanceMessage(getVal('maintenance_message'))
      }
      setTelegramBotToken(getVal('telegram_bot_token') || '')
      setTelegramChatId(getVal('telegram_chat_id') || '')

      isInitialized.current = true
    }
  }, [settingsData, branding])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('settings.logoTooLarge', 'Logo image file must be less than 10MB.'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)
      formData.append('company_id', '1')
      const res = await settingsService.uploadLogo(formData)
      if (res.data?.logo_url || res.logo_url) {
        const uploadedPath = res.data?.logo_url || res.logo_url
        setSiteLogo(uploadedPath)
        setLogoFile(null)
        updateBranding({
          logo: uploadedPath,
          brand_name: siteName,
        })
        qc.invalidateQueries({ queryKey: ['settings'] })
        qc.invalidateQueries({ queryKey: ['companies'] })
        toast.success(t('settings.logoUploadSuccess', 'Logo updated and saved successfully!'))
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('settings.logoUploadFail', 'Failed to upload logo.'))
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleRemoveLogo = async () => {
    setLogoFile(null)
    setLogoPreview(null)
    const fallbackLogo = '/logo.svg'
    setSiteLogo(fallbackLogo)
    if (fileInputRef.current) fileInputRef.current.value = ''
    updateBranding({ logo: fallbackLogo })
    try {
      const res = await settingsService.deleteLogo({ type: 'logo' })
      if (res.data?.logo_url || res.logo_url) {
        setSiteLogo(res.data?.logo_url || res.logo_url)
        updateBranding({ logo: res.data?.logo_url || res.logo_url })
      }
      qc.invalidateQueries({ queryKey: ['settings'] })
      qc.invalidateQueries({ queryKey: ['companies'] })
      fetchBranding(true)
      toast.success(t('settings.logoResetSuccess', 'Logo removed and reset to default!'))
    } catch {
      // ignore
    }
  }

  // Save Settings Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (payload: any) => settingsService.updateSettings(payload),
    onSuccess: () => {
      setSuccess(true)
      toast.success(t('settings.savedSuccess', 'Platform settings updated successfully!'))
      qc.invalidateQueries({ queryKey: ['settings'] })
      qc.invalidateQueries({ queryKey: ['companies'] })
      fetchBranding(true)
      setTimeout(() => setSuccess(false), 3000)
    },
    onError: () => {
      toast.error(t('settings.saveFail', 'Failed to save platform settings.'))
    }
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canUpdateSetting) {
      toast.error('Permission denied. You do not have permission to update settings.')
      return
    }

    updateSettingsMutation.mutate({
      company_id: 1,
      settings: {
        site_name: siteName,
        site_email: siteEmail,
        site_phone: sitePhone,
        site_logo: siteLogo,
        currency,
        timezone,
        free_trial_days: freeTrialDays,
        maintenance_mode: maintenanceMode ? '1' : '0',
        maintenance_message: maintenanceMessage,
        telegram_bot_token: telegramBotToken,
        telegram_chat_id: telegramChatId,
      }
    }, {
      onSuccess: () => {
        updateBranding({
          brand_name: siteName,
          company_name: siteName,
          email: siteEmail,
          logo: siteLogo,
        })
        fetchBranding(true)
      }
    })
  }

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* ── 1. PAGE HEADER ────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
            <span>{t('common.systemManagement', 'System Management')}</span>
            <span>/</span>
            <span className="text-foreground font-bold">{t('settings.globalSettingsTitle', 'Platform Settings')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            {t('settings.globalSettingsTitle', 'Platform Settings & System Preferences')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl mt-1 leading-relaxed">
            {t('settings.globalSettingsSub', 'Configure platform branding, SaaS operation preferences, Bakong KHQR payment gateway, and UI appearance.')}
          </p>
        </div>

        {/* Top Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 bg-muted/40 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-border/80 dark:border-slate-800 shrink-0 overflow-x-auto max-w-full shadow-xs">
          {[
            { id: 'store', label: t('settings.tabStoreProfile', 'Platform Profile'), icon: Sliders },
            { id: 'payments', label: t('settings.tabPayments', 'Bakong & ACLEDA Bank'), icon: QrCode },
            { id: 'appearance', label: t('settings.tabAppearance', 'Appearance'), icon: Palette },
          ].map((tItem) => {
            const Icon = tItem.icon
            const isActiveTab = activeTab === tItem.id
            return (
              <button
                key={tItem.id}
                onClick={() => setActiveTab(tItem.id as MainTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActiveTab
                    ? 'bg-card dark:bg-slate-800 text-primary dark:text-white shadow-sm border border-border/60 dark:border-slate-700'
                    : 'text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-100 hover:bg-muted/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon size={14} className={isActiveTab ? 'text-primary dark:text-white' : 'text-muted-foreground dark:text-slate-400'} />
                <span>{tItem.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 2. TAB CONTENT SECTION ───────────────────────────────────────── */}

      {/* TAB 1: PLATFORM PROFILE & SAAS OPERATIONS */}
      {activeTab === 'store' && (
        <div className="space-y-6">
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm"
            >
              <CheckCircle size={18} />
              {t('settings.savedSuccess', 'Platform settings and system preferences saved successfully!')}
            </motion.div>
          )}

          {settingsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="skeleton h-96 rounded-[24px]" />
              <div className="skeleton h-96 rounded-[24px]" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: PLATFORM BRANDING & IDENTITY */}
              <div className="lg:col-span-6 bg-card rounded-[24px] border border-border/80 p-6 shadow-lg space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-border/70">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">
                          {t('settings.storeProfileTitle', 'Platform Identity & Branding')}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t('settings.storeProfileSub', 'General branding, platform logo, and technical support contact information')}
                        </p>
                      </div>
                    </div>
                    <Sparkles className="text-primary/40" size={20} />
                  </div>

                  <div className="space-y-5">
                    {/* Logo Uploader Box */}
                    <div className="p-4 rounded-2xl bg-muted/40 dark:bg-slate-900/60 border border-border/80 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-foreground">
                            {t('settings.storeLogoLabel', 'Platform Logo / Brand Logo')}
                          </label>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {t('settings.storeLogoHint', 'Displayed on Header, Login page, and Super Admin Portal')}
                          </p>
                        </div>
                        {logoPreview || (siteLogo && siteLogo !== '/logo.svg') ? (
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-xs">
                            <Check size={12} className="stroke-[2.5]" /> {t('settings.logoActive', 'Active Logo')}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                        {/* Logo Preview */}
                        <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-muted/20 dark:bg-slate-900/40 border-2 border-dashed border-border/80 hover:border-primary/60 flex items-center justify-center p-2 shrink-0 shadow-xs overflow-hidden transition-all duration-200">
                          {isUploadingLogo ? (
                            <div className="flex flex-col items-center justify-center text-primary gap-1.5">
                              <Loader2 className="w-6 h-6 animate-spin" />
                              <span className="text-[10px] font-bold">Uploading...</span>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BrandLogo size="lg" customLogo={logoPreview || siteLogo} bordered={false} />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer text-[11px] font-bold gap-1"
                          >
                            <Camera className="w-4 h-4 text-primary" />
                            <span>{t('settings.changeLogo', 'Change Logo')}</span>
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                            onChange={handleFileChange}
                            className="hidden"
                          />

                          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                            <button
                              type="button"
                              disabled={isUploadingLogo}
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-95 active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {isUploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                              <span>{t('settings.uploadLogoBtn', 'Upload Logo')}</span>
                            </button>

                            {(logoPreview || (siteLogo && siteLogo !== '/logo.svg')) && (
                              <button
                                type="button"
                                disabled={isUploadingLogo}
                                onClick={handleRemoveLogo}
                                className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-500/20 disabled:opacity-50"
                              >
                                <Trash2 size={13} />
                                <span>{t('settings.removeLogoBtn', 'Remove')}</span>
                              </button>
                            )}
                          </div>

                          <p className="text-[11px] text-muted-foreground">
                            {t('settings.logoSupportedFormats', 'PNG, JPG, WebP, SVG (Max 10MB)')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Platform Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        {t('settings.siteNameLabel', 'Platform / System Name')}
                      </label>
                      <div className="relative">
                        <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          value={siteName}
                          onChange={(e) => setSiteName(e.target.value)}
                          required
                          placeholder="NexTech Cambodia"
                          className="form-input pl-10 text-sm font-medium"
                        />
                      </div>
                    </div>

                    {/* Support Email & Support Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {t('settings.supportEmailLabel', 'Technical Support Email')}
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="email"
                            value={siteEmail}
                            onChange={(e) => setSiteEmail(e.target.value)}
                            required
                            placeholder="info@nextech-cambodia.com"
                            className="form-input pl-10 text-sm font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {t('settings.supportPhoneLabel', 'Technical Support Hotline')}
                        </label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            value={sitePhone}
                            onChange={(e) => setSitePhone(e.target.value)}
                            placeholder="071 888 999"
                            className="form-input pl-10 text-sm font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Currency & Timezone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {t('settings.baseCurrencyLabel', 'SaaS Base Currency')}
                        </label>
                        <div className="relative">
                          <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="form-select pl-10 text-sm font-semibold"
                          >
                            <option value="USD">USD ($ - US Dollar)</option>
                            <option value="KHR">KHR (៛ - Cambodian Riel)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {t('settings.timezoneLabel', 'System Timezone')}
                        </label>
                        <div className="relative">
                          <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="form-select pl-10 text-sm font-semibold"
                          >
                            <option value="Asia/Phnom_Penh">Asia/Phnom_Penh (UTC+7)</option>
                            <option value="UTC">UTC (Coordinated Universal Time)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/70 flex items-center justify-between mt-6">
                  <span className="text-[11px] text-muted-foreground">
                    {t('settings.storeApplyHint', 'Changes apply across Platform Super Admin and tenant portals.')}
                  </span>
                  <button
                    type="submit"
                    disabled={!canUpdateSetting || updateSettingsMutation.isPending || isUploadingLogo}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {(updateSettingsMutation.isPending || isUploadingLogo) ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {t('settings.saveProfileBtn', 'Save Platform Settings')}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: SAAS OPERATIONS & SYSTEM PREFERENCES */}
              <div className="lg:col-span-6 space-y-6">
                {/* 1. SaaS Operations Card */}
                <div className="bg-card rounded-[24px] border border-border/80 p-6 shadow-lg space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-border/70">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                        <Layers size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">
                          {t('settings.platformOpsTitle', 'SaaS Operations & Maintenance')}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t('settings.platformOpsSub', 'Configure free trial duration, system maintenance mode, and admin alerts')}
                        </p>
                      </div>
                    </div>
                    <Server className="text-indigo-500/40" size={20} />
                  </div>

                  <div className="space-y-5">
                    {/* Free Trial Days */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {t('settings.freeTrialDaysLabel', 'Free Trial Duration (Days)')}
                        </label>
                        <span className="text-xs font-black text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                          {freeTrialDays} Days Free
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-2.5">
                        {t('settings.freeTrialDaysHint', 'Default free trial period granted to newly registered tenant stores')}
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {['7', '14', '30', '60'].map((d) => (
                          <button
                            type="button"
                            key={d}
                            onClick={() => setFreeTrialDays(d)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              freeTrialDays === d
                                ? 'bg-primary text-white border-primary shadow-xs'
                                : 'bg-muted/40 border-border/70 hover:bg-muted text-foreground'
                            }`}
                          >
                            {d} {t('common.days', 'Days')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Maintenance Mode Toggle */}
                    <div className="p-4 rounded-2xl bg-muted/40 dark:bg-slate-900/60 border border-border/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                              {t('settings.maintenanceModeLabel', 'Maintenance Mode')}
                            </span>
                            {maintenanceMode ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                <AlertTriangle size={10} /> Active
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <ShieldCheck size={10} /> System Live
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {t('settings.maintenanceModeHint', 'Temporarily pause tenant access while performing system updates or migrations')}
                          </p>
                        </div>

                        {/* Switch */}
                        <button
                          type="button"
                          onClick={() => setMaintenanceMode(!maintenanceMode)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            maintenanceMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {maintenanceMode && (
                        <div className="pt-2 border-t border-border/60 space-y-1.5 animate-in fade-in duration-200">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            {t('settings.maintenanceNoticeLabel', 'Maintenance Notice Message')}
                          </label>
                          <textarea
                            value={maintenanceMessage}
                            onChange={(e) => setMaintenanceMessage(e.target.value)}
                            rows={2}
                            placeholder="System is currently undergoing routine maintenance..."
                            className="form-textarea text-xs font-medium w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Telegram Alert Notifications Card */}
                <div className="bg-card rounded-[24px] border border-border/80 p-6 shadow-lg space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-border/70">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
                        <Bot size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">
                          {t('settings.telegramAlertTitle', 'Telegram Notifications (Admin Alert Bot)')}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t('settings.telegramAlertSub', 'Receive real-time alerts when new stores register or subscription invoices are paid')}
                        </p>
                      </div>
                    </div>
                    <MessageSquare className="text-sky-500/40" size={20} />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        {t('settings.telegramBotTokenLabel', 'Telegram Bot Token')}
                      </label>
                      <div className="relative">
                        <input
                          type={showBotToken ? 'text' : 'password'}
                          value={telegramBotToken}
                          onChange={(e) => setTelegramBotToken(e.target.value)}
                          placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                          className="form-input pr-10 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowBotToken(!showBotToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showBotToken ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        {t('settings.telegramChatIdLabel', 'Admin Telegram Chat ID')}
                      </label>
                      <input
                        type="text"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        placeholder="-1001234567890 or 987654321"
                        className="form-input text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: BAKONG & ACLEDA PAYMENTS */}
      {activeTab === 'payments' && <BakongSettings />}

      {/* TAB 3: APPEARANCE */}
      {activeTab === 'appearance' && <AppearanceSettings />}
    </div>
  )
}

export default SettingsPage
