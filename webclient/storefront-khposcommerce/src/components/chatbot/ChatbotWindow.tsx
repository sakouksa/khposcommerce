import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import ChatHeader from './ChatHeader'
import ChatMessageList from './ChatMessageList'
import QuickActions from './QuickActions'
import ChatInput from './ChatInput'
import TelegramLinkModal from './TelegramLinkModal'
import { type MessageItem } from './ChatMessage'

interface ChatbotWindowProps {
  isOpen: boolean
  onClose: () => void
  onMinimize: () => void
}

const getOrCreateSessionToken = (): string => {
  let token = localStorage.getItem('chatbot_session_token')
  if (!token) {
    token = 'guest_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now()
    localStorage.setItem('chatbot_session_token', token)
  }
  return token
}

export const ChatbotWindow: React.FC<ChatbotWindowProps> = ({
  isOpen,
  onClose,
  onMinimize,
}) => {
  const { t, i18n } = useTranslation()
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false)

  // Load chat history on initial mount/open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory()
    }
  }, [isOpen])

  const loadHistory = async () => {
    try {
      const token = getOrCreateSessionToken()
      const response = await api.get('/chat/history', {
        params: { session_token: token },
      })
      if (response.data?.data && Array.isArray(response.data.data)) {
        setMessages(response.data.data)
      }
    } catch (err) {
      console.warn('Could not load chat history:', err)
    }
  }

  const handleSendMessage = async (text: string) => {
    const token = getOrCreateSessionToken()
    const userMsg: MessageItem = {
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const response = await api.post('/chat/message', {
        message: text,
        language: i18n.language || 'en',
        session_token: token,
      })

      if (response.data?.data) {
        const assistantMsg: MessageItem = {
          role: 'assistant',
          content: response.data.data.content,
          metadata: response.data.data.metadata,
          created_at: response.data.data.created_at,
        }
        setMessages((prev) => [...prev, assistantMsg])
      }
    } catch (err: any) {
      console.error('Chat error:', err)
      const errorMsg: MessageItem = {
        role: 'assistant',
        content: t(
          'chatbot.actions.connection_error',
          'Sorry, I encountered a temporary connection issue. Please try again in a moment or select one of the quick options below.'
        ),
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearHistory = async () => {
    const confirmMessage = t(
      'chatbot.actions.clear_confirm',
      'Are you sure you want to clear your conversation history?'
    )

    if (window.confirm(confirmMessage)) {
      try {
        const token = getOrCreateSessionToken()
        await api.delete('/chat/history', {
          data: { session_token: token },
        })
        localStorage.removeItem('chatbot_session_token')
        setMessages([])
      } catch (err) {
        console.error('Failed to clear history:', err)
        localStorage.removeItem('chatbot_session_token')
        setMessages([])
      }
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed z-40 flex flex-col bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-300
          bottom-4 right-4 sm:bottom-6 sm:right-6 
          w-[calc(100vw-32px)] sm:w-[380px] md:w-[400px]
          h-[calc(100vh-90px)] max-h-[620px]
          rounded-2xl backdrop-blur-md"
      >
        {/* Header */}
        <ChatHeader
          onClose={onClose}
          onMinimize={onMinimize}
          onClearHistory={handleClearHistory}
          onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
        />

        {/* Message Stream */}
        <ChatMessageList
          messages={messages}
          isLoading={isLoading}
          onProductClick={onClose}
          onOrderClick={onClose}
          onQuickActionClick={handleSendMessage}
        />

        {/* Quick Action Chips */}
        <QuickActions
          onSelectAction={handleSendMessage}
          onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
          disabled={isLoading}
        />

        {/* Input Form */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Telegram Link Modal */}
      <TelegramLinkModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />
    </>
  )
}

export default ChatbotWindow
