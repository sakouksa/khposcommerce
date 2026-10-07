import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCompanyStore } from '@/stores/companyStore'
import { useAuthStore } from '@/stores/authStore'
import { getAbsoluteImageUrl } from '@/utils/image'

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  imageClassName?: string
  customLogo?: string | null
  customName?: string
  showText?: boolean
  showTagline?: boolean
  animated?: boolean
  onClick?: () => void
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  bordered?: boolean
}

const SIZE_CONFIG = {
  xs: { height: 'h-7 sm:h-8', minWidth: 'min-w-7 sm:min-w-8', maxWidth: 'max-w-[100px]', text: 'text-xs', sub: 'text-[9px]' },
  sm: { height: 'h-9 sm:h-10', minWidth: 'min-w-9 sm:min-w-10', maxWidth: 'max-w-[130px]', text: 'text-sm', sub: 'text-[10px]' },
  md: { height: 'h-11 sm:h-12', minWidth: 'min-w-11 sm:min-w-12', maxWidth: 'max-w-[160px]', text: 'text-base', sub: 'text-xs' },
  lg: { height: 'h-14 sm:h-16', minWidth: 'min-w-14 sm:min-w-16', maxWidth: 'max-w-[200px]', text: 'text-xl', sub: 'text-xs' },
  xl: { height: 'h-20 sm:h-24', minWidth: 'min-w-20 sm:min-w-24', maxWidth: 'max-w-[280px]', text: 'text-2xl', sub: 'text-sm' },
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'sm',
  className = '',
  imageClassName = '',
  customLogo,
  customName,
  showText = false,
  showTagline = false,
  animated = false,
  onClick,
  rounded = '2xl',
  bordered = false,
}) => {
  const { branding } = useCompanyStore()
  const { user } = useAuthStore()
  const [imgError, setImgError] = useState(false)

  // Prioritize customLogo -> dynamic branding logo -> user company logo -> default /logo.png
  const rawLogo = customLogo !== undefined ? customLogo : (branding.logo || user?.company?.logo || '/logo.png')
  const logoUrl = getAbsoluteImageUrl(rawLogo || '') || '/logo.png'

  useEffect(() => {
    setImgError(false)
  }, [logoUrl])

  const displayName = customName || user?.company?.name || branding.brand_name || 'OptaPOS'
  const displayTagline = branding.brand_tagline || 'Next-Generation Enterprise POS'

  const cfg = SIZE_CONFIG[size] || SIZE_CONFIG.sm
  const roundedClass = `rounded-${rounded}`

  const Content = (
    <div
      className={`inline-flex items-center gap-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* ─── Master Logo Container (Flexible, Transparent, Curved / Rounded Support) ─── */}
      <div
        className={`relative flex items-center justify-center shrink-0 transition-all duration-200 ${cfg.height} ${cfg.minWidth} ${cfg.maxWidth} ${roundedClass} overflow-hidden ${
          bordered
            ? 'bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-xs ring-1 ring-black/5 dark:ring-white/5 p-1'
            : 'bg-transparent border-0 shadow-none p-0'
        }`}
      >
        {!imgError && logoUrl ? (
          <img
            src={logoUrl}
            alt={`${displayName} Logo`}
            onError={() => setImgError(true)}
            className={`w-auto h-full max-w-full max-h-full object-contain select-none transition-transform duration-200 ${roundedClass} ${imageClassName}`}
          />
        ) : (
          /* Sleek fallback vector monogram badge with curved modern radius */
          <div className={`w-full h-full aspect-square ${roundedClass} bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white font-black shadow-inner`}>
            <span className="leading-none text-white tracking-wider font-extrabold text-sm uppercase">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col min-w-0 text-left">
          <span className={`font-black tracking-tight leading-none text-slate-900 dark:text-white truncate ${cfg.text}`}>
            {displayName}
          </span>
          {showTagline && (
            <span className={`text-slate-500 dark:text-slate-400 font-medium truncate mt-1 ${cfg.sub}`}>
              {displayTagline}
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (animated) {
    return (
      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
        {Content}
      </motion.div>
    )
  }

  return Content
}

export default BrandLogo
