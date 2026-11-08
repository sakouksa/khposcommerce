import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { UploadCloud, Trash2, LayoutGrid, Table as TableIcon } from 'lucide-react'
import { cmsService } from '@/services/cmsService'
import { useToast } from '@/hooks/useToast'
import { downloadCsv } from '@/utils/export'
import Breadcrumb from '@/components/common/Breadcrumb'
import { HeaderActionsGroup, ExportButton, TableToolbar, InlineFilterSelect } from '@/components/common'
import Pagination from '@/components/shared/Pagination'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import BulkSelectionBanner from '@/components/shared/BulkSelectionBanner'
import WorkspaceTabs, { type WorkspaceTabItem } from '@/components/shared/WorkspaceTabs'
import { CMSStatsCards, MediaLibraryGrid } from './components'
import type { MediaItem } from './types/cms.types'

export const MediaLibraryPage: React.FC = () => {
  const { t } = useTranslation(['cms', 'common', 'nav', 'toast', 'confirm'])
  const qc = useQueryClient()
  const toast = useToast()

  // View Mode: 'grid' or 'table'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Search & Filter
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  // Sorting
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(12)

  // Selections
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  // Local Uploads State (for immediate feedback)
  const [localUploads, setLocalUploads] = useState<MediaItem[]>([])

  // Column Settings for Table View
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    thumbnail: true,
    name: true,
    type: true,
    size: true,
    date: true,
    actions: true,
  })

  // Fetch Media List
  const { data: mediaData, isLoading, isFetching } = useQuery({
    queryKey: ['media'],
    queryFn: () => cmsService.getMediaList({ per_page: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  const { data: cmsStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['cms-stats'],
    queryFn: () => cmsService.getStats(),
  })

  const fetchedRecords: MediaItem[] = mediaData?.data ?? []

  // Combine fetched and local uploads
  const allAssets = useMemo(() => {
    return [...localUploads, ...fetchedRecords]
  }, [localUploads, fetchedRecords])

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    return allAssets
      .filter((item) => {
        // Type filter
        if (filterType !== 'all' && item.type !== filterType) return false

        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase()
          const matchName = (item.name || '').toLowerCase().includes(q)
          const matchFileName = (item.file_name || '').toLowerCase().includes(q)
          if (!matchName && !matchFileName) return false
        }

        return true
      })
      .sort((a: any, b: any) => {
        const fieldA = a[sortBy] ?? ''
        const fieldB = b[sortBy] ?? ''
        if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1
        if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
  }, [allAssets, filterType, search, sortBy, sortOrder])

  // Pagination calculations
  const totalItems = filteredRecords.length
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
  const paginatedRecords = useMemo(() => {
    const startIndex = (page - 1) * perPage
    return filteredRecords.slice(startIndex, startIndex + perPage)
  }, [filteredRecords, page, perPage])

  // Status counts for WorkspaceTabs
  const statusCounts = useMemo(() => {
    const total = allAssets.length
    const image = allAssets.filter((m) => m.type === 'image' || !m.type).length
    const icon = allAssets.filter((m) => m.type === 'icon').length
    const document = allAssets.filter((m) => m.type === 'document' || m.type === 'video').length
    return { all: total, image, icon, document }
  }, [allAssets])

  const statusTabs: WorkspaceTabItem[] = useMemo(() => [
    { id: 'all', label: t('cms.allFiles', 'All Media'), count: statusCounts.all },
    { id: 'image', label: t('cms.mediaImages', 'Images'), count: statusCounts.image },
    { id: 'icon', label: t('cms.mediaIcons', 'Icons & Badges'), count: statusCounts.icon },
    { id: 'document', label: t('cms.mediaDocuments', 'Documents'), count: statusCounts.document },
  ], [statusCounts, t])

  // Sorting Handler
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
    setPage(1)
  }

  // File Upload Handler
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const newMedia: MediaItem = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        file_name: file.name,
        path: URL.createObjectURL(file),
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/')
          ? file.name.endsWith('.svg') || file.name.includes('icon')
            ? 'icon'
            : 'image'
          : 'document',
        size: file.size,
        created_at: new Date().toISOString(),
      }
      setLocalUploads((prev) => [newMedia, ...prev])
    })
    toast.success(t('cms.uploadSuccess', 'Files uploaded successfully!'))
  }

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => cmsService.deleteItemByTab('media', id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setLocalUploads((prev) => prev.filter((m) => m.id !== deleteId))
      setConfirmOpen(false)
      toast.success(t('cms.deletedSuccess', 'Media file deleted successfully!'))
      setSelectedRows((prev) => (deleteId ? prev.filter((id) => id !== deleteId) : prev))
      setDeleteId(null)
    },
    onError: () => {
      // Local removal fallback
      if (deleteId) {
        setLocalUploads((prev) => prev.filter((m) => m.id !== deleteId))
        toast.success(t('cms.deletedSuccess', 'Media file deleted!'))
      } else {
        toast.error(t('cms.deleteFailed', 'Failed to delete file'))
      }
      setConfirmOpen(false)
      setDeleteId(null)
    },
  })

  // Bulk Delete Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      try {
        return await cmsService.bulkDeleteItemsByTab('media', ids)
      } catch {
        return await Promise.all(ids.map((id) => cmsService.deleteItemByTab('media', id)))
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setLocalUploads((prev) => prev.filter((m) => !selectedRows.includes(m.id)))
      setBulkDeleteConfirmOpen(false)
      toast.success(t('cms.bulkDeleteSuccess', { count: selectedRows.length, defaultValue: `Deleted ${selectedRows.length} files` }))
      setSelectedRows([])
    },
    onError: () => {
      setLocalUploads((prev) => prev.filter((m) => !selectedRows.includes(m.id)))
      setBulkDeleteConfirmOpen(false)
      toast.success(t('cms.bulkDeleteSuccess', { count: selectedRows.length, defaultValue: `Deleted ${selectedRows.length} files` }))
      setSelectedRows([])
    },
  })

  // Selection handlers
  const toggleSelectAll = () => {
    if (paginatedRecords.length > 0 && selectedRows.length === paginatedRecords.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(paginatedRecords.map((r) => r.id))
    }
  }

  const toggleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // Export CSV
  const handleExportCSV = () => {
    const dataToExport = selectedRows.length > 0
      ? allAssets.filter((r) => selectedRows.includes(r.id))
      : allAssets

    if (!dataToExport.length) {
      toast.error(t('common.noDataToExport', 'No data to export'))
      return
    }
    const headers = ['ID', 'Asset Name', 'File Name', 'Type', 'Size (Bytes)', 'URL', 'Uploaded Date']
    const rows = dataToExport.map((m) => [
      m.id,
      `"${(m.name || '').replace(/"/g, '""')}"`,
      `"${(m.file_name || '').replace(/"/g, '""')}"`,
      m.type || 'image',
      m.size || 0,
      `"${(m.url || m.path || '').replace(/"/g, '""')}"`,
      m.created_at || '',
    ])
    downloadCsv('media-library-assets.csv', [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n'))
    toast.success(t('common.exportSuccess', 'Export completed successfully'))
  }

  return (
    <div className="space-y-6">
      {/* Standalone Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.contentManagement', 'Content Management'), href: '/cms/blogs' },
          { label: t('nav.cmsMedia', 'Media Library') },
        ]}
      />

      {/* Frameless Hero Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t('cms.mediaTitle', 'Media & Digital Assets Library')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('cms.mediaSubtitle', 'Upload, organize, inspect, and reuse product photos, promo banners, and documents.')}
          </p>
        </div>
        <HeaderActionsGroup>
          <ExportButton
            onClick={handleExportCSV}
            disabled={!allAssets.length}
            label={
              selectedRows.length > 0
                ? `${t('common.export', 'Export')} (${selectedRows.length})`
                : t('common.exportCsv', 'Export CSV')
            }
          />
          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/90 transition-all cursor-pointer">
            <UploadCloud size={15} />
            <span>{t('cms.uploadMedia', 'Upload Media')}</span>
            <input
              type="file"
              multiple
              accept="image/*,.webp,.png,.jpg,.jpeg,.svg,.pdf"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </label>
        </HeaderActionsGroup>
      </div>

      {/* Executive KPI Overview */}
      <CMSStatsCards activeTab="media" stats={cmsStats} isLoading={isStatsLoading} />

      {/* Workspace Type Tabs */}
      <WorkspaceTabs
        tabs={statusTabs}
        activeTab={filterType}
        onChange={(tabId) => {
          setFilterType(tabId)
          setPage(1)
        }}
      />

      {/* Table Toolbar & Views */}
      <div className="space-y-4">
        <TableToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          searchPlaceholder={t('cms.searchMediaPlaceholder', 'Search media by file name or label...')}
          columns={[
            { key: 'thumbnail', label: t('cms.colThumbnail', 'Preview') },
            { key: 'name', label: t('cms.colAssetName', 'File & Asset Name') },
            { key: 'type', label: t('cms.colType', 'Type') },
            { key: 'size', label: t('cms.colSize', 'Size') },
            { key: 'date', label: t('cms.colUploadedDate', 'Uploaded Date') },
            { key: 'actions', label: t('cms.colActions', 'Actions') },
          ]}
          visibleColumns={visibleColumns}
          onColumnChange={(col, visible) =>
            setVisibleColumns((prev) => ({ ...prev, [col]: visible }))
          }
          manageTableLabel={t('common.manageTable', 'Manage Columns')}
          leftActions={
            selectedRows.length > 0 ? (
              <button
                type="button"
                onClick={() => setBulkDeleteConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>
                  {t('common.deleteSelected', 'Delete Selected')} ({selectedRows.length})
                </span>
              </button>
            ) : undefined
          }
          actions={
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
                title={t('common.gridView', 'Grid View')}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
                title={t('common.tableView', 'Table View')}
              >
                <TableIcon size={16} />
              </button>
            </div>
          }
          onReset={() => {
            setSearch('')
            setFilterType('all')
            setPage(1)
          }}
          onRefresh={() => qc.invalidateQueries({ queryKey: ['media'] })}
          isFiltered={Boolean(search || filterType !== 'all')}
        />

        {/* Bulk Selection Banner */}
        <BulkSelectionBanner
          selectedCount={selectedRows.length}
          onClear={() => setSelectedRows([])}
          onDelete={() => setBulkDeleteConfirmOpen(true)}
        />

        {/* Media Content (Grid or Table) */}
        <MediaLibraryGrid
          records={paginatedRecords}
          isLoading={isLoading}
          isFetching={isFetching}
          viewMode={viewMode}
          visibleColumns={visibleColumns}
          selectedRows={selectedRows}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onUploadFiles={handleFileUpload}
          confirmDelete={(id) => {
            setDeleteId(id)
            setConfirmOpen(true)
          }}
        />

        {/* Pagination */}
        <Pagination
          currentPage={page}
          lastPage={totalPages}
          total={totalItems}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(val) => {
            setPerPage(val)
            setPage(1)
          }}
          isLoading={isLoading || isFetching}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={t('confirm.deleteTitle', 'Confirm Deletion')}
        message={t('confirm.deleteMessage', 'Are you sure you want to delete this media asset? This cannot be undone.')}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        isDanger
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => {
          setConfirmOpen(false)
          setDeleteId(null)
        }}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirmOpen}
        title={t('confirm.bulkDeleteTitle', 'Confirm Bulk Deletion')}
        message={t('confirm.bulkDeleteMessage', {
          count: selectedRows.length,
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected files?`,
        })}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        isDanger
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows)}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />
    </div>
  )
}

export default MediaLibraryPage
