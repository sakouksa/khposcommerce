import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useBrands } from '@/hooks'
import { getImageUrl } from '@/lib/utils'
import type { Brand } from '@/types/store'

// Custom high-fidelity brand logo renderers for tech enterprise brands
const brandRenderers: Record<string, () => React.ReactNode> = {
  // 1. Lenovo (Red Badge with White Text)
  lenovo: () => (
    <div className="flex items-center justify-center">
      <span className="inline-block bg-[#E2231A] text-white font-black text-xs sm:text-sm px-3 py-0.5 tracking-tight select-none">
        Lenovo
      </span>
    </div>
  ),

  // 2. Logitech
  logitech: () => (
    <div className="flex items-center gap-1 text-slate-900 dark:text-white font-black text-sm sm:text-base tracking-tighter">
      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
      </svg>
      <span className="font-extrabold tracking-tight">logitech</span>
    </div>
  ),

  // 3. Microsoft (4 Colorful Squares + Microsoft Text)
  microsoft: () => (
    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200">
      <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0">
        <div className="bg-[#F25022] w-1.5 h-1.5" />
        <div className="bg-[#7FBA00] w-1.5 h-1.5" />
        <div className="bg-[#00A4EF] w-1.5 h-1.5" />
        <div className="bg-[#FFB900] w-1.5 h-1.5" />
      </div>
      <span className="font-semibold tracking-tight text-slate-800 dark:text-slate-100">Microsoft</span>
    </div>
  ),

  // 4. Prolink (Blue Text with Green Dot)
  prolink: () => (
    <div className="flex items-center font-black text-sm sm:text-base text-[#005BAC] tracking-tight">
      <span>prol</span>
      <span className="text-[#00A859] relative">i<span className="absolute -top-1 left-0 text-[#00A859]">•</span></span>
      <span>nk</span>
    </div>
  ),

  // 5. Toshiba (Bold Red Text)
  toshiba: () => (
    <span className="font-black text-xs sm:text-sm text-[#E60012] tracking-widest uppercase">
      TOSHIBA
    </span>
  ),

  // 6. Transcend (Red Text with Wing Logo)
  transcend: () => (
    <div className="flex items-center gap-1 text-[#ED1B2D] font-black text-xs sm:text-sm">
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2L2 12l10 10 10-10L12 2zm0 4.5l5.5 5.5-5.5 5.5L6.5 12 12 6.5z" />
      </svg>
      <span className="italic font-bold tracking-tight">Transcend</span>
    </div>
  ),

  // 7. NEC (Bold Navy Blue Text)
  nec: () => (
    <span className="font-black text-sm sm:text-base text-[#1414A0] tracking-wider uppercase font-display">
      NEC
    </span>
  ),

  // 8. MSI
  msi: () => (
    <div className="flex items-center gap-1 font-black text-sm text-slate-800 dark:text-white">
      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#E2231A] rotate-45 inline-block shrink-0" />
      <span className="text-base tracking-tighter font-display font-black text-[#E2231A]">MSI</span>
    </div>
  ),

  // 9. PTC Computer
  ptc: () => (
    <div className="flex flex-col items-center leading-none text-[#005BAC]">
      <span className="font-black text-sm sm:text-base tracking-tighter">PTC</span>
      <span className="text-[7px] font-bold tracking-widest text-[#005BAC]/80 uppercase">COMPUTER</span>
    </div>
  ),

  // 10. Hikvision (Bold Red)
  hikvision: () => (
    <span className="font-black text-xs sm:text-sm text-[#E60012] tracking-wider uppercase">
      HIKVISION
    </span>
  ),

  // 11. AOC (Bold Cyan/Blue)
  aoc: () => (
    <span className="font-black text-sm sm:text-base text-[#0077C8] tracking-widest font-display">
      ЛОС
    </span>
  ),

  // 12. Ubiquiti (Blue U Logo)
  ubiquiti: () => (
    <div className="flex items-center gap-1 font-black text-xs text-[#006FFF]">
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5V7h2v5c0 1.66 1.34 3 3 3s3-1.34 3-3V7h2v5c0 2.76-2.24 5-5 5z" />
      </svg>
      <span className="font-bold tracking-wider text-[10px] sm:text-[11px] uppercase">UBIQUITI</span>
    </div>
  ),

  // 13. Cisco (Cyan Multi-bar Bridge)
  cisco: () => (
    <div className="flex flex-col items-center leading-none text-[#049FD9]">
      <div className="flex items-end gap-0.5 h-2.5 mb-0.5">
        <div className="w-0.5 h-1 bg-[#049FD9]" />
        <div className="w-0.5 h-2 bg-[#049FD9]" />
        <div className="w-0.5 h-2.5 bg-[#049FD9]" />
        <div className="w-0.5 h-2 bg-[#049FD9]" />
        <div className="w-0.5 h-1 bg-[#049FD9]" />
      </div>
      <span className="font-black text-xs sm:text-sm tracking-wider uppercase">CISCO</span>
    </div>
  ),

  // 14. Planet (Blue Earth Logo)
  planet: () => (
    <div className="flex items-center gap-1 text-[#005BAC] font-black text-xs sm:text-sm">
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F58220] fill-current" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" fill="#005BAC" />
      </svg>
      <span className="font-black tracking-wider uppercase">PLANET</span>
    </div>
  ),

  // 15. Cooler Master
  'cooler-master': () => (
    <div className="flex items-center gap-1 font-black text-xs text-slate-800 dark:text-slate-200 border border-slate-700 dark:border-slate-300 px-2 py-0.5 rounded-md">
      <span className="uppercase text-[9px] sm:text-[10px] tracking-tight font-extrabold">COOLER MASTER</span>
    </div>
  ),

  // 16. Tally Dascom (Teal)
  'tally-dascom': () => (
    <div className="flex flex-col items-center leading-none text-[#00828A]">
      <span className="font-bold text-[8px] sm:text-[9px] uppercase tracking-wider">Tally</span>
      <span className="font-black text-xs sm:text-sm tracking-widest uppercase">DASCOM</span>
    </div>
  ),

  // 17. Intel (Classic Blue Swirl)
  intel: () => (
    <div className="flex items-center justify-center font-black text-sm sm:text-base text-[#0071C5] tracking-tight">
      <span className="border-2 border-[#0071C5] rounded-full px-2 py-0.5 text-xs sm:text-sm font-bold">
        intel
      </span>
    </div>
  ),

  // 18. Apple
  apple: () => (
    <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 170 170">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.85-11.7-14.43-6-9.61-10.7-20.48-14.1-32.61-3.41-12.13-5.12-23.46-5.12-34 0-14.28 3.53-26.04 10.6-35.29 7.07-9.25 16-13.97 26.8-14.15 4.58 0 9.77 1.25 15.58 3.75 5.8 2.5 9.72 3.82 11.75 3.96 1.63-.14 5.75-1.52 12.37-4.14 6.62-2.62 12.11-3.79 16.48-3.5 12.22.95 21.84 5.43 28.87 13.43-10.88 6.64-16.2 15.74-15.96 27.29.23 9.07 3.63 16.73 10.2 22.97 6.57 6.24 14.34 9.87 23.31 10.89-2.31 6.83-5.14 13.75-8.49 20.76zM119.22 33.64c0-7.39 2.66-14.34 7.99-20.85 5.33-6.51 11.83-10.77 19.5-12.79.13 1.09.2 2.05.2 2.87 0 7.42-2.82 14.46-8.47 21.13-5.65 6.67-12.25 10.78-19.8 12.33-.42-.96-.63-1.85-.63-2.69z" />
      </svg>
      <span>Apple</span>
    </div>
  ),

  // 19. ASUS
  asus: () => (
    <span className="font-black text-sm sm:text-base text-[#00539B] tracking-wider font-display">
      ASUS
    </span>
  ),

  // 20. Dell
  dell: () => (
    <div className="flex items-center gap-1 font-black text-xs sm:text-sm text-[#0076CE]">
      <span className="border-2 border-[#0076CE] rounded-full px-2 py-0.5 font-bold uppercase">
        DELL
      </span>
    </div>
  ),

  // 21. HP
  hp: () => (
    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0096D6] flex items-center justify-center text-white font-black text-xs italic shadow-xs">
      hp
    </div>
  ),

  // 22. Samsung
  samsung: () => (
    <span className="font-black text-xs sm:text-sm text-[#1428A0] tracking-widest uppercase">
      SAMSUNG
    </span>
  ),

  // 23. TP-Link
  'tp-link': () => (
    <div className="flex items-center gap-1 text-[#4ACBD6] font-bold text-xs sm:text-sm">
      <span className="w-2.5 h-2.5 rounded-full bg-[#4ACBD6] inline-block" />
      <span className="font-extrabold tracking-tight">tp-link</span>
    </div>
  ),

  // 24. Kingston
  kingston: () => (
    <div className="flex items-center gap-1 text-[#C41230] font-black text-xs sm:text-sm">
      <span className="w-2.5 h-2.5 bg-[#C41230] rounded-xs inline-block" />
      <span className="tracking-tight font-extrabold">Kingston</span>
    </div>
  ),

  // 25. Western Digital / WD
  'western-digital': () => (
    <span className="font-black text-xs sm:text-sm text-[#002F6C] tracking-widest uppercase">
      Western Digital
    </span>
  ),

  // 26. Xiaomi
  xiaomi: () => (
    <div className="w-6 h-6 rounded-lg bg-[#FF6900] flex items-center justify-center text-white font-black text-xs shadow-xs">
      mi
    </div>
  ),

  // 27. Oppo
  oppo: () => (
    <span className="font-black text-xs sm:text-sm text-[#00875A] tracking-wider lowercase">
      oppo
    </span>
  ),

  // 28. JBL
  jbl: () => (
    <span className="font-black text-xs sm:text-sm text-[#E2231A] tracking-tight uppercase">
      JBL
    </span>
  ),

  // 29. Sony
  sony: () => (
    <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white tracking-widest uppercase font-mono">
      SONY
    </span>
  ),
}

