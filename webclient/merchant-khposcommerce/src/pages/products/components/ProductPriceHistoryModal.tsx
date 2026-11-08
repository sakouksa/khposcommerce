import React from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { History, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { ModalHeader } from '@/components/common/ModalHeader'

interface ProductPriceHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  priceHistory: any[]
  isLoading?: boolean
}

export const ProductPriceHistoryModal: React.FC<ProductPriceHistoryModalProps> = ({
  isOpen,
  onClose,
  productName,
  priceHistory,
  isLoading,
}) => {
  const { t } = useTranslation(['products', 'common'])

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-card border border-border rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Global Modal Header */}
          <ModalHeader
            title={t('products.priceHistoryTitle', 'Price Change History')}
            subtitle={productName}
            icon={<History size={18} />}
            iconVariant="emerald"
            onClose={onClose}
          />

          {/* Content */}
          <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading price history...</div>
            ) : priceHistory.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <DollarSign size={28} className="mx-auto mb-2 opacity-40" />
                <p>{t('products.noPriceHistory', 'No price change records found for this item.')}</p>
              </div>
            ) : (
              priceHistory.map((item: any, idx: number) => {
                const isUp = (item.new_price || 0) >= (item.old_price || 0)
                return (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-xl border border-border/80 bg-muted/15 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-muted-foreground line-through">
                          ${Number(item.old_price || 0).toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className={`font-bold font-mono text-sm ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                          ${Number(item.new_price || 0).toFixed(2)}
                        </span>
                        {isUp ? (
                          <TrendingUp size={14} className="text-emerald-600" />
                        ) : (
                          <TrendingDown size={14} className="text-rose-600" />
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground block">
                        {item.reason || 'Manual price adjustment'} · by {item.user?.name || 'System Admin'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground cursor-pointer transition-colors"
            >
              {t('common.close', 'Close')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}

export default ProductPriceHistoryModal
