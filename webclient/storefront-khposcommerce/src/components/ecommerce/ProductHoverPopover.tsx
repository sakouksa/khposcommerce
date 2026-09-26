import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useProductPreviewStore } from '@/stores/productPreviewStore'
import { getProductSpecs } from '@/lib/productSpecs'
import { cn } from '@/lib/utils'

export const ProductHoverPopover: React.FC = () => {
  const { t } = useTranslation()
  const { hoverProduct, hoverRect, isHoverOpen, setHoverLocked, isModalOpen } =
    useProductPreviewStore()

  const { overviewText, specs } = useMemo(() => {
    if (!hoverProduct) return { overviewText: '', specs: [] }
    return getProductSpecs(hoverProduct, t)
  }, [hoverProduct, t])

  // If hover is closed or modal is open or no product/rect, don't render
  if (!isHoverOpen || isModalOpen || !hoverProduct || !hoverRect) {
    return null
  }

  // Calculate anchored position
  const popoverWidth = 300
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800

  // Check if there's enough space on the right of the card
  const spaceOnRight = screenWidth - hoverRect.right
  const placeOnRight = spaceOnRight >= popoverWidth + 16

  // Horizontal position
  const left = placeOnRight
    ? hoverRect.right + 10
    : Math.max(12, hoverRect.left - popoverWidth - 10)

  // Dynamic Vertical position (anchored to card top, bounded in viewport)
  let top = hoverRect.top
  if (top < 70) top = 70
  if (top + 380 > screenHeight - 20) {
    top = Math.max(70, screenHeight - 400)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, x: placeOnRight ? -6 : 6 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.96, x: placeOnRight ? -6 : 6 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: `${top}px`,
          left: `${left}px`,
          width: `${popoverWidth}px`,
        }}
        onMouseEnter={() => setHoverLocked(true)}
        onMouseLeave={() => setHoverLocked(false)}
        className="z-40 hidden lg:block bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-4 select-text pointer-events-auto max-h-[85vh] overflow-y-auto scrollbar-thin"
      >
        {/* Pointer Arrow Notch */}
        <div
          className={cn(
            'absolute top-8 w-3 h-3 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 rotate-45 pointer-events-none',
            placeOnRight
              ? '-left-1.5 border-l border-b'
              : '-right-1.5 border-r border-t'
          )}
        />

        {/* Header (PTC Computer Style: Description / ព័ត៌មានលម្អិត) */}
        <div className="relative">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
            {t('product.description_title', 'Description')}
          </h4>
          {/* Dashed Line Divider */}
          <div className="border-t border-dashed border-slate-300 dark:border-slate-700 my-2" />
        </div>

        {/* Raw Database Short Description (Displayed without translation as requested) */}
        {overviewText && (
          <p className="text-[11.5px] font-semibold text-blue-600 dark:text-blue-400 mb-2.5 leading-snug">
            {overviewText}
          </p>
        )}

        {/* Real Dynamic Specs List */}
        <ul className="space-y-1.5 text-[11px] leading-snug text-slate-700 dark:text-slate-300">
          {specs.map((spec, index) => (
            <li key={index} className="flex items-start gap-1.5">
              <span className="text-slate-400 font-bold shrink-0 leading-none mt-0.5">-</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">
                {spec.label}:
              </span>
              <span
                className={cn(
                  'text-slate-600 dark:text-slate-400 break-words font-medium',
                  spec.highlight && 'font-bold text-slate-900 dark:text-slate-100'
                )}
              >
                {spec.value}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProductHoverPopover
