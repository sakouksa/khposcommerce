import React from 'react'
import { Bot, X, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ChatbotButtonProps {
  isOpen: boolean
  onClick: () => void
  unreadCount?: number
}

export const ChatbotButton: React.FC<ChatbotButtonProps> = ({
  isOpen,
  onClick,
  unreadCount = 0,
}) => {
  const { t } = useTranslation()

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
      <button
        type="button"
        onClick={onClick}
        aria-label={isOpen ? t('chatbot.actions.close', 'Close Chat') : t('chatbot.actions.open_tooltip', 'Chat with AI Assistant')}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/20"
      >
        {/* Glow Ring */}
        <span className="absolute -inset-1 rounded-full bg-blue-500/30 blur-sm group-hover:bg-blue-500/50 transition-all animate-pulse" />

        {/* Inner Icon */}
        <span className="relative z-10 flex items-center justify-center">
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200 rotate-0 hover:rotate-90" />
          ) : (
            <Bot className="w-6 h-6 transition-transform duration-200 group-hover:rotate-6" />
          )}
        </span>

        {/* Active status beacon */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-xs" />
        )}

        {/* Unread badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-xs">
            {unreadCount}
          </span>
        )}

        {/* Hover Tooltip (desktop only) */}
        {!isOpen && (
          <span className="hidden sm:inline-flex absolute right-16 top-1/2 -translate-y-1/2 items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 text-white text-xs font-semibold rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('chatbot.actions.open_tooltip', 'Chat with AI Assistant')}</span>
          </span>
        )}
      </button>
    </div>
  )
}

export default ChatbotButton
