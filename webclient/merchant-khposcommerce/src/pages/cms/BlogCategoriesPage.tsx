import React, { useState, useMemo } from 'react'
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
  TableToolbar,
} from '@/components/common'
import Pagination from '@/components/shared/Pagination'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import BulkSelectionBanner from '@/components/shared/BulkSelectionBanner'
import WorkspaceTabs, { type WorkspaceTabItem } from '@/components/shared/WorkspaceTabs'

import {
  CMSStatsCards,
  CMSFormModal,
  BlogCategoriesTable,
} from './components'

export const BlogCategoriesPage: React.FC = () => {
  const { t } = useTranslation(['cms', 'common', 'nav', 'toast', 'confirm'])
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
  } = useServerPagination({ storageKey: 'cms_categories' })

  // Filters & Sorting
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Selections
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Column Settings
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    title: true,
    slug: true,
    posts: true,
    status: true,
    actions: true,
  })

  // Data Fetching
  const { data: listData, isLoading, isFetching } = useQuery({
    queryKey: ['blog-categories', page, debouncedSearch, perPage, filterStatus, sortBy, sortOrder],
    queryFn: () =>
      cmsService.getItemsByTab('blog-categories', {
        page,
        search: debouncedSearch,
        per_page: perPage,
        sort: sortBy,
        order: sortOrder,
        ...(filterStatus !== 'all' && { status: filterStatus }),
      }),
    placeholderData: (prev) => prev,
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

  // Status Tabs Counts
  const statusCounts = useMemo(() => {
    const total = cmsStats?.categories?.total ?? pagination.total ?? records.length
    const active =
      cmsStats?.categories?.active ??
      records.filter((r: any) => Boolean(r.is_active)).length
    const inactive =
      cmsStats?.categories?.inactive ??
      records.filter((r: any) => !r.is_active).length

    return { all: total, active, inactive }
  }, [cmsStats, pagination.total, records])

  const statusTabs: WorkspaceTabItem[] = useMemo(() => [
    {
      id: 'all',
      label: t('cms.allStatuses', 'All Statuses'),
      count: statusCounts.all,
    },
    {
      id: 'active',
      label: t('cms.active', 'Active'),
      count: statusCounts.active,
    },
    {
      id: 'inactive',
      label: t('cms.inactive', 'Inactive'),
      count: statusCounts.inactive,
    },
  ], [statusCounts, t])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => cmsService.createCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-categories'] })
      qc.invalidateQueries({ queryKey: ['blog-categories-list'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      closeModal()
      toast.success(t('cms.createdSuccess'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('cms.createFailed')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => cmsService.updateCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-categories'] })
      qc.invalidateQueries({ queryKey: ['blog-categories-list'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      closeModal()
      toast.success(t('cms.updatedSuccess'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('cms.updateFailed')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cmsService.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-categories'] })
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
    mutationFn: (ids: number[]) => cmsService.bulkDeleteItemsByTab('blog-categories', ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-categories'] })
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

  const openCreateModal = () => {
    setEditingItem(null)
    setName('')
    setSlug('')
    setDescription('')
    setIsActive(true)
    setModalOpen(true)
  }

  const openEditModal = (item: any) => {
    setEditingItem(item)
    setName(item.name || '')
    setSlug(item.slug || '')
    setDescription(item.description || '')
    setIsActive(item.is_active ?? true)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      company_id: 1,
      name,
      slug: slug || name.toLowerCase().replace(/ /g, '-'),
      description,
      is_active: isActive ? 1 : 0,
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

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
    const headers = ['ID', 'Name', 'Slug', 'Posts Count', 'Status']
    const rows = exportItems.map((c: any) => [
      c.id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      c.slug || '',
      c.posts_count || 0,
      c.is_active ? 'Active' : 'Inactive',
    ])
    downloadCsv('cms-categories.csv', headers, rows)
    toast.success(
      isExportingSelected
        ? t('cms.exportSelectedSuccess')
        : t('common.exportSuccess')
    )
  }

  const resetAllFilters = () => {
    setFilterStatus('all')
    reset()
  }

  return (
    <div className="space-y-5 print:p-0">
      {/* ── 1. BREADCRUMB (Top, by itself) ── */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: t('cms.contentManagement', 'Content Management'), href: '/cms/blogs' },
            { label: t('cms.tabCategories', 'Content Categories') },
          ]}
        />
      </div>

      {/* ── 2. FRAMELESS HERO HEADER (Shopify Polaris Standard) ── */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('cms.categoriesTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('cms.categoriesSubtitle')}
          </p>
        </div>

        <HeaderActionsGroup className="w-full sm:w-auto flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <ExportButton
            onClick={handleExportCSV}
            disabled={!records.length}
            label={
              selectedRows.length > 0
                ? `${t('common.exportSelected', 'Export Selected')} (${selectedRows.length})`
                : t('common.exportCsv', 'Export CSV')
            }
          />
          {canCreate && (
            <AddButton
              label={t('cms.addCategory')}
              onClick={openCreateModal}
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* ── 3. EXECUTIVE KPI OVERVIEW ── */}
      <CMSStatsCards activeTab="blog-categories" records={records} stats={cmsStats} pagination={pagination} />

      {/* ── 4. WORKSPACE STATUS TABS ── */}
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
          searchPlaceholder={t('cms.searchCategoryPlaceholder', 'Search categories...')}
          isFilterActive={Boolean(filterStatus !== 'all' || search)}
          onReset={resetAllFilters}
          onRefresh={() => {
            qc.invalidateQueries({ queryKey: ['blog-categories'] })
            qc.invalidateQueries({ queryKey: ['cms-stats'] })
          }}
          refreshLoading={isFetching}
          manageTableLabel={t('common.manageTable', 'Manage Table')}
          columns={[
            { key: 'title', label: t('cms.colCategoryName', 'Category Name') },
            { key: 'slug', label: t('cms.colSlug', 'Slug') },
            { key: 'posts', label: t('cms.cardLinkedArticles', 'Posts Count') },
            { key: 'status', label: t('cms.colStatus', 'Status') },
            { key: 'actions', label: t('cms.colActions', 'Actions') },
          ]}
          visibleColumns={visibleColumns}
          onColumnChange={setVisibleColumns}
          leftActions={
            selectedRows.length > 0 ? (
              <button
                type="button"
                onClick={() => setBulkDeleteConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 h-10 min-h-[40px] max-h-[40px] px-3.5 text-xs sm:text-[13px] font-semibold bg-rose-500/10 text-rose-600 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 active:scale-[0.98] transition-all cursor-pointer shrink-0 box-border leading-normal"
              >
                <Trash2 size={14} />
                <span>
                  {t('common.deleteSelected', 'Delete Selected')} ({selectedRows.length})
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
        <BlogCategoriesTable
          records={records}
          isLoading={isLoading}
          isFetching={isFetching}
          visibleColumns={visibleColumns}
          openEditModal={openEditModal}
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
          isLoading={isFetching}
        />
      </div>

      {/* Category Create/Edit Modal */}
      <CMSFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        activeTab="blog-categories"
        getAddButtonLabel={() => t('cms.addCategory')}
        title={name}
        setTitle={setName}
        name={name}
        setName={setName}
        slug={slug}
        setSlug={setSlug}
        content=""
        setContent={() => {}}
        excerpt=""
        setExcerpt={() => {}}
        status="published"
        setStatus={() => {}}
        description={description}
        setDescription={setDescription}
        question=""
        setQuestion={() => {}}
        answer=""
        setAnswer={() => {}}
        faqCategory=""
        setFaqCategory={() => {}}
        sortOrder="0"
        setSortOrder={() => {}}
        isActive={isActive}
        setIsActive={setIsActive}
        categoryId=""
        setCategoryId={() => {}}
        metaTitle=""
        setMetaTitle={() => {}}
        metaDescription=""
        setMetaDescription={() => {}}
        testimonialRole=""
        setTestimonialRole={() => {}}
        testimonialCompany=""
        setTestimonialCompany={() => {}}
        testimonialRating={5}
        setTestimonialRating={() => {}}
        testimonialComment=""
        setTestimonialComment={() => {}}
        isFeatured={false}
        setIsFeatured={() => {}}
        selectedFile={null}
        featuredImage=""
        handleFileChange={() => {}}
        handleRemoveImage={() => {}}
        categories={[]}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={t('confirm.deleteTitle')}
        message={t('confirm.deleteMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
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
        title={t('confirm.bulkDeleteTitle')}
        message={t('confirm.bulkDeleteMessage', {
          count: selectedRows.length,
        })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        isDanger
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows)}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />
    </div>
  )
}

export default BlogCategoriesPage
