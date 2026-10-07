import React from 'react'
import { Search, Flame, Tag, Package, Headphones, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface QuickActionItem {
  label: string
  query: string
  icon?: React.ReactNode
}

interface QuickActionsProps {
  onSelectAction: (query: string) => void
  onOpenTelegramModal?: () => void
  disabled?: boolean
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectAction,
  onOpenTelegramModal,
  disabled = false,
}) => {
  const { t } = useTranslation()

  const actions: QuickActionItem[] = [
    {
      label: t('chatbot.quick_actions.find_products', 'Find Products'),
      query: t('chatbot.quick_queries.find_products', 'Show popular products in your catalog'),
      icon: <Search className="w-3 h-3 text-blue-500" />,
    },
    {
      label: t('chatbot.quick_actions.best_sellers', 'Best Sellers'),
      query: t('chatbot.quick_queries.best_sellers', 'What are your best-selling items?'),
      icon: <Flame className="w-3 h-3 text-amber-500" />,
    },
    {
      label: t('chatbot.quick_actions.deals', 'Deals & Offers'),
      query: t('chatbot.quick_queries.deals', 'Show me current special offers and discounts'),
      icon: <Tag className="w-3 h-3 text-emerald-500" />,
    },
    {
      label: t('chatbot.quick_actions.track_order', 'Track Order'),
      query: t('chatbot.quick_queries.track_order', 'I want to check the status of my order'),
      icon: <Package className="w-3 h-3 text-indigo-500" />,
    },
    {
      label: t('chatbot.quick_actions.support', 'Customer Support'),
      query: t('chatbot.quick_queries.support', 'I would like to talk to customer support'),
      icon: <Headphones className="w-3 h-3 text-rose-500" />,
    },
  ]

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-3 no-scrollbar scrollbar-none border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 backdrop-blur-xs">
      {actions.map((act, index) => (
        <button
          key={index}
          type="button"
          disabled={disabled}
          onClick={() => onSelectAction(act.query)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600 border border-slate-200 dark:border-slate-700/80 rounded-full shadow-2xs whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {act.icon}
          <span>{act.label}</span>
        </button>
      ))}

      {onOpenTelegramModal && (
        <button
          type="button"
          onClick={onOpenTelegramModal}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-200 dark:border-sky-800 rounded-full shadow-2xs whitespace-nowrap transition-all shrink-0"
        >
          <Send className="w-3 h-3" />
          <span>{t('chatbot.quick_actions.telegram_bot', 'Telegram Bot')}</span>
        </button>
      )}
    </div>
  )
}

export default QuickActions
