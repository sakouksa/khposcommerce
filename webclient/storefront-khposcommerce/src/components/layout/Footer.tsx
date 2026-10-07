import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  RefreshCw,
  Headset,
  Clock,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'

import { useStoreSettings } from '@/hooks'
import { resolveMediaUrl } from '@/lib/utils'
import {
  FacebookAppIcon,
  TikTokAppIcon,
  InstagramAppIcon,
  TelegramAppIcon,
  YouTubeAppIcon,
} from '@/lib/socialIcons'

interface FooterProps {
  storeInfo?: {
    name?: string
    email?: string
    phone?: string
    address?: string
    currency?: string
  }
}

export const Footer: React.FC<FooterProps> = ({ storeInfo }) => {
  const { t } = useTranslation()
  const [logoError, setLogoError] = useState(false)

  // Fetch real-time reactive store settings from backend API
  const { data: storeSettings } = useStoreSettings()

  React.useEffect(() => {
    setLogoError(false)
  }, [storeSettings?.site_logo])

  const name = storeInfo?.name || storeSettings?.site_name || 'NexTech Tbong Khmum'
  const email = storeInfo?.email || storeSettings?.site_email || 'tbongkhmum@enterprise-pos.com'
  const phone = storeInfo?.phone || storeSettings?.company_phone || '+855 71 888 999'
  const address = storeInfo?.address || storeSettings?.company_address || 'ក្រុងសួង, ខេត្តត្បូងឃ្មុំ, ព្រះរាជាណាចក្រកម្ពុជា'
  const logo = storeSettings?.site_logo

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs mt-auto border-t border-slate-800 select-none">
      {/* ── VALUE PROPOSITIONS STRIP ────────────────────────────────────────── */}
      <div className="border-b border-slate-800/80 py-6 bg-slate-900/50">
        <div className="container-site grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Free Express Delivery</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{t('nav.free_shipping')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">{t('footer.payment_methods')}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">ABA KHQR, Wing Bank, Visa, Mastercard</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-amber-600/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">{t('footer.returns_refunds')}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Easy 30-Day Guarantee Policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center flex-shrink-0">
              <Headset className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">{t('footer.customer_service')}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">24/7 Dedicated Support Team</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN FOOTER COLUMNS ─────────────────────────────────────────── */}
      <div className="container-site py-10 lg:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Column 1: Store Brand Info, Hotlines & Opening Hours (3 cols) */}
        <div className="lg:col-span-3 sm:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3 group">
            {!logoError ? (
              <div className="h-11 max-w-[160px] flex items-center justify-center rounded-xl overflow-hidden">
                <img
                  src={resolveMediaUrl(logo, 'company') || '/logo.png'}
                  alt={name}
                  onError={() => setLogoError(true)}
                  className="h-10 w-auto max-w-full object-contain rounded-xl select-none brightness-110"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-2xl bg-[#2C376B] flex items-center justify-center shadow-md">
                <span className="text-white font-black text-base font-display">{name.charAt(0)}</span>
              </div>
            )}

            <div className="flex flex-col">
              <span className="font-black text-xl text-white font-display tracking-tight">
                {name}
              </span>
              <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">
                {storeSettings?.site_subtitle || 'Tech Store & POS'}
              </span>
            </div>
          </Link>

          <p className="text-xs text-slate-400 leading-relaxed pr-4">
            {t('footer.description')}
          </p>

          <div className="space-y-2 text-xs pt-1">
            {/* Opening Hours */}
            <div className="flex items-start gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">Opening Hours:</div>
                <div className="text-slate-400">{storeSettings?.store_hours || 'Monday to Sunday, 8:00 AM to 8:00 PM'}</div>
              </div>
            </div>

            {/* Sales Hotlines */}
            <div className="flex items-start gap-2 text-slate-300 pt-1">
              <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">Sales Showroom Hotlines:</div>
                <div className="text-slate-400 space-x-2 font-semibold">
                  {(storeSettings?.hotlines && storeSettings.hotlines.length > 0 ? storeSettings.hotlines : [phone]).map((num, i, arr) => (
                    <React.Fragment key={i}>
                      <a href={`tel:${num.replace(/\s+/g, '')}`} className="hover:text-emerald-400 transition-colors">
                        {num}
                      </a>
                      {i < arr.length - 1 && <span>•</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Service Center */}
            <div className="flex items-start gap-2 text-slate-300 pt-1">
              <Headset className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">Service Center & Repair:</div>
                <div className="text-slate-400 space-x-2 font-semibold">
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-amber-400 transition-colors">
                    {phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-2 text-slate-300 pt-1">
              <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-slate-400">{address}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Links (2 cols) */}
        <div className="lg:col-span-2">
          <h4 className="font-black text-white mb-4 text-xs uppercase tracking-wider">
            {t('footer.quick_links', 'Quick Links')}
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/products" className="hover:text-white transition-colors">{t('nav.products')}</Link></li>
            <li><Link to="/products?sort=deals" className="hover:text-white transition-colors">{t('nav.deals')}</Link></li>
            <li><Link to="/blog" className="hover:text-white transition-colors">{t('nav.blog')}</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">{t('nav.about')}</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">{t('nav.contact')}</Link></li>
            <li><Link to="/track-order" className="hover:text-white transition-colors">{t('nav.track_order', 'Track Order')}</Link></li>
          </ul>
        </div>

        {/* Column 3: Conditions & Policies (2 cols) */}
        <div className="lg:col-span-2">
          <h4 className="font-black text-white mb-4 text-xs uppercase tracking-wider">
            Conditions Apply
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/terms" className="hover:text-white transition-colors">{t('footer.terms_service')}</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">{t('footer.privacy_policy')}</Link></li>
            <li><Link to="/shipping" className="hover:text-white transition-colors">{t('footer.shipping_policy')}</Link></li>
            <li><Link to="/returns" className="hover:text-white transition-colors">{t('footer.returns_refunds')}</Link></li>
            <li><Link to="/faq" className="hover:text-white transition-colors">{t('footer.faq')}</Link></li>
          </ul>
        </div>

        {/* Column 4: My Account (2 cols) */}
        <div className="lg:col-span-2">
          <h4 className="font-black text-white mb-4 text-xs uppercase tracking-wider">
            My Account
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/auth/login" className="hover:text-white transition-colors">{t('nav.login')}</Link></li>
            <li><Link to="/account/orders" className="hover:text-white transition-colors">{t('nav.my_orders', 'Order History')}</Link></li>
            <li><Link to="/account/wishlist" className="hover:text-white transition-colors">{t('nav.wishlist')}</Link></li>
            <li><Link to="/track-order" className="hover:text-white transition-colors">{t('nav.track')}</Link></li>
          </ul>
        </div>

        {/* Column 5: Download Our Official APP & Get $10 OFF (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800/90 shadow-xl space-y-3.5">
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-wider">
                <Smartphone className="w-3 h-3 text-amber-400" />
                Download Our APP
              </span>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                GET $10 OFF
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-snug">
              Scan with your smartphone to download our official app for iOS & Android.
            </p>

            {/* Store Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href="#download-google-play"
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] border border-slate-700 transition-colors shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Play</span>
              </a>
              <a
                href="#download-app-store"
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] border border-slate-700 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>App Store</span>
              </a>
            </div>

            {/* QR Codes Grid */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-20 h-20 rounded-xl bg-white p-1.5 shadow-inner flex items-center justify-center flex-shrink-0">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://enterprisestore.com/app/ios"
                  alt="iOS QR Code"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="w-20 h-20 rounded-xl bg-white p-1.5 shadow-inner flex items-center justify-center flex-shrink-0">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://enterprisestore.com/app/android"
                  alt="Android QR Code"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                <div className="font-bold text-white">Instant 1-Tap QR</div>
                <div>iOS & Android Supported</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. SOCIAL MEDIA & ACCEPTED PAYMENTS BAR ────────────────────────── */}
      <div className="border-t border-slate-900 bg-slate-950 py-5">
        <div className="container-site flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Media Links */}
          <div className="flex items-center gap-2.5">
            {/* Official Social Media Channels */}
            <a
              href={storeSettings?.socials?.facebook || 'https://facebook.com'}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              title="Facebook"
              className="flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
            >
              <FacebookAppIcon className="w-7 h-7 shadow-xs" size={28} />
            </a>

            <a
              href={storeSettings?.socials?.telegram || 'https://t.me'}
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
              title="Telegram"
              className="flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
            >
              <TelegramAppIcon className="w-7 h-7 shadow-xs" size={28} />
            </a>

            <a
              href={storeSettings?.socials?.tiktok || 'https://tiktok.com'}
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              title="TikTok"
              className="flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
            >
              <TikTokAppIcon className="w-7 h-7 shadow-xs" size={28} />
            </a>

            <a
              href={storeSettings?.socials?.instagram || 'https://instagram.com'}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              title="Instagram"
              className="flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
            >
              <InstagramAppIcon className="w-7 h-7 shadow-xs" size={28} />
            </a>

            <a
              href={storeSettings?.socials?.youtube || 'https://youtube.com'}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              title="YouTube"
              className="flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
            >
              <YouTubeAppIcon className="w-7 h-7 shadow-xs" size={28} />
            </a>
          </div>

          {/* Copyright text */}
          <div className="text-center text-slate-500 text-[11px]">
            © {new Date().getFullYear()} {name}. All rights reserved. Enterprise Tech & POS Platform.
          </div>

          {/* Payment Methods Badges */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center text-[10px]">
            <span className="text-slate-400 font-bold mr-1">We Accept:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold shadow-xs">Wing Bank</span>
            <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-extrabold shadow-xs">KHQR</span>
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-extrabold shadow-xs">VISA</span>
            <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-extrabold shadow-xs">Mastercard</span>
            <span className="px-2 py-0.5 rounded bg-cyan-700 text-white font-extrabold shadow-xs">UnionPay</span>
            <span className="px-2 py-0.5 rounded bg-indigo-700 text-white font-extrabold shadow-xs">JCB</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
