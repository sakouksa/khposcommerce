import React from 'react'
import { Bot, User, Ticket } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ProductCarousel from './ProductCarousel'
import ProductCard, { type StructuredProduct } from './ProductCard'
import OrderCard, { type StructuredOrder } from './OrderCard'

export interface MessageItem {
  id?: number | string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string | null
  metadata?: {
    type?: string
    products?: StructuredProduct[]
    product?: StructuredProduct
    order?: StructuredOrder
    orders?: StructuredOrder[]
    ticket?: { ticket_id: string; message: string }
    cart?: { items: any[]; total: number; item_count: number }
    quick_actions?: Array<{ label: string; query: string }>
  }
  created_at?: string
}

interface ChatMessageProps {
  message: MessageItem
  onProductClick?: () => void
  onOrderClick?: () => void
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onProductClick,
  onOrderClick,
}) => {
  const { t } = useTranslation()
  const isUser = message.role === 'user'

  // Format basic markdown elements: **bold**, `code`, newlines
  const renderFormattedText = (text: string | null) => {
    if (!text) return null

    // Split paragraphs
    const paragraphs = text.split('\n\n')

    return paragraphs.map((para, pIdx) => {
      const lines = para.split('\n')

      return (
        <p key={pIdx} className="mb-1.5 last:mb-0 leading-relaxed">
          {lines.map((line, lIdx) => {
            // Parse bold **text** and `code`
            const formattedLine = line
              .split(/(\*\*.*?\*\*|`.*?`)/g)
              .map((chunk, cIdx) => {
                if (chunk.startsWith('**') && chunk.endsWith('**')) {
                  return <strong key={cIdx} className="font-bold">{chunk.slice(2, -2)}</strong>
                }
                if (chunk.startsWith('`') && chunk.endsWith('`')) {
                  return (
                    <code key={cIdx} className="px-1 py-0.5 bg-slate-200/70 dark:bg-slate-800 rounded font-mono text-[11px]">
                      {chunk.slice(1, -1)}
                    </code>
                  )
                }
                return chunk
              })

            return (
              <React.Fragment key={lIdx}>
                {formattedLine}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            )
          })}
        </p>
      )
    })
  }

  return (
    <div className={`flex gap-2.5 my-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
      )}

      {/* Bubble Container */}
      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition-all shadow-2xs ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-xs font-normal'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-700/80'
          }`}
        >
          {renderFormattedText(message.content)}
        </div>

        {/* Structured Attachments */}
        {message.metadata?.products && message.metadata.products.length > 0 && (
          <div className="w-full mt-1.5">
            <ProductCarousel
              products={message.metadata.products}
              onProductClick={onProductClick}
            />
          </div>
        )}

        {message.metadata?.product && (
          <div className="w-full mt-1.5">
            <ProductCard
              product={message.metadata.product}
              onProductClick={onProductClick}
            />
          </div>
        )}

        {message.metadata?.order && (
          <div className="w-full mt-1.5">
            <OrderCard
              order={message.metadata.order}
              onOrderClick={onOrderClick}
            />
          </div>
        )}

        {message.metadata?.orders && message.metadata.orders.length > 0 && (
          <div className="w-full space-y-2 mt-1.5">
            {message.metadata.orders.map((ord) => (
              <OrderCard
                key={ord.id || ord.order_number}
                order={ord}
                onOrderClick={onOrderClick}
              />
            ))}
          </div>
        )}

        {/* Support Ticket Badge */}
        {message.metadata?.ticket && (
          <div className="mt-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-900 dark:text-rose-200 max-w-[320px]">
            <Ticket className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                {t('chatbot.support_ticket.title', 'Support Ticket')} #{message.metadata.ticket.ticket_id}
              </span>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5 leading-tight">
                {t('chatbot.support_ticket.subtitle', 'Our support team is notified. A specialist will assist you promptly.')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  )
}

export default ChatMessage
