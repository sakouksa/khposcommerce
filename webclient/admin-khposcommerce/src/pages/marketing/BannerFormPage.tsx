import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Globe,
  Tag,
  Sparkles,
  Layers,
  Calendar,
  Eye,
  Link as LinkIcon,
  CheckCircle2,
  LayoutTemplate,
  ExternalLink,
  Info,
  Store,
  Smartphone,
  ArrowRight,
  Monitor
} from 'lucide-react'
import { marketingService } from '@/services/marketingService'
import { EnterpriseDatePicker, FieldError, getFieldClass } from '@/components/common'
import { useToast } from '@/hooks/useToast'
import { FormHeader, FormFooter, LoadingSpinner } from '@/components/common'
import { getAbsoluteImageUrl } from '@/utils/image'
import { focusFirstInvalidField } from '@/utils/formValidation'
import { CAMBODIA_BANNER_PRESETS } from './constants/bannerPresets'
import type { Banner, BannerPreset, BannerPlacement, BannerTargetType } from './types/banner'

export const BannerFormPage: React.FC = () => {
  const { t } = useTranslation(['marketing', 'cms', 'common', 'toast'])
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const bannerId = id ? parseInt(id, 10) : null
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()
  const toast = useToast()

  // Determine back path
  const isFromCms = location.pathname.startsWith('/cms') || location.search.includes('tab=banners')
  const backPath = isFromCms ? '/cms?tab=banners' : '/marketing/banners'

  // Form states
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [badge, setBadge] = useState('')
  const [discountTag, setDiscountTag] = useState('')
  const [buttonText, setButtonText] = useState('ទិញឥឡូវនេះ (Shop Now)')
  const [imageUrl, setImageUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [base64Image, setBase64Image] = useState<string>('')
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload')
  const [linkUrl, setLinkUrl] = useState('')
  const [targetType, setTargetType] = useState<BannerTargetType>('flash_sale')
  const [position, setPosition] = useState<BannerPlacement>('hero')
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [isActive, setIsActive] = useState<boolean>(true)
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleClearError = (key: string) => {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // Live Device Mockup Preview Switcher
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile' | 'pos_cfd'>('desktop')

  // Fetch banner detail if in edit mode
  const {
    data: bannerDetail,
    isLoading: isLoadingDetail,
  } = useQuery({
    queryKey: ['banner-detail', bannerId],
    queryFn: () => (bannerId ? marketingService.getBanner(bannerId) : null),
    enabled: isEdit && !isNaN(bannerId as number),
  })

  useEffect(() => {
    if (bannerDetail) {
      setTitle(bannerDetail.title || '')
      setSubtitle(bannerDetail.subtitle || '')
      setBadge(bannerDetail.badge || '')
      setDiscountTag(bannerDetail.discount_tag || '')
      setButtonText(bannerDetail.button_text || 'ទិញឥឡូវនេះ (Shop Now)')
      const img = bannerDetail.image_url || bannerDetail.image || ''
      setImageUrl(img)
      setImageMode(img.startsWith('http') || img.startsWith('/storage') ? 'url' : 'upload')
      setLinkUrl(bannerDetail.link_url || bannerDetail.link || '')
      setPosition((bannerDetail.position as any) || 'hero')
      setSortOrder(bannerDetail.sort_order ?? 0)
      setIsActive(bannerDetail.is_active ?? true)
      setStartsAt(bannerDetail.starts_at ? bannerDetail.starts_at.split(/[T ]/)[0] : '')
      setEndsAt(bannerDetail.ends_at ? bannerDetail.ends_at.split(/[T ]/)[0] : '')
    }
  }, [bannerDetail])

  // Handle Preset Apply
  const handleApplyPreset = (preset: BannerPreset) => {
    setSelectedPresetId(preset.id)
    setTitle(preset.titleKm)
    setSubtitle(preset.subtitleKm)
    setBadge(preset.badge)
    setDiscountTag(preset.discount_tag || '')
    setButtonText(preset.buttonTextKm)
    setPosition(preset.placement)
    setImageUrl(preset.defaultImage)
    setImageMode('url')
    setTargetType(preset.target_type)

    if (preset.placement === 'pos_cfd') {
      setPreviewDevice('pos_cfd')
    } else if (preset.placement === 'app_splash') {
      setPreviewDevice('mobile')
    } else {
      setPreviewDevice('desktop')
    }

    toast.info(`Applied "${preset.nameEn}" template.`)
  }

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      handleClearError('image')
      const previewUrl = URL.createObjectURL(file)
      setImageUrl(previewUrl)

      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setBase64Image(reader.result)
        }
      }
      reader.readAsDataURL(file)

      toast.success(t('toast.fileSelected', { fileName: file.name, defaultValue: `File "${file.name}" selected.` }))
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setBase64Image('')
    setImageUrl('')
  }

  // Create & Update mutations
  const createMutation = useMutation({
    mutationFn: (newBanner: any) => marketingService.createBanner(newBanner),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners'] })
      toast.success(t('toast.created', { item: t('marketing.banners', 'Banner') }))
      navigate(backPath)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error', 'Failed to create banner'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => marketingService.updateBanner(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners'] })
      qc.invalidateQueries({ queryKey: ['banner-detail', bannerId] })
      toast.success(t('toast.updated', { item: t('marketing.banners', 'Banner') }))
      navigate(backPath)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error', 'Failed to update banner'))
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!title.trim()) {
      newErrors.title = t('marketing.bannerTitleRequired', 'Please enter banner title')
    }
    if (!selectedFile && !imageUrl.trim()) {
      newErrors.image = t('marketing.bannerImageRequired', 'Please select an image or enter image URL')
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      focusFirstInvalidField(newErrors)
      return
    }

    const formData = new FormData()
    formData.append('company_id', '1')
    formData.append('title', title.trim())
    formData.append('subtitle', subtitle.trim())
    formData.append('badge', badge.trim())
    formData.append('discount_tag', discountTag.trim())
    formData.append('button_text', buttonText.trim())
    formData.append('position', position)
    formData.append('sort_order', String(sortOrder))
    formData.append('is_active', isActive ? '1' : '0')
    if (startsAt) formData.append('starts_at', startsAt)
    if (endsAt) formData.append('ends_at', endsAt)
    if (linkUrl) formData.append('link', linkUrl.trim())

    if (selectedFile && selectedFile instanceof File) {
      formData.append('image_file', selectedFile)
      if (base64Image) {
        formData.append('image', base64Image)
      }
    } else if (imageUrl && !imageUrl.startsWith('blob:') && !imageUrl.includes('/storage/[]') && imageUrl !== '[]') {
      formData.append('image', imageUrl)
      formData.append('image_url', imageUrl)
    }

    if (isEdit && bannerId) {
      formData.append('_method', 'PUT')
      updateMutation.mutate({ id: bannerId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const resolveDisplayImage = (url?: string): string => {
    if (!url || url === '[]' || url === '""' || url.includes('/storage/[]')) {
      return '/logo.png'
    }
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      return url
    }
    return getAbsoluteImageUrl(url) || '/logo.png'
  }

  if (isEdit && isLoadingDetail) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ─── Standard Form Header ─── */}
      <FormHeader
        isEdit={isEdit}
        title={
          isEdit
            ? t('marketing.editBanner', 'Edit Banner')
            : t('marketing.addBanner', 'Add New Banner')
        }
        subtitle={t('marketing.bannerSubtitle', 'Manage promotional banners and omnichannel visual marketing assets')}
        breadcrumbs={[
          { label: t('marketing.breadcrumbDashboard', 'Dashboard'), path: '/dashboard' },
          { label: t('marketing.breadcrumbMarketing', 'Marketing'), path: '/marketing/coupons' },
          { label: t('marketing.banners', 'Banners'), path: backPath },
          { label: isEdit ? `#${bannerId}` : t('marketing.addBanner', 'Create New') },
        ]}
        statusBadge={
          isEdit ? (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-muted text-muted-foreground border border-border'
              }`}
            >
              {isActive ? t('marketing.active', 'Active') : t('marketing.inactive', 'Inactive')}
            </span>
          ) : undefined
        }
        onBack={() => navigate(backPath)}
        backLabel={t('common.back', 'Back')}
      />

      {/* ─── Presets Bar ─── */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <Sparkles size={13} className="text-amber-500" />
          <span>Cambodia Festive & Omnichannel Presets (1-Click Setup)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {CAMBODIA_BANNER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                selectedPresetId === preset.id
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-card hover:bg-muted/60'
              }`}
            >
              <div className="text-[10px] font-bold text-primary truncate">{preset.badge}</div>
              <div className="text-xs font-bold text-foreground truncate mt-0.5">{preset.nameKm}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Form Body ─── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ══════════════════════════════════════════════════════════
              LEFT COLUMN: Main Content & Media (7 cols)
          ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* General Info Card */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Info size={16} />
                </div>
                <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  Banner Typography & Content
                </h3>
              </div>

              <div className="space-y-4">
                {/* Banner Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    Banner Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      handleClearError('title')
                    }}
                    placeholder="e.g. 🌸 មហោស្រពចូលឆ្នាំខ្មែរ បញ្ចុះតម្លៃពិសេស ៥០%"
                    className={getFieldClass(
                      errors.title,
                      'w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs font-bold placeholder:text-muted-foreground/60'
                    )}
                  />
                  <FieldError error={errors.title} />
                </div>

                {/* Subtitle / Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    Subtitle / Promotional Body Text
                  </label>
                  <textarea
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    rows={2}
                    placeholder="e.g. Exclusive festive savings on premium gadgets with instant Bakong KHQR cashback."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-2xs font-medium placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* Badge Label & Discount Tag & Button CTA */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground">Badge Label</label>
                    <div className="relative">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        placeholder="e.g. KNY 2026"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-border/80 bg-background text-foreground text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground">Discount Tag</label>
                    <div className="relative">
                      <Sparkles size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        value={discountTag}
                        onChange={(e) => setDiscountTag(e.target.value)}
                        placeholder="e.g. 50% OFF"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-border/80 bg-background text-foreground text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground">CTA Button Text</label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="e.g. ទិញឥឡូវនេះ"
                      className="w-full px-3 py-2 rounded-xl border border-border/80 bg-background text-foreground text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Media & Image Card */}
            <div id="image" data-field="image" className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <ImageIcon size={16} />
                  </div>
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                    Banner Graphic Asset <span className="text-rose-500">*</span>
                  </h3>
                </div>

                {/* Upload Mode Switcher */}
                <div className="flex items-center gap-1 bg-muted/70 p-1 rounded-xl border border-border/60">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      imageMode === 'upload'
                        ? 'bg-card text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      imageMode === 'url'
                        ? 'bg-card text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {imageMode === 'upload' ? (
                <div className="space-y-3">
                  <label className={`border-2 border-dashed ${errors.image ? 'border-rose-500 bg-rose-50/20' : 'border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-muted/40'} rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group`}>
                    <UploadCloud size={36} className={`${errors.image ? 'text-rose-500' : 'text-muted-foreground group-hover:text-primary'} transition-colors mb-2`} />
                    <span className="text-xs font-bold text-foreground">Click to upload banner image</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Supports PNG, JPG, WEBP, AVIF (Up to 10MB)</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">Direct Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value)
                      handleClearError('image')
                    }}
                    placeholder="/api/v1/storage/banners/banner_hero_1.webp"
                    className={getFieldClass(errors.image, 'w-full px-3.5 py-2 rounded-xl border border-border/80 bg-background text-foreground text-xs')}
                  />
                </div>
              )}
              <FieldError error={errors.image} />
            </div>

            {/* Deep Linking & Target Card */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <LinkIcon size={16} />
                </div>
                <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  Deep-Linking & Destination Trigger
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Destination Target Type</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-medium"
                  >
                    <option value="flash_sale">⚡ Active Flash Sale Campaign</option>
                    <option value="coupon">🏷️ Digital Coupon Voucher</option>
                    <option value="product">🎯 Direct Product SKU Checkout</option>
                    <option value="category">📂 Category Collection</option>
                    <option value="custom_url">🔗 Custom External Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Link URL / Slug</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="e.g. /marketing/flash-sales or /catalog"
                    className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT COLUMN: Settings & Live Device Mockup (5 cols)
          ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Interactive Device Rendering Mockup */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Eye size={16} />
                  </div>
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                    Interactive Device Mockup
                  </h3>
                </div>

                {/* Device Switcher */}
                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      previewDevice === 'desktop' ? 'bg-card text-primary shadow-2xs' : 'text-muted-foreground'
                    }`}
                    title="Desktop Web (21:9)"
                  >
                    <Monitor size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      previewDevice === 'mobile' ? 'bg-card text-primary shadow-2xs' : 'text-muted-foreground'
                    }`}
                    title="Mobile App (9:16)"
                  >
                    <Smartphone size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('pos_cfd')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      previewDevice === 'pos_cfd' ? 'bg-card text-primary shadow-2xs' : 'text-muted-foreground'
                    }`}
                    title="POS Customer Screen CFD (4:3)"
                  >
                    <Store size={14} />
                  </button>
                </div>
              </div>

              {/* Rendered Frame */}
              <div className="rounded-2xl border border-border bg-slate-950 p-2 overflow-hidden shadow-inner flex items-center justify-center min-h-[220px]">
                <div className={`relative overflow-hidden rounded-xl border border-white/10 ${
                  previewDevice === 'desktop'
                    ? 'w-full aspect-[21/9]'
                    : previewDevice === 'mobile'
                    ? 'w-52 aspect-[9/16]'
                    : 'w-72 aspect-[4/3]'
                }`}>
                  <img
                    src={resolveDisplayImage(imageUrl)}
                    alt={title || 'Banner Preview'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = '/logo.png'
                    }}
                  />
                  {/* Live Text Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 flex flex-col justify-end text-white">
                    {badge && (
                      <span className="w-fit px-1.5 py-0.2 rounded-full text-[8px] font-extrabold bg-primary text-white mb-1 uppercase tracking-wider">
                        {badge}
                      </span>
                    )}
                    <h4 className="font-bold text-xs text-white line-clamp-2">{title || 'Banner Title Headline'}</h4>
                    {subtitle && (
                      <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">{subtitle}</p>
                    )}
                    {buttonText && (
                      <div className="mt-2 w-fit px-2.5 py-1 bg-primary text-white text-[9px] font-bold rounded-lg shadow-sm flex items-center gap-1">
                        <span>{buttonText}</span>
                        <ArrowRight size={9} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Display Placement & Scope Card */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <LayoutTemplate size={16} />
                </div>
                <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  Placement & Screen Position
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Target Screen Placement</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-medium"
                  >
                    <option value="hero">Storefront Web Hero Carousel</option>
                    <option value="pos_cfd">POS Customer Display (CFD)</option>
                    <option value="app_splash">Mobile App Splash & Home</option>
                    <option value="sidebar">Sidebar Spotlight</option>
                    <option value="popup">Promotional Modal Popup</option>
                    <option value="footer">Footer Banner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Sort Priority Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-bold"
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    Lower number displays first in slideshows.
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule & Active Status Card */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Calendar size={16} />
                </div>
                <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  Schedule & Activation
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <EnterpriseDatePicker
                    label="Start Date"
                    value={startsAt}
                    onChange={setStartsAt}
                    placeholder="Start Date"
                  />
                </div>
                <div>
                  <EnterpriseDatePicker
                    label="End Date"
                    minDate={startsAt}
                    value={endsAt}
                    onChange={setEndsAt}
                    placeholder="End Date"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                <input
                  type="checkbox"
                  id="isBannerActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
                <label htmlFor="isBannerActive" className="text-xs font-bold text-foreground cursor-pointer">
                  Banner is Active and Visible to Customers
                </label>
              </div>
            </div>

            {/* Form Action Footer */}
            <FormFooter
              isEdit={isEdit}
              isSubmitting={isSubmitting}
              onCancel={() => navigate(backPath)}
              submitLabel={isEdit ? 'Update Banner' : 'Create Banner'}
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default BannerFormPage
