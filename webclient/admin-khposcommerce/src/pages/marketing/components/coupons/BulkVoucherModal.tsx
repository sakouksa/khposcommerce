import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  X,
  Layers,
  Download,
  Copy,
  Check,
  Loader2,
  FileSpreadsheet,
  Zap,
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { downloadCsv } from '@/utils/export'
import type { CouponChannelScope } from '../../types/coupon'
import { EnterpriseDateTimePicker } from '@/components/common'

interface BulkVoucherModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerateBatch: (params: {
    name: string
    codes: string[]
    type: 'fixed' | 'percentage' | 'free_shipping'
    value: number
    currency: 'USD' | 'KHR'
    maxDiscountCap?: number
    minimumAmount: number
    channelScope: CouponChannelScope
    expiresAt: string
  }) => Promise<void>
  isGenerating: boolean
}

export const BulkVoucherModal: React.FC<BulkVoucherModalProps> = ({
  isOpen,
  onClose,
  onGenerateBatch,
  isGenerating,
}) => {
  const toast = useToast()

  // Generation Settings
  const [batchName, setBatchName] = useState('Khmer New Year VIP Serial Vouchers')
  const [prefix, setPrefix] = useState('KNY26-')
  const [quantity, setQuantity] = useState('50')
  const [codeLength, setCodeLength] = useState('8')
  const [type, setType] = useState<'fixed' | 'percentage' | 'free_shipping'>('fixed')
  const [value, setValue] = useState('5')
  const [currency, setCurrency] = useState<'USD' | 'KHR'>('USD')
  const [maxDiscountCap, setMaxDiscountCap] = useState('10')
  const [minimumAmount, setMinimumAmount] = useState('20')
  const [channelScope, setChannelScope] = useState<CouponChannelScope>('all')
  const [expiresAt, setExpiresAt] = useState('2026-09-30T23:59')
  const [copied, setCopied] = useState(false)

  // Generate randomized sample codes
  const generatedCodes = useMemo(() => {
    const count = Math.min(500, Math.max(5, parseInt(quantity) || 50))
    const len = Math.max(4, parseInt(codeLength) || 8)
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
    const codes: string[] = []

    for (let i = 0; i < count; i++) {
      let randomPart = ''
      for (let j = 0; j < len; j++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      codes.push(`${prefix.toUpperCase()}${randomPart}`)
    }
    return codes
  }, [prefix, quantity, codeLength])

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(generatedCodes.join('\n'))
    setCopied(true)
    toast.success(`Copied ${generatedCodes.length} voucher serial codes to clipboard!`)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportCSV = () => {
    const headers = ['Serial Code', 'Batch Name', 'Type', 'Value', 'Min Spend', 'Channel', 'Expires At']
    const rows = generatedCodes.map((c) => [
      c,
      batchName,
      type,
      type === 'percentage' ? `${value}%` : `$${value}`,
      `$${minimumAmount}`,
      channelScope,
      expiresAt ? new Date(expiresAt).toLocaleDateString() : 'Never',
    ])
    downloadCsv(`batch_${prefix.replace(/[^a-zA-Z0-9]/g, '')}_vouchers`, headers, rows)
    toast.success(`Exported ${generatedCodes.length} serial codes as CSV dataset!`)
  }

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onGenerateBatch({
      name: batchName,
      codes: generatedCodes,
      type,
      value: parseFloat(value) || 5,
      currency,
      ...(maxDiscountCap && { maxDiscountCap: parseFloat(maxDiscountCap) }),
      minimumAmount: parseFloat(minimumAmount) || 0,
      channelScope,
      expiresAt,
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-card border border-border rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                <Layers size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Bulk Batch Voucher Serial Generator</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                    High Volume (500+)
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Generate hundreds of unique single-use voucher codes for events, SMS/Telegram, and gift cards.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Split */}
          <form onSubmit={handleConfirmSubmit} className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
            {/* Left Column: Generator Form (7 cols) */}
            <div className="lg:col-span-7 p-6 border-r border-border space-y-4">
              <div>
                <label className="label">Batch Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="e.g. Influencer Outreach Batch Q3"
                  className="input w-full font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Code Prefix *</label>
                  <input
                    type="text"
                    required
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    placeholder="KNY26-"
                    className="input w-full font-mono font-bold uppercase text-xs"
                  />
                </div>

                <div>
                  <label className="label">Batch Count</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="50"
                    className="input w-full font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="label">Random Length</label>
                  <input
                    type="number"
                    min="4"
                    max="12"
                    value={codeLength}
                    onChange={(e) => setCodeLength(e.target.value)}
                    placeholder="8"
                    className="input w-full font-mono text-xs"
                  />
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/30 border border-border">
                <div>
                  <label className="label">Voucher Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="input w-full text-xs font-semibold"
                  >
                    <option value="fixed">Fixed Amount ($)</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="label">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="5"
                    className="input w-full font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="label">Min Spend ($)</label>
                  <input
                    type="number"
                    value={minimumAmount}
                    onChange={(e) => setMinimumAmount(e.target.value)}
                    placeholder="20"
                    className="input w-full font-mono text-xs"
                  />
                </div>
              </div>

              {/* Channel Scope & Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Sales Channel</label>
                  <select
                    value={channelScope}
                    onChange={(e: any) => setChannelScope(e.target.value)}
                    className="input w-full text-xs"
                  >
                    <option value="all">🟢 Omni-Channel (Both)</option>
                    <option value="pos_only">🔵 POS Cashier Only</option>
                    <option value="storefront_only">🟣 Online Storefront</option>
                  </select>
                </div>

                <div>
                  <EnterpriseDateTimePicker
                    label="Expiry Date & Time"
                    value={expiresAt}
                    onChange={setExpiresAt}
                    outputFormat="YYYY-MM-DDTHH:mm"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Code Live Preview & Export (5 cols) */}
            <div className="lg:col-span-5 p-6 bg-muted/10 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Generated Codes Preview ({generatedCodes.length})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyCodes}
                      className="p-1.5 rounded-lg bg-card border border-border text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      <span className="text-[10px]">{copied ? 'Copied' : 'Copy All'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="p-1.5 rounded-lg bg-card border border-border text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Download size={13} />
                      <span className="text-[10px]">CSV</span>
                    </button>
                  </div>
                </div>

                {/* Codes Scroll Area */}
                <div className="p-3 bg-card rounded-2xl border border-border max-h-[300px] overflow-y-auto space-y-1 font-mono text-xs">
                  {generatedCodes.slice(0, 100).map((code, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-1.5 rounded hover:bg-muted/40 text-foreground"
                    >
                      <span className="font-bold text-primary">{code}</span>
                      <span className="text-[10px] text-muted-foreground">#{(idx + 1).toString().padStart(3, '0')}</span>
                    </div>
                  ))}
                  {generatedCodes.length > 100 && (
                    <p className="text-center text-[10px] text-muted-foreground pt-2">
                      ...and {generatedCodes.length - 100} more codes
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 flex items-center gap-2"
                >
                  {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  <span>Generate & Save {generatedCodes.length} Codes</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default BulkVoucherModal
