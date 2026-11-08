import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, Trash2, Building2 } from 'lucide-react'
import {
  DEFAULT_SUPPLIER_IMAGE,
  getSupplierLogoUrl,
} from '@/utils/image'

interface SupplierMediaSectionProps {
  logoPreview: string | null
  setLogoPreview: (preview: string | null) => void
  dragActive: boolean
  setDragActive: (active: boolean) => void
  supplierName?: string
  onLogoChange?: (logo: string) => void
}

export const SupplierMediaSection: React.FC<SupplierMediaSectionProps> = ({
  logoPreview,
  setLogoPreview,
  dragActive,
  setDragActive,
  supplierName = '',
  onLogoChange,
}) => {
  const { t } = useTranslation(['suppliers', 'common'])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const applyLogo = (src: string | null) => {
    setLogoPreview(src)
    if (onLogoChange) onLogoChange(src || '')
  }

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      applyLogo(result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const handleRemove = () => {
    applyLogo(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isCustomLogo = !!logoPreview && logoPreview !== DEFAULT_SUPPLIER_IMAGE
  const displaySrc = logoPreview ? getSupplierLogoUrl(logoPreview, supplierName) : null

  // Initials for the empty-state placeholder when a name is typed
  const initials = supplierName
    ? supplierName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : null

  return (
    <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-sm text-foreground dark:text-slate-100">
            {t('suppliers.supplierMedia', 'Logo អ្នកផ្គត់ផ្គង់')}
          </h3>
          <p className="text-[11px] text-muted-foreground dark:text-slate-400 mt-0.5">
            {t('suppliers.optionalMediaDesc', 'Optional · PNG, JPG, SVG, WEBP · Max 5MB')}
          </p>
        </div>
        {isCustomLogo && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            ✓ {t('suppliers.activeLogoBadge', 'មានរូបភាព')}
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Centered brand-logo uploader */}
      <div className="flex flex-col items-center gap-4">

        {/* Logo Square — drop target + hover overlay */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer select-none transition-all duration-200 ${
            dragActive ? 'scale-105' : 'hover:scale-[1.03]'
          }`}
        >
          {/* Logo box */}
          <div
            className={`w-28 h-28 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-200 ${
              isCustomLogo
                ? 'border-2 border-primary/25 bg-slate-50 dark:bg-slate-950 shadow-md'
                : dragActive
                  ? 'border-2 border-dashed border-primary bg-primary/10'
                  : 'border-2 border-dashed border-border/70 dark:border-slate-700 bg-muted/20 dark:bg-slate-800/40 group-hover:border-primary/60 group-hover:bg-primary/5'
            }`}
          >
            {isCustomLogo ? (
              <img
                src={displaySrc || ''}
                alt={supplierName || 'Supplier Logo'}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  const target = e.currentTarget
                  if (target.src !== DEFAULT_SUPPLIER_IMAGE) {
                    target.src = DEFAULT_SUPPLIER_IMAGE
                  }
                }}
              />
            ) : initials ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-black text-muted-foreground/40 dark:text-slate-600 tracking-tight leading-none">
                  {initials}
                </span>
                <span className="text-[9px] font-semibold text-muted-foreground/30 uppercase tracking-widest">
                  {t('suppliers.logoLabel', 'logo')}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <Building2 size={28} className="text-muted-foreground/25 dark:text-slate-600" />
                <span className="text-[9px] font-semibold text-muted-foreground/30 uppercase tracking-widest">
                  {t('suppliers.logoLabel', 'logo')}
                </span>
              </div>
            )}
          </div>

          {/* Camera overlay on hover / drag */}
          <div
            className={`absolute inset-0 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              dragActive
                ? 'bg-primary/30 opacity-100'
                : 'bg-black/0 opacity-0 group-hover:bg-black/35 group-hover:opacity-100'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Camera size={18} className="text-white drop-shadow" />
              </div>
              <span className="text-[10px] font-bold text-white drop-shadow">
                {isCustomLogo
                  ? t('common.change', 'ប្តូរ')
                  : t('common.upload', 'ផ្ទុក')}
              </span>
            </div>
          </div>

          {/* Drag active pulse ring */}
          {dragActive && (
            <div className="absolute -inset-1 rounded-3xl border-2 border-primary animate-pulse pointer-events-none" />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-xs cursor-pointer transition-all active:scale-95"
          >
            <Camera size={12} />
            <span>
              {isCustomLogo
                ? t('common.changeImage', 'ប្តូររូបភាព')
                : t('common.upload', 'ផ្ទុកឡើង')}
            </span>
          </button>

          {isCustomLogo && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 cursor-pointer transition-all active:scale-95"
              title={t('common.delete', 'លុបចេញ')}
            >
              <Trash2 size={12} />
              <span>{t('common.delete', 'លុប')}</span>
            </button>
          )}
        </div>

        {/* Hint text */}
        <p className="text-[10.5px] text-muted-foreground/60 dark:text-slate-500 text-center leading-relaxed max-w-[200px]">
          {isCustomLogo
            ? t('suppliers.logoSelectedDesc', 'Logo នឹងបង្ហាញក្នុង PO និងតារាង')
            : t('suppliers.defaultLogoNotice', 'បើអត់ដាក់ ប្រព័ន្ធប្រើ Logo លំនាំដើម')}
        </p>
      </div>
    </div>
  )
}

export default SupplierMediaSection
