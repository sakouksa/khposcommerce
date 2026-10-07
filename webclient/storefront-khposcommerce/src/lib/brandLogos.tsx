import React, { useState } from 'react'
import { getImageUrl, cn } from '@/lib/utils'

export interface BrandLogoProps {
  brand: {
    id?: number
    name: string
    slug?: string
    logo?: string | null
    image?: string | null
  }
  className?: string
  imgClassName?: string
}

// Custom vector brand logo renderers for tech enterprise brands
export const brandVectorRenderers: Record<string, () => React.ReactNode> = {
  // 1. Apple
  apple: () => (
    <svg className="w-3.5 h-3.5 fill-current text-slate-800 dark:text-slate-200" viewBox="0 0 170 170">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.85-11.7-14.43-6-9.61-10.7-20.48-14.1-32.61-3.41-12.13-5.12-23.46-5.12-34 0-14.28 3.53-26.04 10.6-35.29 7.07-9.25 16-13.97 26.8-14.15 4.58 0 9.77 1.25 15.58 3.75 5.8 2.5 9.72 3.82 11.75 3.96 1.63-.14 5.75-1.52 12.37-4.14 6.62-2.62 12.11-3.79 16.48-3.5 12.22.95 21.84 5.43 28.87 13.43-10.88 6.64-16.2 15.74-15.96 27.29.23 9.07 3.63 16.73 10.2 22.97 6.57 6.24 14.34 9.87 23.31 10.89-2.31 6.83-5.14 13.75-8.49 20.76zM119.22 33.64c0-7.39 2.66-14.34 7.99-20.85 5.33-6.51 11.83-10.77 19.5-12.79.13 1.09.2 2.05.2 2.87 0 7.42-2.82 14.46-8.47 21.13-5.65 6.67-12.25 10.78-19.8 12.33-.42-.96-.63-1.85-.63-2.69z" />
    </svg>
  ),

  // 2. ASUS
  asus: () => (
    <span className="font-black text-[10px] text-[#00539B] tracking-wider leading-none">
      ASUS
    </span>
  ),

  // 3. Dell
  dell: () => (
    <span className="font-black text-[9px] text-[#0076CE] tracking-tight leading-none uppercase">
      DELL
    </span>
  ),

  // 4. Cisco
  cisco: () => (
    <div className="flex items-end gap-0.5 h-3">
      <div className="w-0.5 h-1.5 bg-[#049FD9]" />
      <div className="w-0.5 h-2.5 bg-[#049FD9]" />
      <div className="w-0.5 h-3 bg-[#049FD9]" />
      <div className="w-0.5 h-2 bg-[#049FD9]" />
      <div className="w-0.5 h-1 bg-[#049FD9]" />
    </div>
  ),

  // 5. AOC
  aoc: () => (
    <span className="font-black text-[10px] text-[#0077C8] tracking-widest leading-none">
      AOC
    </span>
  ),

  // 6. Cooler Master
  'cooler-master': () => (
    <span className="font-black text-[8px] text-slate-800 dark:text-slate-200 uppercase leading-none">
      CM
    </span>
  ),

  // 7. Lenovo
  lenovo: () => (
    <span className="bg-[#E2231A] text-white font-black text-[8px] px-1 py-0.5 leading-none">
      LENOVO
    </span>
  ),

  // 8. Logitech
  logitech: () => (
    <svg className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
    </svg>
  ),

  // 9. Microsoft
  microsoft: () => (
    <div className="grid grid-cols-2 gap-0.5 w-3 h-3 shrink-0">
      <div className="bg-[#F25022] w-1.2 h-1.2" />
      <div className="bg-[#7FBA00] w-1.2 h-1.2" />
      <div className="bg-[#00A4EF] w-1.2 h-1.2" />
      <div className="bg-[#FFB900] w-1.2 h-1.2" />
    </div>
  ),

  // 10. MSI
  msi: () => (
    <span className="font-black text-[10px] text-[#E2231A] tracking-tight leading-none">
      MSI
    </span>
  ),

  // 11. HP
  hp: () => (
    <div className="w-4 h-4 rounded-full bg-[#0096D6] flex items-center justify-center text-white font-black text-[9px] italic leading-none">
      hp
    </div>
  ),

  // 12. Samsung
  samsung: () => (
    <span className="font-black text-[8px] text-[#1428A0] tracking-wider leading-none uppercase">
      SAMSUNG
    </span>
  ),

  // 13. TP-Link
  'tp-link': () => (
    <div className="flex items-center gap-0.5 text-[#4ACBD6] font-extrabold text-[9px] leading-none">
      <span className="w-1.5 h-1.5 rounded-full bg-[#4ACBD6] inline-block" />
      <span>TP</span>
    </div>
  ),

  // 14. Intel
  intel: () => (
    <span className="font-black text-[9px] text-[#0071C5] tracking-tight leading-none">
      intel
    </span>
  ),

  // 15. Sony
  sony: () => (
    <span className="font-black text-[9px] text-slate-900 dark:text-white tracking-wider uppercase leading-none">
      SONY
    </span>
  ),

  // 16. JBL
  jbl: () => (
    <span className="font-black text-[9px] text-[#E2231A] tracking-tight uppercase leading-none">
      JBL
    </span>
  ),

  // 17. Xiaomi
  xiaomi: () => (
    <div className="w-4 h-4 rounded-md bg-[#FF6900] flex items-center justify-center text-white font-black text-[8px] leading-none">
      mi
    </div>
  ),

  // 18. Kingston
  kingston: () => (
    <div className="w-3 h-3 bg-[#C41230] rounded-xs flex items-center justify-center text-white font-black text-[8px] leading-none">
      K
    </div>
  ),

  // 19. Ubiquiti
  ubiquiti: () => (
    <svg className="w-3.5 h-3.5 fill-[#006FFF]" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5V7h2v5c0 1.66 1.34 3 3 3s3-1.34 3-3V7h2v5c0 2.76-2.24 5-5 5z" />
    </svg>
  ),

  // 20. Toshiba
  toshiba: () => (
    <span className="font-black text-[8px] text-[#E60012] tracking-wider uppercase leading-none">
      TOSHIBA
    </span>
  ),

  // 21. Hikvision
  hikvision: () => (
    <span className="font-black text-[8px] text-[#E60012] tracking-wider uppercase leading-none">
      HIK
    </span>
  ),
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  brand,
  className,
  imgClassName,
}) => {
  const [imgError, setImgError] = useState(false)
  const slug = (brand.slug || brand.name || '').toLowerCase().replace(/\s+/g, '-')
  const rawLogo = brand.logo || brand.image
  const logoUrl = rawLogo ? getImageUrl(rawLogo) : null

  // 1. If real logo image exists and hasn't failed to load, display <img>
  if (logoUrl && !imgError) {
    return (
      <div
        className={cn(
          'w-7 h-7 rounded-lg bg-white dark:bg-slate-800 p-1 flex items-center justify-center border border-slate-100 dark:border-slate-700/80 shadow-2xs overflow-hidden flex-shrink-0',
          className
        )}
      >
        <img
          src={logoUrl}
          alt={brand.name}
          onError={() => setImgError(true)}
          className={cn('w-full h-full object-contain', imgClassName)}
          loading="lazy"
        />
      </div>
    )
  }

  // 2. If vector/SVG renderer matches this brand slug
  const VectorRenderer = brandVectorRenderers[slug]
  if (VectorRenderer) {
    return (
      <div
        className={cn(
          'w-7 h-7 rounded-lg bg-white dark:bg-slate-800 p-1 flex items-center justify-center border border-slate-100 dark:border-slate-700/80 shadow-2xs overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform',
          className
        )}
      >
        {VectorRenderer()}
      </div>
    )
  }

  // 3. Clean stylized letter fallback
  const firstLetter = brand.name ? brand.name.charAt(0).toUpperCase() : 'B'
  return (
    <div
      className={cn(
        'w-7 h-7 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border border-blue-100/80 dark:border-slate-700 shadow-2xs flex items-center justify-center text-xs font-black text-blue-600 dark:text-blue-400 flex-shrink-0 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all',
        className
      )}
    >
      {firstLetter}
    </div>
  )
}
