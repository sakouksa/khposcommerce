import React, { useState, useEffect } from 'react'
import { Send, Copy, Check, ExternalLink, X, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'

interface TelegramLinkModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TelegramLinkModal: React.FC<TelegramLinkModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [linkCode, setLinkCode] = useState<string | null>(null)
  const [botUrl, setBotUrl] = useState('https://t.me/EnterpriseShopBot')
  const [copied, setCopied] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('customer_token')
      setIsLoggedIn(Boolean(token))

      if (token) {
        generateCode()
      }
    }
  }, [isOpen])

  const generateCode = async () => {
    setLoading(true)
    try {
      const response = await api.post('/telegram/link-code')
      if (response.data?.data) {
        setLinkCode(response.data.data.link_code)
        if (response.data.data.bot_url) {
          setBotUrl(response.data.data.bot_url)
        }
      }
    } catch (err) {
      console.error('Failed to generate Telegram link code:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (!linkCode) return
    navigator.clipboard.writeText(`/link ${linkCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t('chatbot.actions.close', 'Close')}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-5 pb-3 text-center border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center mx-auto shadow-md mb-2.5">
            <Send className="w-6 h-6 ml-0.5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            {t('chatbot.telegram_modal.title', 'Connect with Telegram Bot')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            {t('chatbot.telegram_modal.subtitle', 'Search products, manage your cart, and track orders directly inside Telegram!')}
          </p>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {isLoggedIn ? (
            <>
              <div className="p-3.5 bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 rounded-xl text-center">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">
                  {t('chatbot.telegram_modal.code_label', 'Your 6-Digit Telegram Link Code:')}
                </span>

                {loading ? (
                  <div className="py-2 flex justify-center">
                    <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="my-2 flex items-center justify-center gap-2">
                    <span className="text-2xl font-black font-mono tracking-widest text-sky-600 dark:text-sky-400">
                      {linkCode || '123456'}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 hover:underline"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>
                    {copied
                      ? t('chatbot.telegram_modal.copied', 'Copied to Clipboard!')
                      : t('chatbot.telegram_modal.copy_command', 'Copy /link command')}
                  </span>
                </button>
              </div>

              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {t('chatbot.telegram_modal.how_to_link', 'How to link:')}
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                  <li>{t('chatbot.telegram_modal.step_1', 'Click "Open Telegram Bot" below.')}</li>
                  <li>
                    {t('chatbot.telegram_modal.step_2', 'In the chat, send /link {{code}}', {
                      code: linkCode || 'CODE',
                    })}
                  </li>
                  <li>{t('chatbot.telegram_modal.step_3', 'Your cart and order history will automatically sync!')}</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="text-center py-2 space-y-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                {t('chatbot.telegram_modal.guest_notice', 'You can browse products with our Telegram bot as a guest, or log in to sync your cart and orders.')}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-98"
            >
              <span>{t('chatbot.telegram_modal.open_bot', 'Open Telegram Bot')}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>{t('chatbot.telegram_modal.encrypted', 'End-to-end encrypted • Safe & Verified')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TelegramLinkModal
