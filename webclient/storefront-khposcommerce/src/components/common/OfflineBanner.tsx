import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const OfflineBanner: React.FC = () => {
  const { t } = useTranslation()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold shadow-md z-50 sticky top-0 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2 max-w-xl mx-auto">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            {t(
              'offline_notice',
              'You are offline. Loaded catalog & shopping cart remain accessible.'
            )}
          </span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 text-white text-[11px] font-extrabold hover:bg-slate-900 active:scale-95 transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          <span>{t('common.try_again', 'Retry')}</span>
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

export default OfflineBanner
