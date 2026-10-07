import React from 'react'
import { Settings2, Globe, DollarSign, Moon, Sun, Monitor } from 'lucide-react'
import { useSettingsStore, type CurrencyCode, type LanguageCode, type ThemeMode } from '@/stores'

export const SettingsPage: React.FC = () => {
  const { currency, setCurrency, language, setLanguage, theme, setTheme } = useSettingsStore()

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="w-9 h-9 rounded-xl bg-[#f58220]/10 text-[#f58220] flex items-center justify-center">
          <Settings2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
            Account & Store Preferences
          </h2>
          <p className="text-xs text-slate-400">Configure your language, currency, and appearance</p>
        </div>
      </div>

      <div className="space-y-5 max-w-lg">
        {/* Currency */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#f58220]" />
            <span>Display Currency</span>
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none"
          >
            <option value="USD">USD ($) - United States Dollar</option>
            <option value="KHR">KHR (៛) - Cambodian Riel</option>
            <option value="THB">THB (฿) - Thai Baht</option>
            <option value="VND">VND (₫) - Vietnamese Dong</option>
            <option value="CNY">CNY (¥) - Chinese Yuan</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#f58220]" />
            <span>Language</span>
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none"
          >
            <option value="km">ខ្មែរ (Khmer)</option>
            <option value="en">English (US)</option>
            <option value="th">ภาษาไทย (Thai)</option>
            <option value="vi">Tiếng Việt (Vietnamese)</option>
            <option value="zh">中文 (Chinese)</option>
          </select>
        </div>

        {/* Theme Mode */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-[#f58220]" />
            <span>Appearance Theme</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'light', label: 'Light', icon: Sun },
              { key: 'dark', label: 'Dark', icon: Moon },
              { key: 'system', label: 'System', icon: Monitor },
            ].map((item) => {
              const Icon = item.icon
              const isSelected = theme === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTheme(item.key as ThemeMode)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#f58220]/10 border-[#f58220] text-[#f58220]'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
