import React, { useState, useRef, useEffect } from 'react'
import { SendHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ChatInputProps {
  onSendMessage: (text: string) => void
  isLoading: boolean
  placeholder?: string
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder,
}) => {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const effectivePlaceholder = placeholder || t('chatbot.input_placeholder', 'Ask me anything about products, orders, shipping...')

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus()
    }
  }, [isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    onSendMessage(trimmed)
    setInput('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2"
    >
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
        placeholder={effectivePlaceholder}
        className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all disabled:opacity-60"
      />

      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        aria-label="Send message"
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed transition-all shadow-xs shrink-0"
      >
        <SendHorizontal className="w-4 h-4" />
      </button>
    </form>
  )
}

export default ChatInput
