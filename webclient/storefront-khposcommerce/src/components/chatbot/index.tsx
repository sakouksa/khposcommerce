import React, { useState } from 'react'
import ChatbotButton from './ChatbotButton'
import ChatbotWindow from './ChatbotWindow'

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <ChatbotButton
        isOpen={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      />

      <ChatbotWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onMinimize={() => setIsOpen(false)}
      />
    </>
  )
}

export default ChatbotWidget
export * from './ChatbotButton'
export * from './ChatbotWindow'
export * from './ChatHeader'
export * from './ChatMessageList'
export * from './ChatMessage'
export * from './ChatInput'
export * from './TypingIndicator'
export * from './ProductCard'
export * from './ProductCarousel'
export * from './OrderCard'
export * from './QuickActions'
export * from './TelegramLinkModal'
