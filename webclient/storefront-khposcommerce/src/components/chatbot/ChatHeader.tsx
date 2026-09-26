import React from 'react'
import { Bot, Trash2, Send, Minus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ChatHeaderProps {
  onClose: () => void
  onMinimize?: () => void
  onClearHistory?: () => void
  onOpenTelegramModal?: () => void
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClose,
  onMinimize,
  onClearHistory,
  onOpenTelegramModal,
}) => {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-t-2xl shadow-sm select-none">
      {/* Brand & Status */}
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-blue-600 rounded-full animate-pulse" />
        </div>

        <div>
          <h3 className="font-bold text-sm tracking-tight text-white leading-none">
            {t('chatbot.title', 'Shop Assistant')}
          </h3>
          <span className="text-[11px] text-blue-100 font-normal opacity-90 mt-0.5 block">
            {t('chatbot.online_status', 'Online • Instant Help')}
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1">
        {onOpenTelegramModal && (
          <button
            type="button"
            onClick={onOpenTelegramModal}
            title={t('chatbot.quick_actions.telegram_bot', 'Telegram Bot')}
            aria-label={t('chatbot.quick_actions.telegram_bot', 'Telegram Bot')}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        )}

        {onClearHistory && (
          <button
            type="button"
            onClick={onClearHistory}
            title={t('chatbot.actions.clear_chat', 'Clear Chat History')}
            aria-label={t('chatbot.actions.clear_chat', 'Clear Chat History')}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {onMinimize && (
          <button
            type="button"
            onClick={onMinimize}
            title={t('chatbot.actions.minimize', 'Minimize')}
            aria-label={t('chatbot.actions.minimize', 'Minimize')}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          title={t('chatbot.actions.close', 'Close Chat')}
          aria-label={t('chatbot.actions.close', 'Close Chat')}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default ChatHeader
