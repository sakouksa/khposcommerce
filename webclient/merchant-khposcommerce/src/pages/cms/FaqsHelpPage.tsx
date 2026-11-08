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
  FaqsHelpTable,
} from './components'

export const FaqsHelpPage: React.FC = () => {
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
  } = useServerPagination({ storageKey: 'cms_faqs' })

  // Filters & Sorting
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
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
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [faqCategory, setFaqCategory] = useState('')
  const [sortOrderValue, setSortOrderValue] = useState('0')
  const [isActive, setIsActive] = useState(true)

  // Column Settings
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    title: true,
    category: true,
    sortOrder: true,
    status: true,
    actions: true,
  })

  // Data Fetching
  const { data: listData, isLoading, isFetching } = useQuery({
    queryKey: ['faqs', page, debouncedSearch, perPage, filterStatus, filterCategory, sortBy, sortOrder],
    queryFn: () =>
      cmsService.getItemsByTab('faqs', {
        page,
        search: debouncedSearch,
        per_page: perPage,
        sort: sortBy,
        order: sortOrder,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterCategory !== 'all' && { category: filterCategory }),
      }),
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
    const total = cmsStats?.faqs?.total ?? pagination.total ?? records.length
    const active =
      cmsStats?.faqs?.active ??
      records.filter((r: any) => Boolean(r.is_active)).length
    const inactive =
      cmsStats?.faqs?.inactive ??
      records.filter((r: any) => !r.is_active).length

    return { all: total, active, inactive }
  }, [cmsStats, pagination.total, records])

  const statusTabs: WorkspaceTabItem[] = useMemo(() => [
    {
      id: 'all',
      label: t('cms.allStatuses', 'All FAQs'),
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

  // Extract unique categories for inline filtering
  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    records.forEach((r: any) => {
      if (r.category && typeof r.category === 'string') {
        set.add(r.category.trim())
      }
    })
    return Array.from(set).sort()
  }, [records])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => cmsService.createItemByTab('faqs', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      closeModal()
      toast.success(t('cms.createdSuccess', 'FAQ item created successfully!'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('cms.createFailed', 'Failed to create FAQ')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      cmsService.updateItemByTab('faqs', id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] })
      closeModal()
      toast.success(t('cms.updatedSuccess', 'FAQ item updated successfully!'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('cms.updateFailed', 'Failed to update FAQ')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cmsService.deleteItemByTab('faqs', id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setConfirmOpen(false)
      toast.success(t('cms.deletedSuccess', 'FAQ item deleted successfully!'))
      adjustAfterDelete(records.length)
      setSelectedRows((prev) => (deleteId ? prev.filter((id) => id !== deleteId) : prev))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('cms.deleteFailed', 'Failed to delete FAQ'))
      setConfirmOpen(false)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => cmsService.bulkDeleteItemsByTab('faqs', ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setBulkDeleteConfirmOpen(false)
      toast.success(
        t('cms.bulkDeleteSuccess', {
          count: selectedRows.length,
          defaultValue: `Successfully deleted ${selectedRows.length} items`,
        })
      )
      adjustAfterDelete(records.length - selectedRows.length)
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('cms.deleteFailed', 'Failed to delete FAQs'))
      setBulkDeleteConfirmOpen(false)
    },
  })

  // Handlers
  const openCreateModal = () => {
    setEditingItem(null)
    setQuestion('')
    setAnswer('')
    setFaqCategory('')
    setSortOrderValue('0')
    setIsActive(true)
    setModalOpen(true)
  }

  const openEditModal = (item: any) => {
    setEditingItem(item)
    setQuestion(item.question || item.title || '')
    setAnswer(item.answer || item.content || '')
    setFaqCategory(item.category || '')
    setSortOrderValue(String(item.sort_order ?? 0))
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
      question,
      answer,
      category: faqCategory,
      sort_order: parseInt(sortOrderValue) || 0,
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
    const headers = ['ID', 'Question', 'Answer', 'Category', 'Order', 'Status']
    const rows = dataToExport.map((f: any) => [
      f.id,
      `"${(f.question || f.title || '').replace(/"/g, '""')}"`,
      `"${(f.answer || f.content || '').replace(/"/g, '""')}"`,
      `"${(f.category || '').replace(/"/g, '""')}"`,
      f.sort_order || 0,
      f.is_active ? 'Active' : 'Inactive',
    ])
    downloadCsv('cms-faqs.csv', [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n'))
    toast.success(t('common.exportSuccess', 'Export completed successfully'))
  }

  return (
    <div className="space-y-6">
      {/* Standalone Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.contentManagement', 'Content Management'), href: '/cms/blogs' },
          { label: t('nav.cmsFaqs', 'FAQs & Help') },
        ]}
      />

      {/* Frameless Hero Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t('cms.faqsTitle', 'Frequently Asked Questions & Help Center')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('cms.faqsSubtitle', 'Manage self-service help answers, troubleshooting guides, and knowledge base items.')}
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
              label={t('cms.addFaq', 'Add FAQ')}
              onClick={openCreateModal}
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* Executive KPI Overview */}
      <CMSStatsCards activeTab="faqs" stats={cmsStats} isLoading={isStatsLoading} />

      {/* Workspace Status Tabs */}
      <WorkspaceTabs
        tabs={statusTabs}
        activeTab={filterStatus}
        onChange={(tabId) => {
          setFilterStatus(tabId)
          setPage(1)
        }}
      />

      {/* Table Toolbar & Content Container */}
      <div className="space-y-4">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('cms.searchFaqPlaceholder', 'Search questions, answers, or category...')}
          columns={[
            { key: 'title', label: t('cms.colQuestionAnswer', 'Question & Answer') },
            { key: 'category', label: t('cms.colCategory', 'Category') },
            { key: 'sortOrder', label: t('cms.colOrder', 'Display Order') },
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
            availableCategories.length > 0 ? (
              <InlineFilterSelect
                value={filterCategory}
                onChange={(val) => {
                  setFilterCategory(val)
                  setPage(1)
                }}
                options={[
                  { value: 'all', label: t('cms.allCategories', 'All Categories') },
                  ...availableCategories.map((cat) => ({ value: cat, label: cat })),
                ]}
              />
            ) : undefined
          }
          onReset={() => {
            setFilterStatus('all')
            setFilterCategory('all')
            reset()
          }}
          onRefresh={() => qc.invalidateQueries({ queryKey: ['faqs'] })}
          isFiltered={Boolean(search || filterStatus !== 'all' || filterCategory !== 'all')}
        />

        {/* Bulk Selection Banner */}
        <BulkSelectionBanner
          selectedCount={selectedRows.length}
          onClear={() => setSelectedRows([])}
          onDelete={() => setBulkDeleteConfirmOpen(true)}
        />

        {/* Data Table */}
        <FaqsHelpTable
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

      {/* FAQ Form Modal */}
      <CMSFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        activeTab="faqs"
        getAddButtonLabel={() => t('cms.addFaq', 'Add FAQ')}
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
        question={question}
        setQuestion={setQuestion}
        answer={answer}
        setAnswer={setAnswer}
        faqCategory={faqCategory}
        setFaqCategory={setFaqCategory}
        sortOrder={sortOrderValue}
        setSortOrder={setSortOrderValue}
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
        title={t('confirm.deleteTitle', 'Confirm Deletion')}
        message={t('confirm.deleteMessage', 'Are you sure you want to delete this FAQ item? This action cannot be undone.')}
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
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected FAQs?`,
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

export default FaqsHelpPage
