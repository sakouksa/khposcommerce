import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Megaphone,
  Sparkles,
  Eye,
  CheckCircle2,
  Save,
  Link as LinkIcon,
  Tag,
  Gift,
  RotateCcw,
  ExternalLink,
  Ticket,
  Check,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Power,
  Layers,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cmsService } from '@/services/cmsService'
import { marketingService } from '@/services/marketingService'
import { useToast } from '@/hooks/useToast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { AnnouncementConfig } from '../../types/cms.types'

const SEASONAL_PRESETS = [
  {
    name: '🚚 ដឹកជញ្ជូនឥតគិតថ្លៃទូទាំងប្រទេស (Free Shipping)',
    message_km: '🚚 ដឹកជញ្ជូនឥតគិតថ្លៃទូទាំង ២៥ រាជធានី-ខេត្ត សម្រាប់ការកុម្ម៉ង់ចាប់ពី $50 ឡើងទៅ!',
    message_en: '🚚 Free Nationwide Delivery across Cambodia on all orders over $50!',
    badge: 'FREE DELIVERY',
    coupon: 'FREESHIP50',
    link: '/products',
    bg: 'from-blue-600 to-indigo-700',
  },
  {
    name: '🇰🇭 ពិធីបុណ្យចូលឆ្នាំខ្មែរ (Khmer New Year Mega Sale)',
    message_km: '🎉 រីករាយពិធីបុណ្យចូលឆ្នាំខ្មែរ! បញ្ចុះតម្លៃពិសេសរហូតដល់ 35% លើគ្រប់សម្ភារៈបច្ចេកវិទ្យា',
    message_en: '🎉 Happy Khmer New Year! Get up to 35% OFF on flagship laptops and smartphones',
    badge: 'KHMER NEW YEAR',
    coupon: 'KNY2026',
    link: '/promotions',
    bg: 'from-amber-600 to-rose-600',
  },
  {
    name: '🔥 មហាសន្សំប្រចាំខែ (Mid-Month Super Deals)',
    message_km: '⚡ មហាសន្សំថ្ងៃពាក់កណ្តាលខែ! បញ្ចុះបន្ថែម $10 ភ្លាមៗដោយប្រើកូដ MIDMONTH',
    message_en: '⚡ Super Mid-Month Deals! Extra $10 OFF with voucher code MIDMONTH',
    badge: 'FLASH DEAL',
    coupon: 'MIDMONTH',
    link: '/promotions',
    bg: 'from-purple-600 to-pink-600',
  },
]