export const BrandPartnersMarquee: React.FC = () => {
  const { t } = useTranslation()

  // Fetch real brands dynamically from Laravel Backend API
  const { data: dbBrands = [] } = useBrands()

  // If no brands loaded yet, fallback to default keys
  const brandsToRender: Array<Partial<Brand>> = dbBrands.length > 0
    ? dbBrands
    : Object.keys(brandRenderers).map((slug) => ({
        slug,
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
      }))

  return (
    <div className="bg-white dark:bg-slate-900 py-6 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors">
      <div className="container-site mb-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          {t('section.brands_title', 'Official Brand Partners & Authorized Distributors')}
        </h3>
      </div>

      {/* Marquee Wrapper with Smooth Gradient Mask on Left/Right */}
      <div className="relative w-full overflow-hidden">
        {/* Left Gradient Mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10" />

        {/* Right Gradient Mask */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10" />

        {/* Seamless Infinite Marquee Track */}
        <div className="animate-marquee flex items-center gap-6 sm:gap-10 py-2">
          {[...brandsToRender, ...brandsToRender].map((brand, idx) => {
            const slug = (brand.slug || brand.name || '').toLowerCase()
            const customRenderer = brandRenderers[slug]

            return (
              <Link
                to={`/products?brand=${encodeURIComponent(slug)}`}
                key={`${slug}-${idx}`}
                className="flex items-center justify-center shrink-0 px-2 py-1 transition-transform duration-300 hover:scale-110 cursor-pointer"
                title={brand.name}
              >
                {customRenderer ? (
                  customRenderer()
                ) : brand.logo ? (
                  <img
                    src={getImageUrl(brand.logo)}
                    alt={brand.name || 'Brand'}
                    className="h-5 sm:h-6 w-auto max-w-[90px] object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-200 tracking-tight">
                    {brand.name}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BrandPartnersMarquee
