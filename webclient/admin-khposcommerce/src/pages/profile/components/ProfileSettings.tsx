import React, { useState, useRef, useEffect } from 'react'
import { 
  Globe, Clock, Sun, Moon, Bell, CheckSquare, Square, Save, 
  ChevronDown, Check, Monitor, Sliders, Palette, ExternalLink, Sparkles, 
  MapPin, CheckCircle2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/stores/themeStore'
import { useTranslation } from 'react-i18next'
import { sound } from '@/utils/sound'

interface ProfileSettingsProps {
  timezone: string
  setTimezone: (tz: string) => void
  emailNotify: boolean
  setEmailNotify: (v: boolean) => void
  pushNotify: boolean
  setPushNotify: (v: boolean) => void
  smsNotify: boolean
  setSmsNotify: (v: boolean) => void
  onSave: () => void
  isSaving: boolean
}

const LANGUAGES = [
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', flagUrl: 'https://flagcdn.com/w40/kh.png' },
  { code: 'en', name: 'English', nativeName: 'English', flagUrl: 'https://flagcdn.com/w40/us.png' },
] as const

const TIMEZONES = [
  { value: 'Asia/Phnom_Penh', country: 'កម្ពុជា (Cambodia)', label: 'Asia/Phnom Penh (GMT+7)', flag: '🇰🇭' },
  { value: 'Asia/Bangkok', country: 'ថៃ (Thailand)', label: 'Asia/Bangkok (GMT+7)', flag: '🇹🇭' },
  { value: 'Asia/Ho_Chi_Minh', country: 'វៀតណាម (Vietnam)', label: 'Asia/Ho Chi Minh (GMT+7)', flag: '🇻🇳' },
  { value: 'Asia/Vientiane', country: 'ឡាវ (Laos)', label: 'Asia/Vientiane (GMT+7)', flag: '🇱🇦' },
  { value: 'Asia/Singapore', country: 'សិង្ហបុរី (Singapore)', label: 'Asia/Singapore (GMT+8)', flag: '🇸🇬' },
  { value: 'Asia/Kuala_Lumpur', country: 'ម៉ាឡេស៊ី (Malaysia)', label: 'Asia/Kuala Lumpur (GMT+8)', flag: '🇲🇾' },
  { value: 'Asia/Jakarta', country: 'ឥណ្ឌូនេស៊ី (Indonesia)', label: 'Asia/Jakarta (GMT+7)', flag: '🇮🇩' },
  { value: 'Asia/Manila', country: 'ហ្វីលីពីន (Philippines)', label: 'Asia/Manila (GMT+8)', flag: '🇵🇭' },
  { value: 'Asia/Shanghai', country: 'ចិន (China)', label: 'Asia/Shanghai (GMT+8)', flag: '🇨🇳' },
  { value: 'Asia/Hong_Kong', country: 'ហុងកុង (Hong Kong)', label: 'Asia/Hong Kong (GMT+8)', flag: '🇭🇰' },
  { value: 'Asia/Tokyo', country: 'ជប៉ុន (Japan)', label: 'Asia/Tokyo (GMT+9)', flag: '🇯🇵' },
  { value: 'Asia/Seoul', country: 'កូរ៉េខាងត្បូង (South Korea)', label: 'Asia/Seoul (GMT+9)', flag: '🇰🇷' },
  { value: 'Australia/Sydney', country: 'អូស្ត្រាលី (Australia)', label: 'Australia/Sydney (AEST)', flag: '🇦🇺' },
  { value: 'Europe/London', country: 'ចក្រភពអង់គ្លេស (United Kingdom)', label: 'Europe/London (GMT/BST)', flag: '🇬🇧' },
  { value: 'Europe/Paris', country: 'បារាំង / អឺរ៉ុប (France/EU)', label: 'Europe/Paris (CET/CEST)', flag: '🇫🇷' },
  { value: 'America/New_York', country: 'សហរដ្ឋអាមេរិក (USA - East)', label: 'America/New York (EST/EDT)', flag: '🇺🇸' },
  { value: 'America/Los_Angeles', country: 'សហរដ្ឋអាមេរិក (USA - West)', label: 'America/Los Angeles (PST/PDT)', flag: '🇺🇸' },
  { value: 'UTC', country: 'ម៉ោងសកល (Global UTC)', label: 'UTC (Coordinated Universal Time)', flag: '🌐' },
]

const ACCENT_PRESETS = [
  { key: 'emerald', defaultName: 'Emerald Green', color: '#10b981' },
  { key: 'sapphire', defaultName: 'Sapphire Blue', color: '#2563eb' },
  { key: 'indigo', defaultName: 'Indigo Blue', color: '#6366f1' },
  { key: 'amethyst', defaultName: 'Amethyst Violet', color: '#8b5cf6' },
  { key: 'rose', defaultName: 'Rose Pink', color: '#ec4899' },
  { key: 'amber', defaultName: 'Amber Gold', color: '#f59e0b' },
  { key: 'teal', defaultName: 'Teal Blue', color: '#14b8a6' },
  { key: 'crimson', defaultName: 'Crimson Red', color: '#e11d48' },
]

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  timezone,
  setTimezone,
  emailNotify,
  setEmailNotify,
  pushNotify,
  setPushNotify,
  smsNotify,
  setSmsNotify,
  onSave,
  isSaving,
}) => {
  const { t, i18n } = useTranslation(['profile', 'common', 'settings'])
  const navigate = useNavigate()
  const { 
    themeMode, updateThemeMode, 
    language, setLanguage, 
    primaryColor, updatePrimaryColor,
  } = useThemeStore()

  const [langOpen, setLangOpen] = useState(false)
  const [tzOpen, setTzOpen] = useState(false)
  const [now, setNow] = useState(new Date())

  const langRef = useRef<HTMLDivElement>(null)
  const tzRef = useRef<HTMLDivElement>(null)

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
      if (tzRef.current && !tzRef.current.contains(e.target as Node)) {
        setTzOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Detected device timezone
  const detectedDeviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Phnom_Penh'
  const isMatchedWithDevice = (timezone || 'Asia/Phnom_Penh') === detectedDeviceTz

  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0]
  const currentTz = TIMEZONES.find((t) => t.value === timezone) ?? {
    value: timezone || 'Asia/Phnom_Penh',
    country: 'Custom Location',
    label: `${timezone || 'Asia/Phnom_Penh'} (Custom)`,
    flag: '📍',
  }

  const detectedTzItem = TIMEZONES.find((t) => t.value === detectedDeviceTz) ?? {
    value: detectedDeviceTz,
    country: detectedDeviceTz,
    label: detectedDeviceTz,
    flag: '📍',
  }

  const formatTzTime = (tzValue: string) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        timeZone: tzValue,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(now)
    } catch {
      return now.toLocaleTimeString()
    }
  }

  const handleApplyDetectedTz = () => {
    setTimezone(detectedDeviceTz)
    sound.playSuccess()
  }

  const getThemeModeLabel = (mode: string) => {
    const lang = i18n.language || language || 'km'
    if (lang === 'km') {
      if (mode === 'light') return 'ទម្រង់ពន្លឺ (Light)'
      if (mode === 'dark') return 'ទម្រង់ងងឹត (Dark)'
      return 'ស្វ័យប្រវត្តិ (System)'
    }
    if (lang === 'zh') {
      if (mode === 'light') return '浅色模式'
      if (mode === 'dark') return '深色模式'
      return '跟随系统'
    }
    if (lang === 'th') {
      if (mode === 'light') return 'โหมดสว่าง'
      if (mode === 'dark') return 'โหมดมืด'
      return 'ตามระบบ'
    }
    if (lang === 'vi') {
      if (mode === 'light') return 'Chế độ sáng'
      if (mode === 'dark') return 'Chế độ tối'
      return 'Theo hệ thống'
    }
    if (mode === 'light') return 'Light Mode'
    if (mode === 'dark') return 'Dark Mode'
    return 'System Default'
  }

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/50">
        <div>
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Sliders size={18} className="text-primary" />
            <span>{t('settings_tab.ui_title', 'General UI & System Preferences')}</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('settings_tab.subtitle', 'Customize system language, primary accent color, visual theme, and notification channels.')}
          </p>
        </div>

        {/* Shortcut to full System Settings */}
        <button
          type="button"
          onClick={() => navigate('/settings?tab=appearance')}
          className="flex items-center gap-2 px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-extrabold rounded-2xl transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <Sparkles size={14} />
          <span>{t('settings_tab.full_appearance_btn', 'Full Appearance Studio')}</span>
          <ExternalLink size={12} />
        </button>
      </div>

      {/* ── AUTO DETECTED DEVICE LOCATION BANNER ───────────────────────────── */}
      <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <MapPin size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-foreground">
                {t('settings_tab.detected_location', 'Your Current Location')}:
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-extrabold bg-primary/15 text-primary rounded-md border border-primary/25">
                <span>{detectedTzItem.flag}</span>
                <span>{detectedTzItem.country}</span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
              <span>{detectedDeviceTz}</span>
              <span>•</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {formatTzTime(detectedDeviceTz)}
              </span>
            </p>
          </div>
        </div>

        <div>
          {isMatchedWithDevice ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold rounded-xl border border-emerald-500/20 shadow-2xs">
              <CheckCircle2 size={14} />
              <span>{t('settings_tab.detected_badge', 'Matched with location')}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleApplyDetectedTz}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <MapPin size={13} />
              <span>{t('settings_tab.use_detected', 'Sync to Current Location')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── SECTION 1: LANGUAGE & TIMEZONE ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pb-6 border-b border-border/50">
        {/* Preferred Language */}
        <div className="space-y-2 relative" ref={langRef}>
          <label className="flex items-center gap-2 text-xs font-extrabold text-foreground uppercase tracking-wider">
            <Globe size={14} className="text-primary" />
            <span>{t('settings_tab.language', 'Preferred Language')}</span>
          </label>
          <button
            type="button"
            onClick={() => {
              setLangOpen(!langOpen)
              setTzOpen(false)
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border border-border bg-background text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={currentLang.flagUrl}
                alt={currentLang.name}
                className="w-5 h-3.5 object-cover rounded-sm shadow-xs border border-foreground/10 flex-shrink-0"
              />
              <span>{currentLang.nativeName} ({currentLang.name})</span>
            </div>
            <ChevronDown size={15} className={`text-muted-foreground transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          {langOpen && (
            <div className="absolute left-0 mt-1 w-full bg-card border border-border rounded-2xl shadow-xl z-50 p-1.5 backdrop-blur-md max-h-60 overflow-y-auto">
              {LANGUAGES.map((lang) => {
                const isSelected = lang.code === language
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code as any)
                      sound.playSuccess()
                      setLangOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left mb-0.5 last:mb-0 cursor-pointer
                      ${
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={lang.flagUrl}
                        alt={lang.name}
                        className="w-5 h-3.5 object-cover rounded-sm shadow-xs border border-foreground/10 flex-shrink-0"
                      />
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] text-muted-foreground/70">({lang.name})</span>
                    </div>
                    {isSelected && <Check size={14} className="text-primary flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Timezone Configuration with Live Clock */}
        <div className="space-y-2 relative" ref={tzRef}>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-extrabold text-foreground uppercase tracking-wider">
              <Clock size={14} className="text-primary" />
              <span>{t('settings_tab.timezone', 'Timezone Configuration')}</span>
            </label>

            <button
              type="button"
              onClick={handleApplyDetectedTz}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
            >
              <MapPin size={12} />
              <span>{t('settings_tab.auto_detect_tz', 'Auto-detect Location')}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setTzOpen(!tzOpen)
              setLangOpen(false)
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border border-border bg-background text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">{currentTz.flag}</span>
              <span className="truncate">{currentTz.country} • {currentTz.value}</span>
              <span className="shrink-0 px-2 py-0.5 text-[10px] font-mono font-bold bg-primary/10 text-primary rounded-lg border border-primary/20">
                {formatTzTime(timezone || 'Asia/Phnom_Penh')}
              </span>
            </div>
            <ChevronDown size={15} className={`text-muted-foreground transition-transform duration-200 shrink-0 ml-2 ${tzOpen ? 'rotate-180' : ''}`} />
          </button>

          {tzOpen && (
            <div className="absolute left-0 mt-1 w-full bg-card border border-border rounded-2xl shadow-xl z-50 p-1.5 backdrop-blur-md max-h-72 overflow-y-auto">
              {TIMEZONES.map((tz) => {
                const isSelected = tz.value === timezone
                return (
                  <button
                    key={tz.value}
                    type="button"
                    onClick={() => {
                      setTimezone(tz.value)
                      setTzOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left mb-0.5 last:mb-0 cursor-pointer
                      ${
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-base shrink-0">{tz.flag}</span>
                      <div className="truncate">
                        <p className="truncate text-xs font-bold text-foreground">{tz.country}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{tz.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[11px] font-bold text-muted-foreground/80">{formatTzTime(tz.value)}</span>
                      {isSelected && <Check size={14} className="text-primary" />}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 2: PRIMARY THEME COLOR & APPEARANCE ─────────────────────── */}
      <div className="space-y-4 pb-6 border-b border-border/50">
        <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Palette size={14} className="text-primary" />
          <span>{t('settings_tab.primary_color_title', 'Primary Accent Color')}</span>
        </label>
        
        {/* Accent Color Swatches synced to themeStore */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {ACCENT_PRESETS.map((p) => {
            const isSel = (primaryColor || '#10b981').toLowerCase() === p.color.toLowerCase()
            const localizedName = t(`settings_tab.accents.${p.key}`, p.defaultName)
            return (
              <button
                key={p.color}
                type="button"
                onClick={() => {
                  updatePrimaryColor(p.color)
                  sound.playClick()
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSel
                    ? 'border-primary ring-2 ring-primary/20 bg-card shadow-xs'
                    : 'border-border/80 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0" style={{ backgroundColor: p.color }} />
                <span>{localizedName}</span>
                {isSel && <Check size={12} className="text-primary" />}
              </button>
            )
          })}
        </div>

        {/* Theme Mode Selector */}
        <div className="pt-2">
          <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
            {themeMode === 'light' ? <Sun size={14} className="text-amber-500" /> : themeMode === 'dark' ? <Moon size={14} className="text-primary" /> : <Monitor size={14} className="text-blue-500" />}
            <span>{t('settings_tab.theme_title', 'Interface Visual Theme')}</span>
          </label>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { id: 'light', icon: Sun },
              { id: 'dark', icon: Moon },
              { id: 'system', icon: Monitor },
            ].map((mode) => {
              const Icon = mode.icon
              const isSelected = themeMode === mode.id
              const label = getThemeModeLabel(mode.id)
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    updateThemeMode(mode.id as any)
                    sound.playClick()
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Icon size={16} className="mb-1" />
                  <span className="truncate text-[11px]">{label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: NOTIFICATIONS PREFERENCES ───────────────────────────── */}
      <div className="space-y-4">
        <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Bell size={14} className="text-primary" />
          <span>{t('settings_tab.notify_title', 'Notification Subscriptions')}</span>
        </label>

        <div className="space-y-3">
          {/* Email Notify */}
          <div
            onClick={() => setEmailNotify(!emailNotify)}
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/20 hover:bg-muted/40 border border-border/60 cursor-pointer transition-colors"
          >
            <div className="mt-0.5 text-primary">
              {emailNotify ? <CheckSquare size={18} /> : <Square size={18} className="text-muted-foreground" />}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">{t('settings_tab.notify_email_label', 'Email Notifications')}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t('settings_tab.notify_email_desc', 'Receive logs, reports, and critical invoices directly in your inbox.')}</p>
            </div>
          </div>

          {/* Push Notify */}
          <div
            onClick={() => setPushNotify(!pushNotify)}
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/20 hover:bg-muted/40 border border-border/60 cursor-pointer transition-colors"
          >
            <div className="mt-0.5 text-primary">
              {pushNotify ? <CheckSquare size={18} /> : <Square size={18} className="text-muted-foreground" />}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">{t('settings_tab.notify_push_label', 'Browser Push Alerts')}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t('settings_tab.notify_push_desc', 'Receive browser push alerts for live low-stock warnings and sales orders.')}</p>
            </div>
          </div>

          {/* SMS Notify */}
          <div
            onClick={() => setSmsNotify(!smsNotify)}
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/20 hover:bg-muted/40 border border-border/60 cursor-pointer transition-colors"
          >
            <div className="mt-0.5 text-primary">
              {smsNotify ? <CheckSquare size={18} /> : <Square size={18} className="text-muted-foreground" />}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">{t('settings_tab.notify_sms_label', 'SMS Transaction Alerts')}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t('settings_tab.notify_sms_desc', 'Receive critical security codes and high-value cashier register updates on your mobile device.')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-border/50 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold rounded-2xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
        >
          <Save size={15} />
          <span>{isSaving ? t('settings_tab.saving', 'Saving...') : t('settings_tab.save_prefs', 'Save Preferences')}</span>
        </button>
      </div>
    </div>
  )
}

export default ProfileSettings