export const AnnouncementsTab: React.FC = () => {
  const { t } = useTranslation(['cms', 'common'])
  const toast = useToast()
  const qc = useQueryClient()

  // Modal Form State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  // Form states
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [messageKm, setMessageKm] = useState('🚚 ដឹកជញ្ជូនឥតគិតថ្លៃទូទាំង ២៥ រាជធានី-ខេត្ត សម្រាប់ការកុម្ម៉ង់ចាប់ពី $50 ឡើងទៅ!')
  const [messageEn, setMessageEn] = useState('🚚 Free Nationwide Delivery across Cambodia on all orders over $50!')
  const [badgeText, setBadgeText] = useState('SPECIAL PROMO')
  const [couponCode, setCouponCode] = useState('OPTAPOS2026')
  const [linkUrl, setLinkUrl] = useState('/promotions')
  const [bgGradient, setBgGradient] = useState('from-indigo-600 to-purple-700')

  // Preview language toggle: 'km' | 'en'
  const [previewLang, setPreviewLang] = useState<'km' | 'en'>('km')
  // Preset category tab: 'coupons' | 'seasonal'
  const [presetCategory, setPresetCategory] = useState<'coupons' | 'seasonal'>('coupons')

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // 1. Fetch ALL announcement campaigns directly from Database table
  const {
    data: announcementsResponse,
    isLoading: isListLoading,
  } = useQuery({
    queryKey: ['announcements-db-list'],
    queryFn: () => cmsService.getAnnouncementsList({ per_page: 50 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const announcementsList: AnnouncementConfig[] = useMemo(() => {
    if (!announcementsResponse) return []
    const d = announcementsResponse?.data
    if (Array.isArray(d)) return d
    if (Array.isArray(d?.data)) return d.data
    if (Array.isArray(announcementsResponse)) return announcementsResponse
    return []
  }, [announcementsResponse])

  // Find currently active announcement from DB for Live Preview
  const activeAnnouncementFromDb = useMemo(() => {
    return announcementsList.find((a) => a.is_active) || announcementsList[0] || null
  }, [announcementsList])

  // 2. Fetch active store coupons dynamically from Database
  const { data: couponsData, isLoading: isCouponsLoading } = useQuery({
    queryKey: ['store-active-coupons-for-announcement'],
    queryFn: () => marketingService.getCoupons({ per_page: 20 }),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })

  const liveCoupons = useMemo(() => {
    if (!couponsData) return []
    const d = couponsData?.data
    const list = Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : (Array.isArray(couponsData) ? couponsData : []))
    return list.filter((c: any) => c.is_active !== false)
  }, [couponsData])

  // Sync initial form with active announcement if not editing
  useEffect(() => {
    if (activeAnnouncementFromDb && editingId === null) {
      setEditingId(activeAnnouncementFromDb.id || null)
      setTitle(activeAnnouncementFromDb.title || '')
      setEnabled(activeAnnouncementFromDb.is_active ?? true)
      setMessageKm(activeAnnouncementFromDb.message_km || '')
      setMessageEn(activeAnnouncementFromDb.message_en || activeAnnouncementFromDb.message || '')
      setBadgeText(activeAnnouncementFromDb.badge_text || 'SPECIAL PROMO')
      setCouponCode(activeAnnouncementFromDb.coupon_code || activeAnnouncementFromDb.code || '')
      setLinkUrl(activeAnnouncementFromDb.link_url || activeAnnouncementFromDb.link || '/promotions')
      setBgGradient(activeAnnouncementFromDb.bg_gradient || 'from-indigo-600 to-purple-700')
    }
  }, [activeAnnouncementFromDb])

  // Create / Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingId) {
        return cmsService.updateAnnouncement(editingId, data)
      }
      return cmsService.createAnnouncement(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements-db-list'] })
      qc.invalidateQueries({ queryKey: ['announcements'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      qc.invalidateQueries({ queryKey: ['announcement-settings'] })
      setIsFormModalOpen(false)
      toast.success(editingId ? 'បានកែប្រែយុទ្ធនាការក្នុង Database ដោយជោគជ័យ!' : 'បានបង្កើតយុទ្ធនាការថ្មីក្នុង Database ដោយជោគជ័យ!')
    },
    onError: () => {
      toast.error('បរាជ័យក្នុងការរក្សាទុកទិន្នន័យទៅ Database')
    },
  })

  // Toggle active announcement mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => cmsService.toggleAnnouncementActive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements-db-list'] })
      qc.invalidateQueries({ queryKey: ['announcements'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      toast.success('បានផ្លាស់ប្តូរយុទ្ធនាការសកម្មនៅលើ Storefront ដោយជោគជ័យ!')
    },
    onError: () => {
      toast.error('បរាជ័យក្នុងការផ្លាស់ប្តូរស្ថានភាព')
    },
  })

  // Delete announcement mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => cmsService.deleteAnnouncement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements-db-list'] })
      qc.invalidateQueries({ queryKey: ['announcements'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setConfirmOpen(false)
      setDeleteId(null)
      toast.success('បានលុបយុទ្ធនាការចេញពី Database!')
    },
    onError: () => {
      toast.error('បរាជ័យក្នុងការលុបទិន្នន័យ')
    },
  })

  const handleSave = () => {
    if (!messageKm.trim() && !messageEn.trim()) {
      toast.warning('សូមបញ្ចូលសារប្រកាសជាភាសាខ្មែរ ឬអង់គ្លេស')
      return
    }

    const payload = {
      title: title.trim() || 'Store Announcement Campaign',
      message_km: messageKm,
      message_en: messageEn,
      badge_text: badgeText,
      coupon_code: couponCode,
      link_url: linkUrl,
      bg_gradient: bgGradient,
      is_active: enabled,
    }
    saveMutation.mutate(payload)
  }

  const handleEditRecord = (item: AnnouncementConfig) => {
    setEditingId(item.id || null)
    setTitle(item.title || '')
    setEnabled(item.is_active ?? true)
    setMessageKm(item.message_km || '')
    setMessageEn(item.message_en || item.message || '')
    setBadgeText(item.badge_text || 'SPECIAL PROMO')
    setCouponCode(item.coupon_code || item.code || '')
    setLinkUrl(item.link_url || item.link || '/promotions')
    setBgGradient(item.bg_gradient || 'from-indigo-600 to-purple-700')
    setIsFormModalOpen(true)
  }

  const handleCreateNew = () => {
    setEditingId(null)
    setTitle('')
    setEnabled(true)
    setMessageKm('')
    setMessageEn('')
    setBadgeText('SPECIAL PROMO')
    setCouponCode('')
    setLinkUrl('/promotions')
    setBgGradient('from-indigo-600 to-purple-700')
    setIsFormModalOpen(true)
  }

  const applySeasonalPreset = (preset: typeof SEASONAL_PRESETS[0]) => {
    setEditingId(null)
    setTitle(preset.name)
    setMessageKm(preset.message_km)
    setMessageEn(preset.message_en)
    setBadgeText(preset.badge)
    setCouponCode(preset.coupon)
    setLinkUrl(preset.link)
    setBgGradient(preset.bg)
    setIsFormModalOpen(true)
    toast.info(`បានផ្ទុកគំរូ "${preset.name}" ចូលក្នុងទម្រង់`)
  }

  const applyLiveCoupon = (coupon: any) => {
    const isPercent = coupon.type === 'percentage'
    const isFreeShip = coupon.type === 'free_shipping'
    const discountLabel = isFreeShip ? 'Free Delivery' : isPercent ? `${Number(coupon.value)}% OFF` : `$${Number(coupon.value)} OFF`

    setEditingId(null)
    setTitle(`Campaign: ${coupon.name}`)
    setCouponCode(coupon.code)
    setBadgeText(discountLabel)
    setMessageKm(`🎉 ប្រើកូដ ${coupon.code} ទទួលបានការបញ្ចុះតម្លៃ ${discountLabel} សម្រាប់ ${coupon.name}!`)
    setMessageEn(`🎉 Use code ${coupon.code} to get ${discountLabel} for ${coupon.name}!`)
    setLinkUrl('/products')
    setIsFormModalOpen(true)
    toast.info(`បានជ្រើសរើសប័ណ្ណបញ្ចុះតម្លៃ "${coupon.code}" ចូលក្នុងទម្រង់`)
  }

  return (
    <div className="space-y-6">
      {/* 1. Live Preview Card */}
      <div className="bg-card rounded-2xl border border-border shadow-xs p-5 sm:p-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Eye size={18} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
                <span>{t('cms.announcementLivePreview', 'Storefront Live Announcement Preview')}</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Layers size={11} />
                  <span>Database Table: announcements</span>
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                បង្ហាញជាក់ស្តែងនៅលើ Header នៃ Storefront តាមទិន្នន័យដែលសកម្មក្នុង Database
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Switcher for Preview */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border text-xs">
              <button
                type="button"
                onClick={() => setPreviewLang('km')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  previewLang === 'km' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🇰🇭 ខ្មែរ
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  previewLang === 'en' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🇺🇸 English
              </button>
            </div>

            {/* Live Storefront External Link */}
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-primary/10 text-foreground hover:text-primary border border-border text-xs font-semibold transition-all"
              title="View Storefront Website"
            >
              <span>Storefront</span>
              <ExternalLink size={12} />
            </a>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              enabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'
            }`}>
              <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
              {enabled ? 'Active on Storefront' : 'Disabled / Inactive'}
            </span>
          </div>
        </div>

        {/* Live Banner Mockup */}
        <div className="rounded-xl border border-border/80 p-3 bg-muted/40 dark:bg-slate-900/60">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Megaphone size={12} className="text-primary" />
              <span>Storefront Top Header Strip ({previewLang === 'km' ? 'ភាសាខ្មែរ 🇰🇭' : 'English 🇺🇸'})</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">Live Database View</span>
          </div>

          {enabled ? (
            <div className={`w-full py-2.5 px-4 rounded-lg bg-gradient-to-r ${bgGradient} text-white shadow-sm transition-all duration-300 flex flex-wrap items-center justify-between gap-3 text-xs`}>
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {badgeText && (
                  <span className="bg-white/20 backdrop-blur-xs text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 border border-white/20">
                    {badgeText}
                  </span>
                )}
                <span className="font-semibold truncate">
                  {previewLang === 'km' ? (messageKm || messageEn) : (messageEn || messageKm)}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {couponCode && (
                  <span className="bg-black/35 text-amber-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-amber-300/30 flex items-center gap-1">
                    <Tag size={11} />
                    {couponCode}
                  </span>
                )}
                {linkUrl && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold underline hover:text-white/80 cursor-pointer">
                    <span>Shop Now</span>
                    <ExternalLink size={10} />
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-muted-foreground italic bg-background/60 rounded-lg border border-dashed border-border">
              {t('cms.announcementBarHidden', 'Announcement bar is currently disabled and hidden from storefront visitors.')}
            </div>
          )}
        </div>
      </div>

      {/* 2. Database Announcement Campaigns List */}
      <div className="bg-card rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Layers size={18} />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm sm:text-base">
                យុទ្ធនាការប្រកាសក្នុង Database (All Announcements in DB: {announcementsList.length})
              </h4>
              <p className="text-xs text-muted-foreground">
                ទិន្នន័យទាំងអស់ត្រូវបានរក្សាទុកក្នុងតារាង `announcements`។ ចុចប៊ូតុង "បង្ហាញលើ Storefront" ដើម្បីប្តូរការប្រកាសផ្ទាល់។
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>បង្កើតយុទ្ធនាការថ្មី</span>
          </button>
        </div>

        {isListLoading ? (
          <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin text-primary" />
            <span>កំពុងទាញយកទិន្នន័យពី Database...</span>
          </div>
        ) : announcementsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {announcementsList.map((item) => {
              const isActive = Boolean(item.is_active)
              const isBeingEdited = editingId === item.id

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between gap-3 ${
                    isBeingEdited
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                      : isActive
                      ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-xs'
                      : 'border-border/80 bg-muted/20 hover:border-border'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'}`} />
                        <h5 className="font-bold text-xs sm:text-sm text-foreground truncate">
                          {item.title || `Campaign #${item.id}`}
                        </h5>
                      </div>

                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}>
                        {isActive ? 'Active on Storefront' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-xs text-foreground/90 font-medium line-clamp-2">
                      {item.message_km || item.message_en}
                    </p>
                    {item.message_en && item.message_km && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 italic">
                        {item.message_en}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]">
                      {item.badge_text && (
                        <span className="px-2 py-0.5 rounded bg-muted text-foreground font-extrabold text-[10px]">
                          {item.badge_text}
                        </span>
                      )}
                      {item.coupon_code && (
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          {item.coupon_code}
                        </span>
                      )}
                      {item.bg_gradient && (
                        <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${item.bg_gradient} border border-white/40`} title={item.bg_gradient} />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => item.id && toggleActiveMutation.mutate(item.id)}
                      disabled={toggleActiveMutation.isPending}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                      }`}
                    >
                      <Power size={12} />
                      <span>{isActive ? 'កំពុងបង្ហាញលើ Store' : 'ដាក់បង្ហាញ (Activate)'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditRecord(item)}
                        className="p-1.5 rounded-lg bg-muted hover:bg-primary/10 text-foreground hover:text-primary transition-colors cursor-pointer"
                        title="កែសម្រួល"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (item.id) {
                            setDeleteId(item.id)
                            setConfirmOpen(true)
                          }
                        }}
                        className="p-1.5 rounded-lg bg-muted hover:bg-rose-500/10 text-foreground hover:text-rose-600 transition-colors cursor-pointer"
                        title="លុប"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
            មិនទាន់មានទិន្នន័យប្រកាសក្នុងតារាង `announcements` នៅឡើយទេ។ ចុចប៊ូតុង "បង្កើតយុទ្ធនាការថ្មី" ដើម្បីបញ្ចូល។
          </div>
        )}
      </div>

      {/* 3. Dynamic Quick Presets from Database Coupons */}
      <div className="bg-card rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <span>{t('cms.campaignPresets', 'Quick Campaign Presets (ជ្រើសរើសដើម្បីបំពេញស្វ័យប្រវត្តិ)')}</span>
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              ចុចលើប័ណ្ណបញ្ចុះតម្លៃ ឬយុទ្ធនាការខាងក្រោម ដើម្បីបញ្ចូលទិន្នន័យទៅក្នុងទម្រង់កែសម្រួល
            </p>
          </div>

          <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border text-xs">
            <button
              type="button"
              onClick={() => setPresetCategory('coupons')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                presetCategory === 'coupons' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Ticket size={13} />
              <span>🎟️ ប័ណ្ណបញ្ចុះតម្លៃក្នុងប្រព័ន្ធ ({liveCoupons.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setPresetCategory('seasonal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                presetCategory === 'seasonal' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles size={13} />
              <span>⚡ យុទ្ធនាការតាមរដូវកាល</span>
            </button>
          </div>
        </div>

        {presetCategory === 'coupons' ? (
          <div>
            {isCouponsLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <RefreshCw size={14} className="animate-spin text-primary" />
                <span>កំពុងទាញយកប័ណ្ណបញ្ចុះតម្លៃពីប្រព័ន្ធ...</span>
              </div>
            ) : liveCoupons.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[260px] overflow-y-auto pr-1">
                {liveCoupons.map((c: any) => {
                  const isPercent = c.type === 'percentage'
                  const isFreeShip = c.type === 'free_shipping'
                  const discountBadge = isFreeShip ? 'Free Shipping' : isPercent ? `${Number(c.value)}% OFF` : `$${Number(c.value)} OFF`
                  const isSelected = couponCode === c.code

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => applyLiveCoupon(c)}
                      className={`text-left p-3 rounded-xl border transition-all group cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border/80 bg-muted/30 hover:bg-primary/5 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black text-foreground group-hover:text-primary">
                          {c.code}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {discountBadge}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-1">
                        {c.name}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-primary font-semibold">
                        <span>Click to Apply</span>
                        {isSelected && <span className="flex items-center gap-0.5 text-emerald-600 font-bold"><Check size={12} /> Active</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                មិនទាន់មានប័ណ្ណបញ្ចុះតម្លៃក្នុងប្រព័ន្ធនៅឡើយទេ។
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SEASONAL_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applySeasonalPreset(p)}
                className="text-left p-3.5 rounded-xl border border-border/80 bg-muted/30 hover:bg-primary/5 hover:border-primary/40 transition-all group cursor-pointer"
              >
                <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>{p.name}</span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                  {p.message_km}
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-primary font-semibold">
                  <span>Click to Apply</span>
                  <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-border">{p.coupon}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Announcement Form Modal Dialog */}
      {isFormModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFormModalOpen(false)
          }}
        >
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span>{editingId ? `កែសម្រួលយុទ្ធនាការ #${editingId}` : 'បង្កើតយុទ្ធនាការប្រកាសថ្មី'}</span>
                    {editingId ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold">
                        Editing DB Record #{editingId}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                        New Campaign
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    ទិន្នន័យនឹងត្រូវរក្សាទុកចូលទៅក្នុងតារាង Database `announcements`
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="បិទ (Close)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {/* Mini Live Preview inside Modal */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Eye size={12} className="text-primary" />
                    <span>ការមើលសាកល្បងផ្ទាល់ (Live Preview)</span>
                  </span>
                  <div className="flex items-center gap-1 bg-background p-0.5 rounded-md border border-border text-[10px]">
                    <button
                      type="button"
                      onClick={() => setPreviewLang('km')}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                        previewLang === 'km' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      🇰🇭 ខ្មែរ
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewLang('en')}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                        previewLang === 'en' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      🇺🇸 English
                    </button>
                  </div>
                </div>

                <div className={`py-2 px-3.5 rounded-lg text-white font-medium text-xs shadow-xs bg-gradient-to-r ${bgGradient} flex items-center justify-between gap-2 overflow-hidden`}>
                  <div className="flex items-center gap-2 min-w-0">
                    {badgeText && (
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs rounded text-white shrink-0">
                        {badgeText}
                      </span>
                    )}
                    <span className="truncate text-xs">
                      {previewLang === 'km' ? (messageKm || 'សារប្រកាសជាភាសាខ្មែរ...') : (messageEn || 'Announcement message in English...')}
                    </span>
                  </div>
                  {couponCode && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white text-gray-900 rounded shrink-0 shadow-xs">
                      {couponCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Title of Campaign */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  ចំណងជើងយុទ្ធនាការ (Campaign Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ឧ. យុទ្ធនាការដឹកជញ្ជូនឥតគិតថ្លៃ ឬ មហាប្រូម៉ូសិន..."
                  className="w-full h-10 px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>

              {/* Dual Language Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <span>🇰🇭 {t('cms.messageKm', 'Message in Khmer (ភាសាខ្មែរ)')}</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={messageKm}
                    onChange={(e) => setMessageKm(e.target.value)}
                    placeholder="🚚 ដឹកជញ្ជូនឥតគិតថ្លៃទូទាំង ២៥ រាជធានី-ខេត្ត..."
                    className="w-full px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <span>🇺🇸 {t('cms.messageEn', 'Message in English')}</span>
                  </label>
                  <textarea
                    rows={2}
                    value={messageEn}
                    onChange={(e) => setMessageEn(e.target.value)}
                    placeholder="🚚 Free Nationwide Delivery on all orders over $50..."
                    className="w-full px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>

              {/* Badge, Coupon Code, URL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    {t('cms.badgeTag', 'Badge Tag')}
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="SPECIAL PROMO"
                    className="w-full h-10 px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1">
                    <Gift size={13} className="text-amber-500" />
                    <span>{t('cms.couponCode', 'Discount Coupon')}</span>
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="OPTAPOS2026"
                    className="w-full h-10 px-3.5 py-2 text-xs sm:text-[13px] font-mono rounded-lg border border-border bg-background text-foreground uppercase focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1">
                    <LinkIcon size={13} className="text-primary" />
                    <span>{t('cms.linkUrl', 'Target URL')}</span>
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="/promotions"
                    className="w-full h-10 px-3.5 py-2 text-xs sm:text-[13px] font-mono rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Color Gradient Themes */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-2">
                  {t('cms.themeGradient', 'Background Theme Gradient')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'from-indigo-600 to-purple-700', label: 'Indigo Purple' },
                    { id: 'from-blue-600 to-indigo-700', label: 'Ocean Blue' },
                    { id: 'from-amber-600 to-rose-600', label: 'Festive Amber' },
                    { id: 'from-emerald-600 to-teal-700', label: 'Emerald Green' },
                    { id: 'from-purple-600 to-pink-600', label: 'Vibrant Magenta' },
                    { id: 'from-slate-900 to-slate-800', label: 'Dark Obsidian' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setBgGradient(g.id)}
                      className={`h-8 px-3 rounded-lg bg-gradient-to-r ${g.id} text-white text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        bgGradient === g.id ? 'ring-2 ring-primary ring-offset-2 border-white scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      {bgGradient === g.id && <CheckCircle2 size={12} />}
                      <span>{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    ដាក់បង្ហាញលើ Storefront ភ្លាមៗ (Active)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    បើបើកដំណើរការ យុទ្ធនាការនេះនឹងត្រូវបង្ហាញនៅលើ Header នៃ Storefront
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-bold text-foreground transition-colors cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save size={15} />
                <span>{saveMutation.isPending ? 'កំពុងរក្សាទុក...' : (editingId ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតយុទ្ធនាការ')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="លុបយុទ្ធនាការប្រកាស"
        message="តើអ្នកពិតជាចង់លុបយុទ្ធនាការប្រកាសនេះចេញពី Database មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។"
        confirmLabel="លុបចោល"
        cancelLabel="បោះបង់"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => {
          setConfirmOpen(false)
          setDeleteId(null)
        }}
      />
    </div>
  )
}

export default AnnouncementsTab
