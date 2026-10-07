import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  X,
  Phone,
  Building,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface WarrantyCheckModalProps {
  isOpen: boolean
  onClose: () => void
}

export const WarrantyCheckModal: React.FC<WarrantyCheckModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const [serialNumber, setSerialNumber] = useState('')
  const [result, setResult] = useState<{
    valid: boolean
    productName?: string
    serial?: string
    warrantyEnd?: string
    status?: string
    serviceCenter?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault()
    if (!serialNumber.trim()) return

    setLoading(true)
    setTimeout(() => {
      // Demo simulated response matching genuine database items
      setResult({
        valid: true,
        productName: 'MacBook Pro 16" M3 Max (36GB RAM / 1TB SSD)',
        serial: serialNumber.toUpperCase(),
        warrantyEnd: 'August 24, 2027',
        status: 'Active Official Warranty',
        serviceCenter: 'Authorized Service Center #1 — Monivong Blvd, Phnom Penh',
      })
      setLoading(false)
    }, 600)
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
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-transparent dark:from-gray-800/50 dark:via-gray-800/30 dark:to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">
                  Official Warranty & Service Check
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Verify authentic product warranty and authorized service
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

          {/* Body */}
          <div className="p-6 space-y-4">
            <form onSubmit={handleCheck} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Enter Product Serial Number (S/N) or IMEI..."
                  className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !serialNumber.trim()}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check</span>
                  </>
                )}
              </button>
            </form>

            {/* Result Display */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> {result.status}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">S/N: {result.serial}</span>
                </div>

                <div className="font-bold text-sm text-gray-900 dark:text-white">
                  {result.productName}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-emerald-200/50 dark:border-emerald-900/40">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-[10px] text-gray-400">Coverage Valid Until</div>
                      <div className="font-bold">{result.warrantyEnd}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Building className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-[10px] text-gray-400">Service Center</div>
                      <div className="font-bold">Phnom Penh Main Branch</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Support hotline contact */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>Technical Support Hotline: <strong>012 220 152</strong></span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                Mon - Sun 8:00AM - 8:00PM
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default WarrantyCheckModal
