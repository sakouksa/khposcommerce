import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Send,
  Bell,
  Volume2,
  Key,
  Hash,
  Eye,
  EyeOff,
  Check,
  Save,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Smartphone,
  Info,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import { useThemeStore } from '@/stores/themeStore'
import notificationService from '@/services/notificationService'
import { settingsService } from '@/services/settingsService'

export const TelegramAlertSettings: React.FC = () => {
  const { language } = useThemeStore()
  const isKhmer = language === 'km' || language === 'kh'
  const { t } = useTranslation(['settings', 'common'])
  const toast = useToast()
  const qc = useQueryClient()

  // Form states
  const [botToken, setBotToken] = useState('')
  const [chatId, setChatId] = useState('')
  const [threshold, setThreshold] = useState('5')
  const [autoTelegram, setAutoTelegram] = useState(true)
  const [autoInApp, setAutoInApp] = useState(true)
  const [soundAlert, setSoundAlert] = useState(true)

  const [showToken, setShowToken] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isTestingStock, setIsTestingStock] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load existing settings
  const { data: notifSettings, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => notificationService.getSettings(),
  })

  useEffect(() => {
    if (notifSettings) {
      if (notifSettings.telegram_bot_token) setBotToken(notifSettings.telegram_bot_token)
      if (notifSettings.telegram_chat_id) setChatId(notifSettings.telegram_chat_id)
      if (notifSettings.stock_alert_threshold !== undefined) setThreshold(String(notifSettings.stock_alert_threshold))
      if (notifSettings.auto_telegram_stock_alert !== undefined) setAutoTelegram(Boolean(notifSettings.auto_telegram_stock_alert))
      if (notifSettings.enable_notifications !== undefined) setAutoInApp(Boolean(notifSettings.enable_notifications))
      if (notifSettings.enable_sound !== undefined) setSoundAlert(Boolean(notifSettings.enable_sound))
    }
  }, [notifSettings])

  const handleTestBot = async () => {
    setIsTesting(true)
    sound.playClick()
    try {
      const res = await notificationService.testTelegram({
        chat_id: chatId || undefined,
        bot_token: botToken || undefined,
      })
      if (soundAlert) sound.playSuccess()
      if (res.mock) {
        toast.info(
          isKhmer
            ? 'តេស្ត Telegram Bot (Mock): សូមបញ្ចូល Chat ID និង Bot Token ជាក់ស្តែងដើម្បីទទួលសារផ្ទាល់។'
            : 'Telegram Bot test simulated! Please configure Chat ID to receive live messages.'
        )
      } else {
        toast.success(
          isKhmer
            ? 'តេស្ត Telegram Bot ជោគជ័យ! សារបានផ្ញើចូល Telegram រួចរាល់។'
            : 'Telegram Bot test successful! Message sent to channel/chat.'
        )
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || (isKhmer ? 'បរាជ័យក្នុងការតេស្ត Telegram Bot' : 'Failed to test Telegram Bot')
      )
    } finally {
      setIsTesting(false)
    }
  }

  const handleTestStockAlert = async () => {
    setIsTestingStock(true)
    sound.playClick()
    try {
      const res = await notificationService.sendStockAlert({
        out_of_stock: 2,
        low_stock: 3,
        warehouse_name: 'Phnom Penh Central Depot (ឃ្លាំងកណ្តាល)',
        items: [
          { name: 'Samsung Galaxy S24 Ultra', sku: 'SAM-S24U', quantity: 0 },
          { name: 'Apple iPhone 15 Pro Max', sku: 'APL-15PM', quantity: 0 },
          { name: 'Xiaomi 14 Ultra Leica', sku: 'XIA-14U', quantity: 2 },
          { name: 'Oppo Find X7 Ultra', sku: 'OPP-FX7U', quantity: 3 },
        ],
      })
      if (soundAlert) sound.playSuccess()
      if (res.mock) {
        toast.info(
          isKhmer
            ? 'បានតេស្តបញ្ជូនដំណឹងស្តុក (Mock Mode)។ បញ្ចូល Bot Token & Chat ID ដើម្បីទទួលសារក្នុង Telegram ផ្ទាល់។'
            : 'Stock alert test simulated! Set Bot Token & Chat ID to receive live alerts in Telegram.'
        )
      } else {
        toast.success(
          isKhmer
            ? 'បានផ្ញើដំណឹងស្តុកសាកល្បងទៅកាន់ Telegram រួចរាល់!'
            : 'Stock alert test message dispatched to Telegram successfully!'
        )
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || (isKhmer ? 'បរាជ័យក្នុងការផ្ញើដំណឹងស្តុក' : 'Failed to send stock alert')
      )
    } finally {
      setIsTestingStock(false)
    }
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSaving(true)
    sound.playClick()

    try {
      await Promise.all([
        settingsService.updateSettings({
          company_id: 1,
          settings: {
            telegram_bot_token: botToken,
            telegram_chat_id: chatId,
            stock_alert_threshold: Number(threshold) || 5,
            auto_telegram_stock_alert: autoTelegram ? '1' : '0',
            auto_in_app_stock_alert: autoInApp ? '1' : '0',
            sound_stock_alert: soundAlert ? '1' : '0',
          },
        }),
        notificationService.updateSettings({
          telegram: autoTelegram,
          telegram_notify: autoTelegram,
          telegram_bot_token: botToken,
          telegram_chat_id: chatId,
          stock_alert_threshold: Number(threshold) || 5,
          auto_telegram_stock_alert: autoTelegram,
          enable_notifications: autoInApp,
          enable_sound: soundAlert,
        } as any),
      ])

      // Also update localStorage so Stock Alert on Inventory page is instantly updated
      try {
        const cached = localStorage.getItem('pos_stock_alert_config')
        const parsed = cached ? JSON.parse(cached) : {}
        localStorage.setItem(
          'pos_stock_alert_config',
          JSON.stringify({
            ...parsed,
            telegramBotToken: botToken,
            telegramChatId: chatId,
            defaultThreshold: Number(threshold) || 5,
            autoTelegramAlert: autoTelegram,
            autoInAppNotification: autoInApp,
            soundAlert: soundAlert,
          })
        )
      } catch {}

      qc.invalidateQueries({ queryKey: ['settings'] })
      qc.invalidateQueries({ queryKey: ['notification-settings'] })

      if (soundAlert) sound.playSuccess()
      toast.success(
        isKhmer
          ? 'បានរក្សាទុកការកំណត់ Telegram Bot & Stock Alert ដោយជោគជ័យ!'
          : 'Telegram Bot & Stock Alert settings saved successfully!'
      )
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || (isKhmer ? 'បរាជ័យក្នុងការរក្សាទុក' : 'Failed to save settings')
      )
    } finally {
      setIsSaving(false)
    }
  }

  const isConfigured = Boolean(botToken && botToken.trim() !== '' && botToken !== 'your-telegram-bot-token')

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20 shadow-xs">
            <Bot className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground">
                {isKhmer
                  ? 'ការកំណត់ Telegram Bot & ដំណឹងស្តុកទំនិញ'
                  : 'Telegram Bot & Stock Alert Configuration'}
              </h2>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                  isConfigured
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {isConfigured
                  ? (isKhmer ? 'បានភ្ជាប់ Telegram' : 'Active & Connected')
                  : (isKhmer ? 'ទាមទារការកំណត់ Bot' : 'Pending Bot Setup')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isKhmer
                ? 'កំណត់ការជូនដំណឹងស្វ័យប្រវត្តិកាលណាទំនិញដាច់ស្តុក ឬធ្លាក់ដល់កម្រិតព្រមាន ដោយផ្ទាល់ទៅកាន់ទូរស័ព្ទ Telegram'
                : 'Broadcast instant low-stock and out-of-stock alerts to your Telegram staff channel or private group'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 active:scale-95"
        >
          {isSaving ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          <span>{isSaving ? (isKhmer ? 'កំពុងរក្សាទុក...' : 'Saving...') : (isKhmer ? 'រក្សាទុកការកំណត់' : 'Save Changes')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Telegram Credentials Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-border/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {isKhmer ? 'ព័ត៌មានសម្ងាត់ Telegram Bot API' : 'Telegram Bot API Credentials'}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {isKhmer ? 'Bot Token និង Chat ID សម្រាប់បញ្ជូនសារ' : 'HTTP API token and target channel/group chat ID'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle size={14} />
                <span>{showGuide ? (isKhmer ? 'បិទការណែនាំ' : 'Hide Guide') : (isKhmer ? 'ការណែនាំ' : 'Setup Guide')}</span>
              </button>
            </div>

            {/* Guide Collapse */}
            <AnimatePresence>
              {showGuide && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl bg-sky-500/5 dark:bg-sky-950/20 border border-sky-500/20 text-xs text-muted-foreground space-y-2"
                >
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <Info size={14} className="text-sky-500" />
                    {isKhmer ? 'របៀបបង្កើត Telegram Bot ក្នុងរយៈពេល ១ នាទី:' : 'How to set up your Telegram Alert Bot in 1 minute:'}
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 leading-relaxed text-[11px]">
                    <li>
                      {isKhmer
                        ? 'បើក Telegram រួចស្វែងរក @BotFather ចុច Start ឬផ្ញើពាក្យ /newbot'
                        : 'Open Telegram, search for @BotFather, and send /newbot to register a new bot.'}
                    </li>
                    <li>
                      {isKhmer
                        ? 'ដាក់ឈ្មោះ Bot និង Username (ត្រូវបញ្ចប់ដោយ bot ឧ. NexTechStockAlertBot)'
                        : 'Set a name and unique username ending with "bot" (e.g. NexTechStockBot).'}
                    </li>
                    <li>
                      {isKhmer
                        ? 'ចម្លង HTTP API Token ដែលទទួលបានមកបិទភ្ជាប់ក្នុងប្រអប់ "Telegram Bot Token"'
                        : 'Copy the HTTP API Token provided by BotFather into the Telegram Bot Token field.'}
                    </li>
                    <li>
                      {isKhmer
                        ? 'បង្កើត Telegram Channel/Group រួចទាញ Bot ចូល និងតម្លើងជា Administrator'
                        : 'Create a Group or Channel for staff, and invite your Bot as an Administrator.'}
                    </li>
                    <li>
                      {isKhmer
                        ? 'ស្វែងរក Chat ID តាមរយៈ @userinfobot ឬ @RawDataBot រួចចម្លងមកដាក់ក្នុងប្រអប់ "Admin Telegram Chat ID"'
                        : 'Obtain the Chat ID (e.g., -100xxxxxxxxxx) using @userinfobot and paste it below.'}
                    </li>
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {isKhmer ? 'Telegram Bot Token' : 'Telegram Bot Token'}
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    className="w-full pr-10 pl-3.5 py-2.5 text-xs font-mono bg-muted/30 border border-border/80 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {isKhmer ? 'ទទួលបានពី @BotFather នៅលើ Telegram' : 'Received from @BotFather on Telegram'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {isKhmer ? 'Admin / Channel Chat ID' : 'Admin Telegram Chat ID / Channel ID'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Hash size={14} />
                  </span>
                  <input
                    type="text"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    placeholder="-1001234567890 ឬ 987654321"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono bg-muted/30 border border-border/80 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {isKhmer
                    ? 'លេខសម្គាល់ឆានែល ឬគ្រុបបុគ្គលិក (ឧ. -1001234567890)'
                    : 'Target group or channel ID (e.g., -1001234567890) for broadcast'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestBot}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 active:scale-95 shadow-2xs"
                >
                  {isTesting ? <RefreshCw className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                  <span>{isTesting ? (isKhmer ? 'កំពុងតេស្ត...' : 'Testing...') : (isKhmer ? 'តេស្ត Telegram Bot' : 'Test Bot Connection')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestStockAlert}
                  disabled={isTestingStock}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 active:scale-95 shadow-2xs"
                >
                  {isTestingStock ? <RefreshCw className="size-3.5 animate-spin" /> : <AlertTriangle className="size-3.5" />}
                  <span>{isTestingStock ? (isKhmer ? 'កំពុងផ្ញើ...' : 'Sending...') : (isKhmer ? 'ផ្ញើសារសាកល្បងស្តុក (Stock Test)' : 'Dispatch Test Stock Alert')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Automation Rules & Phone Preview Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Automation Rules */}
          <div className="bg-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/70">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {isKhmer ? 'លក្ខខណ្ឌជូនដំណឹងស្តុកស្វ័យប្រវត្តិ' : 'Automated Stock Alert Triggers'}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {isKhmer ? 'កំណត់កម្រិតព្រមានស្តុក និងទម្រង់ alert' : 'Define alert threshold and broadcast rules'}
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Threshold */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block">
                    {isKhmer ? 'កម្រិតព្រមានស្តុកទាប (≤ Threshold Units)' : 'Low Stock Threshold (≤ Units)'}
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    {isKhmer
                      ? 'alert ស្វ័យប្រវត្តិកាលណាទំនិញនៅសល់ ≤ ចំនួននេះ'
                      : 'Trigger alerts when stock quantity falls to or below'}
                  </p>
                </div>
                <div className="w-20 shrink-0">
                  <input
                    type="number"
                    min={0}
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-center text-xs font-bold bg-card border border-border rounded-lg outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                    <Send size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {isKhmer ? 'Alert ស្វ័យប្រវត្តិតាម Telegram Bot' : 'Auto Telegram Broadcast'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {isKhmer ? 'ផ្ញើសារពេលដាច់ស្តុក ឬស្តុកជិតអស់' : 'Push alerts on stock depletion events'}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoTelegram}
                  onChange={(e) => setAutoTelegram(e.target.checked)}
                  className="w-4 h-4 text-primary rounded cursor-pointer accent-primary"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Bell size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {isKhmer ? 'Alert Notification ក្នុងប្រព័ន្ធ (In-App)' : 'In-App Toast Alerts'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {isKhmer ? 'បង្ហាញ Notification ព្រមានលើអេក្រង់' : 'Desktop & banner notifications in POS'}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoInApp}
                  onChange={(e) => setAutoInApp(e.target.checked)}
                  className="w-4 h-4 text-primary rounded cursor-pointer accent-primary"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Volume2 size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {isKhmer ? 'សំឡេងរោទ៍ព្រមាន (Sound Chime)' : 'Audio Chime Alerts'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {isKhmer ? 'បន្លឺសំឡេងរោទ៍កាលណាមានទំនិញដាច់ស្តុក' : 'Play audio chime on urgent stock event'}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlert}
                  onChange={(e) => setSoundAlert(e.target.checked)}
                  className="w-4 h-4 text-primary rounded cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Telegram Alert Message Preview */}
          <div className="bg-card rounded-2xl border border-border/80 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Smartphone size={14} />
                {isKhmer ? 'ទម្រង់សារបង្ហាញក្នុង Telegram' : 'Telegram Live Message Preview'}
              </span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">HTML Format</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-sans text-xs space-y-2 border border-slate-800 shadow-inner">
              <div className="text-amber-400 font-bold flex items-center gap-1">
                <span>🚨</span>
                <span>កម្រិតស្តុកទំនិញ - STOCK ALERT</span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-0.5">
                <p>🏬 <b>សាខា:</b> Phnom Penh Central Depot</p>
                <p>❌ <b>ដាច់ស្តុក:</b> <span className="text-rose-400 font-bold">2 មុខ</span></p>
                <p>⚠️ <b>ជិតអស់ស្តុក:</b> <span className="text-amber-400 font-bold">3 មុខ</span></p>
                <p className="text-[10px] text-slate-400">⏰ កាលបរិច្ឆេទ: 2026-10-01 20:30:00</p>
              </div>
              <div className="pt-1 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                <p>• ❌ Samsung S24 Ultra (<code>SAM-S24U</code>): <b>0</b> ឯកតា</p>
                <p>• ⚠️ Xiaomi 14 Ultra (<code>XIA-14U</code>): <b>2</b> ឯកតា</p>
              </div>
              <p className="text-[10px] text-sky-400 italic pt-1">
                🔗 សូមពិនិត្យ និងបំពេញស្តុកបន្ថែមទាន់ពេលវេលាក្នុងប្រព័ន្ធ POS!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TelegramAlertSettings
