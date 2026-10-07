import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  Trash2,
  Check,
  Eye,
  X,
  ExternalLink,
  Maximize2,
  Paperclip,
  RefreshCw
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Image as AntImage } from 'antd'
import { getStorageFileUrl } from '@/utils/image'
import { useToast } from '@/hooks/useToast'

export interface FileUploadProps {
  value?: string | null
  onChange: (value: string | null, file?: File | null) => void
  label?: string
  hint?: string
  accept?: string
  maxSizeMB?: number
  allowPdf?: boolean
  allowImage?: boolean
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto'
  className?: string
  disabled?: boolean
  required?: boolean
  enableLightbox?: boolean
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  label,
  hint,
  accept = 'image/*,.pdf',
  maxSizeMB = 10,
  allowPdf = true,
  allowImage = true,
  aspectRatio = 'auto',
  className = '',
  disabled = false,
  required = false,
  enableLightbox = true,
}) => {
  const { t } = useTranslation(['common', 'finance'])
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState<string>('')
  const [imageLoadError, setImageLoadError] = useState(false)
  // localPreview: holds the base64 data URL immediately after a local file is picked,
  // so the image/PDF preview shows instantly — before the parent component re-renders.
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  // imageKey: incremented every time the displayed image changes, forcing the
  // browser to destroy and recreate the <img> DOM element — bypassing any cache.
  const [imageKey, setImageKey] = useState(0)

  // Sync: when the parent value changes externally (e.g. edit mode loads server path),
  // clear localPreview so we fallback to displaying the server path.
  useEffect(() => {
    setImageLoadError(false)
    setImageKey(prev => prev + 1) // force img DOM re-creation to bust browser cache
    if (!value) {
      setSelectedFileName('')
      setLocalPreview(null)
    } else if (!value.startsWith('data:') && !value.startsWith('blob:')) {
      // Server path loaded externally — clear any stale local preview
      setLocalPreview(null)
    }
  }, [value])

  // The effective display value: prefer localPreview for instant feedback,
  // then fall back to the controlled value prop.
  const displayValue = localPreview || value || ''

  const isPdf = Boolean(
    displayValue &&
    (displayValue.startsWith('data:application/pdf') ||
      Boolean(displayValue.toLowerCase().match(/\.pdf(\?.*)?$/i)))
  )

  const isImage = Boolean(
    displayValue &&
    !isPdf &&
    allowImage &&
    (
      !allowPdf ||
      displayValue.startsWith('data:image') ||
      displayValue.startsWith('blob:') ||
      Boolean(displayValue.match(/\.(jpe?g|png|webp|gif|svg|avif)(\?.*)?$/i)) ||
      Boolean(displayValue.match(/(unsplash\.com|photo-|image|images|img|\/storage\/)/i)) ||
      !Boolean(displayValue.match(/\.(pdf|doc|docx|xls|xlsx|csv|zip|rar|txt)(\?.*)?$/i))
    )
  )

  // Derive a cache-busted preview URL for server-stored files.
  // For data: / blob: URLs, use as-is. For server paths, append a version
  // based on imageKey so the browser fetches fresh on every change.
  const previewUrl = (() => {
    if (!displayValue) return ''
    if (displayValue.startsWith('data:') || displayValue.startsWith('blob:')) {
      return displayValue
    }
    const baseUrl = getStorageFileUrl(displayValue)
    // Append cache-busting query param so browser doesn't serve stale image
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}_v=${imageKey}`
  })()

  const displayFilename =
    selectedFileName ||
    (displayValue
      ? displayValue.startsWith('data:')
        ? isPdf
          ? 'document-voucher.pdf'
          : 'receipt-image.png'
        : displayValue.split('/').pop() || 'attached-file'
      : '')

  const processFile = (file: File) => {
    // 1. Validate File Size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      toast.error(
        t('common.file_too_large', `File size exceeds maximum limit of {{max}}MB`, { max: maxSizeMB })
      )
      return
    }

    // 2. Validate Allowed Types
    const fileType = file.type.toLowerCase()
    const fileName = file.name.toLowerCase()
    const isImageFile = fileType.startsWith('image/') || Boolean(fileName.match(/\.(jpe?g|png|webp|gif|svg|avif)$/i))
    const isPdfFile = fileType === 'application/pdf' || fileName.endsWith('.pdf')

    if (!allowPdf && isPdfFile) {
      toast.error(t('common.pdf_not_allowed', 'PDF documents are not supported for this field.'))
      return
    }

    if (!allowImage && isImageFile) {
      toast.error(t('common.image_not_allowed', 'Image files are not supported for this field.'))
      return
    }

    // 3. Read file as Data URL and show preview IMMEDIATELY via localPreview
    setSelectedFileName(file.name)
    setImageLoadError(false)
    setImageKey(prev => prev + 1) // force browser to show new image immediately
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      // Set localPreview right away for instant UI feedback
      setLocalPreview(dataUrl)
      // Then notify parent — which may take a render cycle to update value prop
      onChange(dataUrl, file)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFileName('')
    setImageLoadError(false)
    setLocalPreview(null)
    setImageKey(prev => prev + 1)
    onChange(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square max-h-56'
      case 'video': return 'aspect-video max-h-56'
      case 'wide': return 'aspect-[21/9] max-h-48'
      default: return 'max-h-56'
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Optional Top Label */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <span>{label}</span>
            {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
          {displayValue && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Check size={11} />
              <span>{t('finance.receipt_verified', 'Attached')}</span>
            </span>
          )}
        </div>
      )}

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-5 transition-all text-center select-none ${
          disabled ? 'opacity-60 cursor-not-allowed bg-muted/20' : 'cursor-pointer'
        } ${
          isDragging
            ? 'border-primary ring-4 ring-primary/20 bg-primary/5'
            : displayValue
            ? 'border-border dark:border-border/80 bg-muted/10 dark:bg-muted/5'
            : 'border-border dark:border-border/80 hover:border-primary/50 dark:hover:border-primary/50 bg-muted/10 dark:bg-muted/5 hover:bg-muted/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {displayValue ? (
          <div className="space-y-3">
            {/* 1. Image Preview Mode using Ant Design Image Preview */}
            {isImage && !imageLoadError ? (
              <div
                className={`relative rounded-xl overflow-hidden border border-border bg-black/5 dark:bg-black/40 flex items-center justify-center group shadow-xs ${
                  aspectRatio !== 'auto' ? getAspectClass() : 'p-2'
                }`}
              >
                <AntImage
                  key={imageKey}
                  src={previewUrl}
                  alt="File preview"
                  className={`w-full rounded-xl transition-transform group-hover:scale-[1.01] ${
                    aspectRatio !== 'auto' ? '!h-full object-cover' : 'object-contain max-h-52'
                  }`}
                  rootClassName={`w-full ${
                    aspectRatio !== 'auto'
                      ? 'h-full flex items-center justify-center [&_.ant-image]:w-full [&_.ant-image]:h-full [&_.ant-image-img]:h-full [&_.ant-image-img]:object-cover [&_.ant-image-mask]:rounded-xl'
                      : ''
                  }`}
                  preview={
                    enableLightbox
                      ? {
                          zIndex: 9999,
                          mask: (
                            <div className="flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                              <Eye size={15} />
                              <span>{t('common.view', 'Preview')}</span>
                            </div>
                          ),
                        }
                      : false
                  }
                  onError={() => {
                    if (allowPdf) {
                      setImageLoadError(true)
                    }
                  }}
                />
              </div>
            ) : isImage && imageLoadError && !allowPdf ? (
              /* Fallback image box if load error occurs */
              <div className={`relative rounded-xl overflow-hidden border border-border/80 bg-muted/30 flex flex-col items-center justify-center p-4 text-center gap-1 ${getAspectClass()}`}>
                <span className="text-xs font-semibold text-muted-foreground">{t('common.image_failed_load', 'Image preview unavailable')}</span>
                <span className="text-[11px] font-mono text-muted-foreground/60 truncate max-w-full px-2">{displayFilename}</span>
              </div>
            ) : (
              /* 2. PDF or Document Card Preview Mode */
              <div
                onClick={() => enableLightbox && isPdf && setLightboxOpen(true)}
                className="p-4 rounded-xl bg-card border border-border/90 shadow-xs flex items-center justify-between gap-3 text-left group hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-2xs ${
                    isPdf
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  }`}>
                    {isPdf ? <span className="text-xs font-bold font-mono">PDF</span> : <FileText size={20} />}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-mono font-bold text-foreground truncate block">
                      {displayFilename}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">
                      {isPdf ? t('finance.voucher_digital_type', 'PDF Document Voucher') : 'Attached File'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {enableLightbox && isPdf && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setLightboxOpen(true)
                      }}
                      className="p-2 rounded-xl bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title={t('common.view', 'View')}
                    >
                      <Eye size={15} />
                    </button>
                  )}
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Change & Remove Buttons Bar */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/90 px-3.5 py-1.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer shadow-2xs select-none"
              >
                <RefreshCw size={13} />
                <span>{allowPdf ? t('finance.change_receipt', 'Change File') : t('common.changePhoto', 'Change Photo')}</span>
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 px-3.5 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-colors cursor-pointer shadow-2xs select-none"
              >
                <Trash2 size={13} />
                <span>{t('common.remove', 'Remove')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty Upload Placeholder State */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 py-5 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <Upload size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                {t('finance.upload_receipt', t('common.uploadPhoto', 'Click or drag file to upload'))}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {hint || t('finance.upload_receipt_hint', `Supports PNG, JPG, PDF up to ${maxSizeMB}MB`)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Lightbox / Interactive Modal for Fullscreen PDF Preview ─── */}
      <AnimatePresence>
        {lightboxOpen && isPdf && value && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Lightbox Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText size={18} className="text-primary shrink-0" />
                  <span className="text-sm font-bold text-foreground truncate">{displayFilename}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    title="Open in new tab"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(false)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Lightbox Body */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/5 dark:bg-black/40 min-h-[400px]">
                {isPdf ? (
                  <iframe
                    src={previewUrl}
                    title="Document Preview"
                    className="w-full h-[70vh] rounded-xl border border-border bg-white"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Full Preview"
                    className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-md"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileUpload
