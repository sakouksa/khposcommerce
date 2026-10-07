import React from 'react'
import { X, PlayCircle, Trash2, Clock, ShoppingCart, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/formatters'
import type { HeldCart } from '../types/pos.types'

interface POSHeldCartsModalProps {
  isOpen: boolean
  onClose: () => void
  heldCarts: HeldCart[]
  onResumeCart: (id: string) => void
  onDeleteHeldCart: (id: string) => void
}

export const POSHeldCartsModal: React.FC<POSHeldCartsModalProps> = ({
  isOpen,
  onClose,
  heldCarts,
  onResumeCart,
  onDeleteHeldCart,
}) => {
  const { t } = useTranslation(['pos', 'common'])
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">{t('suspendedOrders', 'Suspended / Held Orders')}</h3>
              <p className="text-xs text-muted-foreground">{heldCarts.length} {t('activeHeldSessions', 'active held sessions')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* List of Held Carts */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {heldCarts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <ShoppingCart size={36} className="mx-auto opacity-20" />
              <p className="text-xs">{t('noSuspendedSales', 'No suspended sales at the moment.')}</p>
            </div>
          ) : (
            heldCarts.map((h) => {
              const totalAmount = h.items.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0)
              return (
                <div
                  key={h.id}
                  className="p-3.5 rounded-2xl bg-muted/20 border border-border/70 hover:border-primary/40 space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{h.id}</span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock size={11} /> {h.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <User size={13} className="text-muted-foreground" /> {h.customer?.name || 'Walk-in Customer'}
                    </span>
                    <span className="font-black text-foreground">{formatCurrency(totalAmount)}</span>
                  </div>

                  <div className="text-[11px] text-muted-foreground line-clamp-1 border-t border-border/40 pt-1.5">
                    {h.items.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => onDeleteHeldCart(h.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 text-xs"
                      title={t('discardOrder', 'Discard Order')}
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        onResumeCart(h.id)
                        onClose()
                      }}
                      className="btn-primary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 font-bold"
                    >
                      <PlayCircle size={14} /> {t('resumeCart', 'Resume Cart')}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}
