import React, { useState, useMemo } from 'react'
import {
  UploadCloud,
  Search,
  Image as ImageIcon,
  Copy,
  Check,
  Trash2,
  Filter,
  FileText,
  FileCode,
  FolderOpen,
  Sparkles,
  ExternalLink,
  Layers,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppImage } from '@/components/common'
import { useToast } from '@/hooks/useToast'
import { getAbsoluteImageUrl } from '@/utils/image'
import type { MediaItem } from '../../types/cms.types'

interface MediaLibraryTabProps {
  records: MediaItem[]
  isLoading: boolean
  isFetching: boolean
  confirmDelete?: (id: number) => void
}

export const MediaLibraryTab: React.FC<MediaLibraryTabProps> = ({
  records = [],
  isLoading,
  confirmDelete,
}) => {
  const { t } = useTranslation(['cms', 'common'])
  const toast = useToast()

  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [localUploads, setLocalUploads] = useState<MediaItem[]>([])

  const allAssets = useMemo(() => {
    return [...localUploads, ...records]
  }, [localUploads, records])

  const filteredAssets = useMemo(() => {
    return allAssets.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.file_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCategory =
        selectedCategory === 'all' || item.type === selectedCategory
      return matchSearch && matchCategory
    })
  }, [allAssets, searchTerm, selectedCategory])

  const handleCopyLink = (item: MediaItem) => {
    const url = item.url || item.path
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(item.id)
    toast.success(t('cms.copiedUrl', 'Copied asset URL to clipboard!'))
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const newMedia: MediaItem = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        file_name: file.name,
        path: URL.createObjectURL(file),
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'document',
        size: file.size,
        created_at: new Date().toISOString(),
      }
      setLocalUploads((prev) => [newMedia, ...prev])
    })
    toast.success(t('cms.uploadSuccess', `Uploaded ${files.length} file(s) successfully.`))
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '120 KB'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-5">
      {/* Upload Zone & Quick Action */}
      <div className="bg-card rounded-2xl border border-dashed border-primary/40 p-6 text-center hover:border-primary transition-all bg-primary/2 dark:bg-primary/5 group relative overflow-hidden">
        <input
          type="file"
          multiple
          accept="image/*,.webp,.png,.jpg,.jpeg,.svg,.pdf"
          onChange={handleFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        <div className="flex flex-col items-center justify-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
            <UploadCloud size={24} />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm sm:text-base">
              {t('cms.dragDropMedia', 'Drag & drop image files here, or click to browse')}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Supports WebP, PNG, JPG, SVG, and PDF assets (Recommended max 5MB per file)
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('cms.searchMediaPlaceholder', 'Search media by file name or asset title...')}
              className="w-full h-10 pl-9 pr-3 text-xs sm:text-[13px] rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'image', label: '🖼️ Images' },
            { id: 'icon', label: '✨ Badges & Icons' },
            { id: 'document', label: '📄 Documents' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Media Assets */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-3 animate-pulse space-y-2">
              <div className="w-full aspect-video bg-muted rounded-xl" />
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-2.5 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground space-y-2">
          <ImageIcon size={36} className="mx-auto opacity-40 text-primary" />
          <p className="font-bold text-foreground text-sm">{t('cms.noMediaFound', 'No media assets found.')}</p>
          <p className="text-xs">{t('cms.noMediaDesc', 'Upload your first image, banner, or logo using the dropzone above.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets.map((item) => {
            const isCopied = copiedId === item.id
            const imgSrc = getAbsoluteImageUrl(item.url || item.path)

            return (
              <div
                key={item.id}
                className="group bg-card rounded-2xl border border-border shadow-xs hover:border-primary/50 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Thumbnail */}
                <div className="relative aspect-4/3 w-full bg-muted/40 overflow-hidden border-b border-border/60">
                  <AppImage
                    src={imgSrc}
                    alt={item.name}
                    fallbackType="general"
                    fallbackSrc="/images/banners/banner-01.jpg"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    preview={true}
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(item)}
                      title="Copy URL"
                      className="w-7 h-7 rounded-lg bg-background/90 text-foreground hover:text-primary shadow-xs flex items-center justify-center backdrop-blur-xs border border-border cursor-pointer transition-colors"
                    >
                      {isCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                    {confirmDelete && (
                      <button
                        type="button"
                        onClick={() => confirmDelete(item.id)}
                        title="Delete asset"
                        className="w-7 h-7 rounded-lg bg-background/90 text-destructive hover:bg-destructive hover:text-white shadow-xs flex items-center justify-center backdrop-blur-xs border border-border cursor-pointer transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-3">
                  <p className="font-bold text-foreground text-xs truncate group-hover:text-primary transition-colors" title={item.name}>
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                    <span className="truncate max-w-[90px] font-mono">{item.file_name}</span>
                    <span className="font-semibold shrink-0">{formatFileSize(item.size)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MediaLibraryTab
