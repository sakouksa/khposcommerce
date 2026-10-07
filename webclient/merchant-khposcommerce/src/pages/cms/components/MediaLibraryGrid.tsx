import React, { useState } from 'react'
import {
  UploadCloud,
  Image as ImageIcon,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  FileCode,
  FileText,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppImage } from '@/components/common'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import { useToast } from '@/hooks/useToast'
import { getAbsoluteImageUrl } from '@/utils/image'
import type { MediaItem } from '../types/cms.types'

export interface MediaLibraryGridProps {
  records: MediaItem[]
  isLoading: boolean
  isFetching: boolean
  confirmDelete?: (id: number) => void
  selectedRows?: number[]
  onToggleSelectAll?: () => void
  onToggleSelectRow?: (id: number) => void
  viewMode?: 'grid' | 'table'
  visibleColumns?: Record<string, boolean>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
  onUploadFiles?: (files: FileList) => void
}

export type MediaLibraryTabProps = MediaLibraryGridProps

export const MediaLibraryGrid: React.FC<MediaLibraryGridProps> = ({
  records = [],
  isLoading,
  isFetching,
  confirmDelete,
  selectedRows = [],
  onToggleSelectAll,
  onToggleSelectRow,
  viewMode = 'grid',
  visibleColumns = {
    thumbnail: true,
    name: true,
    type: true,
    size: true,
    date: true,
    actions: true,
  },
  sortBy = 'id',
  sortOrder = 'desc',
  onSort,
  onUploadFiles,
}) => {
  const { t } = useTranslation(['cms', 'common'])
  const toast = useToast()
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const isAllSelected = records.length > 0 && selectedRows.length === records.length

  const handleCopyLink = (item: MediaItem) => {
    const url = item.url || item.path
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(item.id)
    toast.success(t('cms.copiedUrl', 'Media URL copied to clipboard!'))
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '120 KB'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const renderSortIcon = (columnKey: string) => {
    if (!onSort) return null
    if (sortBy === columnKey) {
      return sortOrder === 'asc' ? (
        <ArrowUp size={13} className="text-primary shrink-0 transition-transform" />
      ) : (
        <ArrowDown size={13} className="text-primary shrink-0 transition-transform" />
      )
    }
    return (
      <ArrowUpDown
        size={13}
        className="opacity-0 group-hover:opacity-60 text-muted-foreground shrink-0 transition-opacity"
      />
    )
  }

  const colsCount = 1 + Object.values(visibleColumns).filter(Boolean).length

  return (
    <div className="space-y-5">
      {/* Upload Zone & Quick Drop Action */}
      <div className="bg-card rounded-2xl border border-dashed border-primary/40 p-6 text-center hover:border-primary transition-all bg-primary/2 dark:bg-primary/5 group relative overflow-hidden">
        <input
          type="file"
          multiple
          accept="image/*,.webp,.png,.jpg,.jpeg,.svg,.pdf"
          onChange={(e) => {
            if (e.target.files && onUploadFiles) {
              onUploadFiles(e.target.files)
            }
          }}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        <div className="flex flex-col items-center justify-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
            <UploadCloud size={24} />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm sm:text-base">
              {t('cms.dragDropMedia', 'Drag and drop files here, or click to browse')}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('cms.mediaSupportHint', 'Supports PNG, JPG, WebP, SVG, and PDF documents (Max 10MB each)')}
            </p>
          </div>
        </div>
      </div>

      {/* View Mode 1: Table View */}
      {viewMode === 'table' ? (
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
          <TableWrapper isFetching={isFetching}>
            <div className="overflow-x-auto">
              <table className="w-full data-table border-collapse">
                <thead className="bg-muted/40 sticky top-0 border-b border-border z-10 select-none">
                  <tr>
                    <th className="w-10 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={onToggleSelectAll}
                        className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer accent-primary"
                        aria-label="Select all"
                      />
                    </th>
                    {visibleColumns.thumbnail && (
                      <th className="w-16 px-3 text-center font-bold text-xs">{t('cms.colThumbnail', 'Preview')}</th>
                    )}
                    {visibleColumns.name && (
                      <th
                        onClick={() => onSort?.('name')}
                        className={`text-left font-bold text-xs ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t('cms.colAssetName', 'File & Asset Name')}</span>
                          {renderSortIcon('name')}
                        </div>
                      </th>
                    )}
                    {visibleColumns.type && (
                      <th
                        onClick={() => onSort?.('type')}
                        className={`text-left font-bold text-xs w-28 ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t('cms.colType', 'Type')}</span>
                          {renderSortIcon('type')}
                        </div>
                      </th>
                    )}
                    {visibleColumns.size && (
                      <th
                        onClick={() => onSort?.('size')}
                        className={`text-left font-bold text-xs w-28 ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t('cms.colSize', 'Size')}</span>
                          {renderSortIcon('size')}
                        </div>
                      </th>
                    )}
                    {visibleColumns.date && (
                      <th
                        onClick={() => onSort?.('created_at')}
                        className={`text-left font-bold text-xs w-36 ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t('cms.colUploadedDate', 'Uploaded Date')}</span>
                          {renderSortIcon('created_at')}
                        </div>
                      </th>
                    )}
                    {visibleColumns.actions && (
                      <th className="text-right font-bold text-xs w-28">{t('cms.colActions', 'Actions')}</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {isLoading ? (
                    <LoadingSkeleton cols={colsCount} />
                  ) : records.length === 0 ? (
                    <EmptyState cols={colsCount} message={t('cms.noMediaFound', 'No media assets found')} />
                  ) : (
                    records.map((item) => {
                      const isSelected = selectedRows.includes(item.id)
                      const imgSrc = getAbsoluteImageUrl(item.url || item.path)
                      const isCopied = copiedId === item.id

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-muted/40 transition-colors group ${
                            isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''
                          }`}
                        >
                          <td className="w-10 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => onToggleSelectRow?.(item.id)}
                              className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer accent-primary"
                              aria-label={`Select media ${item.id}`}
                            />
                          </td>
                          {visibleColumns.thumbnail && (
                            <td className="w-16 px-3 py-2 text-center">
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-border bg-muted/60 mx-auto">
                                {item.type === 'document' ? (
                                  <div className="w-full h-full flex items-center justify-center text-primary bg-primary/5">
                                    <FileText size={18} />
                                  </div>
                                ) : (
                                  <AppImage
                                    src={imgSrc}
                                    alt={item.name}
                                    fallbackType="general"
                                    fallbackSrc="/images/banners/banner-01.jpg"
                                    className="w-full h-full object-cover"
                                    preview={true}
                                  />
                                )}
                              </div>
                            </td>
                          )}
                          {visibleColumns.name && (
                            <td>
                              <div className="min-w-0 py-1">
                                <p className="font-bold text-foreground hover:text-primary cursor-pointer text-sm group-hover:text-primary transition-colors truncate">
                                  {item.name}
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground truncate">
                                  {item.file_name}
                                </p>
                              </div>
                            </td>
                          )}
                          {visibleColumns.type && (
                            <td>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-muted text-foreground border border-border/80">
                                {item.type || 'image'}
                              </span>
                            </td>
                          )}
                          {visibleColumns.size && (
                            <td>
                              <span className="font-mono text-xs font-semibold text-muted-foreground">
                                {formatFileSize(item.size)}
                              </span>
                            </td>
                          )}
                          {visibleColumns.date && (
                            <td>
                              <span className="text-xs text-muted-foreground">
                                {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                              </span>
                            </td>
                          )}
                          {visibleColumns.actions && (
                            <td className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(item)}
                                  title={t('cms.copyUrl', 'Copy URL')}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors cursor-pointer"
                                >
                                  {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                </button>
                                <a
                                  href={imgSrc}
                                  target="_blank"
                                  rel="noreferrer"
                                  title={t('common.view', 'View')}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors cursor-pointer"
                                >
                                  <ExternalLink size={14} />
                                </a>
                                {confirmDelete && (
                                  <button
                                    type="button"
                                    onClick={() => confirmDelete(item.id)}
                                    title={t('common.delete', 'Delete')}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </TableWrapper>
        </div>
      ) : (
        /* View Mode 2: Grid of Media Assets */
        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-3 animate-pulse space-y-2">
                  <div className="w-full aspect-4/3 bg-muted rounded-xl" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2.5 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground space-y-2">
              <ImageIcon size={36} className="mx-auto opacity-40 text-primary" />
              <p className="font-bold text-foreground text-sm">{t('cms.noMediaFound', 'No media assets found')}</p>
              <p className="text-xs">{t('cms.noMediaDesc', 'Upload images, icons, and documents to use across your store.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {records.map((item) => {
                const isSelected = selectedRows.includes(item.id)
                const isCopied = copiedId === item.id
                const imgSrc = getAbsoluteImageUrl(item.url || item.path)

                return (
                  <div
                    key={item.id}
                    className={`group bg-card rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/30 shadow-md'
                        : 'border-border shadow-xs hover:border-primary/50 hover:shadow-md'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-4/3 w-full bg-muted/40 overflow-hidden border-b border-border/60">
                      {item.type === 'document' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-primary bg-primary/5 p-4">
                          <FileText size={32} />
                          <span className="text-[10px] font-mono mt-1 text-muted-foreground uppercase font-bold">PDF / DOC</span>
                        </div>
                      ) : (
                        <AppImage
                          src={imgSrc}
                          alt={item.name}
                          fallbackType="general"
                          fallbackSrc="/images/banners/banner-01.jpg"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          preview={true}
                        />
                      )}

                      {/* Top Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelectRow?.(item.id)}
                          className={`w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer accent-primary transition-opacity ${
                            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                          aria-label={`Select media ${item.id}`}
                        />
                      </div>

                      {/* Top Actions Overlay */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(item)}
                          title={t('cms.copyUrl', 'Copy URL')}
                          className="w-7 h-7 rounded-lg bg-background/90 text-foreground hover:text-primary shadow-xs flex items-center justify-center backdrop-blur-xs border border-border cursor-pointer transition-colors"
                        >
                          {isCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                        {confirmDelete && (
                          <button
                            type="button"
                            onClick={() => confirmDelete(item.id)}
                            title={t('common.delete', 'Delete')}
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
      )}
    </div>
  )
}

export { MediaLibraryGrid as MediaLibraryTab }
export default MediaLibraryGrid
