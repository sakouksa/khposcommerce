import React, { useState, useRef, useEffect } from 'react'
import {
  Phone,
  Truck,
  ShieldCheck,
  Package,
  Globe,
  ChevronDown,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Search,
  Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSettingsStore, useLocationStore } from '@/stores'
import { useStoreSettings, useClickOutside } from '@/hooks'
import { cn } from '@/lib/utils'
import TrackOrderModal from '@/components/common/TrackOrderModal'
import WarrantyCheckModal from '@/components/common/WarrantyCheckModal'
import {
  FacebookAppIcon,
  TikTokAppIcon,
  InstagramAppIcon,
  TelegramAppIcon,
  YouTubeAppIcon,
} from '@/lib/socialIcons'

// ─── 1. Admin-Dashboard Style Language Dropdown ───────────────────────────
interface LanguageItem {
  code: 'km' | 'en' | 'th' | 'vi' | 'zh'
  name: string
  nativeName: string
  flagUrl: string
}

const LANGUAGES: LanguageItem[] = [
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', flagUrl: 'https://flagcdn.com/w40/kh.png' },
  { code: 'en', name: 'English', nativeName: 'English', flagUrl: 'https://flagcdn.com/w40/us.png' },
]

const TopLanguageDropdown: React.FC = () => {
  const { language, setLanguage } = useSettingsStore()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside(dropdownRef, () => setIsOpen(false))

  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0]

  const handleSelect = (code: LanguageItem['code']) => {
    setLanguage(code)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-xl transition-all duration-200 cursor-pointer select-none text-white"
        aria-label="Language Selector"
      >
        <img
          src={currentLang.flagUrl}
          alt={currentLang.name}
          className="w-5 h-3.5 object-cover rounded-sm shadow-sm border border-white/20 flex-shrink-0"
        />
        <span className="text-xs font-bold hidden sm:inline-block">
          {currentLang.nativeName}
        </span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 opacity-80 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-[70] p-1.5 backdrop-blur-md flex flex-col text-slate-900 dark:text-slate-100 select-none"
          >
            {/* 5-Language Direct Clean List */}
            <div className="space-y-0.5">
              {LANGUAGES.map((lang) => {
                const isSelected = lang.code === language
                return (
                  <button
                    type="button"
                    key={lang.code}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSelect(lang.code)
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer',
                      isSelected
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={lang.flagUrl}
                        alt={lang.name}
                        className="w-5 h-3.5 object-cover rounded-sm shadow-sm border border-slate-200 dark:border-slate-700 flex-shrink-0"
                      />
                      <span className="truncate">{lang.nativeName}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 ml-2" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── 2. Admin-Dashboard Style Theme Switcher (ពន្លឺ) ──────────────────────
const TopThemeDropdown: React.FC = () => {
  const { theme, setTheme } = useSettingsStore()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside(dropdownRef, () => setIsOpen(false))

  const modes = [
    { id: 'light', label: t('common.light', 'Light'), icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { id: 'dark', label: t('common.dark', 'Dark'), icon: <Moon className="w-4 h-4 text-blue-400" /> },
    { id: 'system', label: t('common.system', 'System'), icon: <Monitor className="w-4 h-4 text-emerald-400" /> },
  ] as const

  const activeMode = modes.find((m) => m.id === theme) ?? modes[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center opacity-90 hover:opacity-100 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200 cursor-pointer text-white"
        title={t('common.theme', 'Theme')}
        aria-label="Theme Switcher"
      >
        {activeMode.icon}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-[70] p-1 backdrop-blur-md text-slate-900 dark:text-slate-100 select-none"
          >
            {modes.map((mode) => {
              const isSelected = theme === mode.id
              return (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => {
                    setTheme(mode.id as any)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer',
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                  )}
                >
                  {mode.icon}
                  <span>{mode.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-auto flex-shrink-0" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── 3. Admin-Dashboard Style Currency Selector ───────────────────────────
const TopCurrencyDropdown: React.FC = () => {
  const { currency, setCurrency } = useSettingsStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside(dropdownRef, () => setIsOpen(false))

  const currencies = [
    { code: 'USD', label: '$ USD', name: 'US Dollar' },
    { code: 'KHR', label: '៛ KHR', name: 'Cambodian Riel' },
  ] as const

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-xl transition-all duration-200 cursor-pointer select-none text-white text-xs font-bold"
        title="Select Currency"
      >
        <span>{currency}</span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 opacity-80 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-[70] p-1 backdrop-blur-md flex flex-col text-slate-900 dark:text-slate-100 select-none"
          >
            {currencies.map((curr) => {
              const isSelected = currency === curr.code
              return (
                <button
                  type="button"
                  key={curr.code}
                  onClick={() => {
                    setCurrency(curr.code)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer',
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                  )}
                >
                  <div className="flex flex-col text-left">
                    <span className="font-bold leading-tight">{curr.label}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">({curr.name})</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-auto flex-shrink-0" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── 4. Main Top Utility Bar Component ─────────────────────────────────────
interface TopUtilityBarProps {
  announcement?: {
    message?: string
    code?: string
  }
}

export const TopUtilityBar: React.FC<TopUtilityBarProps> = ({ announcement }) => {
  const { t } = useTranslation()
  const { province, deliveryHeadline } = useLocationStore()
  const { data: storeSettings } = useStoreSettings()

  const [trackOpen, setTrackOpen] = useState(false)
  const [warrantyOpen, setWarrantyOpen] = useState(false)

  const hotlines = storeSettings?.hotlines && storeSettings.hotlines.length > 0
    ? storeSettings.hotlines
    : [storeSettings?.company_phone || '012 220 152']

  const rawSocials = (storeSettings?.socials || {}) as Record<string, string | undefined>
  const socials = {
    facebook: rawSocials.facebook || 'https://facebook.com',
    telegram: rawSocials.telegram || 'https://t.me',
    tiktok: rawSocials.tiktok || 'https://tiktok.com',
    instagram: rawSocials.instagram || 'https://instagram.com',
    youtube: rawSocials.youtube || 'https://youtube.com',
  }

  return (
    <>
      <div className="relative z-[60] w-full bg-[#2C376B] text-slate-100 text-xs py-1.5 sm:py-2 border-b border-[#232c57] select-none shadow-xs">
        <div className="container-site flex items-center justify-between gap-2 sm:gap-3">
          {/* Left Side: Store Hotlines & 25 Provinces Delivery Notice */}
          <div className="flex items-center gap-2 sm:gap-4 text-[11px] min-w-0 flex-shrink-0 max-w-[55%] sm:max-w-none">
            {/* Hotlines */}
            <div className="flex items-center gap-1.5 sm:gap-2 font-medium flex-shrink-0">
              <a
                href={`tel:${hotlines[0].replace(/\s+/g, '')}`}
                className="flex items-center gap-1 text-slate-200 hover:text-white transition-colors"
                title="Call Hotline"
              >
                <Phone className="w-3 h-3 text-blue-300 flex-shrink-0" />
                {/* Show full number on sm+, just icon on xs */}
                <span className="font-bold hidden sm:inline">{hotlines[0]}</span>
              </a>
              {hotlines[1] && (
                <>
                  <span className="text-white/30 hidden sm:inline">•</span>
                  <a
                    href={`tel:${hotlines[1].replace(/\s+/g, '')}`}
                    className="text-slate-200 hover:text-white transition-colors hidden md:inline"
                  >
                    {hotlines[1]}
                  </a>
                </>
              )}
              {hotlines[2] && (
                <>
                  <span className="text-white/30 hidden lg:inline">•</span>
                  <a
                    href={`tel:${hotlines[2].replace(/\s+/g, '')}`}
                    className="text-slate-200 hover:text-white transition-colors hidden lg:inline"
                  >
                    {hotlines[2]}
                  </a>
                </>
              )}
            </div>

            {/* Auto-detected Delivery 25 Provinces Notice (Non-clickable) */}
            <div
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 rounded-full bg-white/15 text-white border border-white/20 shadow-xs flex-shrink-0 select-none"
              title="Auto-detected Delivery Zone"
            >
              <Truck className="w-3 h-3 text-emerald-300 flex-shrink-0" />
              <span className="font-bold hidden sm:inline">{deliveryHeadline}</span>
              <span className="font-bold sm:hidden text-[10px]">📍 {province}</span>
            </div>
          </div>

          {/* Center Promo (Desktop only) */}
          <div className="hidden 2xl:flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black shadow-xs">
              <Sparkles className="w-2.5 h-2.5" /> {t('nav.promo_badge', 'PROMO')}
            </span>
            <span className="text-slate-200 truncate max-w-md">
              {announcement?.message || t('nav.free_shipping')}
            </span>
          </div>

          {/* Right Side: Social Media, Theme Switcher, Currency & 5-Language Localization */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 text-[11px] flex-shrink-0 ml-auto">
            {/* Social Media Channels (Official Brand App Icons) */}
            <div className="hidden lg:flex items-center gap-2.5">
              {socials.facebook && (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noreferrer"
                  title="Facebook"
                  aria-label="Facebook"
                  className="flex items-center justify-center cursor-pointer"
                >
                  <FacebookAppIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </a>
              )}
              {socials.tiktok && (
                <a
                  href={socials.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  title="TikTok"
                  aria-label="TikTok"
                  className="flex items-center justify-center cursor-pointer"
                >
                  <TikTokAppIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </a>
              )}
              {socials.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram"
                  aria-label="Instagram"
                  className="flex items-center justify-center cursor-pointer"
                >
                  <InstagramAppIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </a>
              )}
              {socials.telegram && (
                <a
                  href={socials.telegram}
                  target="_blank"
                  rel="noreferrer"
                  title="Telegram"
                  aria-label="Telegram"
                  className="flex items-center justify-center cursor-pointer"
                >
                  <TelegramAppIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </a>
              )}
              {socials.youtube && (
                <a
                  href={socials.youtube}
                  target="_blank"
                  rel="noreferrer"
                  title="YouTube"
                  aria-label="YouTube"
                  className="flex items-center justify-center cursor-pointer"
                >
                  <YouTubeAppIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </a>
              )}
            </div>

            {/* Admin Dashboard Style Theme Switcher — hidden on mobile to prevent crowding */}
            <div className="hidden sm:block">
              <TopThemeDropdown />
            </div>

            {/* Admin Dashboard Style Currency Selector — hidden on mobile to prevent crowding */}
            <div className="hidden sm:block">
              <TopCurrencyDropdown />
            </div>

            {/* Admin Dashboard Style 5-Language Selector with Flags & Search — always visible */}
            <TopLanguageDropdown />
          </div>
        </div>
      </div>

      <TrackOrderModal isOpen={trackOpen} onClose={() => setTrackOpen(false)} />
      <WarrantyCheckModal isOpen={warrantyOpen} onClose={() => setWarrantyOpen(false)} />
    </>
  )
}

export default TopUtilityBar

