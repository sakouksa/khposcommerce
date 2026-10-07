import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search, Check, X, Truck, Zap, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CAMBODIA_PROVINCES, useLocationStore } from '@/stores'
import { cn } from '@/lib/utils'

interface LocationPickerModalProps {
  isOpen: boolean
  onClose: () => void
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const { province: selectedProvince, setProvince, isExpressAvailable } = useLocationStore()
  const [search, setSearch] = useState('')

  const filteredProvinces = CAMBODIA_PROVINCES.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (p: string) => {
    setProvince(p)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-transparent dark:from-gray-800/50 dark:via-gray-800/30 dark:to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">
                  {t('location.select_destination', 'Choose Your Delivery Location')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('location.coverage_text', 'Delivery available across 25 Provinces in Cambodia')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Delivery Highlights Banner */}
          <div className="px-6 py-3 bg-blue-600/5 dark:bg-blue-950/30 border-b border-blue-600/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Phnom Penh: 1-Hour Express</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Truck className="w-3.5 h-3.5 text-emerald-500" />
              <span>25 Provinces: 1-2 Days</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="p-6 pb-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search province (e.g. Phnom Penh, Siem Reap, Battambang)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
              />
            </div>
          </div>

          {/* Provinces Grid */}
          <div className="p-6 pt-2 max-h-72 overflow-y-auto space-y-1.5 scrollbar-thin">
            <div className="grid grid-cols-2 gap-2">
              {filteredProvinces.map((province) => {
                const isSelected = selectedProvince === province
                const isPhnomPenh = province === 'Phnom Penh'

                return (
                  <button
                    key={province}
                    onClick={() => handleSelect(province)}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all text-left border',
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500/50 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold">{province}</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {isPhnomPenh ? '⚡ 1-Hour Fast Express' : '🚚 1 - 2 Days'}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer Note */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Real-time shipping calculation & inventory sync</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-300 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default LocationPickerModal
