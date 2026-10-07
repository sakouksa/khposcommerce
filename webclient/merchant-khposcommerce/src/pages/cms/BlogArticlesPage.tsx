import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { cmsService } from '@/services/cmsService'
import { useToast } from '@/hooks/useToast'
import { usePermission } from '@/hooks/usePermission'
import { useServerPagination } from '@/hooks/useServerPagination'
import { downloadCsv } from '@/utils/export'
import Breadcrumb from '@/components/common/Breadcrumb'
import {
  HeaderActionsGroup,
  AddButton,
  ExportButton,
  ImportButton,
  TableToolbar,
} from '@/components/common'
import Pagination from '@/components/shared/Pagination'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import BulkSelectionBanner from '@/components/shared/BulkSelectionBanner'
import WorkspaceTabs, { type WorkspaceTabItem } from '@/components/shared/WorkspaceTabs'

import {
  CMSStatsCards,
  CMSFilterDrawer,
  CMSImportModal,
  BlogArticlesTable,
} from './components'

export const BlogArticlesPage: React.FC = () => {
  const { t } = useTranslation(['cms', 'common', 'nav', 'toast', 'confirm'])
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()
  const { hasPermission } = usePermission()

  const canCreate = hasPermission('blog.create')

  // Pagination & Search
  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    reset,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: 'cms_blogs' })

  // Filters & Sorting
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterAuthor, setFilterAuthor] = useState<string>('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Selections
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  // CSV Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  // Column Settings
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    title: true,
    category: true,
    views: true,
    slug: true,
    status: true,
    created_at: true,
    actions: true,
  })

  // Data Fetching
  const { data: listData, isLoading, isFetching } = useQuery({
    queryKey: ['blogs', page, debouncedSearch, perPage, filterStatus, filterCategory, sortBy, sortOrder],
    queryFn: () =>
      cmsService.getItemsByTab('blogs', {
        page,
        search: debouncedSearch,
        per_page: perPage,
        sort: sortBy,
        order: sortOrder,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterCategory !== 'all' && { category_id: filterCategory }),
      }),
    placeholderData: (prev) => prev,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['blog-categories-list'],
    queryFn: () => cmsService.getCategories({ per_page: 100 }),
  })

  const { data: cmsStats } = useQuery({
    queryKey: ['cms-stats'],
    queryFn: () => cmsService.getStats(),
  })

  const records = listData?.data ?? []
  const pagination = listData?.pagination ?? { total: records.length, current_page: 1, last_page: 1 }

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

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: number) => cmsService.deleteBlog(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blogs'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setConfirmOpen(false)
      toast.success(t('cms.deletedSuccess'))
      adjustAfterDelete(records.length)
      setSelectedRows((prev) => (deleteId ? prev.filter((id) => id !== deleteId) : prev))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('cms.deleteFailed'))
      setConfirmOpen(false)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => cmsService.bulkDeleteItemsByTab('blogs', ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blogs'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setBulkDeleteConfirmOpen(false)
      toast.success(
        t('cms.bulkDeleteSuccess', {
          count: selectedRows.length,
        })
      )
      adjustAfterDelete(records.length - selectedRows.length)
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('cms.deleteFailed'))
      setBulkDeleteConfirmOpen(false)
    },
  })

  const toggleSelectAll = () => {
    if (records.length > 0 && selectedRows.length === records.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(records.map((r: any) => r.id))
    }
  }

  const toggleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleExportCSV = () => {
    const isExportingSelected = selectedRows.length > 0
    const exportItems = isExportingSelected
      ? records.filter((r: any) => selectedRows.includes(r.id))
      : records

    if (!exportItems.length) {
      toast.error(t('common.noDataToExport'))
      return
    }

    const headers = ['ID', 'Title', 'Slug', 'Category', 'Status', 'Views', 'Created At']
    const rows = exportItems.map((b: any) => [
      b.id,
      `"${(b.title || '').replace(/"/g, '""')}"`,
      b.slug || '',
      `"${(b.category_name || b.blog_category?.name || b.category?.name || '').replace(/"/g, '""')}"`,
      b.status || 'published',
      b.views_count || b.view_count || 0,
      b.created_at || '',
    ])
    downloadCsv('cms-blogs.csv', headers, rows)
    toast.success(
      isExportingSelected
        ? t('cms.exportSelectedSuccess')
        : t('common.exportSuccess')
    )
  }

  const handleProcessImport = () => {
    setIsImporting(true)
    setTimeout(() => {
      setIsImporting(false)
      setImportModalOpen(false)
      setImportFile(null)
      toast.success(t('cms.importSuccess'))
      qc.invalidateQueries({ queryKey: ['blogs'] })
    }, 1000)
  }

  const resetAllFilters = () => {
    setFilterStatus('all')
    setFilterCategory('all')
    setFilterAuthor('all')
    reset()
  }

  const activeFilterCount = useMemo(() => {
    return [
      filterCategory !== 'all' ? filterCategory : null,
      filterAuthor !== 'all' ? filterAuthor : null,
    ].filter(Boolean).length
  }, [filterCategory, filterAuthor])

  const categories = categoriesData?.data ?? []

  // Dynamic Workspace Status Tabs with Live Badges
  const statusCounts = useMemo(() => {
    const total = cmsStats?.blogs?.total ?? pagination.total ?? records.length
    const published =
      cmsStats?.blogs?.published ??
      records.filter((r: any) => (r.status || 'published').toLowerCase() === 'published').length
    const draft =
      cmsStats?.blogs?.draft ??
      records.filter((r: any) => (r.status || '').toLowerCase() === 'draft').length
    const archived =
      cmsStats?.blogs?.archived ??
      records.filter((r: any) => (r.status || '').toLowerCase() === 'archived').length

    return {
      all: total,
      published,
      draft,
      archived,
    }
  }, [cmsStats, pagination.total, records])

  const statusTabs: WorkspaceTabItem[] = useMemo(() => [
    {
      id: 'all',
      label: t('cms.allStatuses'),
      count: statusCounts.all,
    },
    {
      id: 'published',
      label: t('cms.published'),
      count: statusCounts.published,
    },
    {
      id: 'draft',
      label: t('cms.drafts'),
      count: statusCounts.draft,
    },
    {
      id: 'archived',
      label: t('cms.archived'),
      count: statusCounts.archived,
    },
  ], [statusCounts, t])

  return (
    <div className="space-y-5 print:p-0">
      {/* ── 1. BREADCRUMB (Top, by itself) ── */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: t('cms.contentManagement'), href: '/cms/blogs' },
            { label: t('cms.tabBlogs') },
          ]}
        />
      </div>

      {/* ── 2. FRAMELESS HERO HEADER (Shopify Polaris / Enterprise Standard) ── */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('cms.blogsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('cms.blogsSubtitle')}
          </p>
        </div>

        <HeaderActionsGroup className="w-full sm:w-auto flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <ExportButton
            onClick={handleExportCSV}
            disabled={!records.length}
            label={
              selectedRows.length > 0
                ? `${t('common.exportSelected')} (${selectedRows.length})`
                : t('common.exportCsv')
            }
          />
          <ImportButton
            onClick={() => setImportModalOpen(true)}
            label={t('common.importCsv')}
          />
          {canCreate && (
            <AddButton
              label={t('cms.addBlog')}
              onClick={() => navigate('/cms/blogs/create')}
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* ── 3. EXECUTIVE KPI OVERVIEW (GLOBAL ENTERPRISE STATS GRID) ── */}
      <CMSStatsCards activeTab="blogs" records={records} stats={cmsStats} pagination={pagination} />

      {/* ── 4. WORKSPACE STATUS TABS (Linear / Orders Standard) ── */}
      <WorkspaceTabs
        tabs={statusTabs}
        activeTab={filterStatus}
        onChange={(tabId) => {
          setFilterStatus(tabId)
          setPage(1)
        }}
      />

      {/* ── 5. GLOBAL STANDARD TABLE TOOLBAR ── */}
      <div className="space-y-4">
        <TableToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          searchPlaceholder={t('cms.searchPlaceholder')}
          onFilterClick={() => setFilterDrawerOpen(true)}
          filterActiveCount={activeFilterCount}
          isFilterActive={activeFilterCount > 0 || Boolean(debouncedSearch) || filterStatus !== 'all'}
          onReset={resetAllFilters}
          onRefresh={() => {
            qc.invalidateQueries({ queryKey: ['blogs'] })
            qc.invalidateQueries({ queryKey: ['cms-stats'] })
          }}
          refreshLoading={isFetching}
          columns={[
            { key: 'title', label: t('cms.colHeadline') },
            { key: 'category', label: t('cms.colCategory') },
            { key: 'views', label: t('cms.cardTotalViews') },
            { key: 'slug', label: t('cms.colSlug') },
            { key: 'status', label: t('cms.colStatus') },
            { key: 'created_at', label: t('common.date') },
            { key: 'actions', label: t('cms.colActions') },
          ]}
          visibleColumns={visibleColumns}
          onColumnChange={setVisibleColumns}
          manageTableLabel={t('common.manageTable')}
          leftActions={
            selectedRows.length > 0 ? (
              <button
                type="button"
                onClick={() => setBulkDeleteConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 h-10 min-h-[40px] max-h-[40px] px-3.5 text-xs sm:text-[13px] font-semibold bg-rose-500/10 text-rose-600 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 active:scale-[0.98] transition-all cursor-pointer shrink-0 box-border leading-normal"
              >
                <Trash2 size={14} />
                <span>
                  {t('common.deleteSelected')} ({selectedRows.length})
                </span>
              </button>
            ) : null
          }
        />

        {/* Bulk Selection Banner */}
        <BulkSelectionBanner
          selectedCount={selectedRows.length}
          onClear={() => setSelectedRows([])}
          onDelete={() => setBulkDeleteConfirmOpen(true)}
        />

        {/* Data Table */}
        <BlogArticlesTable
          records={records}
          isLoading={isLoading}
          isFetching={isFetching}
          visibleColumns={visibleColumns}
          confirmDelete={(id) => {
            setDeleteId(id)
            setConfirmOpen(true)
          }}
          selectedRows={selectedRows}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />

        {/* Pagination */}
        <Pagination
          currentPage={page}
          lastPage={pagination.last_page || 1}
          total={pagination.total || 0}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      </div>

      {/* Filter Drawer */}
      <CMSFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterAuthor={filterAuthor}
        setFilterAuthor={setFilterAuthor}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={categories}
        onReset={resetAllFilters}
      />

      {/* CSV Import Modal */}
      <CMSImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        importFile={importFile}
        setImportFile={setImportFile}
        isImporting={isImporting}
        handleConfirmImport={handleProcessImport}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={t('confirm.deleteTitle')}
        message={t('confirm.deleteMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => {
          setConfirmOpen(false)
          setDeleteId(null)
        }}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirmOpen}
        title={t('confirm.bulkDeleteTitle')}
        message={t('confirm.bulkDeleteMessage', {
          count: selectedRows.length,
        })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows)}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />
    </div>
  )
}

export default BlogArticlesPage
