import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export const ScrollToTop: React.FC = () => {
  const { t } = useTranslation()
  const { isScrolled } = useScrollPosition(400)

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {isScrolled && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 15 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          onClick={scrollToTop}
          className={cn(
            'fixed bottom-20 lg:bottom-8 right-5 z-40',
            'w-11 h-11 rounded-2xl flex items-center justify-center',
            'bg-[#2C376B] hover:bg-[#202952] text-white',
            'shadow-xl shadow-blue-950/20 border border-white/20',
            'active:scale-95 transition-colors cursor-pointer'
          )}
          aria-label={t('feed.back_to_top', 'Back to Top')}
          title={t('feed.back_to_top', 'Back to Top')}
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default ScrollToTop
