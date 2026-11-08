import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, Send, Bell, Volume2, Bot, Check, Eye, EyeOff, ExternalLink, Hash, Key, HelpCircle, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import notificationService from '@/services/notificationService'
import { settingsService } from '@/services/settingsService'

export interface StockAlertConfig {
  autoTelegramAlert: boolean
  autoInAppNotification: boolean
  soundAlert: boolean
  defaultThreshold: number
  telegramBotToken?: string
  telegramChatId?: string
}

export const DEFAULT_STOCK_ALERT_CONFIG: StockAlertConfig = {
  autoTelegramAlert: true,
  autoInAppNotification: true,
  soundAlert: true,
  defaultThreshold: 5,
  telegramBotToken: '',
  telegramChatId: '',
}

interface StockAlertConfigModalProps {
  isOpen: boolean
  onClose: () => void
  config: StockAlertConfig
  onSaveConfig: (updated: Partial<StockAlertConfig>) => void
}

export const StockAlertConfigModal: React.FC<StockAlertConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const { t } = useTranslation(['inventory', 'common'])
  const toast = useToast()
  const navigate = useNavigate()

  const [botToken, setBotToken] = useState(config.telegramBotToken || '')
  const [chatId, setChatId] = useState(config.telegramChatId || '')
  const [threshold, setThreshold] = useState(config.defaultThreshold || 5)
  const [autoTelegram, setAutoTelegram] = useState(config.autoTelegramAlert)
  const [autoInApp, setAutoInApp] = useState(config.autoInAppNotification)
  const [soundAlert, setSoundAlert] = useState(config.soundAlert)

  const [showToken, setShowToken] = useState(false)
  const [testingBot, setTestingBot] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  // Fetch initial token and chat_id from backend settings if not already in config
  useEffect(() => {
    if (isOpen) {
      setBotToken(config.telegramBotToken || '')
      setChatId(config.telegramChatId || '')
      setThreshold(config.defaultThreshold || 5)
      setAutoTelegram(config.autoTelegramAlert)
      setAutoInApp(config.autoInAppNotification)
      setSoundAlert(config.soundAlert)

      notificationService.getSettings()
        .then((res: any) => {
          if (res?.telegram_bot_token && !config.telegramBotToken) {
            setBotToken(res.telegram_bot_token)
          }
          if (res?.telegram_chat_id && !config.telegramChatId) {
            setChatId(res.telegram_chat_id)
          }
          if (res?.stock_alert_threshold && !config.defaultThreshold) {
            setThreshold(Number(res.stock_alert_threshold))
          }
        })
        .catch(() => {})
    }
  }, [isOpen, config])

  const handleTestTelegramBot = async () => {
    setTestingBot(true)
    sound.playClick()
    try {
      const res = await notificationService.testTelegram({
        chat_id: chatId || undefined,
        bot_token: botToken || undefined,
      })
      if (soundAlert) sound.playSuccess()
      toast.success(
        res.mock
          ? t('telegram_test_simulated', 'Telegram Bot test simulated! Please configure Chat ID to receive live messages')
          : t('telegram_test_success', 'Test message sent to Telegram Bot successfully!')
      )
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || t('telegram_test_failed', 'Failed to test Telegram Bot')
      )
    } finally {
      setTestingBot(false)
    }
  }

  const handleSaveAndDone = async () => {
    setIsSaving(true)
    sound.playClick()

    const updatedConfig: Partial<StockAlertConfig> = {
      autoTelegramAlert: autoTelegram,
      autoInAppNotification: autoInApp,
      soundAlert: soundAlert,
      defaultThreshold: Number(threshold) || 5,
      telegramBotToken: botToken,
      telegramChatId: chatId,
    }

    // 1. Save to local state / parent
    onSaveConfig(updatedConfig)

    // 2. Persist to Global Settings via settingsService and notificationService in backend
    try {
      await Promise.allSettled([
        settingsService.updateSettings({
          company_id: 1,
          settings: {
            telegram_bot_token: botToken,
            telegram_chat_id: chatId,
            stock_alert_threshold: Number(threshold) || 5,
            auto_telegram_stock_alert: autoTelegram ? '1' : '0',
          },
        }),
        notificationService.updateSettings({
          telegram: autoTelegram,
          telegram_notify: autoTelegram,
          telegram_bot_token: botToken,
          telegram_chat_id: chatId,
          stock_alert_threshold: Number(threshold) || 5,
          auto_telegram_stock_alert: autoTelegram,
        } as any),
      ])
      toast.success(t('alert_config_saved_applied', 'Alert configuration saved and applied successfully'))
    } catch {
      // Local state is already updated, show mild notice
      toast.info(t('saved_local_preferences', 'Saved to local preferences'))
    } finally {
      setIsSaving(false)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl max-h-[92vh] flex flex-col bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 pb-3 border-b border-border/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <Bot className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span>{t('modal_stock_alert_title', 'Stock Alert & Telegram Bot Configuration')}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold border border-sky-500/20">
                      Auto Alert
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('modal_stock_alert_subtitle', 'Manage automated low-stock warnings and connect your custom Telegram Bot')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {/* Telegram Credentials Card */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 dark:bg-sky-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
                    <Key className="size-3.5" />
                    <span>{t('telegram_bot_credentials', 'Telegram Bot API Credentials')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGuide(!showGuide)}
                    className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="size-3" />
                    <span>{showGuide ? t('telegram_hide_guide', 'Hide Guide') : t('telegram_show_guide', 'How to Setup Bot')}</span>
                  </button>
                </div>

                {/* Quick Setup Guide Collapse */}
                <AnimatePresence>
                  {showGuide && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 rounded-lg bg-card/80 border border-sky-500/20 text-[11px] text-muted-foreground space-y-1.5"
                    >
                      <p className="font-semibold text-foreground">
                        {t('telegram_guide_title', '📌 Quick Setup Instructions:')}
                      </p>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li>
                          {t('telegram_guide_step1', '1. Open Telegram, search @BotFather and send /newbot to obtain your Bot Token')}
                        </li>
                        <li>
                          {t('telegram_guide_step2', '2. Search @userinfobot or add your Bot to a Group/Channel to get your Chat ID')}
                        </li>
                        <li>
                          {t('telegram_guide_step3', '3. Paste your Token and Chat ID below, then click "Test Telegram Alert" to verify')}
                        </li>
                      </ol>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bot Token Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                    {t('telegram_bot_token', 'Telegram Bot Token')}
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={botToken}
                      onChange={e => setBotToken(e.target.value)}
                      placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                      className="w-full pr-9 pl-3 py-2 text-xs font-mono bg-card border border-border/80 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showToken ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Chat ID Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                    {t('telegram_chat_id', 'Admin / Channel Chat ID')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Hash className="size-3.5" />
                    </span>
                    <input
                      type="text"
                      value={chatId}
                      onChange={e => setChatId(e.target.value)}
                      placeholder="-1001234567890 ឬ 987654321"
                      className="w-full pl-8 pr-3 py-2 text-xs font-mono bg-card border border-border/80 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Test Bot Trigger */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted-foreground">
                    {t('telegram_chat_id_hint', 'Can be your personal user ID or group chat ID (e.g. -100xxxxxxxxxx) for team alerts')}
                  </span>
                  <button
                    type="button"
                    onClick={handleTestTelegramBot}
                    disabled={testingBot}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-2xs active:scale-95"
                  >
                    <Send className="size-3" />
                    <span>
                      {testingBot
                        ? t('telegram_testing', 'Testing...')
                        : t('telegram_test_btn', 'Test Telegram Alert')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Threshold & Alert Automation Options */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t('stock_alert_triggers', 'Automated Stock Alert Triggers')}
                </h4>

                {/* Low Stock Threshold Input */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                  <div className="space-y-0.5">
                    <label className="text-xs font-semibold text-foreground block">
                      {t('low_stock_threshold_label', 'Low Stock Alert Threshold (≤ Units)')}
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      {t('low_stock_threshold_hint', 'Products with stock at or below this number are flagged as Low Stock')}
                    </p>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min={0}
                      value={threshold}
                      onChange={e => setThreshold(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 text-center text-xs font-bold bg-card border border-border rounded-lg outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* 1. Telegram Bot Auto Alert Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                      <Send className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {t('auto_telegram_alert', 'Auto Telegram Bot Alert')}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t('auto_telegram_alert_hint', 'Automatically dispatch Telegram notifications when stock runs low or depletes')}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoTelegram}
                    onChange={e => setAutoTelegram(e.target.checked)}
                    className="w-4 h-4 text-primary rounded cursor-pointer accent-primary"
                  />
                </div>

                {/* 2. In-App Notification Alert Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <Bell className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {t('auto_inapp_alert', 'In-App Stock Notification')}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t('auto_inapp_alert_hint', 'Display banner or toast alerts inside the application when visiting inventory')}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoInApp}
                    onChange={e => setAutoInApp(e.target.checked)}
                    className="w-4 h-4 text-primary rounded cursor-pointer accent-primary"
                  />
                </div>

                {/* 3. Sound Alert Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                      <Volume2 className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {t('sound_alert_label', 'Stock Alert Sound Effect')}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t('sound_alert_hint', 'Play an alert chime to notify staff when urgent low-stock items are detected')}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundAlert}
                    onChange={e => setSoundAlert(e.target.checked)}
                    className="w-4 h-4 text-primary rounded cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 sm:p-5 pt-3 border-t border-border/70 shrink-0 bg-muted/10">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  navigate('/settings?tab=telegram')
                }}
                className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="size-3.5" />
                <span>{t('open_global_settings', 'Open Global Settings')}</span>
                <ExternalLink className="size-3" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndDone}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95 disabled:opacity-50"
                >
                  <Check className="size-3.5" />
                  <span>
                    {isSaving
                      ? t('saving', 'Saving...')
                      : t('save_and_apply', 'Save & Apply')}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default StockAlertConfigModal
