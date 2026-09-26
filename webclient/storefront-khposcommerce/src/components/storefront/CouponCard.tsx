import React, { useState } from 'react'
import { Tag, Check, Copy, Clock, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores'

import type { CouponItem } from '@/types/store'

export type { CouponItem }

interface CouponCardProps {
  coupon: CouponItem
  className?: string
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, className }) => {
  const { t } = useTranslation()
  const { formatPrice, convertPrice } = useSettingsStore()
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    navigator.clipboard.writeText(coupon.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isPercentage = coupon.type === 'percentage'
  const discountDisplay = isPercentage ? `${coupon.value}% OFF` : `${formatPrice(convertPrice(coupon.value))} OFF`

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-blue-900/90 via-indigo-900/90 to-purple-900/90 text-white border border-blue-500/30 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group',
        className
      )}
    >
      {/* Decorative background radial blur */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase border border-white/20">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" /> {coupon.type.replace('_', ' ')}
          </span>
          {coupon.expires_at && (
            <span className="text-[10px] text-blue-200 flex items-center gap-1 opacity-80">
              <Clock className="w-2.5 h-2.5" />
              {new Date(coupon.expires_at).toLocaleDateString()}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-extrabold text-white font-display tracking-tight mt-1">
          {discountDisplay}
        </h3>

        <p className="text-xs text-blue-100/90 mt-1 line-clamp-1">
          {coupon.name}
        </p>

        {coupon.min_purchase && coupon.min_purchase > 0 && (
          <p className="text-[11px] text-blue-200/70 mt-1">
            {t('coupon.min_spend')}: {formatPrice(convertPrice(coupon.min_purchase))}
          </p>
        )}
      </div>

      {/* Code & Copy button */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
        <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 font-mono font-bold text-xs tracking-wider text-amber-300 select-all">
          {coupon.code}
        </div>

        <button
          onClick={handleCopy}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95',
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-white text-gray-900 hover:bg-blue-50'
          )}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" /> {t('coupon.copied')}
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> {t('coupon.copy_code')}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default CouponCard
