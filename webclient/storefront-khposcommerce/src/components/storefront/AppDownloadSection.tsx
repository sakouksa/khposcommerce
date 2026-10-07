import React from 'react'
import { motion } from 'framer-motion'
import { Smartphone, QrCode, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export const AppDownloadSection: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation()

  return (
    <section className={cn('w-full py-6 sm:py-10', className)}>
      <div className="container-site">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 border border-blue-800/40 p-6 sm:p-10 lg:p-14 text-white shadow-2xl">
          {/* Decorative Glow */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md">
                <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                Mobile Shopping Experience
              </span>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display leading-tight tracking-tight">
                Download Our Official Mobile App & Get $10 OFF
              </h2>

              <p className="text-xs sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
                Experience fast 1-tap checkout, instant flash sale push notifications, live GPS delivery tracking, and exclusive app-only voucher discounts.
              </p>

              {/* App Features Checklist */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Instant Push Sale Alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Real-time GPS Delivery Track</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>KHQR & 1-Tap Secure Pay</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Loyalty Points Multiplier</span>
                </div>
              </div>

              {/* App Store Buttons */}
              <div className="flex items-center gap-3 pt-4 flex-wrap">
                <a
                  href="#download"
                  className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-lg inline-flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>Google Play</span>
                </a>
                <a
                  href="#download"
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>App Store (iOS)</span>
                </a>
              </div>
            </div>

            {/* Right QR Code Box */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-center space-y-3 max-w-xs">
                <div className="w-44 h-44 mx-auto rounded-2xl bg-white p-3 shadow-inner flex items-center justify-center">
                  {/* High quality clean QR Code visual */}
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://enterprisestore.com/app"
                    alt="Scan to Download Mobile App"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs font-bold text-white">Scan with your camera to download</div>
                <div className="text-[11px] text-blue-300">Supports iOS & Android devices</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppDownloadSection
