import React from 'react'
import { useTranslation } from 'react-i18next'

export const TypingIndicator: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-xs w-fit shadow-xs border border-slate-200/60 dark:border-slate-700/60">
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce" />
      </div>
      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
        {t('chatbot.actions.thinking', 'AI Assistant is thinking...')}
      </span>
    </div>
  )
}

export default TypingIndicator
