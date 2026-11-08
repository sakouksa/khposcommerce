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
  InlineFilterSelect,
} from '@/components/common'
import Pagination from '@/components/shared/Pagination'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import BulkSelectionBanner from '@/components/shared/BulkSelectionBanner'
import WorkspaceTabs, { type WorkspaceTabItem } from '@/components/shared/WorkspaceTabs'

import {
  CMSStatsCards,
  CMSFormModal,
  TestimonialsTable,
} from './components'

export const TestimonialsPage: React.FC = () => {
  const { t } = useTranslation(['cms', 'common', 'nav', 'toast', 'confirm'])
  const qc = useQueryClient()
  const toast = useToast()
  const { hasPermission } = usePermission()

  const canCreate = hasPermission('page.create')

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
  } = useServerPagination({ storageKey: 'cms_testimonials' })

  // Filters & Sorting
  const [filterTab, setFilterTab] = useState<string>('all')
  const [filterRating, setFilterRating] = useState<string>('all')
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
  const [authorName, setAuthorName] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)

  // Column Settings
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    author: true,
    feedback: true,
    rating: true,
    featured: true,
    status: true,
    actions: true,
  })

  // Data Fetching
  const { data: listData, isLoading, isFetching } = useQuery({
    queryKey: ['testimonials', page, debouncedSearch, perPage, filterTab, filterRating, sortBy, sortOrder],
    queryFn: () => {
      const params: Record<string, any> = {
        page,
        search: debouncedSearch,
        per_page: perPage,
        sort: sortBy,
        order: sortOrder,
      }
      if (filterTab === 'featured') params.is_featured = true
      if (filterTab === 'active') params.is_active = true
      if (filterTab === 'inactive') params.is_active = false
      if (filterRating !== 'all') params.rating = parseInt(filterRating)

      return cmsService.getItemsByTab('testimonials', params)
    },
    placeholderData: (prev) => prev,
  })

  const { data: cmsStats, isLoading: isStatsLoading } = useQuery({
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

  // Workspace Status Tabs with live counts
  const statusCounts = useMemo(() => {
    const total = pagination.total ?? records.length
    const featured = records.filter((r: any) => Boolean(r.is_featured)).length
    const active = records.filter((r: any) => r.is_active !== false).length
    const inactive = records.filter((r: any) => r.is_active === false).length

    return { all: total, featured, active, inactive }
  }, [pagination.total, records])

  const statusTabs: WorkspaceTabItem[] = useMemo(() => [
    {
      id: 'all',
      label: t('cms.allReviews', 'All Reviews'),
      count: statusCounts.all,
    },
    {
      id: 'featured',
      label: t('cms.featured', 'Featured'),
      count: statusCounts.featured,
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
    mutationFn: (payload: any) => cmsService.createItemByTab('testimonials', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['testimonials'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      closeModal()
      toast.success(t('cms.createdSuccess', 'Review added successfully!'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('cms.createFailed', 'Failed to create review')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      cmsService.updateItemByTab('testimonials', id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['testimonials'] })
      closeModal()
      toast.success(t('cms.updatedSuccess', 'Review updated successfully!'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('cms.updateFailed', 'Failed to update review')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cmsService.deleteItemByTab('testimonials', id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['testimonials'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setConfirmOpen(false)
      toast.success(t('cms.deletedSuccess', 'Review deleted successfully!'))
      adjustAfterDelete(records.length)
      setSelectedRows((prev) => (deleteId ? prev.filter((id) => id !== deleteId) : prev))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('cms.deleteFailed', 'Failed to delete review'))
      setConfirmOpen(false)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => cmsService.bulkDeleteItemsByTab('testimonials', ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['testimonials'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setBulkDeleteConfirmOpen(false)
      toast.success(
        t('cms.bulkDeleteSuccess', {
          count: selectedRows.length,
          defaultValue: `Successfully deleted ${selectedRows.length} reviews`,
        })
      )
      adjustAfterDelete(records.length - selectedRows.length)
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('cms.deleteFailed', 'Failed to delete reviews'))
      setBulkDeleteConfirmOpen(false)
    },
  })

  // Handlers
  const openCreateModal = () => {
    setEditingItem(null)
    setAuthorName('')
    setRole('')
    setCompany('')
    setRating(5)
    setComment('')
    setIsFeatured(false)
    setIsActive(true)
    setModalOpen(true)
  }

  const openEditModal = (item: any) => {
    setEditingItem(item)
    setAuthorName(item.author_name || item.name || item.title || '')
    setRole(item.role || item.position || '')
    setCompany(item.company || '')
    setRating(item.rating || 5)
    setComment(item.comment || item.content || '')
    setIsFeatured(item.is_featured ?? false)
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
      author_name: authorName,
      role,
      company,
      rating,
      comment,
      is_featured: isFeatured,
      is_active: isActive,
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
    const dataToExport = selectedRows.length > 0
      ? records.filter((r: any) => selectedRows.includes(r.id))
      : records

    if (!dataToExport.length) {
      toast.error(t('common.noDataToExport', 'No data to export'))
      return
    }
    const headers = ['ID', 'Author', 'Role', 'Company', 'Rating', 'Comment', 'Featured', 'Status']
    const rows = dataToExport.map((tm: any) => [
      tm.id,
      `"${(tm.author_name || '').replace(/"/g, '""')}"`,
      `"${(tm.role || '').replace(/"/g, '""')}"`,
      `"${(tm.company || '').replace(/"/g, '""')}"`,
      tm.rating || 5,
      `"${(tm.comment || '').replace(/"/g, '""')}"`,
      tm.is_featured ? 'Yes' : 'No',
      tm.is_active ? 'Active' : 'Inactive',
    ])
    downloadCsv('cms-testimonials.csv', [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n'))
    toast.success(t('common.exportSuccess', 'Export completed successfully'))
  }

  return (
    <div className="space-y-6">
      {/* Standalone Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.contentManagement', 'Content Management'), href: '/cms/blogs' },
          { label: t('nav.cmsTestimonials', 'Client Testimonials') },
        ]}
      />

      {/* Frameless Hero Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t('cms.testimonialsTitle', 'Customer Feedback & Testimonials')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('cms.testimonialsSubtitle', 'Manage client reviews, enterprise customer quotes, ratings, and social proof.')}
          </p>
        </div>
        <HeaderActionsGroup>
          <ExportButton
            onClick={handleExportCSV}
            disabled={!records.length}
            label={
              selectedRows.length > 0
                ? `${t('common.export', 'Export')} (${selectedRows.length})`
                : t('common.exportCsv', 'Export CSV')
            }
          />
          {canCreate && (
            <AddButton
              label={t('cms.addTestimonial', 'New Testimonial')}
              onClick={openCreateModal}
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* Executive KPI Overview */}
      <CMSStatsCards activeTab="testimonials" stats={cmsStats} isLoading={isStatsLoading} />

      {/* Workspace Status Tabs */}
      <WorkspaceTabs
        tabs={statusTabs}
        activeTab={filterTab}
        onChange={(tabId) => {
          setFilterTab(tabId)
          setPage(1)
        }}
      />

      {/* Table Toolbar & Content Container */}
      <div className="space-y-4">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('cms.searchTestimonialPlaceholder', 'Search by client name, company, or feedback...')}
          columns={[
            { key: 'author', label: t('cms.colAuthor', 'Client / Author') },
            { key: 'feedback', label: t('cms.colFeedback', 'Review / Feedback') },
            { key: 'rating', label: t('cms.colRating', 'Rating') },
            { key: 'featured', label: t('cms.colFeatured', 'Featured') },
            { key: 'status', label: t('cms.colStatus', 'Status') },
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
                onClick={() => setBulkDeleteConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 transition-colors"
              >
                <Trash2 size={14} />
                <span>
                  {t('common.deleteSelected', 'Delete Selected')} ({selectedRows.length})
                </span>
              </button>
            ) : undefined
          }
          filters={
            <InlineFilterSelect
              value={filterRating}
              onChange={(val) => {
                setFilterRating(val)
                setPage(1)
              }}
              options={[
                { value: 'all', label: t('cms.allRatings', 'All Ratings') },
                { value: '5', label: '★★★★★ (5 Stars)' },
                { value: '4', label: '★★★★☆ (4 Stars)' },
                { value: '3', label: '★★★☆☆ (3 Stars)' },
              ]}
            />
          }
          onReset={() => {
            setFilterTab('all')
            setFilterRating('all')
            reset()
          }}
          onRefresh={() => qc.invalidateQueries({ queryKey: ['testimonials'] })}
          isFiltered={Boolean(search || filterTab !== 'all' || filterRating !== 'all')}
        />

        {/* Bulk Selection Banner */}
        <BulkSelectionBanner
          selectedCount={selectedRows.length}
          onClear={() => setSelectedRows([])}
          onDelete={() => setBulkDeleteConfirmOpen(true)}
        />

        {/* Data Table */}
        <TestimonialsTable
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
          isLoading={isLoading || isFetching}
        />
      </div>

      {/* Testimonial Form Modal */}
      <CMSFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        activeTab="testimonials"
        getAddButtonLabel={() => t('cms.addTestimonial', 'Add Testimonial')}
        title=""
        setTitle={() => {}}
        name=""
        setName={() => {}}
        slug=""
        setSlug={() => {}}
        content=""
        setContent={() => {}}
        excerpt=""
        setExcerpt={() => {}}
        status="published"
        setStatus={() => {}}
        description=""
        setDescription={() => {}}
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
        testimonialRole={role}
        setTestimonialRole={setRole}
        testimonialCompany={company}
        setTestimonialCompany={setCompany}
        testimonialRating={rating}
        setTestimonialRating={setRating}
        testimonialComment={comment}
        setTestimonialComment={setComment}
        isFeatured={isFeatured}
        setIsFeatured={setIsFeatured}
        selectedFile={null}
        featuredImage=""
        handleFileChange={() => {}}
        handleRemoveImage={() => {}}
        categories={[]}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={t('confirm.deleteTitle', 'Confirm Deletion')}
        message={t('confirm.deleteMessage', 'Are you sure you want to delete this customer review? This action cannot be undone.')}
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
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected reviews?`,
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

export default TestimonialsPage
