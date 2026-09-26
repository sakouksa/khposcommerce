import React, { useEffect, useRef } from 'react'
import { Bot, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ChatMessage, { type MessageItem } from './ChatMessage'
import TypingIndicator from './TypingIndicator'

interface ChatMessageListProps {
  messages: MessageItem[]
  isLoading: boolean
  onProductClick?: () => void
  onOrderClick?: () => void
  onQuickActionClick?: (query: string) => void
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  onProductClick,
  onOrderClick,
  onQuickActionClick,
}) => {
  const { t } = useTranslation()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 bg-slate-50/40 dark:bg-slate-950/40">
      {/* Welcome Banner when empty */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-6 px-4 bg-gradient-to-b from-blue-50/70 to-indigo-50/40 dark:from-slate-800/70 dark:to-slate-900/50 rounded-2xl border border-blue-100/70 dark:border-slate-700/60 my-2 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md mb-2.5">
            <Bot className="w-6 h-6" />
          </div>

          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>{t('chatbot.welcome_title', 'Shop Assistant AI')}</span>
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-[280px] mt-1.5 leading-relaxed">
            {t('chatbot.welcome_subtitle', "Hello! 👋 I'm your AI shopping assistant. I can help you find products, check prices, track orders, and answer questions.")}
          </p>

          {onQuickActionClick && (
            <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => onQuickActionClick(t('chatbot.quick_queries.best_sellers', 'What are your best-selling items?'))}
                className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800 font-medium shadow-2xs hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
              >
                🔥 {t('chatbot.quick_actions.best_sellers', 'Best Sellers')}
              </button>
              <button
                type="button"
                onClick={() => onQuickActionClick(t('chatbot.quick_queries.deals', 'Show me current special offers and discounts'))}
                className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium shadow-2xs hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
              >
                💰 {t('chatbot.quick_actions.deals', 'Deals & Offers')}
              </button>
              <button
                type="button"
                onClick={() => onQuickActionClick(t('chatbot.quick_queries.track_order', 'I want to check the status of my order'))}
                className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800 font-medium shadow-2xs hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
              >
                📦 {t('chatbot.quick_actions.track_order', 'Track Order')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Messages Stream */}
      {messages.map((msg, idx) => (
        <ChatMessage
          key={msg.id ?? idx}
          message={msg}
          onProductClick={onProductClick}
          onOrderClick={onOrderClick}
        />
      ))}

      {/* Typing Indicator */}
      {isLoading && (
        <div className="py-1">
          <TypingIndicator />
        </div>
      )}

      <div ref={bottomRef} className="h-1" />
    </div>
  )
}

export default ChatMessageList
